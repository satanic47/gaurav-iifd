import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.userSetting.findUnique({
      where: { id: "default_user" },
    });

    if (!settings) {
      settings = await prisma.userSetting.create({
        data: {
          id: "default_user",
          name: "Gaurav Sharma",
          email: "gaurav@iifd.edu",
          organization: "Gaurav IIFD Studio",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
          theme: "dark",
          planName: "Agency Enterprise",
          planStatus: "ACTIVE",
          postsUsed: 48,
          postsLimit: 1000,
          creditsUsed: 25,
          creditsLimit: 500,
          apiKeys: JSON.stringify({
            geminiKey: "",
            openAiKey: "",
            metaToken: "",
            linkedInToken: "",
            pinterestToken: "",
            youtubeKey: "",
          }),
        },
      });
    }

    return NextResponse.json({
      settings: {
        ...settings,
        apiKeys: JSON.parse(settings.apiKeys || "{}"),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      organization,
      avatarUrl,
      theme,
      apiKeys,
    } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (organization !== undefined) updateData.organization = organization;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (theme !== undefined) updateData.theme = theme;
    if (apiKeys !== undefined) updateData.apiKeys = JSON.stringify(apiKeys);

    const updated = await prisma.userSetting.upsert({
      where: { id: "default_user" },
      update: updateData,
      create: {
        id: "default_user",
        name: name || "Gaurav Sharma",
        email: email || "gaurav@iifd.edu",
        organization: organization || "Gaurav IIFD Studio",
        avatarUrl: avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        theme: theme || "dark",
        apiKeys: JSON.stringify(apiKeys || {}),
      },
    });

    return NextResponse.json({
      settings: {
        ...updated,
        apiKeys: JSON.parse(updated.apiKeys || "{}"),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
