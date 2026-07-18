import { NextResponse } from "next/server";

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const MAX_README_LENGTH = 16000;
const TIMEOUT_MS = 25000;

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

const SYSTEM_PROMPT = `You are a savage, witty README critic. Your job is to roast GitHub READMEs with surgical precision.

Analyze the README for:
- Vague/generic descriptions ("A full-stack app" — groundbreaking)
- Badge spam (15 badges for passing CI, a tweet, and someone's horoscope)
- "Coming soon" / "TODO" sections rotting for years
- Bloated tech stack listing every dependency like it's a resume
- Cringey "built with ❤️", "powered by coffee" nonsense
- Typos, bad grammar, copy-paste relics
- Walls of text nobody will read
- Missing install/usage/contributing sections
- Overly self-promotional "we're hiring!" vibes
- Outdated info (Node.js 12? In 2026?)
- "It just works" energy with zero proof

Return valid JSON only with exactly this structure:
{
  "roast": "2-3 punchy paragraphs. Each paragraph separated by \\n\\n. Be specific, quote the README, make it hurt.",
  "rating": <number between 1-10>,
  "one_liner": "A single devastating summary line",
  "highlights": [
    "Specific cringeworthy line from README",
    "Another thing you roasted"
  ]
}

Rules:
- rating: 1 = absolutely dire, 10 = actually decent
- Be funny, not mean. Sarcasm > insults
- Quote real lines from their README
- 2-3 highlights minimum
- Keep highlights short and punchy`;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { readme } = body || {};

    if (!readme || typeof readme !== "string") {
      return NextResponse.json({ error: "README content is required" }, { status: 400 });
    }

    if (readme.length > MAX_README_LENGTH) {
      return NextResponse.json({ error: "README too large" }, { status: 413 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("GROQ_API_KEY is not set");
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(GROQ_API, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Roast this README:\n\n${readme.slice(0, 8000)}` },
          ],
          temperature: 0.85,
          max_tokens: 1024,
          response_format: { type: "json_object" },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Groq API error:", res.status, err);
        return NextResponse.json({ error: "AI service error" }, { status: 502 });
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        return NextResponse.json({ error: "No response from AI" }, { status: 502 });
      }

      const parsed = JSON.parse(content);

      return NextResponse.json({
        roast: parsed.roast || "Could not generate roast.",
        rating: typeof parsed.rating === "number" ? parsed.rating : 5,
        one_liner: parsed.one_liner || "",
        highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "Request timed out" }, { status: 504 });
    }
    console.error("Roast error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
