"use client";

import { useState, useRef, useEffect, useCallback } from "react";

function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/\s?#]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

function getRatingColor(rating: number): string {
  if (rating <= 3) return "bg-red-500";
  if (rating <= 5) return "bg-orange-500";
  if (rating <= 7) return "bg-yellow-500";
  return "bg-emerald-500";
}

function getRatingLabel(rating: number): string {
  if (rating <= 2) return "War Crime";
  if (rating <= 4) return "Painful";
  if (rating <= 6) return "Mediocre";
  if (rating <= 8) return "Decent";
  return "Actually Good";
}

const LOADING_STEPS = [
  "Resolving repository...",
  "Fetching README...",
  "Analyzing cringe patterns...",
  "Consulting AI roast model...",
  "Preparing verdict...",
];

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index++;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayed}</span>;
}

export default function Roaster() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    roast: string;
    rating: number;
    one_liner: string;
    highlights: string[];
  } | null>(null);
  const [phase, setPhase] = useState<"idle" | "fetching" | "roasting" | "done">("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase === "fetching" || phase === "roasting") {
      const timer = setInterval(() => {
        setStepIndex((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1));
      }, 2500);
      return () => clearInterval(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [result]);

  const handleRoast = useCallback(async () => {
    setError("");
    setResult(null);
    setStepIndex(0);
    setLoading(true);

    const trimmed = url.trim();
    const parsed = parseRepoUrl(trimmed);
    if (!parsed) {
      setError("Invalid GitHub URL. Use format: https://github.com/owner/repo");
      setLoading(false);
      return;
    }

    setPhase("fetching");

    try {
      let readmeRes = await fetch(
        `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/main/README.md`
      );

      if (readmeRes.status === 404) {
        readmeRes = await fetch(
          `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/master/README.md`
        );
      }

      if (readmeRes.status === 404) {
        throw new Error("README not found on main or master branch.");
      }

      const readme = await readmeRes.text();

      if (!readme || readme.length < 10) {
        throw new Error("README is empty or too short to roast.");
      }

      setPhase("roasting");

      const roastRes = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readme }),
      });

      const data = await roastRes.json();

      if (!roastRes.ok) {
        throw new Error(data.error || "Roast failed");
      }

      setResult(data);
      setPhase("done");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [url]);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    const text = `README Roast: ${result.rating}/10\n${result.one_liner}\n\n${result.roast}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may not be available in all contexts
    }
  }, [result]);

  return (
    <div
      className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 gap-8"
      role="application"
      aria-label="README Roast Tool"
    >
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="repo-url" className="text-sm font-mono text-zinc-500">
            {inputFocused ? "$ " : ""}Repository URL
          </label>
          {url && !loading && (
            <button
              onClick={() => {
                setUrl("");
                inputRef.current?.focus();
              }}
              className="text-xs font-mono text-zinc-600 hover:text-zinc-400 transition"
              aria-label="Clear input"
            >
              clear
            </button>
          )}
        </div>
        <div className="relative group">
          <input
            ref={inputRef}
            id="repo-url"
            type="url"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            autoCapitalize="none"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleRoast()}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="https://github.com/facebook/react"
            aria-label="GitHub repository URL"
            aria-disabled={loading}
            className="w-full px-4 py-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-zinc-100 font-mono text-sm placeholder-zinc-700 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition peer"
            disabled={loading}
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 peer-focus:from-emerald-500/5 peer-focus:via-emerald-500/0 peer-focus:to-emerald-500/5 transition duration-500 pointer-events-none" />
        </div>
      </div>

      <button
        onClick={handleRoast}
        disabled={loading || !url.trim()}
        aria-label={loading ? "Processing roast" : "Roast this README"}
        className="relative px-10 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-white font-semibold rounded-xl transition-all text-sm uppercase tracking-[0.15em] disabled:cursor-not-allowed glow-border disabled:animate-none overflow-hidden group"
      >
        {loading ? (
          <span className="flex items-center gap-3">
            <svg
              className="animate-spin h-4 w-4 text-emerald-300"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Processing...</span>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">🔥</span>
            Roast This README
          </span>
        )}
      </button>

      {loading && (
        <div className="w-full max-w-md mx-auto space-y-3 animate-fade-slide-up" role="status" aria-label="Loading progress">
          {LOADING_STEPS.map((step, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 font-mono text-xs transition-all duration-500 ${
                i < stepIndex
                  ? "text-emerald-500"
                  : i === stepIndex
                  ? "text-zinc-300"
                  : "text-zinc-700"
              }`}
              aria-current={i === stepIndex ? "step" : undefined}
            >
              <span className="w-4 text-center" aria-hidden="true">
                {i < stepIndex ? "✓" : i === stepIndex ? ">" : " "}
              </span>
              <span className={i === stepIndex ? "typing-cursor" : ""}>
                {step}
              </span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div
          className="w-full p-4 bg-red-950/40 border border-red-900/50 rounded-xl animate-fade-slide-up"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <span className="text-red-400 mt-0.5" aria-hidden="true">!</span>
            <div>
              <p className="text-red-400 font-mono text-sm font-medium">Error</p>
              <p className="text-red-300/70 font-mono text-xs mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div ref={resultRef} className="w-full space-y-6" role="region" aria-label="Roast result">
          <div className="space-y-4 animate-fade-slide-up animate-fade-slide-up-delay-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono text-zinc-600 uppercase tracking-[0.2em]">
                Verdict
              </h2>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-mono text-zinc-600 hover:text-zinc-400 transition"
                aria-label={copied ? "Copied to clipboard" : "Copy roast to clipboard"}
              >
                {copied ? (
                  <>Copied</>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold font-mono text-white">
                    {result.rating}
                    <span className="text-zinc-600 text-lg">/10</span>
                  </span>
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                    {getRatingLabel(result.rating)}
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden" role="progressbar" aria-valuenow={result.rating} aria-valuemin={0} aria-valuemax={10} aria-label={`Rating: ${result.rating} out of 10`}>
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${getRatingColor(result.rating)}`}
                    style={{ width: `${(result.rating / 10) * 100}%`, animation: "bar-fill 1s ease-out" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {result.one_liner && (
            <div className="animate-fade-slide-up animate-fade-slide-up-delay-2">
              <p className="text-base font-medium text-zinc-300 italic border-l-2 border-emerald-600/50 pl-4 leading-relaxed">
                &ldquo;{result.one_liner}&rdquo;
              </p>
            </div>
          )}

          {result.highlights.length > 0 && (
            <div className="space-y-2 animate-fade-slide-up animate-fade-slide-up-delay-3">
              <h3 className="text-xs font-mono text-zinc-600 uppercase tracking-[0.2em]">
                Called Out
              </h3>
              <div className="space-y-1.5">
                {result.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-2.5 bg-red-950/20 border border-red-900/20 rounded-lg"
                  >
                    <span className="text-red-400/60 text-xs mt-0.5" aria-hidden="true">#</span>
                    <span className="text-zinc-400 font-mono text-xs leading-relaxed">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="relative p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl animate-fade-slide-up animate-fade-slide-up-delay-4">
            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-emerald-600/30 to-transparent" />
            <div className="prose prose-invert max-w-none">
              {result.roast.split("\n\n").map((paragraph, i) => (
                <p
                  key={i}
                  className="text-zinc-300 leading-relaxed mb-4 last:mb-0 font-mono text-sm"
                >
                  <TypewriterText text={paragraph} />
                </p>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center animate-fade-slide-up animate-fade-slide-up-delay-5">
            <button
              onClick={() => {
                setResult(null);
                setUrl("");
                setPhase("idle");
                inputRef.current?.focus();
              }}
              className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-400 transition font-mono px-4 py-2 border border-zinc-800 rounded-lg hover:border-zinc-700"
            >
              Roast Another Repo
              <span className="text-lg" aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
