"use client";

import { useState, useEffect } from "react";
import { X, MapPin, Loader2, Trash2, Save } from "lucide-react";
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface ManageVenuesModalProps {
  open: boolean;
  onClose: () => void;
  onAddVenue: (data: { venueIdOnchain: number; venueUUID: string; location: string }) => void;
  onRemoveVenue: (venueIdOnchain: number, venueUUID: string) => void;
  onUpdateVenueLocation: (venueIdOnchain: number, venueUUID: string, newLocation: string) => void;
  isAddLoading: boolean;
  isRemoveLoading: boolean;
  isUpdateLocationLoading: boolean;
  availableVenues: Array<{ id: string; venueIdOnchain: number; name: string; city: string }>;
  currentVenues: Array<{
    venueId: string;
    venueIdOnchain: number;
    name: string;
    city: string;
    locationInVenue: string | null;
  }>;
}

export function ManageVenuesModal({
  open,
  onClose,
  onAddVenue,
  onRemoveVenue,
  onUpdateVenueLocation,
  isAddLoading,
  isRemoveLoading,
  isUpdateLocationLoading,
  availableVenues,
  currentVenues,
}: ManageVenuesModalProps) {
  const [selectedVenueId, setSelectedVenueId] = useState<number>(0);
  const [location, setLocation]               = useState("");
  const [errors, setErrors]                   = useState<{ venue?: string; location?: string }>({});

  // Per-venue location edit state: venueIdOnchain → edited location string
  const [locationEdits, setLocationEdits] = useState<Record<number, string>>({});
  // Which venue is currently saving its location
  const [savingVenueId, setSavingVenueId] = useState<number | null>(null);

  // Initialise locationEdits whenever currentVenues changes (e.g. on modal open)
  useEffect(() => {
    if (!open) return;
    setSelectedVenueId(availableVenues[0]?.venueIdOnchain ?? 0);
    setLocation("");
    setErrors({});

    const edits: Record<number, string> = {};
    for (const v of currentVenues) {
      edits[v.venueIdOnchain] = v.locationInVenue ?? "";
    }
    setLocationEdits(edits);
    setSavingVenueId(null);
  }, [open, availableVenues, currentVenues]);

  const handleAdd = () => {
    const newErrors: typeof errors = {};
    if (!selectedVenueId) newErrors.venue = "Please select a venue.";
    if (!location.trim()) newErrors.location = "Location is required.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const venue = availableVenues.find((v) => v.venueIdOnchain === selectedVenueId);
    if (!venue) return;

    onAddVenue({ venueIdOnchain: venue.venueIdOnchain, venueUUID: venue.id, location: location.trim() });
  };

  const handleSaveLocation = (v: typeof currentVenues[number]) => {
    const newLoc = (locationEdits[v.venueIdOnchain] ?? "").trim();
    if (newLoc === (v.locationInVenue ?? "").trim()) return; // no change
    setSavingVenueId(v.venueIdOnchain);
    onUpdateVenueLocation(v.venueIdOnchain, v.venueId, newLoc);
  };

  // Clear savingVenueId once the loading finishes
  useEffect(() => {
    if (!isUpdateLocationLoading) setSavingVenueId(null);
  }, [isUpdateLocationLoading]);

  const handleClose = () => {
    if (isAddLoading || isRemoveLoading || isUpdateLocationLoading) return;
    onClose();
  };

  const isLoading = isAddLoading || isRemoveLoading || isUpdateLocationLoading;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-[calc(100%-2rem)] max-w-[440px] translate-x-[-50%] translate-y-[-50%] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="backdrop-blur-[10px] bg-[rgba(25,25,25,0.85)] border border-white/5 rounded-xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">

            {/* Header */}
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#56a963]/20 flex items-center justify-center">
                  <MapPin size={16} className="text-[#a5fcad]" />
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="text-white/40 hover:text-white/80 transition-colors disabled:opacity-30"
                >
                  <X size={16} />
                </button>
              </div>
              <h2 className="text-xl font-bold font-heading text-white tracking-tight leading-tight">
                Manage Venues
              </h2>
              <p className="text-xs text-[#ababab] mt-1">
                Add or remove venues. Edit location within each venue and save individually.
              </p>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-5 py-3 space-y-4">

              {/* Current venues */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Current Venues</p>
                {currentVenues.length === 0 ? (
                  <p className="text-xs text-white/30 italic">No venues added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {currentVenues.map((v) => {
                      const isSavingThis = savingVenueId === v.venueIdOnchain && isUpdateLocationLoading;
                      const currentEdit = locationEdits[v.venueIdOnchain] ?? "";
                      const hasChanged  = currentEdit.trim() !== (v.locationInVenue ?? "").trim();

                      return (
                        <div key={v.venueIdOnchain} className="bg-white/[0.03] border border-white/5 rounded-lg p-3 space-y-2">
                          {/* Venue name + remove */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-white/80 font-medium truncate">{v.name}, {v.city}</span>
                            <button
                              onClick={() => onRemoveVenue(v.venueIdOnchain, v.venueId)}
                              disabled={isLoading}
                              title="Remove venue"
                              className="text-red-400/50 hover:text-red-400 transition-colors disabled:opacity-30 shrink-0"
                            >
                              {isRemoveLoading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                            </button>
                          </div>

                          {/* Location edit row */}
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={currentEdit}
                              onChange={(e) =>
                                setLocationEdits((prev) => ({ ...prev, [v.venueIdOnchain]: e.target.value }))
                              }
                              placeholder="e.g. Gate 3, Section B"
                              disabled={isLoading}
                              className="flex-1 min-w-0 bg-[#141414] border border-white/10 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#56a963]/50 placeholder:text-white/20 disabled:opacity-40"
                            />
                            <button
                              onClick={() => handleSaveLocation(v)}
                              disabled={isLoading || !hasChanged}
                              title="Save location (on-chain)"
                              className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold font-heading text-[#002a0c] bg-[#a5fcad] hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              {isSavingThis
                                ? <Loader2 size={11} className="animate-spin" />
                                : <Save size={11} />}
                              {isSavingThis ? "Saving…" : "Save"}
                            </button>
                          </div>
                          <p className="text-[10px] text-white/20">⛓ Save triggers an on-chain transaction</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-white/5" />

              {/* Add new venue */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Add New Venue</p>
                {availableVenues.length === 0 ? (
                  <p className="text-xs text-white/30 italic">All available venues have been added.</p>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">
                        Venue <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={selectedVenueId}
                        onChange={(e) => { setSelectedVenueId(Number(e.target.value)); setErrors((p) => ({ ...p, venue: undefined })); }}
                        className="w-full bg-[#1a1a1a] border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#56a963]/50"
                      >
                        {availableVenues.map((v) => (
                          <option key={v.venueIdOnchain} value={v.venueIdOnchain}>
                            {v.name}, {v.city}
                          </option>
                        ))}
                      </select>
                      {errors.venue && <p className="text-xs text-red-400 mt-1">{errors.venue}</p>}
                    </div>
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">
                        Your Location in Venue <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => { setLocation(e.target.value); setErrors((p) => ({ ...p, location: undefined })); }}
                        placeholder="e.g. Gate 4, Section A"
                        className="w-full bg-[#1a1a1a] border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#56a963]/50 placeholder:text-white/20"
                      />
                      {errors.location && <p className="text-xs text-red-400 mt-1">{errors.location}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            {availableVenues.length > 0 && (
              <div className="px-5 pt-2 pb-5 space-y-2">
                <button
                  onClick={handleAdd}
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl font-bold font-heading text-sm text-[#002a0c] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
                >
                  {isAddLoading && <Loader2 size={13} className="animate-spin" />}
                  {isAddLoading ? "Adding…" : "Add Venue"}
                </button>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="w-full py-2 text-center text-sm text-[#ababab] hover:text-white transition-colors font-medium disabled:opacity-30"
                >
                  Close
                </button>
              </div>
            )}
            {availableVenues.length === 0 && (
              <div className="px-5 pt-2 pb-5">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl font-bold font-heading text-sm text-[#002a0c] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
                  style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
