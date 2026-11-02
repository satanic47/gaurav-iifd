import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publishToPlatform } from "@/lib/socialPublisher";

export async function GET() {
  return handleCronPublish();
}

export async function POST() {
  return handleCronPublish();
}

async function handleCronPublish() {
  try {
    const now = new Date();

    // Find all scheduled posts that are due for publishing
    const duePosts = await prisma.post.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: {
          lte: now,
        },
      },
      include: {
        targets: {
          include: {
            account: true,
          },
        },
      },
    });

    if (duePosts.length === 0) {
      return NextResponse.json({
        message: "No scheduled posts due for publishing right now.",
        checkedAt: now.toISOString(),
        publishedCount: 0,
      });
    }

    const results = [];

    for (const post of duePosts) {
      let anyFailed = false;
      const mediaUrls = JSON.parse(post.mediaUrls || "[]");

      for (const target of post.targets) {
        if (target.status === "PUBLISHED") continue;

        const res = await publishToPlatform(target.platform, target.account, {
          id: post.id,
          content: post.content,
          mediaUrls,
          mediaType: post.mediaType,
        });

        await prisma.postTarget.update({
          where: { id: target.id },
          data: {
            status: res.success ? "PUBLISHED" : "FAILED",
            platformPostId: res.platformPostId || null,
            errorMessage: res.error || null,
            publishedAt: res.success ? new Date() : null,
          },
        });

        if (!res.success) anyFailed = true;
      }

      const finalStatus = anyFailed ? "FAILED" : "PUBLISHED";
      const updated = await prisma.post.update({
        where: { id: post.id },
        data: {
          status: finalStatus,
          publishedAt: anyFailed ? null : new Date(),
        },
      });

      results.push({
        postId: post.id,
        status: finalStatus,
        targetCount: post.targets.length,
      });
    }

    return NextResponse.json({
      message: `Successfully processed ${duePosts.length} due post(s).`,
      checkedAt: now.toISOString(),
      publishedCount: results.length,
      details: results,
    });
  } catch (error: any) {
    console.error("Cron publish error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
