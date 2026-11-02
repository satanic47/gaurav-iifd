import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        accounts: true,
        schedules: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ clients });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, avatarUrl } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Client name is required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") + `-${Date.now().toString(36).substring(4)}`;

    const newClient = await prisma.client.create({
      data: {
        name,
        slug,
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
        schedules: {
          create: [
            { dayOfWeek: 1, timeSlot: "10:00", isEnabled: true },
            { dayOfWeek: 3, timeSlot: "15:00", isEnabled: true },
            { dayOfWeek: 5, timeSlot: "18:00", isEnabled: true },
          ],
        },
      },
      include: {
        accounts: true,
        schedules: true,
      },
    });

    return NextResponse.json({ client: newClient }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
