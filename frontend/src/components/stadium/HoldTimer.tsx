"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

interface HoldTimerProps {
  expiresAt: Date;
  onExpired: () => void;
}

export function HoldTimer({ expiresAt, onExpired }: HoldTimerProps) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const secs = Math.max(
        0,
        Math.floor((expiresAt.getTime() - Date.now()) / 1000)
      );
      setRemaining(secs);
      if (secs <= 0) {
        clearInterval(interval);
        onExpired();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isUrgent = remaining <= 120;

  return (
    <div
      className={`flex items-center gap-1.5 text-sm font-mono font-bold ${
        isUrgent ? "text-amber-400" : "text-[#56a963]"
      }`}
    >
      <Timer size={14} />
      <span>
        {minutes}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
}
