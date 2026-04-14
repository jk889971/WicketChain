"use client";

import { useState, useMemo } from "react";

// Enclosure category colors (fallback)
const CATEGORY_COLORS: Record<string, string> = {
  GENERAL: "#F5A623",
  FIRST_CLASS: "#E53E3E",
  PREMIUM: "#00A651",
  VIP: "#4A90D9",
  VVIP: "#FFD700",
  VVIP_GALLERY: "#9B59B6",
};

const LEGEND = [
  { label: "General", color: "#F5A623" },
  { label: "First Class", color: "#E53E3E" },
  { label: "Premium", color: "#00A651" },
  { label: "VIP", color: "#4A90D9" },
  { label: "VVIP", color: "#FFD700" },
  { label: "Gallery", color: "#9B59B6" },
];

export interface Enclosure {
  id: string;
  enclosure_id_onchain: number;
  name: string;
  category: string;
  color: string;
  svg_path_id: string | null;
  total_seats: number;
  is_active?: boolean;
  enclosure_rows: { row_label: string; seat_count: number; seat_numbers?: number[] | null }[];
}

interface StadiumMapProps {
  enclosures: Enclosure[];
  selectedEnclosureId: string | null;
  onSelectEnclosure: (enclosure: Enclosure) => void;
  seatAvailability: Record<string, { total: number; booked: number }>;
  priceMap: Record<string, string>;
  disabled?: boolean;
}

/*
 * ── Symmetric layout around Rawalpindi Cricket Stadium ──
 *
 * Axis rules:
 *   0°   = top   → gap between Javed Akhtar & Azhar Mehmood (perfectly centred)
 *   180° = bottom → gap between Gallery 2 & Gallery 1 (perfectly centred)
 *
 * Clockwise from 0°:
 *   Azhar Mehmood  Premium      0°  →  32°    (32°)
 *   Miran Bakhsh   General     32°  →  87°    (55°)
 *   Yasir Arafat   First Class 87°  → 128°    (41°)
 *   Javed Miandad  VIP        128°  → 162°    (34°)
 *   Gallery 2      VVIP       162°  → 180°    (18°)
 *   Gallery 1      VVIP       180°  → 198°    (18°)
 *   Imran Khan     VIP        198°  → 232°    (34°)
 *   Shoaib Akhtar  First Class232°  → 273°    (41°)
 *   Sohail Tanveer General    273°  → 328°    (55°)
 *   Javed Akhtar   Premium    328°  → 360°    (32°)
 *                                          ─────────
 *                                          360°  ✓
 *
 * Left / right sides are mirror images → both axes are perfectly centred.
 */

export interface SectionLayout {
  svgPathId: string;
  startAngle: number;
  endAngle: number;
}

export const SECTION_LAYOUTS: SectionLayout[] = [
  { svgPathId: "azhar-mehmood",  startAngle:   0, endAngle:  32 },
  { svgPathId: "miran-bakhsh",   startAngle:  32, endAngle:  87 },
  { svgPathId: "yasir-arafat",   startAngle:  87, endAngle: 128 },
  { svgPathId: "javed-miandad",  startAngle: 128, endAngle: 162 },
  { svgPathId: "gallery-2",      startAngle: 162, endAngle: 180 },
  { svgPathId: "gallery-1",      startAngle: 180, endAngle: 198 },
  { svgPathId: "imran-khan",     startAngle: 198, endAngle: 232 },
  { svgPathId: "shoaib-akhtar",  startAngle: 232, endAngle: 273 },
  { svgPathId: "sohail-tanveer", startAngle: 273, endAngle: 328 },
  { svgPathId: "javed-akhtar",   startAngle: 328, endAngle: 360 },
];

const CATEGORY_SHORT: Record<string, string> = {
  GENERAL: "GENERAL",
  FIRST_CLASS: "FIRST CLASS",
  PREMIUM: "PREMIUM",
  VIP: "VIP",
  VVIP: "VVIP",
  VVIP_GALLERY: "VVIP",
};

export function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function generateArcPath(
  cx: number,
  cy: number,
  outerRx: number,
  outerRy: number,
  innerRx: number,
  innerRy: number,
  startDeg: number,
  endDeg: number
) {
  // SVG 0° = top, clockwise → convert to math angles (0°=right, CCW)
  const startRad = degToRad(startDeg - 90);
  const endRad   = degToRad(endDeg   - 90);

  let sweep = endDeg - startDeg;
  if (sweep < 0) sweep += 360;
  const largeArc = sweep > 180 ? 1 : 0;

  const outerStart = { x: cx + outerRx * Math.cos(startRad), y: cy + outerRy * Math.sin(startRad) };
  const outerEnd   = { x: cx + outerRx * Math.cos(endRad),   y: cy + outerRy * Math.sin(endRad)   };
  const innerStart = { x: cx + innerRx * Math.cos(endRad),   y: cy + innerRy * Math.sin(endRad)   };
  const innerEnd   = { x: cx + innerRx * Math.cos(startRad), y: cy + innerRy * Math.sin(startRad) };

  return [
    `M ${outerStart.x.toFixed(2)} ${outerStart.y.toFixed(2)}`,
    `A ${outerRx} ${outerRy} 0 ${largeArc} 1 ${outerEnd.x.toFixed(2)} ${outerEnd.y.toFixed(2)}`,
    `L ${innerStart.x.toFixed(2)} ${innerStart.y.toFixed(2)}`,
    `A ${innerRx} ${innerRy} 0 ${largeArc} 0 ${innerEnd.x.toFixed(2)} ${innerEnd.y.toFixed(2)}`,
    `Z`,
  ].join(" ");
}

export function StadiumMap({
  enclosures,
  selectedEnclosureId,
  onSelectEnclosure,
  seatAvailability,
  priceMap,
  disabled = false,
}: StadiumMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const cx = 250;
  const cy = 250;
  const outerRx = 228;
  const outerRy = 208;
  const innerRx = 130;
  const innerRy = 116;

  // Mid-ring radii (used to position labels)
  const midRx = (outerRx + innerRx) / 2; // 179
  const midRy = (outerRy + innerRy) / 2; // 162

  const enclosureByPathId = useMemo(() => {
    const map: Record<string, Enclosure> = {};
    for (const enc of enclosures) {
      if (enc.svg_path_id) map[enc.svg_path_id] = enc;
    }
    return map;
  }, [enclosures]);

  const hoveredEnclosure = enclosures.find((e) => e.id === hoveredId);
  const availability = hoveredId ? seatAvailability[hoveredId] : null;

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
      <h2 className="text-xl font-bold font-heading mb-1">1. Select Enclosure</h2>
      <p className="text-sm text-white/40 mb-6">
        Tap on a section to view availability
      </p>

      {/* SVG Container */}
      <div
        className="relative mx-auto overflow-visible touch-pan-x touch-pan-y"
        style={{ maxWidth: 520 }}
      >
        <svg
          viewBox="0 0 500 520"
          className="w-full h-auto"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }}
        >
          {/* ── Stadium sections ── */}
          {SECTION_LAYOUTS.map((layout) => {
            const enc = enclosureByPathId[layout.svgPathId];
            if (!enc) return null;

            const isActive   = enc.is_active !== false && !disabled; // treat undefined as active; disabled overrides all
            const isSelected = selectedEnclosureId === enc.id;
            const isHovered  = hoveredId === enc.id;

            // Inactive sections get a neutral grey fill
            const fillColor = isActive
              ? (enc.color || CATEGORY_COLORS[enc.category] || "#F5A623")
              : "#4b5563";

            const path = generateArcPath(
              cx, cy, outerRx, outerRy, innerRx, innerRy,
              layout.startAngle, layout.endAngle
            );

            // Section angular span (used for text sizing decisions)
            let sectionAngle = layout.endAngle - layout.startAngle;
            if (sectionAngle < 0) sectionAngle += 360;

            // Label sits at the midpoint angle, at the mid-ring radius
            const midAngleDeg = (layout.startAngle + layout.endAngle) / 2;
            const midAngleRad = degToRad(midAngleDeg - 90);
            const lx = cx + midRx * Math.cos(midAngleRad);
            const ly = cy + midRy * Math.sin(midAngleRad);

            // Text rotation: tangential to the oval
            // 0° (top) → text is horizontal; 90° (right) → text reads top-to-bottom
            let textRotation = midAngleDeg - 90;
            // Flip text that would otherwise be upside-down (sections on the left half)
            if (textRotation > 90 && textRotation < 270) textRotation += 180;
            if (textRotation >= 360) textRotation -= 360;
            if (textRotation < 0)   textRotation += 360;

            const categoryLabel = CATEGORY_SHORT[enc.category] || enc.category;
            // Narrow sections (Galleries at 18°, Premium at 32°) only show the name
            const showCategory = sectionAngle >= 33;
            // For very narrow sections, use a smaller font
            const nameFontSize = sectionAngle < 25 ? "7" : sectionAngle < 34 ? "7.5" : "8.5";

            return (
              <g key={enc.id}>
                <path
                  d={path}
                  fill={fillColor}
                  opacity={isHovered || isSelected ? 1 : 0.78}
                  stroke={isSelected ? "white" : "rgba(0,0,0,0.4)"}
                  strokeWidth={isSelected ? 3 : 1.5}
                  className={`transition-all duration-150 ${isActive ? "cursor-pointer" : "cursor-default"}`}
                  style={isSelected ? { filter: "drop-shadow(0 0 8px rgba(255,255,255,0.5))" } : undefined}
                  onMouseEnter={() => !disabled && setHoveredId(enc.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => !disabled && isActive && onSelectEnclosure(enc)}
                />

                {/* Label group — translate to position, then rotate tangentially */}
                <g
                  transform={`translate(${lx.toFixed(2)}, ${ly.toFixed(2)}) rotate(${textRotation.toFixed(1)})`}
                  className="pointer-events-none select-none"
                >
                  <text
                    x={0}
                    y={showCategory ? -5 : 0}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isActive ? "white" : "rgba(255,255,255,0.5)"}
                    fontSize={nameFontSize}
                    fontWeight="bold"
                  >
                    {enc.name.toUpperCase()}
                  </text>
                  {showCategory && (
                    <text
                      x={0}
                      y={7}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isActive ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.35)"}
                      fontSize="6.5"
                      fontWeight="600"
                    >
                      {isActive ? categoryLabel : "COMING SOON"}
                    </text>
                  )}
                </g>
              </g>
            );
          })}

          {/* ── Center field ── */}
          <ellipse
            cx={cx}
            cy={cy}
            rx={innerRx - 8}
            ry={innerRy - 8}
            fill="#2d5a30"
            stroke="#56a963"
            strokeWidth="1"
          />

          {/* Pitch strip */}
          <rect
            x={cx - 12}
            y={cy - 26}
            width="24"
            height="52"
            rx="2"
            fill="#3a6b3d"
            stroke="#56a963"
            strokeWidth="0.5"
          />

          {/* Stadium name */}
          <text x={cx} y={cy - 40} textAnchor="middle" fill="#56a963" fontSize="11" fontWeight="bold" className="select-none">
            RAWALPINDI
          </text>
          <text x={cx} y={cy - 27} textAnchor="middle" fill="#56a963" fontSize="11" fontWeight="bold" className="select-none">
            CRICKET
          </text>
          <text x={cx} y={cy + 44} textAnchor="middle" fill="#56a963" fontSize="13" fontWeight="bold" className="select-none">
            STADIUM
          </text>

          {/* Axis labels */}
          <text
            x={cx}
            y={cy + outerRy + 20}
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize="9"
            fontWeight="600"
            letterSpacing="1"
            className="select-none"
          >
            MAIN ENTRANCE
          </text>
          <text
            x={cx}
            y={cy - outerRy - 10}
            textAnchor="middle"
            fill="rgba(255,255,255,0.3)"
            fontSize="8"
            fontWeight="600"
            letterSpacing="1"
            className="select-none"
          >
            FAR END
          </text>
        </svg>

        {/* Tooltip */}
        {hoveredEnclosure && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg bg-black/90 border border-white/10 px-3 py-2 text-xs shadow-xl"
            style={{
              left: Math.min(tooltipPos.x + 12, 380),
              top: tooltipPos.y - 60,
            }}
          >
            <p className="font-semibold text-white">{hoveredEnclosure.name}</p>
            <p className="text-white/60 text-[10px] uppercase tracking-wider">
              {hoveredEnclosure.is_active === false
                ? "Coming Soon"
                : (CATEGORY_SHORT[hoveredEnclosure.category] || hoveredEnclosure.category)}
            </p>
            {hoveredEnclosure.is_active !== false && (
              <>
                <p className="text-white/60">
                  {priceMap[hoveredEnclosure.id]
                    ? `Price: ${priceMap[hoveredEnclosure.id]}`
                    : "Pricing TBA"}
                </p>
                {availability && (
                  <p className="text-white/60">
                    {availability.total - availability.booked} / {availability.total} available
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-2 min-[520px]:gap-4 mt-6">
        {LEGEND.map((item) => (
          <div key={item.label} className="flex items-center gap-1 min-[520px]:gap-1.5">
            <span className="inline-block w-1.5 h-1.5 min-[520px]:w-3 min-[520px]:h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[9px] min-[520px]:text-xs text-white/60">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
