"use client";

import { useState } from "react";

interface Props {
  text: string;
  className?: string;
  clampLines?: number;
}

export function ExpandableDescription({ text, className = "", clampLines = 1 }: Props) {
  const [expanded, setExpanded] = useState(false);

  const clampClass = `line-clamp-${clampLines}`;

  return (
    <div>
      <p className={`${className} ${expanded ? "" : clampClass}`}>{text}</p>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="text-xs text-[#56a963]/70 hover:text-[#56a963] transition-colors mt-0.5"
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}
