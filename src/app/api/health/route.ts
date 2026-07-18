import { NextResponse } from "next/server";

export const runtime = "edge";

export function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    groqConfigured: !!process.env.GROQ_API_KEY,
  });
}
