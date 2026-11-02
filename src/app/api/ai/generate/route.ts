import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      topic,
      keywords = "",
      tone = "engaging",
      platform = "INSTAGRAM",
      contentType = "post", // "post" | "ad_copy" | "creative_prompt"
    } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: "Topic or product description is required" }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    // If Gemini key is available, call Gemini API
    if (geminiKey) {
      try {
        const prompt = `You are an elite social media strategist and ad copywriter.
Create a high-performing ${contentType} for ${platform}.
Topic: "${topic}"
Target Keywords: "${keywords}"
Tone: ${tone}

Format response with:
1. Hook / Headline
2. Engaging Body
3. Call to Action (CTA)
4. Platform-tailored Hashtags
5. Recommended Visual / Ad Creative prompt (for Midjourney / Gemini / Imagen)`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );
        const geminiData = await geminiRes.json();
        const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText) {
          return NextResponse.json({
            content: generatedText,
            source: "Google Gemini 1.5",
          });
        }
      } catch (geminiErr) {
        console.warn("Gemini call failed, falling back to smart generator:", geminiErr);
      }
    }

    // Smart generator fallback / template engine
    const kwList = keywords
      ? keywords.split(",").map((k: string) => k.trim().replace(/^#/, ""))
      : [topic.split(" ")[0] || "viral", "marketing", "trending"];

    const hashtagString = kwList
      .map((k: string) => `#${k.replace(/\s+/g, "")}`)
      .concat(["#GrowthMindset", "#Innovation", `#${platform.toLowerCase()}`])
      .slice(0, 8)
      .join(" ");

    let generatedCaption = "";
    let visualCreativeIdea = "";

    if (platform === "LINKEDIN") {
      generatedCaption = `💡 ${topic.toUpperCase()}: The Big Shift Happening Right Now.\n\nMost teams struggle with consistency. But when you align strategy with execution, the results speak for themselves:\n\n1. Focus on core value delivery\n2. Automate repetitive workflows\n3. Engage directly with your audience daily\n\nWhat is your biggest bottleneck when scaling? Let's discuss in the comments below! 👇\n\n${hashtagString}`;
      visualCreativeIdea = "Minimalist carousel slide deck or clean high-contrast infographic highlighting 3 growth pillars.";
    } else if (platform === "INSTAGRAM") {
      generatedCaption = `✨ Ready to elevate your game? Introducing ${topic}! 🔥\n\nCrafted for those who refuse to settle for ordinary. Whether you're leveling up your routine or looking for that fresh inspiration, we've got you covered.\n\n👇 Drop a 'YES' below if you want exclusive early access!\n\n${hashtagString} #InstaGood #DailyInspo`;
      visualCreativeIdea = "Vibrant, aesthetic lifestyle shot with warm natural lighting and clean typography overlay.";
    } else if (platform === "FACEBOOK") {
      generatedCaption = `🌟 Big announcement! We are thrilled to share ${topic} with our community.\n\nSwipe through the photos to see the details, and let us know what you think in the comments. Tag someone who needs to see this today!\n\n🔗 Link in the first comment.\n\n${hashtagString}`;
      visualCreativeIdea = "Multi-photo showcase or customer reaction collage.";
    } else if (platform === "PINTEREST") {
      generatedCaption = `📌 The Ultimate Guide to ${topic}. Save this pin for your next project inspiration!\n\nClick through to discover step-by-step ideas and styling tips.\n\n${hashtagString} #PinterestFinds #CreativeIdeas`;
      visualCreativeIdea = "Vertical 2:3 ratio high-resolution moodboard pin with elegant serif overlay title.";
    } else if (platform === "YOUTUBE") {
      generatedCaption = `🎬 Everything you need to know about ${topic}! What topic should we deep-dive into next? Drop your vote in the poll below.\n\n${hashtagString}`;
      visualCreativeIdea = "16:9 thumbnail preview with expressive facial expression and bold title typography.";
    } else {
      // GOOGLE BUSINESS PROFILE
      generatedCaption = `📢 Special Update: ${topic}! Visit us today or order online to experience the difference. Tap 'Learn More' below to get directions and view current offers.\n\n${hashtagString}`;
      visualCreativeIdea = "Storefront/product hero photo showing real-time availability and friendly atmosphere.";
    }

    return NextResponse.json({
      content: generatedCaption,
      visualCreativeIdea,
      hashtags: hashtagString,
      source: "OmniAI Smart Generator (Configure GEMINI_API_KEY for custom LLM prompts)",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
