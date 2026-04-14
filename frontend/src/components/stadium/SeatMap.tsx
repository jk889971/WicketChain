"use client";

import { useMemo } from "react";
import { Armchair } from "lucide-react";

export interface SeatStatus {
  row: string;
  seat: number;
  state: "available" | "held" | "booked" | "selected" | "yours";
}

interface SeatMapProps {
  enclosureName: string;
  rows: { row_label: string; seat_count: number; seat_numbers?: number[] | null }[];
  seatStatuses: SeatStatus[];
  selectedSeats: { row: string; seat: number }[];
  onToggleSeat: (row: string, seat: number) => void;
  bulkSelect: boolean;
}

const STATE_COLORS: Record<string, { fill: string; border: string; cursor: string }> = {
  available: { fill: "transparent", border: "#56a963", cursor: "pointer" },
  held: { fill: "#EAB308", border: "#EAB308", cursor: "not-allowed" },
  booked: { fill: "#EF4444", border: "#EF4444", cursor: "not-allowed" },
  selected: { fill: "transparent", border: "#3B82F6", cursor: "pointer" },
  yours: { fill: "#3B82F6", border: "#3B82F6", cursor: "not-allowed" },
};

const STATE_LABELS = [
  { label: "AVAILABLE", color: "#56a963", filled: false },
  { label: "HELD", color: "#EAB308", filled: true },
  { label: "BOOKED", color: "#EF4444", filled: true },
  { label: "SELECTED", color: "#3B82F6", filled: false },
  { label: "YOURS", color: "#3B82F6", filled: true },
];

function SeatIcon({
  state,
  row,
  seat,
  onClick,
}: {
  state: string;
  row: string;
  seat: number;
  onClick: () => void;
}) {
  const style = STATE_COLORS[state] || STATE_COLORS.available;
  const isClickable = state === "available" || state === "selected";

  return (
    <button
      type="button"
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className="relative group flex flex-col items-center justify-center w-9 h-11 min-[480px]:w-10 min-[480px]:h-12 rounded-md transition-colors duration-150 hover:bg-white/10 disabled:hover:bg-transparent"
      style={{
        border: `2px solid ${style.border}`,
        backgroundColor: style.fill,
        cursor: style.cursor,
        opacity: state === "booked" ? 0.5 : 1,
      }}
      title={
        state === "held"
          ? "Held by another user"
          : state === "booked"
            ? "Already booked"
            : state === "yours"
              ? "You own this seat"
              : `Row ${row}, Seat ${seat}`
      }
    >
      <Armchair
        size={14}
        className={
          style.fill !== "transparent" ? "text-white" : ""
        }
        style={
          style.fill === "transparent" ? { color: style.border } : undefined
        }
      />
      <span
        className="text-[8px] font-mono leading-none mt-0.5"
        style={{
          color: style.fill !== "transparent" ? "rgba(255,255,255,0.8)" : style.border,
        }}
      >
        {seat}
      </span>
    </button>
  );
}

export function SeatMap({
  enclosureName,
  rows,
  seatStatuses,
  selectedSeats,
  onToggleSeat,
}: SeatMapProps) {
  // Build a lookup: `${row}-${seat}` => state
  const statusMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of seatStatuses) {
      map[`${s.row}-${s.seat}`] = s.state;
    }
    for (const s of selectedSeats) {
      map[`${s.row}-${s.seat}`] = "selected";
    }
    return map;
  }, [seatStatuses, selectedSeats]);

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-bold font-heading">2. Select Your Seats</h2>
      </div>
      <p className="text-sm text-[#56a963] mb-4">{enclosureName}</p>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 min-[500px]:gap-3 mb-6">
        {STATE_LABELS.map((item) => (
          <div key={item.label} className="flex items-center gap-1 min-[500px]:gap-1.5">
            <div
              className="w-3.5 h-3.5 min-[500px]:w-5 min-[500px]:h-5 rounded-sm flex items-center justify-center"
              style={{
                border: `2px solid ${item.color}`,
                backgroundColor: item.filled ? item.color : "transparent",
              }}
            >
              <Armchair
                size={7}
                className="min-[500px]:hidden"
                style={{ color: item.filled ? "white" : item.color }}
              />
              <Armchair
                size={10}
                className="hidden min-[500px]:block"
                style={{ color: item.filled ? "white" : item.color }}
              />
            </div>
            <span className="text-[7px] min-[500px]:text-[10px] uppercase tracking-wider text-white/50">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Seat Grid by Rows */}
      <div className="space-y-3 overflow-x-auto">
        {rows.map((row) => {
          // Use sparse seat_numbers if available, otherwise fallback to 1..seat_count
          const seatNumbers: number[] =
            row.seat_numbers && row.seat_numbers.length > 0
              ? row.seat_numbers
              : Array.from({ length: row.seat_count }, (_, i) => i + 1);

          return (
            <div key={row.row_label} className="flex items-center gap-2">
              {/* Row Label */}
              <span className="w-6 text-center text-sm font-bold text-white/60 shrink-0">
                {row.row_label}
              </span>

              {/* Seats */}
              <div className="flex flex-wrap gap-1.5">
                {seatNumbers.map((seatNum) => {
                  const key = `${row.row_label}-${seatNum}`;
                  const state = statusMap[key] || "available";

                  return (
                    <SeatIcon
                      key={key}
                      state={state}
                      row={row.row_label}
                      seat={seatNum}
                      onClick={() => onToggleSeat(row.row_label, seatNum)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SeatMapPlaceholder() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
      <Armchair size={40} className="text-white/10 mb-3" />
      <p className="text-white/40 text-sm">
        Select an enclosure from the map to view seats
      </p>
    </div>
  );
}
