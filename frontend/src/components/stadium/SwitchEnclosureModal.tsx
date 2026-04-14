"use client";

import { AlertTriangle, X } from "lucide-react";
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface SwitchEnclosureModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fromName: string;
  toName: string;
  seatCount: number;
}

export function SwitchEnclosureModal({
  open,
  onClose,
  onConfirm,
  fromName,
  toName,
  seatCount,
}: SwitchEnclosureModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-[420px] translate-x-[-50%] translate-y-[-50%] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 scale-[0.9] min-[470px]:scale-100">
          <div className="backdrop-blur-[10px] bg-[rgba(25,25,25,0.92)] border border-white/5 rounded-xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="px-7 pt-7 pb-4">
              <div className="flex items-start justify-between mb-5">
                <div className="w-11 h-11 rounded-lg bg-amber-500/15 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-amber-400" />
                </div>
                <button
                  onClick={onClose}
                  className="text-white/40 hover:text-white/80 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <h2 className="text-[24px] font-bold font-heading text-white tracking-tight leading-tight">
                Switch Enclosure?
              </h2>
              <p className="text-sm text-[#ababab] mt-1">
                You have{" "}
                <span className="text-white font-medium">
                  {seatCount} seat{seatCount !== 1 ? "s" : ""}
                </span>{" "}
                held in{" "}
                <span className="text-white font-medium">{fromName}</span>.
              </p>
            </div>

            {/* Body */}
            <div className="px-7 py-4">
              <div className="bg-[#1f1f1f] border border-white/5 rounded-xl p-4 space-y-3">
                {/* From → To */}
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-[#ababab] mb-0.5">
                      Current
                    </p>
                    <p className="text-white font-medium truncate">{fromName}</p>
                  </div>
                  <span className="text-white/30 text-lg">→</span>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-[10px] uppercase tracking-wider text-[#ababab] mb-0.5">
                      Switching to
                    </p>
                    <p className="text-[#a5fcad] font-medium truncate">{toName}</p>
                  </div>
                </div>

                {/* Warning note */}
                <div className="border-t border-white/5 pt-3">
                  <p className="text-xs text-amber-400/80">
                    Your held seats will be released and your current selection will be cleared.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-7 pt-2 pb-7 space-y-3">
              <button
                onClick={onConfirm}
                className="w-full py-3.5 rounded-xl font-bold font-heading text-base text-[#002a0c] text-center"
                style={{
                  backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)",
                  boxShadow: "0px 8px 15px -3px rgba(165,252,173,0.15)",
                }}
              >
                Yes, Switch Enclosure
              </button>
              <button
                onClick={onClose}
                className="w-full py-2 text-center text-sm text-[#ababab] hover:text-white transition-colors font-medium"
              >
                Keep Current Selection
              </button>
            </div>

          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
