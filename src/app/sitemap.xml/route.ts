import { NextResponse } from "next/server";

const BASE = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "https://github-readme-roast.vercel.app";

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
