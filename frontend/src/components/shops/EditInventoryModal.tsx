"use client";

import { useState, useEffect } from "react";
import { X, Boxes, Loader2 } from "lucide-react";
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface EditInventoryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (units: number) => void;
  isLoading: boolean;
  productName: string;
  currentUnits: number;
}

export function EditInventoryModal({
  open,
  onClose,
  onSave,
  isLoading,
  productName,
  currentUnits,
}: EditInventoryModalProps) {
  const [units, setUnits] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setUnits(currentUnits >= 0 ? String(currentUnits) : "");
      setError("");
    }
  }, [open, currentUnits]);

  const handleSave = () => {
    const num = parseInt(units, 10);
    if (isNaN(num) || num < 0) {
      setError("Units must be 0 or more.");
      return;
    }
    onSave(num);
  };

  const handleClose = () => {
    if (isLoading) return;
    setUnits("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-[calc(100%-2rem)] max-w-[400px] translate-x-[-50%] translate-y-[-50%] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="backdrop-blur-[10px] bg-[rgba(25,25,25,0.85)] border border-white/5 rounded-xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">

            {/* Header */}
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#56a963]/20 flex items-center justify-center">
                  <Boxes size={16} className="text-[#a5fcad]" />
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
                Update Inventory
              </h2>
              <p className="text-xs text-[#ababab] mt-1 truncate">{productName}</p>
            </div>

            {/* Form */}
            <div className="overflow-y-auto flex-1 px-5 py-3">
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">
                Available Units <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={units}
                onChange={(e) => { setUnits(e.target.value); setError(""); }}
                placeholder="e.g. 50"
                min="0"
                step="1"
                className="w-full bg-[#1a1a1a] border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#56a963]/50 placeholder:text-white/20"
              />
              {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
            </div>

            {/* Footer */}
            <div className="px-5 pt-2 pb-5 space-y-2">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl font-bold font-heading text-sm text-[#002a0c] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
              >
                {isLoading && <Loader2 size={14} className="animate-spin" />}
                {isLoading ? "Saving..." : "Update Inventory"}
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
