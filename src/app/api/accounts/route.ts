import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    const where = clientId ? { clientId } : {};
    const accounts = await prisma.socialAccount.findMany({
      where,
      orderBy: { platform: "asc" },
    });

    return NextResponse.json({ accounts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      clientId,
      platform,
      accountName,
      accountId,
      username,
      profilePic,
      accessToken,
      metadata,
    } = body;

    if (!clientId || !platform || !accountName) {
      return NextResponse.json(
        { error: "clientId, platform, and accountName are required" },
        { status: 400 }
      );
    }

    const safeAccountId = accountId || `${platform.toLowerCase()}_${Date.now()}`;

    // Upsert so if the user reconnects the same account ID, it refreshes tokens
    const account = await prisma.socialAccount.upsert({
      where: {
        clientId_platform_accountId: {
          clientId,
          platform,
          accountId: safeAccountId,
        },
      },
      update: {
        accountName,
        username: username || null,
        profilePic: profilePic || null,
        accessToken: accessToken || null,
        status: "CONNECTED",
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
      create: {
        clientId,
        platform,
        accountName,
        accountId: safeAccountId,
        username: username || null,
        profilePic: profilePic || null,
        accessToken: accessToken || null,
        status: "CONNECTED",
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return NextResponse.json({ account });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
