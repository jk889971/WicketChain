// ── Shared event status display config ──
// Used by MatchCard and the match detail page.
// DB value (e.g. "LIVE") is never shown raw — always mapped through these.

export const STATUS_LABEL: Record<string, string> = {
  CREATED:        "Upcoming",
  LIVE:           "Buy Tickets",
  REFUNDS_CLOSED: "Refunds Closed",
  GATES_OPEN:     "Gates Open",
  IN_PROGRESS:    "In Progress",
  COMPLETED:      "Completed",
  CANCELLED:      "Cancelled",
  POSTPONED:      "Postponed",
};

export const STATUS_STYLE: Record<string, string> = {
  CREATED:        "bg-white/10 text-white/70",
  LIVE:           "bg-[#56a963] text-white",
  REFUNDS_CLOSED: "bg-amber-500/80 text-white",
  GATES_OPEN:     "bg-[#56a963] text-white",
  IN_PROGRESS:    "bg-amber-500/80 text-white",
  COMPLETED:      "bg-white/10 text-white/50",
  CANCELLED:      "bg-red-500/80 text-white",
  POSTPONED:      "bg-amber-500/80 text-white",
};

/** Fallback style for any unknown future status */
export const STATUS_STYLE_FALLBACK = "bg-white/10 text-white/70";
