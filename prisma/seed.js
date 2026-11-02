const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding initial data...");

  // Create Client 1: Fashion & Apparel Brand
  const client1 = await prisma.client.upsert({
    where: { slug: "luxe-fashion" },
    update: {},
    create: {
      name: "Luxe Fashion Studio",
      slug: "luxe-fashion",
      avatarUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=128&auto=format&fit=crop&q=80",
      accounts: {
        create: [
          {
            platform: "INSTAGRAM",
            accountName: "Luxe Fashion (@luxefashion)",
            accountId: "ig_luxe_101",
            username: "luxefashion",
            status: "CONNECTED",
            profilePic: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=96&auto=format&fit=crop&q=80",
          },
          {
            platform: "FACEBOOK",
            accountName: "Luxe Fashion Official Page",
            accountId: "fb_page_202",
            status: "CONNECTED",
            profilePic: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=96&auto=format&fit=crop&q=80",
          },
          {
            platform: "PINTEREST",
            accountName: "Luxe Styles & Trends",
            accountId: "pin_luxe_303",
            username: "luxestyles",
            status: "CONNECTED",
            profilePic: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=96&auto=format&fit=crop&q=80",
            metadata: JSON.stringify({ defaultBoard: "Spring Collection 2026" }),
          },
        ],
      },
      schedules: {
        create: [
          { dayOfWeek: 1, timeSlot: "10:00", isEnabled: true }, // Monday 10 AM
          { dayOfWeek: 1, timeSlot: "18:30", isEnabled: true }, // Monday 6:30 PM
          { dayOfWeek: 3, timeSlot: "11:00", isEnabled: true }, // Wednesday 11 AM
          { dayOfWeek: 5, timeSlot: "16:00", isEnabled: true }, // Friday 4 PM
          { dayOfWeek: 6, timeSlot: "12:00", isEnabled: true }, // Saturday 12 PM
        ],
      },
    },
  });

  // Create Client 2: Tech & B2B SaaS
  const client2 = await prisma.client.upsert({
    where: { slug: "cloudscale-ai" },
    update: {},
    create: {
      name: "CloudScale AI",
      slug: "cloudscale-ai",
      avatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80",
      accounts: {
        create: [
          {
            platform: "LINKEDIN",
            accountName: "CloudScale AI Company Page",
            accountId: "li_org_404",
            username: "cloudscale-ai",
            status: "CONNECTED",
            profilePic: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=96&auto=format&fit=crop&q=80",
          },
          {
            platform: "YOUTUBE",
            accountName: "CloudScale Tech Talks",
            accountId: "yt_channel_505",
            username: "@CloudScaleAI",
            status: "CONNECTED",
            profilePic: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=96&auto=format&fit=crop&q=80",
          },
          {
            platform: "GOOGLE_BUSINESS",
            accountName: "CloudScale AI HQ - New York",
            accountId: "gbp_loc_606",
            status: "CONNECTED",
            profilePic: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=96&auto=format&fit=crop&q=80",
          },
        ],
      },
      schedules: {
        create: [
          { dayOfWeek: 2, timeSlot: "09:30", isEnabled: true }, // Tuesday 9:30 AM
          { dayOfWeek: 4, timeSlot: "14:00", isEnabled: true }, // Thursday 2 PM
        ],
      },
    },
  });

  // Sample Post for Luxe Fashion
  await prisma.post.create({
    data: {
      clientId: client1.id,
      content: "🌸 Embrace the season with our new Summer Bloom ensemble! Lightweight, sustainably crafted, and effortlessly chic. Link in bio to shop the drop.\n\n#FashionTrends #SustainableFashion #SummerCollection #StyleInspo",
      mediaUrls: JSON.stringify([
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80",
      ]),
      mediaType: "IMAGE",
      status: "SCHEDULED",
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 3), // 3 hours from now
      targets: {
        create: [
          {
            accountId: (await prisma.socialAccount.findFirst({ where: { clientId: client1.id, platform: "INSTAGRAM" } })).id,
            platform: "INSTAGRAM",
            status: "PENDING",
          },
          {
            accountId: (await prisma.socialAccount.findFirst({ where: { clientId: client1.id, platform: "FACEBOOK" } })).id,
            platform: "FACEBOOK",
            status: "PENDING",
          },
        ],
      },
    },
  });

  console.log("Database seeded successfully with clients:", client1.name, "and", client2.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
