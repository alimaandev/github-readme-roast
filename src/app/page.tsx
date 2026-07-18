import ErrorBoundary from "@/components/ErrorBoundary";
import Roaster from "@/components/Roaster";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center">
      <div className="scanline fixed inset-0 pointer-events-none z-50" />

      <header className="w-full max-w-2xl mx-auto px-4 pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-zinc-500 tracking-wider uppercase">
            AI Powered · No Mercy
          </span>
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-3 leading-tight">
          <span className="bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400 bg-clip-text text-transparent">
            README Roast
          </span>
        </h1>
        <p className="text-zinc-500 font-mono text-sm max-w-md mx-auto leading-relaxed">
          Drop a GitHub repo URL. Our AI will dissect your README
          with surgical precision. Bring a thick skin.
        </p>
      </header>

      <main className="flex-1 w-full pb-24">
        <ErrorBoundary>
          <Roaster />
        </ErrorBoundary>
      </main>

      <footer className="w-full pb-8 text-center space-y-1">
        <p className="text-zinc-700 font-mono text-xs">
          Built with Next.js · Powered by Groq
        </p>
        <p className="text-zinc-800 font-mono text-[10px]">
          Not responsible for bruised egos
        </p>
      </footer>
    </div>
  );
}
