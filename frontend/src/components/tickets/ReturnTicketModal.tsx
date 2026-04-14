"use client";

import { AlertTriangle, X, ShoppingBag } from "lucide-react";
import { formatWire } from "@/lib/utils/formatWire";
import { useReadContracts } from "wagmi";
import { useEffect, useState } from "react";
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { CONTRACTS } from "@/config/contracts";
import { ticketNftAbi } from "@/lib/contracts/generated";
import { supabase } from "@/lib/supabase";

interface LinkedOrder {
  id: string;
  orderIdOnchain: number;
  productName: string;
  quantity: number;
  totalPaidWei: string;
}

export interface ReturnTicketInfo {
  tokenId: number;
  matchTitle: string;
  enclosureName: string;
  rowLabel: string;
  seatNumber: number;
}

interface ReturnTicketModalProps {
  open: boolean;
  onClose: () => void;
  ticket: ReturnTicketInfo | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ReturnTicketModal({
  open,
  onClose,
  ticket,
  onConfirm,
  isLoading = false,
}: ReturnTicketModalProps) {
  /* ── On-chain reads ───────────────────────────────────── */
  const { data: contractData } = useReadContracts({
    contracts: [
      {
        address: CONTRACTS.ticketNFT,
        abi: ticketNftAbi,
        functionName: "getTicketData",
        args: [BigInt(ticket?.tokenId ?? 0)],
      },
      {
        address: CONTRACTS.ticketNFT,
        abi: ticketNftAbi,
        functionName: "REFUND_BPS",
      },
      {
        address: CONTRACTS.ticketNFT,
        abi: ticketNftAbi,
        functionName: "BPS_DENOMINATOR",
      },
    ],
    query: { enabled: open && !!ticket },
  });

  /* ── Linked shop orders ───────────────────────────────── */
  const [linkedOrders, setLinkedOrders] = useState<LinkedOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!open || !ticket) { setLinkedOrders([]); return; }
    setOrdersLoading(true);
    supabase
      .from("shop_orders")
      .select("id, order_id_onchain, quantity, total_paid_wei, shop_products(name)")
      .eq("ticket_token_id", ticket.tokenId)
      .eq("status", "ACTIVE")
      .then(({ data }) => {
        setLinkedOrders(
          ((data as any[]) || []).map((o) => ({
            id: o.id,
            orderIdOnchain: o.order_id_onchain,
            productName: (Array.isArray(o.shop_products) ? o.shop_products[0] : o.shop_products)?.name ?? "Product",
            quantity: o.quantity,
            totalPaidWei: o.total_paid_wei,
          }))
        );
        setOrdersLoading(false);
      });
  }, [open, ticket]);

  // Only surface numbers once ALL three reads succeed — never fall back to guesses
  const dataLoaded =
    contractData?.[0]?.status === "success" &&
    contractData?.[1]?.status === "success" &&
    contractData?.[2]?.status === "success";

  const purchasePrice = dataLoaded
    ? (contractData![0].result as { purchasePrice: bigint }).purchasePrice
    : 0n;

  const refundBps   = dataLoaded ? (contractData![1].result as bigint) : 0n;
  const bpsDenom    = dataLoaded ? (contractData![2].result as bigint) : 1n; // avoid /0
  const refundAmount = purchasePrice > 0n ? (purchasePrice * refundBps) / bpsDenom : 0n;
  const refundPct    = dataLoaded ? Number(refundBps) / (Number(bpsDenom) / 100) : null;

  const tokenIdDisplay = `#${String(ticket?.tokenId ?? 0).padStart(4, "0")}`;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !isLoading) onClose();
      }}
    >
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 w-full max-w-[460px] translate-x-[-50%] translate-y-[-50%] focus:outline-none px-4 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 scale-[0.85] min-[400px]:scale-100"
          onPointerDownOutside={(e) => { if (isLoading) e.preventDefault(); }}
          onEscapeKeyDown={(e)       => { if (isLoading) e.preventDefault(); }}
        >
          <div className="relative backdrop-blur-xl bg-[rgba(31,31,31,0.97)] border border-white/[0.07] rounded-xl shadow-[0px_20px_40px_-8px_rgba(0,0,0,0.6)] overflow-hidden">

            {/* Close */}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="absolute right-4 top-4 z-10 p-1 text-white/40 hover:text-white/70 transition-colors disabled:pointer-events-none"
              aria-label="Close"
            >
              <X size={15} />
            </button>

            {/* Header */}
            <div className="px-6 pt-7 pb-4">
              <h2 className="text-xl font-bold font-heading text-white tracking-tight">
                Return Ticket
              </h2>
              <p className="text-xs text-[#ababab] font-light mt-1">
                Confirm your return request for the selected ticket.
              </p>
            </div>

            {/* Body */}
            <div className="px-6 pb-6 flex flex-col gap-4">

              {/* ── Warning card ── */}
              <div className="bg-[rgba(255,210,200,0.05)] border border-[rgba(185,41,2,0.2)] rounded-lg p-4 flex gap-3">
                <AlertTriangle size={15} className="text-[#b92902] shrink-0 mt-0.5" />
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold text-[#b92902]">
                    Returning this ticket will:
                  </p>
                  <ul className="text-xs text-[#ababab] flex flex-col gap-1 list-disc pl-3.5">
                    <li>
                      {dataLoaded
                        ? `Refund ${refundPct}% of the purchase price (${formatWire(refundAmount)})`
                        : (
                          <span className="inline-flex items-center gap-1.5">
                            Refund a percentage of the purchase price
                            <span className="inline-block h-2.5 w-16 rounded bg-white/10 animate-pulse align-middle" />
                          </span>
                        )
                      }
                    </li>
                    <li>Cancel and refund all active shop orders linked to this ticket</li>
                  </ul>
                </div>
              </div>

              {/* ── Ticket info ── */}
              <div className="border border-white/[0.05] rounded-lg p-4 flex flex-col gap-3">

                {/* Match title + enclosure badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[1px] text-[#ababab]">
                      Event Details
                    </p>
                    <h3 className="text-sm font-bold font-heading text-[#a5fcad] leading-snug truncate">
                      {ticket?.matchTitle}
                    </h3>
                  </div>
                  <div className="shrink-0 px-2.5 py-1 rounded-md border border-[rgba(165,252,173,0.2)] bg-[rgba(165,252,173,0.1)]">
                    <p className="text-[9px] font-bold uppercase tracking-[1px] text-[#a5fcad] whitespace-nowrap">
                      {ticket?.enclosureName}
                    </p>
                  </div>
                </div>

                {/* Seat + Token ID */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-medium uppercase text-[#ababab] mb-0.5">
                      Seat Assignment
                    </p>
                    <p className="text-sm font-medium text-white">
                      Row {ticket?.rowLabel}, Seat {ticket?.seatNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-medium uppercase text-[#ababab] mb-0.5">
                      Ticket ID
                    </p>
                    <p className="text-xs font-mono text-white">{tokenIdDisplay}</p>
                  </div>
                </div>

                {/* Price + Refund */}
                {(() => {
                  const ordersRefundWei = linkedOrders.reduce((sum, o) => sum + BigInt(o.totalPaidWei), 0n);
                  const totalRefundWei = refundAmount + ordersRefundWei;
                  const hasOrders = linkedOrders.length > 0;
                  return (
                    <div className="border-t border-white/[0.05] pt-3 flex flex-col gap-3">
                      <div className={`grid gap-4 ${hasOrders ? "grid-cols-3" : "grid-cols-2"}`}>
                        <div>
                          <p className="text-[9px] font-medium uppercase text-[#ababab] mb-0.5">
                            Purchase Price
                          </p>
                          {dataLoaded ? (
                            <p className="text-sm font-bold text-white">
                              {formatWire(purchasePrice)}
                            </p>
                          ) : (
                            <div className="h-5 w-20 rounded bg-white/5 animate-pulse mt-0.5" />
                          )}
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[1px] text-[#a5fcad] mb-0.5">
                            Ticket Refund
                          </p>
                          {dataLoaded ? (
                            <p className="text-sm font-bold text-[#a5fcad]">
                              {formatWire(refundAmount)}
                            </p>
                          ) : (
                            <div className="h-5 w-24 rounded bg-[rgba(165,252,173,0.1)] animate-pulse mt-0.5" />
                          )}
                        </div>
                        {hasOrders && (
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[1px] text-[#a5fcad] mb-0.5">
                              Orders Refund
                            </p>
                            <p className="text-sm font-bold text-[#a5fcad]">
                              {formatWire(ordersRefundWei)}
                            </p>
                          </div>
                        )}
                      </div>
                      {hasOrders && dataLoaded && (
                        <div className="bg-[rgba(165,252,173,0.06)] border border-[rgba(165,252,173,0.15)] rounded-lg px-3 py-2 flex items-center justify-between">
                          <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#a5fcad]">
                            Total Estimated Refund
                          </p>
                          <p className="text-sm font-bold text-[#a5fcad]">
                            {formatWire(totalRefundWei)}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* ── Linked shop orders ── */}
              <div className="flex flex-col gap-2">
                <p className="text-[9px] font-bold uppercase tracking-[1px] text-[#ababab]">
                  Linked Shop Orders
                </p>
                {ordersLoading ? (
                  <div className="bg-[#131313] border border-white/[0.05] rounded-lg px-4 py-3">
                    <div className="h-3 w-32 bg-white/5 animate-pulse rounded" />
                  </div>
                ) : linkedOrders.length === 0 ? (
                  <div className="bg-[#131313] border border-white/[0.05] rounded-lg px-4 py-3 flex items-center gap-2.5 text-[#ababab]">
                    <ShoppingBag size={13} className="shrink-0 opacity-50" />
                    <p className="text-xs">No linked shop orders</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-24 overflow-y-auto pr-1">
                    {linkedOrders.map((o) => (
                      <div key={o.id} className="bg-[#131313] border border-white/[0.05] rounded-lg px-4 py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <ShoppingBag size={13} className="shrink-0 text-[#ababab] opacity-60" />
                          <div className="min-w-0">
                            <p className="text-xs text-white truncate">{o.productName}</p>
                            <p className="text-[10px] text-white/30">Qty {o.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-mono text-[#a5fcad]">{formatWire(BigInt(o.totalPaidWei))}</p>
                          <p className="text-[10px] text-orange-400/70">Will be cancelled</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Action buttons ── */}
              <div className="flex flex-col min-[400px]:flex-row gap-3 pt-1">
                <button
                  onClick={onConfirm}
                  disabled={isLoading || !ticket}
                  className="flex-1 py-3 rounded-xl bg-[#ff7351] text-[#450900] text-sm font-bold font-heading hover:bg-[#ff8a6d] transition-colors disabled:opacity-50 disabled:pointer-events-none order-1 min-[400px]:order-2"
                  style={{
                    boxShadow:
                      "0px 8px 12px -3px rgba(255,115,81,0.2), 0px 3px 5px -3px rgba(255,115,81,0.2)",
                  }}
                >
                  Confirm Return
                </button>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl border border-white/[0.08] text-[#ababab] text-sm font-bold font-heading hover:bg-white/[0.03] transition-colors disabled:pointer-events-none disabled:opacity-40 order-2 min-[400px]:order-1"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Footer branding */}
            <div className="bg-[rgba(38,38,38,0.3)] border-t border-white/[0.03] py-2.5 flex items-center justify-center">
              <p className="text-[9px] font-bold uppercase tracking-[1px] text-white/20">
                WicketChain Obsidian Secure
              </p>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
