"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin, Shield, Plus, ChevronDown, ChevronRight,
  Edit2, X, Layers, ToggleLeft, ToggleRight,
  Building2, RefreshCw, Rows3, MoveRight,
} from "lucide-react";
import { useAccount, usePublicClient } from "wagmi";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { useContractWrite } from "@/hooks/useContractWrite";
import { TransactionProgressModal } from "@/components/stadium/TransactionProgressModal";
import { supabase } from "@/lib/supabase";
import { CONTRACTS } from "@/config/contracts";
import { venueRegistryAbi } from "@/lib/contracts/generated";
import { StadiumSlotPicker, OccupiedSlot } from "@/components/stadium/StadiumSlotPicker";

// ── Types ─────────────────────────────────────────────────────────────────────

interface VenueRow {
  id: string;
  venueIdOnchain: number;
  name: string;
  city: string;
  isActive: boolean;
}

interface EnclosureRow {
  id: string;
  enclosureIdOnchain: number;
  venueId: string;
  name: string;
  isActive: boolean;
  totalSeats: number;
  svgPathId: string | null;
  category: string;
  color: string;
}

interface RowData {
  label: string;    // single char e.g. "A"
  seatsInput: string; // raw input e.g. "1,2,3,5,10"
  seats: number[];  // parsed seat numbers
}

// ── Enclosure categories ─────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  GENERAL: "#F5A623",
  FIRST_CLASS: "#E53E3E",
  PREMIUM: "#00A651",
  VIP: "#4A90D9",
  VVIP: "#FFD700",
  VVIP_GALLERY: "#9B59B6",
};

const CATEGORY_OPTIONS = [
  { value: "GENERAL",      label: "General" },
  { value: "FIRST_CLASS",  label: "First Class" },
  { value: "PREMIUM",      label: "Premium" },
  { value: "VIP",          label: "VIP" },
  { value: "VVIP",         label: "VVIP" },
  { value: "VVIP_GALLERY", label: "VVIP Gallery" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert single char label to bytes1 hex (e.g. "A" → "0x41") */
function labelToBytes1(char: string): `0x${string}` {
  return `0x${char.charCodeAt(0).toString(16).padStart(2, "0")}` as `0x${string}`;
}

/** Parse comma-separated seat numbers string into a number array (preserves duplicates for validation) */
function parseSeats(input: string): number[] {
  return input
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n > 0);
}

/** Returns the first duplicate seat number in an array, or null if all unique */
function findDuplicateSeat(seats: number[]): number | null {
  const seen = new Set<number>();
  for (const n of seats) {
    if (seen.has(n)) return n;
    seen.add(n);
  }
  return null;
}

/** Returns error message if any row has duplicate seat numbers */
function hasDuplicateSeats(rows: RowData[]): string | null {
  for (const r of rows) {
    const dup = findDuplicateSeat(r.seats);
    if (dup !== null) return `Row ${r.label} has duplicate seat number ${dup}.`;
  }
  return null;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1.5">
      {children}
    </p>
  );
}

function FieldInput({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#1a1a1a] border border-white/8 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#56a963]/40 placeholder:text-white/15"
      />
    </div>
  );
}

/** Dynamic row builder used in both Add Enclosure + Add Rows modals */
function RowsBuilder({
  rows, onChange,
}: {
  rows: RowData[];
  onChange: (rows: RowData[]) => void;
}) {
  const addRow = () => onChange([...rows, { label: "", seatsInput: "", seats: [] }]);
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const updateRow = (i: number, patch: Partial<RowData>) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const handleSeatsChange = (i: number, raw: string) => {
    const seats = parseSeats(raw);
    updateRow(i, { seatsInput: raw, seats });
  };

  const totalSeats = rows.reduce((s, r) => s + r.seats.length, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <SectionLabel>Rows</SectionLabel>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1 text-[10px] text-[#56a963] hover:text-[#a5fcad] transition-colors"
        >
          <Plus size={10} />
          Add Row
        </button>
      </div>

      {rows.length === 0 && (
        <p className="text-xs text-white/20 italic py-2">No rows added yet.</p>
      )}

      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={1}
                value={row.label}
                onChange={(e) => updateRow(i, { label: e.target.value.toUpperCase() })}
                placeholder="A"
                className="w-10 text-center bg-[#1a1a1a] border border-white/8 text-white text-sm rounded-lg px-2 py-2 focus:outline-none focus:border-[#56a963]/40 placeholder:text-white/15 font-mono font-bold"
              />
              <span className="text-xs text-white/30 shrink-0">Row label</span>
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="ml-auto text-white/20 hover:text-red-400 transition-colors"
              >
                <X size={13} />
              </button>
            </div>
            <div>
              {(() => {
                const dupSeat = findDuplicateSeat(row.seats);
                return (
                  <>
                    <input
                      type="text"
                      value={row.seatsInput}
                      onChange={(e) => handleSeatsChange(i, e.target.value)}
                      placeholder="e.g. 1,2,3,4,5,10,15"
                      className={`w-full bg-[#1a1a1a] border text-white text-xs rounded-lg px-3 py-2 focus:outline-none placeholder:text-white/15 font-mono ${
                        dupSeat !== null
                          ? "border-red-500/50 focus:border-red-500/70"
                          : "border-white/8 focus:border-[#56a963]/40"
                      }`}
                    />
                    {dupSeat !== null ? (
                      <p className="text-[10px] text-red-400 mt-1">
                        Duplicate seat number: {dupSeat} — all seat numbers must be unique.
                      </p>
                    ) : row.seats.length > 0 ? (
                      <p className="text-[10px] text-white/30 mt-1">
                        {row.seats.length} seat{row.seats.length !== 1 ? "s" : ""}: {row.seats.slice(0, 8).join(", ")}{row.seats.length > 8 ? ` … +${row.seats.length - 8} more` : ""}
                      </p>
                    ) : null}
                  </>
                );
              })()}
            </div>
          </div>
        ))}
      </div>

      {rows.length > 0 && (
        <p className="text-[10px] text-white/25 mt-2">
          {totalSeats} total seat{totalSeats !== 1 ? "s" : ""} across {rows.length} row{rows.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────

function Modal({
  title, onClose, children,
}: {
  title: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#0e0e0e] border border-white/8 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
          <h3 className="font-heading font-bold text-white text-base">{title}</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminVenuesPage() {
  const { isConnected } = useAccount();
  const { hasAdminAccess } = useUserRole();
  const publicClient = usePublicClient();

  // ── Venues state ──────────────────────────────────────────────────────────
  const [venues, setVenues] = useState<VenueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedVenueId, setExpandedVenueId] = useState<string | null>(null);

  // Enclosures per venue (keyed by venue UUID)
  const [enclosuresByVenue, setEnclosuresByVenue] = useState<Record<string, EnclosureRow[]>>({});
  const [enclosuresLoading, setEnclosuresLoading] = useState<Record<string, boolean>>({});

  // Rows per enclosure (keyed by enclosure UUID)
  const [rowsByEnclosure, setRowsByEnclosure] = useState<Record<string, RowData[]>>({});
  const [rowsLoading, setRowsLoading] = useState<Record<string, boolean>>({});
  const [expandedEnclosureId, setExpandedEnclosureId] = useState<string | null>(null);

  // ── Modal state ───────────────────────────────────────────────────────────
  type ActiveModal =
    | "createVenue"
    | "editVenue"
    | "addEnclosure"
    | "editEnclosure"
    | "addRows"
    | "editRow"
    | "repositionEnclosure"
    | null;
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  // What's being acted on
  const targetVenueRef = useRef<VenueRow | null>(null);
  const targetEnclosureRef = useRef<EnclosureRow | null>(null);
  const targetRowRef = useRef<{ row: RowData; rowIndex: number; enclosure: EnclosureRow } | null>(null);

  // Snapshot of form data captured just before execute() so onSuccess closures don't go stale
  const pendingFormRef = useRef<{ name: string; rows: RowData[]; svgPathId: string | null; category: string }>({ name: "", rows: [], svgPathId: null, category: "GENERAL" });
  const pendingRowEditRef = useRef<{ label: string; seats: number[] }>({ label: "", seats: [] });

  // ── Form state ────────────────────────────────────────────────────────────
  const [formName, setFormName] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formSvgPathId, setFormSvgPathId] = useState<string | null>(null);
  const [formCategory, setFormCategory] = useState("GENERAL");
  const [addEnclosureStep, setAddEnclosureStep] = useState<"selectSlot" | "fillForm">("selectSlot");
  const [formRows, setFormRows] = useState<RowData[]>([]);
  const [formRowLabel, setFormRowLabel] = useState("");
  const [formRowSeatsInput, setFormRowSeatsInput] = useState("");

  // ── Tx modals ─────────────────────────────────────────────────────────────
  const [txModal, setTxModal] = useState<{
    open: boolean;
    title: string;
    desc: string;
  }>({ open: false, title: "", desc: "" });

  // ── Contract writers ──────────────────────────────────────────────────────
  const createVenueContract = useContractWrite({
    onSuccess: async () => {
      // Re-fetch all venues after a brief delay for indexer to sync
      toast.success("Venue created on-chain! Syncing…");
      setTimeout(() => fetchVenues(), 3000);
    },
  });

  const updateVenueContract = useContractWrite({
    onSuccess: async () => {
      const v = targetVenueRef.current;
      if (!v) return;
      await supabase.from("venues").update({
        name: formName.trim(),
        city: formCity.trim(),
      }).eq("id", v.id);

      setVenues((prev) =>
        prev.map((x) =>
          x.id === v.id
            ? { ...x, name: formName.trim(), city: formCity.trim() }
            : x
        )
      );
      toast.success("Venue updated!");
    },
  });

  const activateVenueContract = useContractWrite({
    onSuccess: async () => {
      const v = targetVenueRef.current;
      if (!v) return;
      await supabase.from("venues").update({ is_active: true }).eq("id", v.id);
      setVenues((prev) => prev.map((x) => x.id === v.id ? { ...x, isActive: true } : x));
      toast.success("Venue activated!");
    },
  });

  const deactivateVenueContract = useContractWrite({
    onSuccess: async () => {
      const v = targetVenueRef.current;
      if (!v) return;
      await supabase.from("venues").update({ is_active: false }).eq("id", v.id);
      setVenues((prev) => prev.map((x) => x.id === v.id ? { ...x, isActive: false } : x));
      toast.success("Venue deactivated!");
    },
  });

  const addEnclosureContract = useContractWrite({
    onSuccess: async () => {
      const v = targetVenueRef.current;
      const { name, rows, svgPathId, category } = pendingFormRef.current;
      if (!v) return;

      toast.success("Enclosure added on-chain! Saving rows…");

      // Wait for indexer to write the enclosure row into Supabase (retry loop)
      let encData: any = null;
      for (let i = 0; i < 4; i++) {
        await new Promise((r) => setTimeout(r, 1500));
        const { data } = await supabase
          .from("enclosures")
          .select("id")
          .eq("venue_id", v.id)
          .eq("name", name)
          .maybeSingle();
        
        if (data?.id) {
          encData = data;
          break;
        }
      }

      if (encData?.id) {
        // Save svg_path_id, category, and color
        await supabase.from("enclosures").update({
          svg_path_id: svgPathId,
          category,
          color: CATEGORY_COLORS[category] ?? "#F5A623",
        }).eq("id", encData.id);

        if (rows.length > 0) {
          const inserts = rows.map((r) => ({
            enclosure_id: encData.id,
            row_label: r.label,
            seat_count: r.seats.length,
            seat_numbers: r.seats,
          }));
          const { error } = await supabase.from("enclosure_rows").insert(inserts);
          if (error) {
            toast.error(`Enclosure created but rows failed: ${error.message}`);
          } else {
            const totalSeats = rows.reduce((s, r) => s + r.seats.length, 0);
            await supabase.from("enclosures").update({ total_seats: totalSeats }).eq("id", encData.id);
            toast.success("Enclosure and rows saved!");
          }
        } else {
          toast.success("Enclosure saved!");
        }
      } else {
        toast.error("Enclosure synced but could not find it in DB — add rows manually.");
      }

      loadEnclosures(v.id);
    },
  });

  const updateEnclosureContract = useContractWrite({
    onSuccess: async () => {
      const enc = targetEnclosureRef.current;
      if (!enc) return;
      const { name, category } = pendingFormRef.current;
      const color = CATEGORY_COLORS[category] ?? "#F5A623";
      await supabase.from("enclosures").update({ name, category, color }).eq("id", enc.id);
      setEnclosuresByVenue((prev) => {
        const list = (prev[enc.venueId] ?? []).map((e) =>
          e.id === enc.id ? { ...e, name, category, color } : e
        );
        return { ...prev, [enc.venueId]: list };
      });
      toast.success("Enclosure updated!");
    },
  });

  const addRowsContract = useContractWrite({
    onSuccess: async () => {
      const enc = targetEnclosureRef.current;
      const { rows } = pendingFormRef.current;
      if (!enc) return;

      const inserts = rows.map((r) => ({
        enclosure_id: enc.id,
        row_label: r.label,
        seat_count: r.seats.length,
        seat_numbers: r.seats,
      }));

      const { error } = await supabase.from("enclosure_rows").insert(inserts);
      if (error) {
        toast.error(`On-chain succeeded but rows failed to save: ${error.message}`);
      } else {
        // Re-sum total_seats for the enclosure
        const { data: sumData } = await supabase
          .from("enclosure_rows")
          .select("seat_count")
          .eq("enclosure_id", enc.id);
        const totalSeats = (sumData ?? []).reduce((s: number, r: any) => s + (r.seat_count ?? 0), 0);
        await supabase.from("enclosures").update({ total_seats: totalSeats }).eq("id", enc.id);
        toast.success("Rows added and saved!");
        loadRows(enc.id);
        loadEnclosures(enc.venueId);
      }
    },
  });

  const toggleEnclosureContract = useContractWrite({
    onSuccess: async () => {
      const enc = targetEnclosureRef.current;
      if (!enc) return;
      const newActive = !enc.isActive;
      await supabase.from("enclosures").update({ is_active: newActive }).eq("id", enc.id);
      setEnclosuresByVenue((prev) => {
        const list = (prev[enc.venueId] ?? []).map((e) =>
          e.id === enc.id ? { ...e, isActive: newActive } : e
        );
        return { ...prev, [enc.venueId]: list };
      });
      toast.success(newActive ? "Enclosure activated!" : "Enclosure deactivated!");
    },
  });

  const updateRowContract = useContractWrite({
    onSuccess: async () => {
      const ref = targetRowRef.current;
      if (!ref) return;
      const { enclosure, row } = ref;
      const { label: newLabel, seats: newSeats } = pendingRowEditRef.current;

      // DELETE + INSERT: plain UPDATE silently drops INTEGER[] in PostgREST; INSERT handles arrays correctly.
      // DELETE requires the enclosure_rows_delete RLS policy (see 002_rls_policies.sql).
      const { error: delErr } = await supabase
        .from("enclosure_rows")
        .delete()
        .eq("enclosure_id", enclosure.id)
        .eq("row_label", row.label);
      if (delErr) { toast.error(`Row update failed: ${delErr.message}`); return; }

      const { error: insErr } = await supabase
        .from("enclosure_rows")
        .insert({ enclosure_id: enclosure.id, row_label: newLabel, seat_count: newSeats.length, seat_numbers: newSeats });
      if (insErr) { toast.error(`Row update failed: ${insErr.message}`); return; }
      // Re-sum total_seats for the enclosure
      const { data: sumData } = await supabase
        .from("enclosure_rows")
        .select("seat_count")
        .eq("enclosure_id", enclosure.id);
      const totalSeats = (sumData ?? []).reduce((s: number, r: any) => s + (r.seat_count ?? 0), 0);
      await supabase.from("enclosures").update({ total_seats: totalSeats }).eq("id", enclosure.id);
      loadRows(enclosure.id);
      loadEnclosures(enclosure.venueId);
      toast.success(`Row ${row.label} updated!`);
    },
  });

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("venues")
      .select("id, venue_id_onchain, name, city, is_active")
      .order("venue_id_onchain", { ascending: true });

    if (error) {
      toast.error(`Failed to load venues: ${error.message}`);
      setLoading(false);
      return;
    }

    setVenues(
      ((data as any[]) || []).map((v) => ({
        id: v.id,
        venueIdOnchain: v.venue_id_onchain,
        name: v.name,
        city: v.city,
        isActive: v.is_active,
      }))
    );
    setLoading(false);
  }, []);

  const loadEnclosures = useCallback(async (venueId: string) => {
    setEnclosuresLoading((p) => ({ ...p, [venueId]: true }));
    const { data } = await supabase
      .from("enclosures")
      .select("id, enclosure_id_onchain, venue_id, name, is_active, total_seats, svg_path_id, category, color")
      .eq("venue_id", venueId)
      .order("enclosure_id_onchain", { ascending: true });

    setEnclosuresByVenue((p) => ({
      ...p,
      [venueId]: ((data as any[]) || []).map((e) => ({
        id: e.id,
        enclosureIdOnchain: e.enclosure_id_onchain,
        venueId: e.venue_id,
        name: e.name,
        isActive: e.is_active,
        totalSeats: e.total_seats ?? 0,
        svgPathId: e.svg_path_id ?? null,
        category: e.category ?? "GENERAL",
        color: e.color ?? "#F5A623",
      })),
    }));
    setEnclosuresLoading((p) => ({ ...p, [venueId]: false }));
  }, []);

  const loadRows = useCallback(async (enclosureId: string) => {
    setRowsLoading((p) => ({ ...p, [enclosureId]: true }));
    const { data } = await supabase
      .from("enclosure_rows")
      .select("row_label, seat_count, seat_numbers")
      .eq("enclosure_id", enclosureId)
      .order("row_label", { ascending: true });

    setRowsByEnclosure((p) => ({
      ...p,
      [enclosureId]: ((data as any[]) || []).map((r) => ({
        label: r.row_label,
        seatsInput: "",
        seats: Array.isArray(r.seat_numbers) ? r.seat_numbers : [],
      })),
    }));
    setRowsLoading((p) => ({ ...p, [enclosureId]: false }));
  }, []);

  useEffect(() => {
    if (hasAdminAccess) fetchVenues();
  }, [hasAdminAccess, fetchVenues]);

  // ── Venue expand ──────────────────────────────────────────────────────────

  const toggleVenue = (venueId: string) => {
    if (expandedVenueId === venueId) {
      setExpandedVenueId(null);
    } else {
      setExpandedVenueId(venueId);
      if (!enclosuresByVenue[venueId]) loadEnclosures(venueId);
    }
  };

  const toggleEnclosure = (enclosureId: string) => {
    if (expandedEnclosureId === enclosureId) {
      setExpandedEnclosureId(null);
    } else {
      setExpandedEnclosureId(enclosureId);
      if (!rowsByEnclosure[enclosureId]) loadRows(enclosureId);
    }
  };

  // ── Modal openers ─────────────────────────────────────────────────────────

  const openCreateVenue = () => {
    setFormName(""); setFormCity("");
    setActiveModal("createVenue");
  };

  const openEditVenue = (v: VenueRow) => {
    targetVenueRef.current = v;
    setFormName(v.name); setFormCity(v.city);
    setActiveModal("editVenue");
  };

  const openAddEnclosure = (v: VenueRow) => {
    targetVenueRef.current = v;
    setFormName(""); setFormRows([]);
    setFormSvgPathId(null);
    setFormCategory("GENERAL");
    setAddEnclosureStep("selectSlot");
    setActiveModal("addEnclosure");
  };

  const openRepositionEnclosure = (enc: EnclosureRow) => {
    targetEnclosureRef.current = enc;
    setFormSvgPathId(enc.svgPathId ?? null);
    setActiveModal("repositionEnclosure");
  };

  const openEditEnclosure = (enc: EnclosureRow) => {
    targetEnclosureRef.current = enc;
    setFormName(enc.name);
    setFormCategory(enc.category ?? "GENERAL");
    setActiveModal("editEnclosure");
  };

  const openAddRows = (enc: EnclosureRow) => {
    targetEnclosureRef.current = enc;
    setFormRows([]);
    setActiveModal("addRows");
  };

  const openEditRow = (row: RowData, rowIndex: number, enc: EnclosureRow) => {
    targetRowRef.current = { row, rowIndex, enclosure: enc };
    setFormRowLabel(row.label);
    setFormRowSeatsInput(row.seats.join(", "));
    setActiveModal("editRow");
  };

  const closeModal = () => setActiveModal(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreateVenue = async () => {
    if (!formName.trim() || !formCity.trim()) {
      toast.error("Name and city are required.");
      return;
    }
    closeModal();
    setTxModal({ open: true, title: "Creating Venue", desc: "Registering venue on-chain…" });
    try {
      await createVenueContract.execute({
        address: CONTRACTS.venueRegistry,
        abi: venueRegistryAbi,
        functionName: "createVenue",
        args: [formName.trim(), formCity.trim(), ""],
      });
    } catch {}
  };

  const handleEditVenue = async () => {
    const v = targetVenueRef.current;
    if (!v || !formName.trim() || !formCity.trim()) {
      toast.error("Name and city are required.");
      return;
    }
    closeModal();
    setTxModal({ open: true, title: "Updating Venue", desc: "Saving venue details on-chain…" });
    try {
      await updateVenueContract.execute({
        address: CONTRACTS.venueRegistry,
        abi: venueRegistryAbi,
        functionName: "updateVenue",
        args: [BigInt(v.venueIdOnchain), formName.trim(), formCity.trim(), ""],
      });
    } catch {}
  };

  const handleToggleVenueActive = async (v: VenueRow) => {
    targetVenueRef.current = v;
    setTxModal({
      open: true,
      title: v.isActive ? "Deactivating Venue" : "Activating Venue",
      desc: `${v.isActive ? "Deactivating" : "Activating"} venue on-chain…`,
    });
    try {
      if (v.isActive) {
        await deactivateVenueContract.execute({
          address: CONTRACTS.venueRegistry,
          abi: venueRegistryAbi,
          functionName: "deactivateVenue",
          args: [BigInt(v.venueIdOnchain)],
        });
      } else {
        await activateVenueContract.execute({
          address: CONTRACTS.venueRegistry,
          abi: venueRegistryAbi,
          functionName: "activateVenue",
          args: [BigInt(v.venueIdOnchain)],
        });
      }
    } catch {}
  };

  const handleAddEnclosure = async () => {
    const v = targetVenueRef.current;
    if (!v) return;
    if (!formSvgPathId) { toast.error("Select a section on the stadium first."); return; }
    if (!formName.trim()) { toast.error("Enclosure name is required."); return; }
    if (formRows.length === 0) { toast.error("Add at least one row."); return; }

    const invalid = formRows.find((r) => !r.label.trim() || r.seats.length === 0);
    if (invalid) { toast.error("Each row needs a label and at least one seat number."); return; }

    const dupErr = hasDuplicateSeats(formRows);
    if (dupErr) { toast.error(dupErr); return; }

    const rowLabels = formRows.map((r) => r.label.trim().toUpperCase());
    if (new Set(rowLabels).size !== rowLabels.length) { toast.error("Each row must have a unique label."); return; }

    const labels = formRows.map((r) => labelToBytes1(r.label));
    const counts = formRows.map((r) => BigInt(r.seats.length));

    // Snapshot form data before closing modal so onSuccess closure has fresh values
    pendingFormRef.current = { name: formName.trim(), rows: formRows, svgPathId: formSvgPathId, category: formCategory };

    closeModal();
    setTxModal({ open: true, title: "Adding Enclosure", desc: "Creating enclosure on-chain…" });
    try {
      await addEnclosureContract.execute({
        address: CONTRACTS.venueRegistry,
        abi: venueRegistryAbi,
        functionName: "addEnclosure",
        args: [BigInt(v.venueIdOnchain), formName.trim(), labels, counts],
      });
    } catch {}
  };

  const handleEditEnclosure = async () => {
    const enc = targetEnclosureRef.current;
    if (!enc || !formName.trim()) { toast.error("Enclosure name is required."); return; }

    const venue = venues.find((v) => v.id === enc.venueId);
    if (!venue) return;

    // Snapshot before closing modal
    pendingFormRef.current = { name: formName.trim(), rows: [], svgPathId: null, category: formCategory };

    closeModal();
    setTxModal({ open: true, title: "Updating Enclosure", desc: "Saving enclosure name on-chain…" });
    try {
      await updateEnclosureContract.execute({
        address: CONTRACTS.venueRegistry,
        abi: venueRegistryAbi,
        functionName: "updateEnclosure",
        args: [BigInt(venue.venueIdOnchain), BigInt(enc.enclosureIdOnchain), formName.trim()],
      });
    } catch {}
  };

  const handleAddRows = async () => {
    const enc = targetEnclosureRef.current;
    if (!enc) return;
    if (formRows.length === 0) { toast.error("Add at least one row."); return; }

    const invalid = formRows.find((r) => !r.label.trim() || r.seats.length === 0);
    if (invalid) { toast.error("Each row needs a label and at least one seat number."); return; }

    const dupErr = hasDuplicateSeats(formRows);
    if (dupErr) { toast.error(dupErr); return; }

    const rowLabels = formRows.map((r) => r.label.trim().toUpperCase());
    if (new Set(rowLabels).size !== rowLabels.length) { toast.error("Each row must have a unique label."); return; }

    const venue = venues.find((v) => v.id === enc.venueId);
    if (!venue) return;

    const labels = formRows.map((r) => labelToBytes1(r.label));
    const counts = formRows.map((r) => BigInt(r.seats.length));

    // Snapshot rows before closing modal so onSuccess closure has fresh values
    pendingFormRef.current = { name: "", rows: formRows, svgPathId: null, category: "GENERAL" };

    closeModal();
    setTxModal({ open: true, title: "Adding Rows", desc: "Adding rows to enclosure on-chain…" });
    try {
      await addRowsContract.execute({
        address: CONTRACTS.venueRegistry,
        abi: venueRegistryAbi,
        functionName: "addRows",
        args: [BigInt(venue.venueIdOnchain), BigInt(enc.enclosureIdOnchain), labels, counts],
      });
    } catch {}
  };

  const handleToggleEnclosure = async (enc: EnclosureRow) => {
    const venue = venues.find((v) => v.id === enc.venueId);
    if (!venue) return;
    targetEnclosureRef.current = enc;
    setTxModal({
      open: true,
      title: enc.isActive ? "Deactivating Enclosure" : "Activating Enclosure",
      desc: `${enc.isActive ? "Deactivating" : "Activating"} enclosure on-chain…`,
    });
    try {
      await toggleEnclosureContract.execute({
        address: CONTRACTS.venueRegistry,
        abi: venueRegistryAbi,
        functionName: "toggleEnclosureActive",
        args: [BigInt(venue.venueIdOnchain), BigInt(enc.enclosureIdOnchain), !enc.isActive],
      });
    } catch {}
  };

  const handleRepositionEnclosure = async () => {
    const enc = targetEnclosureRef.current;
    if (!enc) return;

    const { error } = await supabase
      .from("enclosures")
      .update({ svg_path_id: formSvgPathId })
      .eq("id", enc.id);

    if (error) {
      toast.error(`Failed to update position: ${error.message}`);
      return;
    }

    setEnclosuresByVenue((prev) => {
      const list = (prev[enc.venueId] ?? []).map((e) =>
        e.id === enc.id ? { ...e, svgPathId: formSvgPathId } : e
      );
      return { ...prev, [enc.venueId]: list };
    });
    closeModal();
    toast.success("Stadium position updated!");
  };

  const handleUpdateRow = async () => {
    const ref = targetRowRef.current;
    if (!ref) return;
    const { row, enclosure } = ref;
    const venue = venues.find((v) => v.id === enclosure.venueId);
    if (!venue || !publicClient) return;
    const newLabel = formRowLabel.trim().toUpperCase();
    const newSeats = parseSeats(formRowSeatsInput);
    if (!newLabel || newLabel.length !== 1) { toast.error("Row label must be a single character."); return; }
    if (newSeats.length === 0) { toast.error("Add at least one seat number."); return; }

    const dup = findDuplicateSeat(newSeats);
    if (dup !== null) { toast.error(`Duplicate seat number found: ${dup}`); return; }

    // Look up the on-chain row index by label (DB order ≠ on-chain insertion order)
    let onChainIndex: bigint;
    try {
      const onChainRows = await publicClient.readContract({
        address: CONTRACTS.venueRegistry,
        abi: venueRegistryAbi,
        functionName: "getRows",
        args: [BigInt(venue.venueIdOnchain), BigInt(enclosure.enclosureIdOnchain)],
      }) as { label: `0x${string}`; seatCount: bigint }[];

      const currentLabelHex = labelToBytes1(row.label);
      const idx = onChainRows.findIndex((r) => r.label.toLowerCase() === currentLabelHex.toLowerCase());
      if (idx === -1) {
        toast.error(`Row ${row.label} not found on-chain.`);
        return;
      }
      onChainIndex = BigInt(idx);
    } catch (e) {
      toast.error("Failed to read on-chain row data.");
      return;
    }

    // Snapshot before closing modal so onSuccess closure reads fresh values
    pendingRowEditRef.current = { label: newLabel, seats: newSeats };
    closeModal();
    setTxModal({ open: true, title: "Updating Row", desc: "Saving row changes on-chain…" });
    try {
      await updateRowContract.execute({
        address: CONTRACTS.venueRegistry,
        abi: venueRegistryAbi,
        functionName: "updateRow",
        args: [
          BigInt(venue.venueIdOnchain),
          BigInt(enclosure.enclosureIdOnchain),
          onChainIndex,
          labelToBytes1(newLabel),
          BigInt(newSeats.length),
        ],
      });
    } catch {}
  };

  // Which contract write is currently active (for shared tx modal)
  const activeTx = [
    createVenueContract, updateVenueContract, activateVenueContract,
    deactivateVenueContract, addEnclosureContract, updateEnclosureContract, addRowsContract,
    toggleEnclosureContract, updateRowContract,
  ].find((c) => c.step !== "idle") ?? createVenueContract;

  // ── Guard ─────────────────────────────────────────────────────────────────

  if (!isConnected || !hasAdminAccess) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 mx-auto">
          <Shield size={28} className="text-amber-400" />
        </div>
        <h2 className="text-lg font-semibold text-white/70 mb-1">Admin access required</h2>
        <p className="text-sm text-white/40">Connect an admin wallet to manage venues.</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#56a963]/10 flex items-center justify-center shrink-0">
            <Building2 size={20} className="text-[#56a963]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading">Venue Management</h1>
            <p className="text-sm text-white/40">Create and manage venues, enclosures, and rows</p>
          </div>
        </div>

        <button
          onClick={openCreateVenue}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[#002a0c] hover:opacity-90 transition-opacity max-[578px]:w-full max-[578px]:justify-center"
          style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
        >
          <Plus size={15} />
          Create Venue
        </button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && venues.length === 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-16 text-center">
          <Building2 size={32} className="text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30 mb-4">No venues registered yet.</p>
          <button
            onClick={openCreateVenue}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#002a0c] hover:opacity-90 transition-opacity"
            style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
          >
            <Plus size={14} />
            Create First Venue
          </button>
        </div>
      )}

      {/* Venue list */}
      {!loading && (
        <div className="space-y-3">
          {venues.map((venue) => {
            const isExpanded = expandedVenueId === venue.id;
            const enclosures = enclosuresByVenue[venue.id] ?? [];
            const encLoading = enclosuresLoading[venue.id] ?? false;

            return (
              <div
                key={venue.id}
                className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden"
              >
                {/* Venue header row */}
                <div className="flex items-center gap-3 px-5 py-4 max-[550px]:flex-wrap max-[400px]:px-3 max-[400px]:py-2.5 max-[400px]:gap-1.5">
                  {/* Info group: expand toggle + icon + name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0 max-[550px]:w-full max-[550px]:justify-center max-[550px]:order-2 max-[400px]:gap-2">
                    {/* Expand toggle */}
                    <button
                      onClick={() => toggleVenue(venue.id)}
                      className="text-white/30 hover:text-white/60 transition-colors shrink-0"
                    >
                      {isExpanded
                        ? <ChevronDown size={18} />
                        : <ChevronRight size={18} />}
                    </button>

                    {/* Venue icon */}
                    <div className="w-9 h-9 rounded-xl bg-[#56a963]/10 flex items-center justify-center shrink-0 max-[400px]:w-6 max-[400px]:h-6 max-[400px]:rounded-lg">
                      <MapPin size={16} className="text-[#56a963] max-[400px]:w-3 max-[400px]:h-3" />
                    </div>

                    {/* Name + city */}
                    <div className="flex-1 min-w-0 max-[550px]:flex-none max-[550px]:text-center">
                      <div className="flex items-center gap-2 flex-wrap max-[550px]:justify-center">
                        <p className="text-sm font-bold text-white max-[400px]:text-xs">{venue.name}</p>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full max-[400px]:text-[7px] max-[400px]:px-1.5 ${
                            venue.isActive
                              ? "bg-[#56a963]/15 text-[#a5fcad]"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {venue.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-white/35 mt-0.5 max-[400px]:text-[9px]">
                        {venue.city}
                        <span className="text-white/15 ml-2 font-mono">#{venue.venueIdOnchain}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 max-[550px]:w-full max-[550px]:justify-center max-[550px]:order-1 max-[400px]:gap-1">
                    {/* Activate / Deactivate */}
                    <button
                      onClick={() => handleToggleVenueActive(venue)}
                      title={venue.isActive ? "Deactivate venue" : "Activate venue"}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors max-[400px]:px-2 max-[400px]:py-1 max-[400px]:text-[9px] max-[400px]:gap-1 ${
                        venue.isActive
                          ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/15"
                          : "bg-[#56a963]/10 text-[#a5fcad] border-[#56a963]/20 hover:bg-[#56a963]/15"
                      }`}
                    >
                      {venue.isActive
                        ? <><ToggleLeft size={13} className="max-[400px]:w-2.5 max-[400px]:h-2.5" />Deactivate</>
                        : <><ToggleRight size={13} className="max-[400px]:w-2.5 max-[400px]:h-2.5" />Activate</>}
                    </button>

                    {/* Edit venue */}
                    <button
                      onClick={() => openEditVenue(venue)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-white/50 border border-white/8 hover:bg-white/8 hover:text-white/70 transition-colors max-[400px]:px-2 max-[400px]:py-1 max-[400px]:text-[9px] max-[400px]:gap-1"
                    >
                      <Edit2 size={12} className="max-[400px]:w-2.5 max-[400px]:h-2.5" />
                      Edit
                    </button>

                    {/* Add enclosure */}
                    <button
                      onClick={() => { openAddEnclosure(venue); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-white/50 border border-white/8 hover:bg-white/8 hover:text-white/70 transition-colors max-[400px]:px-2 max-[400px]:py-1 max-[400px]:text-[9px] max-[400px]:gap-1"
                    >
                      <Plus size={12} className="max-[400px]:w-2.5 max-[400px]:h-2.5" />
                      Enclosure
                    </button>
                  </div>
                </div>

                {/* Enclosures panel */}
                {isExpanded && (
                  <div className="border-t border-white/5 bg-[#0a0a0a] px-5 py-4">
                    {encLoading && (
                      <div className="space-y-2">
                        {[1, 2].map((i) => (
                          <div key={i} className="h-12 rounded-xl bg-white/[0.02] animate-pulse" />
                        ))}
                      </div>
                    )}

                    {!encLoading && enclosures.length === 0 && (
                      <div className="flex flex-col items-center py-8 text-center gap-2">
                        <Layers size={22} className="text-white/10" />
                        <p className="text-xs text-white/25">No enclosures yet.</p>
                        <button
                          onClick={() => openAddEnclosure(venue)}
                          className="text-xs text-[#56a963] hover:text-[#a5fcad] transition-colors flex items-center gap-1 mt-1"
                        >
                          <Plus size={11} /> Add first enclosure
                        </button>
                      </div>
                    )}

                    {!encLoading && enclosures.length > 0 && (
                      <div className="space-y-2">
                        {enclosures.map((enc) => {
                          const isEncExpanded = expandedEnclosureId === enc.id;
                          const rows = rowsByEnclosure[enc.id] ?? [];
                          const rLoading = rowsLoading[enc.id] ?? false;

                          return (
                            <div
                              key={enc.id}
                              className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
                            >
                              {/* Enclosure row */}
                              <div className="flex items-center gap-3 px-4 py-3 max-[550px]:flex-wrap max-[400px]:px-3 max-[400px]:py-2 max-[400px]:gap-1.5">
                                {/* Info group: expand toggle + icon + name */}
                                <div className="flex items-center gap-3 flex-1 min-w-0 max-[550px]:w-full max-[550px]:justify-center max-[550px]:order-2 max-[400px]:gap-1.5">
                                  <button
                                    onClick={() => toggleEnclosure(enc.id)}
                                    className="text-white/25 hover:text-white/50 transition-colors shrink-0"
                                  >
                                    {isEncExpanded
                                      ? <ChevronDown size={15} />
                                      : <ChevronRight size={15} />}
                                  </button>

                                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 max-[400px]:w-5 max-[400px]:h-5">
                                    <Layers size={13} className="text-white/30 max-[400px]:w-2.5 max-[400px]:h-2.5" />
                                  </div>

                                  <div className="flex-1 min-w-0 max-[550px]:flex-none max-[550px]:text-center">
                                    <div className="flex items-center gap-2 flex-wrap max-[550px]:justify-center">
                                      <p className="text-xs font-semibold text-white/80 max-[400px]:text-[9px]">{enc.name}</p>
                                      <span
                                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full max-[400px]:text-[7px] max-[400px]:px-1 ${
                                          enc.isActive
                                            ? "bg-[#56a963]/10 text-[#a5fcad]"
                                            : "bg-red-500/10 text-red-400"
                                        }`}
                                      >
                                        {enc.isActive ? "Active" : "Inactive"}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-white/25 mt-0.5 max-[400px]:text-[8px]">
                                      {enc.totalSeats} total seats
                                      <span className="text-white/15 ml-2 font-mono">#{enc.enclosureIdOnchain}</span>
                                    </p>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0 max-[550px]:w-full max-[550px]:justify-center max-[550px]:order-1 max-[400px]:gap-1">
                                  <button
                                    onClick={() => handleToggleEnclosure(enc)}
                                    title={enc.isActive ? "Deactivate enclosure" : "Activate enclosure"}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] border transition-colors max-[400px]:text-[8px] max-[400px]:px-1.5 max-[400px]:py-0.5 ${
                                      enc.isActive
                                        ? "text-red-400 bg-red-500/5 border-red-500/15 hover:bg-red-500/10"
                                        : "text-[#a5fcad] bg-[#56a963]/5 border-[#56a963]/15 hover:bg-[#56a963]/10"
                                    }`}
                                  >
                                    {enc.isActive ? <ToggleLeft size={10} className="max-[400px]:w-2 max-[400px]:h-2" /> : <ToggleRight size={10} className="max-[400px]:w-2 max-[400px]:h-2" />}
                                    {enc.isActive ? "Deactivate" : "Activate"}
                                  </button>

                                  <button
                                    onClick={() => openEditEnclosure(enc)}
                                    title="Edit enclosure name"
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-white/35 bg-white/[0.03] border border-white/[0.06] hover:text-white/60 hover:bg-white/5 transition-colors max-[400px]:text-[8px] max-[400px]:px-1.5 max-[400px]:py-0.5"
                                  >
                                    <Edit2 size={10} className="max-[400px]:w-2 max-[400px]:h-2" />
                                    Edit
                                  </button>

                                  <button
                                    onClick={() => openAddRows(enc)}
                                    title="Add rows"
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-white/35 bg-white/[0.03] border border-white/[0.06] hover:text-white/60 hover:bg-white/5 transition-colors max-[400px]:text-[8px] max-[400px]:px-1.5 max-[400px]:py-0.5"
                                  >
                                    <Plus size={10} className="max-[400px]:w-2 max-[400px]:h-2" />
                                    Rows
                                  </button>

                                  <button
                                    onClick={() => openRepositionEnclosure(enc)}
                                    title="Set stadium position"
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-white/35 bg-white/[0.03] border border-white/[0.06] hover:text-white/60 hover:bg-white/5 transition-colors max-[400px]:text-[8px] max-[400px]:px-1.5 max-[400px]:py-0.5"
                                  >
                                    <MoveRight size={10} className="max-[400px]:w-2 max-[400px]:h-2" />
                                    Position
                                  </button>
                                </div>
                              </div>

                              {/* Rows panel */}
                              {isEncExpanded && (
                                <div className="border-t border-white/[0.05] bg-[#060606] px-4 py-3">
                                  {rLoading && (
                                    <div className="flex items-center gap-2 text-xs text-white/25 py-2">
                                      <RefreshCw size={11} className="animate-spin" />
                                      Loading rows…
                                    </div>
                                  )}

                                  {!rLoading && rows.length === 0 && (
                                    <p className="text-xs text-white/20 italic py-1">No rows loaded yet.</p>
                                  )}

                                  {!rLoading && rows.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {rows.map((r, rIdx) => (
                                        <div
                                          key={r.label}
                                          className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg px-2.5 py-1.5"
                                        >
                                          <Rows3 size={10} className="text-[#56a963]/50 shrink-0" />
                                          <span className="text-[10px] font-mono font-bold text-white/60">
                                            Row {r.label}
                                          </span>
                                          <span className="text-[10px] text-white/30">
                                            {r.seats.length} seats
                                          </span>
                                          <button
                                            onClick={() => openEditRow(r, rIdx, enc)}
                                            className="ml-1 text-white/20 hover:text-[#56a963] transition-colors"
                                            title="Edit row"
                                          >
                                            <Edit2 size={9} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────────────── */}

      {/* Create Venue */}
      {activeModal === "createVenue" && (
        <Modal title="Create Venue" onClose={closeModal}>
          <div className="space-y-4">
            <FieldInput label="Venue Name" value={formName} onChange={setFormName} placeholder="e.g. National Stadium" />
            <FieldInput label="City" value={formCity} onChange={setFormCity} placeholder="e.g. Karachi" />
            <div className="pt-2 flex gap-2 max-[400px]:flex-col-reverse">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl text-sm text-white/40 border border-white/8 hover:text-white/70 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleCreateVenue}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#002a0c] hover:opacity-90 transition-opacity"
                style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
              >
                Create Venue
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Venue */}
      {activeModal === "editVenue" && (
        <Modal title="Edit Venue" onClose={closeModal}>
          <div className="space-y-4">
            <FieldInput label="Venue Name" value={formName} onChange={setFormName} placeholder="e.g. National Stadium" />
            <FieldInput label="City" value={formCity} onChange={setFormCity} placeholder="e.g. Karachi" />
            <div className="pt-2 flex gap-2">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl text-sm text-white/40 border border-white/8 hover:text-white/70 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleEditVenue}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#002a0c] hover:opacity-90 transition-opacity"
                style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Enclosure — Step 1: Pick a slot */}
      {activeModal === "addEnclosure" && addEnclosureStep === "selectSlot" && (() => {
        const v = targetVenueRef.current;
        const existingEncs = v ? (enclosuresByVenue[v.id] ?? []) : [];
        const occupiedSlots: Record<string, OccupiedSlot> = {};
        for (const enc of existingEncs) {
          if (enc.svgPathId) occupiedSlots[enc.svgPathId] = { name: enc.name, color: "#56a963" };
        }
        return (
          <Modal title="Pick a Section" onClose={closeModal}>
            <div className="space-y-4">
              <p className="text-xs text-white/40">
                Click a free section on the stadium to assign this enclosure to it.
              </p>
              <StadiumSlotPicker
                occupiedSlots={occupiedSlots}
                selectedPathId={formSvgPathId}
                onSelectSlot={setFormSvgPathId}
              />
              <div className="pt-2 flex gap-2">
                <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl text-sm text-white/40 border border-white/8 hover:text-white/70 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => setAddEnclosureStep("fillForm")}
                  disabled={!formSvgPathId}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#002a0c] hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
                >
                  Continue →
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* Add Enclosure — Step 2: Fill form */}
      {activeModal === "addEnclosure" && addEnclosureStep === "fillForm" && (() => {
        return (
          <Modal title={`Configure Section`} onClose={closeModal}>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5">Category</p>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[formCategory] ?? "#F5A623" }} />
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25"
                  >
                    {CATEGORY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <FieldInput label="Enclosure Name" value={formName} onChange={setFormName} placeholder="e.g. North Stand" />
              <RowsBuilder rows={formRows} onChange={setFormRows} />
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setAddEnclosureStep("selectSlot")}
                  className="py-2.5 px-4 rounded-xl text-sm text-white/40 border border-white/8 hover:text-white/70 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleAddEnclosure}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#002a0c] hover:opacity-90 transition-opacity"
                  style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
                >
                  Add Enclosure
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* Reposition Enclosure */}
      {activeModal === "repositionEnclosure" && (() => {
        const enc = targetEnclosureRef.current;
        const existingEncs = enc ? (enclosuresByVenue[enc.venueId] ?? []) : [];
        const occupiedSlots: Record<string, OccupiedSlot> = {};
        for (const e of existingEncs) {
          if (e.svgPathId && e.id !== enc?.id) occupiedSlots[e.svgPathId] = { name: e.name, color: "#56a963" };
        }
        return (
          <Modal title={`Set Position — ${enc?.name}`} onClose={closeModal}>
            <div className="space-y-4">
              <p className="text-xs text-white/40">
                Click a free section to move this enclosure to a different position on the stadium map.
              </p>
              <StadiumSlotPicker
                occupiedSlots={occupiedSlots}
                selectedPathId={formSvgPathId}
                onSelectSlot={setFormSvgPathId}
              />
              <div className="pt-2 flex gap-2">
                <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl text-sm text-white/40 border border-white/8 hover:text-white/70 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleRepositionEnclosure}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#002a0c] hover:opacity-90 transition-opacity"
                  style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
                >
                  Save Position
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* Edit Enclosure */}
      {activeModal === "editEnclosure" && (
        <Modal title="Edit Enclosure" onClose={closeModal}>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5">Category</p>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[formCategory] ?? "#F5A623" }} />
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25"
                >
                  {CATEGORY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <FieldInput label="Enclosure Name" value={formName} onChange={setFormName} placeholder="e.g. North Stand" />
            <div className="pt-2 flex gap-2 max-[400px]:flex-col-reverse">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl text-sm text-white/40 border border-white/8 hover:text-white/70 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleEditEnclosure}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#002a0c] hover:opacity-90 transition-opacity"
                style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Rows */}
      {activeModal === "addRows" && (
        <Modal title={`Add Rows — ${targetEnclosureRef.current?.name}`} onClose={closeModal}>
          <div className="space-y-4">
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl px-4 py-3">
              <p className="text-xs text-amber-400/80">
                <span className="font-semibold text-amber-400">Note:</span> Row labels must be unique within this enclosure.
              </p>
            </div>
            <RowsBuilder rows={formRows} onChange={setFormRows} />
            <div className="pt-2 flex gap-2">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl text-sm text-white/40 border border-white/8 hover:text-white/70 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleAddRows}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#002a0c] hover:opacity-90 transition-opacity"
                style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
              >
                Add Rows
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Row */}
      {activeModal === "editRow" && (
        <Modal title={`Edit Row ${targetRowRef.current?.row.label} — ${targetRowRef.current?.enclosure.name}`} onClose={closeModal}>
          <div className="space-y-4">
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl px-4 py-3">
              <p className="text-xs text-amber-400/80">
                <span className="font-semibold text-amber-400">Warning:</span> Removing existing seat numbers may affect already-sold seats. Only add new seat numbers or rename unused labels safely.
              </p>
            </div>
            <div>
              <SectionLabel>Row Label</SectionLabel>
              <input
                type="text"
                maxLength={1}
                value={formRowLabel}
                onChange={(e) => setFormRowLabel(e.target.value.toUpperCase())}
                placeholder="A"
                className="w-16 text-center bg-[#1a1a1a] border border-white/8 text-white text-sm rounded-lg px-2 py-2.5 focus:outline-none focus:border-[#56a963]/40 placeholder:text-white/15 font-mono font-bold"
              />
            </div>
            <div>
              <SectionLabel>Seat Numbers</SectionLabel>
              {(() => {
                const currentSeats = parseSeats(formRowSeatsInput);
                const dupSeat = findDuplicateSeat(currentSeats);
                return (
                  <>
                    <input
                      type="text"
                      value={formRowSeatsInput}
                      onChange={(e) => setFormRowSeatsInput(e.target.value)}
                      placeholder="e.g. 1,2,3,4,5,10,15"
                      className={`w-full bg-[#1a1a1a] border text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none placeholder:text-white/15 font-mono ${
                        dupSeat !== null
                          ? "border-red-500/50 focus:border-red-500/70"
                          : "border-white/8 focus:border-[#56a963]/40"
                      }`}
                    />
                    {dupSeat !== null ? (
                      <p className="text-[10px] text-red-400 mt-1">
                        Duplicate seat number: {dupSeat} — all seat numbers must be unique.
                      </p>
                    ) : currentSeats.length > 0 ? (
                      <p className="text-[10px] text-white/30 mt-1">
                        {currentSeats.length} seat{currentSeats.length !== 1 ? "s" : ""}: {currentSeats.slice(0, 8).join(", ")}{currentSeats.length > 8 ? ` … +${currentSeats.length - 8} more` : ""}
                      </p>
                    ) : null}
                  </>
                );
              })()}
            </div>
            <div className="pt-2 flex gap-2">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl text-sm text-white/40 border border-white/8 hover:text-white/70 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleUpdateRow}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#002a0c] hover:opacity-90 transition-opacity"
                style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
              >
                Update Row
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Shared Transaction Progress Modal */}
      <TransactionProgressModal
        open={txModal.open}
        onClose={() => {
          setTxModal((p) => ({ ...p, open: false }));
          activeTx.reset();
        }}
        step={activeTx.step}
        txHash={activeTx.txHash}
        errorMessage={activeTx.errorMessage}
        successTitle={txModal.title.replace("ing", "ed").replace("Creating", "Created").replace("Updating", "Updated").replace("Adding", "Added").replace("Deactivating", "Deactivated").replace("Activating", "Activated")}
        successDescription="The transaction has been confirmed on-chain."
      />
    </div>
  );
}
