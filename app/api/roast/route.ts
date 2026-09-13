import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import playwright from "playwright-core";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { url: rawUrl } = await req.json();

  if (!rawUrl) {
    return NextResponse.json({ error: "URL missing" }, { status: 400 });
  }

  const url =
    rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
      ? rawUrl
      : `https://${rawUrl}`;

  let browser;
  try {
    const isLocal = process.env.NODE_ENV === "development";

    browser = await playwright.chromium.launch({
      args: isLocal ? [] : chromium.args,
      executablePath: isLocal ? undefined : await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });

    const data = await page.evaluate(() => ({
      title: document.title,
      metaDesc: document.querySelector('meta[name="description"]')?.getAttribute("content") || "none",
      imgCount: document.querySelectorAll("img").length,
      imgNoAlt: Array.from(document.querySelectorAll("img")).filter((i) => !i.getAttribute("alt")).length,
      h1Count: document.querySelectorAll("h1").length,
      bodyText: document.body.innerText.slice(0, 500),
    }));

    console.log("SCRAPED DATA:", JSON.stringify(data, null, 2));

    const screenshotBuffer = await page.screenshot();
    const screenshot = screenshotBuffer.toString("base64");

    await browser.close();
    browser = undefined;

    const roastPrompt = `You are the most savage, ruthless website critic on the internet. Roast this website mercilessly based on the real data below — don't hold back, be brutally harsh and cutting, like a comedian doing a scathing roast set. Stay grounded in these actual facts, don't invent issues that aren't here, but exaggerate and mock them hard. Use 3-5 relevant emojis scattered naturally through the roast to add punch (fire, skull, clown, etc). Keep it under 150 words, punchy, meme-able, quotable. Respond only in English. Do not use markdown formatting — no asterisks, no bold, no bullet points, plain text with emojis only.

Website data:
- Title: ${data.title}
- Meta description: ${data.metaDesc}
- Total images: ${data.imgCount}, images missing alt text: ${data.imgNoAlt}
- H1 tags: ${data.h1Count}
- Visible text sample: ${data.bodyText}`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [{ role: "user", content: roastPrompt }],
      max_tokens: 500,
    });

    console.log("GROQ FULL RESPONSE:", JSON.stringify(completion, null, 2));

    let roast =
      completion.choices[0]?.message?.content?.trim() ||
      "Couldn't even roast this one, that's how boring it is.";

    roast = roast.replace(/\*\*/g, "").replace(/\*/g, "");

    return NextResponse.json({
      roast,
      screenshot: `data:image/png;base64,${screenshot}`,
    });
  } catch (err) {
    console.error("ROAST ERROR:", err);
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
    return NextResponse.json(
      { error: "Scan failed", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}