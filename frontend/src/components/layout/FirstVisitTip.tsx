"use client";

import { useEffect, useState } from "react";
import { X, Sparkles, Ticket, ShoppingBag, QrCode } from "lucide-react";

const STORAGE_KEY = "wicketchain:first-visit-dismissed";

const TIPS = [
  { icon: Ticket,      text: "Buy soulbound NFT tickets — yours forever on-chain." },
  { icon: ShoppingBag, text: "Order stadium snacks tied to your seat ticket."       },
  { icon: QrCode,      text: "Show your QR code at the gate to enter the stadium."  },
];

export function FirstVisitTip() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage unavailable (SSR / private browsing) — skip silently
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* noop */ }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm mx-auto px-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-[#0e0e0e] border border-[#56a963]/30 rounded-2xl shadow-2xl p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#56a963] shrink-0" />
            <p className="text-sm font-bold text-white">Welcome to WicketChain</p>
          </div>
          <button
            onClick={dismiss}
            className="text-white/30 hover:text-white/60 transition-colors shrink-0"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>

        <ul className="space-y-2">
          {TIPS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2">
              <Icon size={12} className="text-[#56a963] mt-0.5 shrink-0" />
              <span className="text-xs text-white/50">{text}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={dismiss}
          className="mt-4 w-full py-2 rounded-xl text-xs font-bold text-[#002a0c] hover:opacity-90 transition-opacity"
          style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
