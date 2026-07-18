# 🔥 README Roast

> Drop a GitHub repo URL. Get your README destroyed by AI. No mercy.

A single-page Next.js app that uses Groq AI to analyze and roast GitHub READMEs with surgical precision. Dark theme, terminal vibes, savage rating system.

## How it works

1. Paste a GitHub repo URL (`https://github.com/user/repo`)
2. App fetches the README from `raw.githubusercontent.com`
3. Groq's `llama-3.3-70b-versatile` analyzes it for:
   - Vague descriptions, badge spam, "coming soon" rot
   - Bloated tech stacks, cringey "built with ❤️" lines
   - Typos, walls of text, missing sections
4. Returns a structured roast with rating, one-liner, and specific call-outs

## Features

- **Savage meter** — Animated rating bar from "War Crime" to "Actually Good"
- **Typewriter effect** — Roast text appears character by character
- **Called Out** — Specific cringeworthy lines highlighted from your README
- **One-liner** — A devastating summary pull-quote
- **Copy to clipboard** — Share your roast with friends
- **5-step loading progress** — See exactly what's happening
- **Rate limited** — 10 requests/minute per IP
- **Accessible** — ARIA labels, keyboard navigation, semantic HTML

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS 4 |
| AI | Groq API (`llama-3.3-70b-versatile`) |
| Fonts | Geist (Vercel) |
| Bundler | Turbopack |

## Getting started

```bash
git clone https://github.com/YOUR_USERNAME/github-readme-roast.git
cd github-readme-roast
npm install
```

Create `.env.local`:

```bash
GROQ_API_KEY=gsk_your_key_here
```

Get a key at [console.groq.com/keys](https://console.groq.com/keys).

Run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API

### `POST /api/roast`

```json
{
  "readme": "# My Project\n..."
}
```

Returns:

```json
{
  "roast": "2-3 paragraphs of surgical sarcasm",
  "rating": 3,
  "one_liner": "A devastating summary",
  "highlights": ["specific cringe line 1", "specific cringe line 2"]
}
```

### `GET /api/health`

```json
{
  "status": "ok",
  "timestamp": "2026-07-18T...",
  "groqConfigured": true
}
```

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Set `GROQ_API_KEY` as an environment variable in your Vercel project.

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── health/route.ts    # Health check endpoint
│   │   └── roast/route.ts    # Roast generation API
│   ├── globals.css            # Tailwind + animations
│   ├── layout.tsx             # Root layout + SEO metadata
│   ├── not-found.tsx          # Custom 404
│   ├── page.tsx               # Homepage
│   ├── robots.ts              # SEO
│   └── sitemap.ts             # SEO
├── components/
│   ├── ErrorBoundary.tsx       # Client-side crash catcher
│   └── Roaster.tsx            # Main UI component
```

## License

MIT
