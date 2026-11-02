import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }

    const schedules = await prisma.scheduleSetting.findMany({
      where: { clientId },
      orderBy: [{ dayOfWeek: "asc" }, { timeSlot: "asc" }],
    });

    return NextResponse.json({ schedules });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientId, dayOfWeek, timeSlot, isEnabled = true } = body;

    if (!clientId || dayOfWeek === undefined || !timeSlot) {
      return NextResponse.json(
        { error: "clientId, dayOfWeek, and timeSlot are required" },
        { status: 400 }
      );
    }

    const schedule = await prisma.scheduleSetting.create({
      data: {
        clientId,
        dayOfWeek: Number(dayOfWeek),
        timeSlot,
        isEnabled: Boolean(isEnabled),
      },
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Schedule ID is required" }, { status: 400 });
    }

    await prisma.scheduleSetting.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
