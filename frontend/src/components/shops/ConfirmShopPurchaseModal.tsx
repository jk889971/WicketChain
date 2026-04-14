"use client";

import { formatWire } from "@/lib/utils/formatWire";
import { truncateAddress } from "@/lib/utils/truncateAddress";
import { X, ShoppingBag, Wallet } from "lucide-react";
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface ConfirmShopPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  shopName: string;
  items: Array<{
    name: string;
    quantity: number;
    priceWei: bigint;
    priceDisplay: string | null;
    ticketLabel: string;
  }>;
  totalWei: bigint;
  walletAddress?: string;
}

export function ConfirmShopPurchaseModal({
  open,
  onClose,
  onConfirm,
  shopName,
  items,
  totalWei,
  walletAddress,
}: ConfirmShopPurchaseModalProps) {
  const shortAddr = walletAddress
    ? truncateAddress(walletAddress)
    : "—";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-[460px] translate-x-[-50%] translate-y-[-50%] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 min-[500px]:scale-100 scale-[0.8]">
          <div className="backdrop-blur-[10px] bg-[rgba(25,25,25,0.85)] border border-white/5 rounded-xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
            {/* Header */}
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#56a963]/20 flex items-center justify-center">
                  <ShoppingBag size={16} className="text-[#a5fcad]" />
                </div>
                <button
                  onClick={onClose}
                  className="text-white/40 hover:text-white/80 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <h2 className="text-xl font-bold font-heading text-white tracking-tight leading-tight">
                Confirm Purchase
              </h2>
              <p className="text-xs text-[#ababab] mt-1">
                Review your order before paying.
              </p>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 px-5 py-3 space-y-3">
              {/* Shop info card */}
              <div className="bg-[#1f1f1f] border border-white/5 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#2c2c2c] flex items-center justify-center shrink-0">
                  <ShoppingBag size={18} className="text-[#a5fcad]" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-snug">{shopName}</p>
                  <p className="text-[#a5fcad] text-[10px] uppercase tracking-widest mt-0.5">
                    Stadium Shop
                  </p>
                </div>
              </div>

              {/* Items list */}
              <div className="space-y-2">
                {items.map((item, i) => {
                  const lineTotal = item.priceWei * BigInt(item.quantity);
                  return (
                    <div key={i} className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium leading-snug line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-white/30 mt-0.5">
                          Qty {item.quantity} · {item.ticketLabel}
                        </p>
                      </div>
                      <span className="text-sm text-white/80 font-mono shrink-0">
                        {formatWire(lineTotal)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="border-t border-white/10" />

              {/* Total row */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#a5fcad] font-bold mb-1">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold font-heading text-[#a5fcad]">
                    {formatWire(totalWei)}
                  </p>
                </div>
              </div>

              {/* Wallet row */}
              <div className="bg-[#131313] border border-white/5 rounded-xl p-4 flex items-center gap-3">
                <Wallet size={15} className="text-[#ababab] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#ababab]">Connected Wallet</p>
                  <p className="text-xs text-white font-mono">{shortAddr}</p>
                </div>
                <span className="text-[10px] text-[#77f5af] bg-[rgba(0,109,66,0.3)] px-2 py-0.5 rounded-full">
                  Testnet
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pt-2 pb-5 space-y-2">
              <button
                onClick={onConfirm}
                className="w-full py-2.5 rounded-xl font-bold font-heading text-sm text-[#002a0c] text-center"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)",
                  boxShadow:
                    "0px 10px 15px -3px rgba(165,252,173,0.2), 0px 4px 6px -4px rgba(165,252,173,0.2)",
                }}
              >
                Confirm &amp; Pay
              </button>
              <button
                onClick={onClose}
                className="w-full py-2 text-center text-sm text-[#ababab] hover:text-white transition-colors font-medium"
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
