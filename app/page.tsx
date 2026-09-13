"use client";
import { useState } from "react";
import { Link2, Sparkles } from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ roast: string; screenshot: string } | null>(null);

  const loadingMsgs = [
    "questioning your life choices...",
    "counting your broken links...",
    "judging your font choices...",
    "checking if your CTA button even works...",
  ];
  const [msgIdx, setMsgIdx] = useState(0);

  async function handleRoast() {
    if (!url) return;
    setLoading(true);
    setResult(null);
    const interval = setInterval(() => setMsgIdx((i) => (i + 1) % loadingMsgs.length), 3000);

    const res = await fetch("/api/roast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    clearInterval(interval);
    setLoading(false);
    setResult(data);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 flex flex-col items-center">
      {/* Background blobs */}
      <div className="absolute top-40 -left-20 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-40" />
      <div className="absolute top-1/3 right-20 w-16 h-16 bg-blue-300 rounded-full blur-md opacity-50" />
      <div className="absolute bottom-40 left-24 w-10 h-10 bg-blue-300 rounded-full blur-sm opacity-50" />

      {/* Nav */}
      <div className="relative z-10 w-full flex justify-between items-center px-10 py-6">
        <div className="flex items-center gap-2 text-lg font-bold">
          <span className="text-blue-500">💧</span>
          <span className="text-slate-900">RoastMy</span>
          <span className="text-blue-500">Website</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
          <span>Fast</span>
          <span>•</span>
          <span>No Signup</span>
          <span>•</span>
          <span>Brutal Honesty</span>
        </div>
      </div>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center text-center mt-16 px-4">
        <div className="text-6xl mb-4">🔥</div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
          <span className="text-slate-900">Roast My </span>
          <span className="text-blue-500">Website</span>
        </h1>
        <p className="mt-4 text-lg text-slate-500">~30 seconds, no signup, brutal honesty</p>

        {/* Input pill */}
        <div className="mt-10 flex items-center gap-3 bg-white/70 backdrop-blur-md rounded-full p-2 shadow-lg border border-white w-full max-w-xl">
          <div className="flex items-center gap-2 flex-1 pl-4">
            <Link2 className="w-4 h-4 text-slate-400" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRoast()}
              placeholder="yourwebsite.com"
              className="flex-1 bg-transparent outline-none py-3 text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={handleRoast}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 transition disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? "Roasting..." : "Roast It"}
          </button>
        </div>

        {loading && (
          <p className="mt-4 text-slate-400 italic text-sm">{loadingMsgs[msgIdx]}</p>
        )}

        {/* Result */}
        {result?.roast && (
          <div className="mt-10 max-w-xl bg-white/80 backdrop-blur-md border border-white rounded-2xl p-6 shadow-lg text-left">
            <p className="text-slate-800 text-lg leading-relaxed">{result.roast}</p>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                "Got my website roasted\n\n" + result.roast.slice(0, 200) + "\n\ntry it:"
              )}&url=https://your-domain.vercel.app`}
              target="_blank"
              className="inline-block mt-4 text-blue-500 font-medium underline"
            >
              Share on X
            </a>
          </div>
        )}
      </div>
    </main>
  );
}