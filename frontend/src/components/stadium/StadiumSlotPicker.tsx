"use client";

import { degToRad, generateArcPath, SECTION_LAYOUTS, SectionLayout } from "./StadiumMap";

export interface OccupiedSlot {
  name: string;
  color: string;
}

interface StadiumSlotPickerProps {
  /** svgPathId → { name, color } for already-assigned enclosures */
  occupiedSlots: Record<string, OccupiedSlot>;
  selectedPathId: string | null;
  onSelectSlot: (svgPathId: string) => void;
}

// Human-readable label for each slot id
const SLOT_LABELS: Record<string, string> = {
  "azhar-mehmood":  "Azhar Mehmood",
  "miran-bakhsh":   "Miran Bakhsh",
  "yasir-arafat":   "Yasir Arafat",
  "javed-miandad":  "Javed Miandad",
  "gallery-2":      "Gallery 2",
  "gallery-1":      "Gallery 1",
  "imran-khan":     "Imran Khan",
  "shoaib-akhtar":  "Shoaib Akhtar",
  "sohail-tanveer": "Sohail Tanveer",
  "javed-akhtar":   "Javed Akhtar",
};

export function StadiumSlotPicker({
  occupiedSlots,
  selectedPathId,
  onSelectSlot,
}: StadiumSlotPickerProps) {
  const cx = 250;
  const cy = 250;
  const outerRx = 228;
  const outerRy = 208;
  const innerRx = 130;
  const innerRy = 116;
  const midRx = (outerRx + innerRx) / 2;
  const midRy = (outerRy + innerRy) / 2;

  return (
    <div className="mx-auto" style={{ maxWidth: 440 }}>
      <svg viewBox="0 0 500 520" className="w-full h-auto">
        {SECTION_LAYOUTS.map((layout: SectionLayout) => {
          const occupied = occupiedSlots[layout.svgPathId];
          const isOccupied = Boolean(occupied);
          const isSelected = selectedPathId === layout.svgPathId;

          const path = generateArcPath(
            cx, cy, outerRx, outerRy, innerRx, innerRy,
            layout.startAngle, layout.endAngle
          );

          let sectionAngle = layout.endAngle - layout.startAngle;
          if (sectionAngle < 0) sectionAngle += 360;

          const midAngleDeg = (layout.startAngle + layout.endAngle) / 2;
          const midAngleRad = degToRad(midAngleDeg - 90);
          const lx = cx + midRx * Math.cos(midAngleRad);
          const ly = cy + midRy * Math.sin(midAngleRad);

          let textRotation = midAngleDeg - 90;
          if (textRotation > 90 && textRotation < 270) textRotation += 180;
          if (textRotation >= 360) textRotation -= 360;
          if (textRotation < 0) textRotation += 360;

          // Color logic
          let fillColor: string;
          if (isSelected) fillColor = "#1a3d1a";
          else if (isOccupied) fillColor = occupied.color;
          else fillColor = "#1e1e1e";

          const strokeColor = isSelected
            ? "#a5fcad"
            : isOccupied
            ? "rgba(0,0,0,0.4)"
            : "rgba(255,255,255,0.08)";
          const strokeWidth = isSelected ? 3 : 1.5;

          const label = isOccupied
            ? occupied.name
            : isSelected
            ? "✓"
            : "+";

          const nameFontSize = sectionAngle < 25 ? "7" : sectionAngle < 34 ? "7.5" : "8.5";
          const labelColor = isOccupied
            ? "rgba(255,255,255,0.85)"
            : isSelected
            ? "#a5fcad"
            : "rgba(255,255,255,0.25)";

          return (
            <g key={layout.svgPathId}>
              <path
                d={path}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                opacity={isOccupied && !isSelected ? 0.75 : 1}
                className={isOccupied ? "cursor-default" : "cursor-pointer"}
                style={
                  isSelected
                    ? { filter: "drop-shadow(0 0 6px rgba(165,252,173,0.4))" }
                    : undefined
                }
                onClick={() => {
                  if (!isOccupied) onSelectSlot(layout.svgPathId);
                }}
              />
              <g
                transform={`translate(${lx.toFixed(2)}, ${ly.toFixed(2)}) rotate(${textRotation.toFixed(1)})`}
                className="pointer-events-none select-none"
              >
                <text
                  x={0}
                  y={0}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={labelColor}
                  fontSize={isOccupied ? nameFontSize : isSelected ? "14" : "16"}
                  fontWeight="bold"
                >
                  {label}
                </text>
              </g>
            </g>
          );
        })}

        {/* Center field */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={innerRx - 8}
          ry={innerRy - 8}
          fill="#1a2e1a"
          stroke="#56a963"
          strokeWidth="1"
        />
        <rect
          x={cx - 12}
          y={cy - 26}
          width="24"
          height="52"
          rx="2"
          fill="#1f3620"
          stroke="#56a963"
          strokeWidth="0.5"
        />
        <text x={cx} y={cy - 14} textAnchor="middle" fill="#56a963" fontSize="9" fontWeight="bold" className="select-none">
          PICK A
        </text>
        <text x={cx} y={cy} textAnchor="middle" fill="#56a963" fontSize="9" fontWeight="bold" className="select-none">
          SECTION
        </text>
      </svg>

      {/* Slot name label under SVG */}
      <p className="text-center text-xs mt-1 h-4">
        {selectedPathId && !occupiedSlots[selectedPathId] ? (
          <span className="text-[#a5fcad] font-semibold">Section selected</span>
        ) : (
          <span className="text-white/20">Click a free section to select it</span>
        )}
      </p>
    </div>
  );
}

export { SLOT_LABELS };
