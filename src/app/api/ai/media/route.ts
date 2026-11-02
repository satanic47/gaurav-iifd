import { NextResponse } from "next/server";

// Curated high-fidelity generative visual library representing diverse prompts
const SAMPLE_GENERATIONS = {
  fashion: [
    {
      url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop&q=80",
      thumbnail: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&auto=format&fit=crop&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1000&auto=format&fit=crop&q=80",
      thumbnail: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&auto=format&fit=crop&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&auto=format&fit=crop&q=80",
      thumbnail: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&auto=format&fit=crop&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1000&auto=format&fit=crop&q=80",
      thumbnail: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300&auto=format&fit=crop&q=80",
    },
  ],
  tech: [
    {
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80",
      thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1000&auto=format&fit=crop&q=80",
      thumbnail: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=300&auto=format&fit=crop&q=80",
    },
  ],
  videos: [
    {
      url: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-neon-lights-39878-large.mp4",
      thumbnail: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&auto=format&fit=crop&q=80",
    },
    {
      url: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-in-a-green-dress-walking-in-a-park-41364-large.mp4",
      thumbnail: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80",
    },
  ],
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      prompt,
      mediaType = "IMAGE", // "IMAGE" | "VIDEO"
      aspectRatio = "1:1",
      style = "Fashion Editorial",
    } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Creative prompt is required" }, { status: 400 });
    }

    // Simulate AI generation latency (1.2 seconds)
    await new Promise((r) => setTimeout(r, 1200));

    let selectedMedia;
    if (mediaType === "VIDEO") {
      const vidList = SAMPLE_GENERATIONS.videos;
      selectedMedia = vidList[Math.floor(Math.random() * vidList.length)];
    } else {
      const isTech = /tech|ai|code|data|future|device|software/i.test(prompt);
      const pool = isTech ? SAMPLE_GENERATIONS.tech : SAMPLE_GENERATIONS.fashion;
      selectedMedia = pool[Math.floor(Math.random() * pool.length)];
    }

    const genId = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    return NextResponse.json({
      id: genId,
      mediaUrl: selectedMedia.url,
      thumbnailUrl: selectedMedia.thumbnail,
      prompt,
      mediaType,
      aspectRatio,
      style,
      engine: mediaType === "VIDEO" ? "Google Veo / Runway Gen-3" : "Google Imagen 3 / FLUX.1 Pro",
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
