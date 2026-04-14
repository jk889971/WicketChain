"use client";

import { useState, useEffect } from "react";
import { X, MapPin, Loader2 } from "lucide-react";
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface AddVenueModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { venueIdOnchain: number; venueUUID: string; location: string }) => void;
  isLoading: boolean;
  availableVenues: Array<{ id: string; venueIdOnchain: number; name: string; city: string }>;
}

export function AddVenueModal({
  open,
  onClose,
  onSave,
  isLoading,
  availableVenues,
}: AddVenueModalProps) {
  const [selectedVenueId, setSelectedVenueId] = useState<number>(0);
  const [location, setLocation]               = useState("");
  const [errors, setErrors]                   = useState<{ venue?: string; location?: string }>({});

  useEffect(() => {
    if (open) {
      setSelectedVenueId(availableVenues[0]?.venueIdOnchain ?? 0);
      setLocation("");
      setErrors({});
    }
  }, [open, availableVenues]);

  const handleSave = () => {
    const newErrors: typeof errors = {};
    if (!selectedVenueId) newErrors.venue = "Please select a venue.";
    if (!location.trim()) newErrors.location = "Location is required.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const venue = availableVenues.find((v) => v.venueIdOnchain === selectedVenueId);
    if (!venue) return;

    onSave({ venueIdOnchain: venue.venueIdOnchain, venueUUID: venue.id, location: location.trim() });
  };

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  if (availableVenues.length === 0) {
    return (
      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-[400px] translate-x-[-50%] translate-y-[-50%] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <div className="backdrop-blur-[10px] bg-[rgba(25,25,25,0.85)] border border-white/5 rounded-xl shadow-2xl p-8 text-center">
              <div className="w-11 h-11 rounded-lg bg-[#56a963]/20 flex items-center justify-center mb-4 mx-auto">
                <MapPin size={20} className="text-[#a5fcad]" />
              </div>
              <h2 className="text-lg font-bold font-heading text-white mb-2">No Venues Available</h2>
              <p className="text-sm text-[#ababab] mb-6">Your shop is already registered at all active venues.</p>
              <button
                onClick={handleClose}
                className="w-full py-2.5 rounded-xl font-bold text-sm text-[#002a0c]"
                style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
              >
                Close
              </button>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-[420px] translate-x-[-50%] translate-y-[-50%] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="backdrop-blur-[10px] bg-[rgba(25,25,25,0.85)] border border-white/5 rounded-xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="px-8 pt-8 pb-4">
              <div className="flex items-start justify-between mb-6">
                <div className="w-11 h-11 rounded-lg bg-[#56a963]/20 flex items-center justify-center">
                  <MapPin size={20} className="text-[#a5fcad]" />
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="text-white/40 hover:text-white/80 transition-colors disabled:opacity-30"
                >
                  <X size={16} />
                </button>
              </div>
              <h2 className="text-[24px] font-bold font-heading text-white tracking-tight leading-tight">
                Add Venue
              </h2>
              <p className="text-sm text-[#ababab] mt-1">
                Expand your shop to a new venue.
              </p>
            </div>

            {/* Form */}
            <div className="px-8 py-4 space-y-4">

              {/* Venue select */}
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

              {/* Location */}
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

            {/* Footer */}
            <div className="px-8 pt-2 pb-8 space-y-3">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-bold font-heading text-base text-[#002a0c] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
              >
                {isLoading && <Loader2 size={14} className="animate-spin" />}
                {isLoading ? "Adding…" : "Add Venue"}
              </button>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="w-full py-2 text-center text-sm text-[#ababab] hover:text-white transition-colors font-medium disabled:opacity-30"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
