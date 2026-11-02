import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publishToPlatform } from "@/lib/socialPublisher";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");

    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;

    const posts = await prisma.post.findMany({
      where,
      include: {
        targets: {
          include: {
            account: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [
        { scheduledAt: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ posts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      clientId,
      content,
      mediaUrls = [],
      mediaType = "TEXT_ONLY",
      targetAccountIds = [],
      scheduleType = "NOW", // "NOW" | "SCHEDULE" | "QUEUE"
      scheduledAt: customScheduledAt,
      aiPrompt,
    } = body;

    if (!clientId) {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }
    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Post content cannot be empty" }, { status: 400 });
    }
    if (!targetAccountIds || targetAccountIds.length === 0) {
      return NextResponse.json({ error: "Select at least one platform/account to post to" }, { status: 400 });
    }

    // Fetch the accounts
    const accounts = await prisma.socialAccount.findMany({
      where: {
        id: { in: targetAccountIds },
        clientId,
      },
    });

    if (accounts.length === 0) {
      return NextResponse.json({ error: "No matching accounts found for this client" }, { status: 404 });
    }

    let calculatedScheduledAt: Date | null = null;
    let initialStatus = "SCHEDULED";

    if (scheduleType === "NOW") {
      initialStatus = "PUBLISHED";
      calculatedScheduledAt = new Date();
    } else if (scheduleType === "SCHEDULE") {
      calculatedScheduledAt = customScheduledAt ? new Date(customScheduledAt) : new Date(Date.now() + 3600000);
      initialStatus = "SCHEDULED";
    } else if (scheduleType === "QUEUE") {
      // Find next available slot for this client
      const schedules = await prisma.scheduleSetting.findMany({
        where: { clientId, isEnabled: true },
      });

      if (schedules.length > 0) {
        // Find the next slot from tomorrow or today's upcoming slot
        const now = new Date();
        const currentDay = now.getDay();
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();

        // Sort schedules
        let nextSlotTime: Date | null = null;

        // Check slots for the next 7 days
        for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
          const targetDay = (currentDay + dayOffset) % 7;
          const matchingSlots = schedules.filter((s) => s.dayOfWeek === targetDay);

          for (const slot of matchingSlots) {
            const [slotH, slotM] = slot.timeSlot.split(":").map(Number);
            const candidateDate = new Date(now);
            candidateDate.setDate(candidateDate.getDate() + dayOffset);
            candidateDate.setHours(slotH, slotM, 0, 0);

            if (candidateDate.getTime() > now.getTime() + 10 * 60 * 1000) {
              nextSlotTime = candidateDate;
              break;
            }
          }
          if (nextSlotTime) break;
        }

        calculatedScheduledAt = nextSlotTime || new Date(Date.now() + 24 * 3600000);
      } else {
        // Default tomorrow 10:00 AM
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        calculatedScheduledAt = tomorrow;
      }
      initialStatus = "SCHEDULED";
    }

    // Create the post in database
    const post = await prisma.post.create({
      data: {
        clientId,
        content,
        mediaUrls: JSON.stringify(mediaUrls),
        mediaType,
        status: initialStatus,
        scheduledAt: calculatedScheduledAt,
        publishedAt: scheduleType === "NOW" ? new Date() : null,
        aiPrompt: aiPrompt || null,
        targets: {
          create: accounts.map((acc) => ({
            accountId: acc.id,
            platform: acc.platform,
            status: scheduleType === "NOW" ? "PUBLISHED" : "PENDING",
          })),
        },
      },
      include: {
        targets: {
          include: { account: true },
        },
      },
    });

    // If publishing immediately, execute social platform API calls
    if (scheduleType === "NOW") {
      let anyFailed = false;

      for (const target of post.targets) {
        const result = await publishToPlatform(target.platform, target.account, {
          id: post.id,
          content,
          mediaUrls,
          mediaType,
        });

        await prisma.postTarget.update({
          where: { id: target.id },
          data: {
            status: result.success ? "PUBLISHED" : "FAILED",
            platformPostId: result.platformPostId || null,
            errorMessage: result.error || null,
            publishedAt: result.success ? new Date() : null,
          },
        });

        if (!result.success) anyFailed = true;
      }

      const finalStatus = anyFailed ? "FAILED" : "PUBLISHED";
      const updatedPost = await prisma.post.update({
        where: { id: post.id },
        data: { status: finalStatus },
        include: {
          targets: { include: { account: true } },
        },
      });

      return NextResponse.json({ post: updatedPost }, { status: 201 });
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (error: any) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
