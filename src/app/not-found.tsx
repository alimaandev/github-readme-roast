import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 text-center">
      <span className="text-6xl font-mono font-bold text-zinc-800">404</span>
      <p className="mt-4 font-mono text-sm text-zinc-500">
        This page does not exist. Much like a well-written README.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 px-4 py-2 text-sm font-mono text-zinc-400 border border-zinc-800 rounded-lg hover:text-zinc-200 hover:border-zinc-700 transition"
      >
        ← Back to safety
      </Link>
    </div>
  );
}
