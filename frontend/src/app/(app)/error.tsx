"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[WicketChain] Route error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-5 mx-auto">
        <AlertTriangle size={28} className="text-red-400" />
      </div>

      <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
      <p className="text-sm text-white/40 mb-6">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#002a0c] hover:opacity-90 transition-opacity"
          style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
        >
          <RotateCcw size={14} />
          Try Again
        </button>
        <Link
          href="/matches"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/5 text-white/60 border border-white/10 hover:bg-white/8 transition-colors"
        >
          <Home size={14} />
          Go Home
        </Link>
      </div>

      {error.digest && (
        <p className="mt-6 text-[11px] text-white/20 font-mono">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
