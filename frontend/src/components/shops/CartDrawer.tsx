"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ShoppingCart,
  ShoppingBag,
  X,
  Plus,
  Minus,
  AlertTriangle,
  Ticket,
  ChevronDown,
  Check,
} from "lucide-react";
import { formatWire } from "@/lib/utils/formatWire";

export interface CartItem {
  cartItemId: string;
  productId: string;
  productIdOnchain: number;
  ticketTokenId: number;
  quantity: number;
  name: string;
  shopName: string;
  priceWei: bigint;
  imageUrl: string | null;
  shopId: string;
  shopIdOnchain: number;
  venueId: string;
  availableUnits: number;
}

export interface EligibleTicket {
  tokenId: number;
  label: string;
  venueId: string;
  matchTitle: string;
  matchTime: string | null;
  venueName: string;
}

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  eligibleTickets: EligibleTicket[];
  onUpdateQuantity: (cartItemId: string, qty: number) => void;
  onToggleTicket: (productId: string, ticketTokenId: number) => void;
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
  onCheckout: () => void;
  isCheckoutDisabled: boolean;
}

export function CartDrawer({
  open,
  onClose,
  items,
  eligibleTickets,
  onUpdateQuantity,
  onToggleTicket,
  onRemoveProduct,
  onClearAll,
  onCheckout,
  isCheckoutDisabled,
}: CartDrawerProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Only count assigned items (ticketTokenId !== 0) for totals
  const assignedItems = items.filter((i) => i.ticketTokenId !== 0);
  const totalWei = assignedItems.reduce(
    (sum, item) => sum + item.priceWei * BigInt(item.quantity),
    BigInt(0)
  );
  const totalItemCount = assignedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Unique product groups preserving insertion order
  const productIds = [...new Set(items.map((i) => i.productId))];

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[380px] flex flex-col bg-[#0e0e0e] border-l border-white/5 shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 shrink-0">
          <ShoppingCart size={18} className="text-[#a5fcad]" />
          <span className="font-heading font-bold text-white text-base">
            Cart
          </span>
          {totalItemCount > 0 && (
            <span className="text-xs font-bold text-[#002a0c] bg-gradient-to-br from-[#a5fcad] to-[#5fb26b] rounded-full px-2 py-0.5 min-w-[22px] text-center">
              {totalItemCount}
            </span>
          )}
          {productIds.length > 0 && (
            <button
              onClick={onClearAll}
              className="ml-auto text-xs text-white/30 hover:text-red-400 transition-colors"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            className={`${productIds.length > 0 ? "ml-3" : "ml-auto"} text-white/30 hover:text-white/70 transition-colors`}
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Item list or empty state */}
        <div className="flex-1 overflow-y-auto">
          {productIds.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 px-5 text-center">
              <ShoppingCart size={32} className="text-white/15" />
              <p className="text-sm text-white/30">Your cart is empty</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {productIds.map((productId) => {
                const group = items.filter((i) => i.productId === productId);
                const template = group[0];
                const assigned = group.filter((i) => i.ticketTokenId !== 0);
                const hasPlaceholder = group.some(
                  (i) => i.ticketTokenId === 0
                );
                const venueTickets = eligibleTickets.filter(
                  (t) => t.venueId === template.venueId
                );
                const selectedTokenIds = new Set(
                  assigned.map((i) => i.ticketTokenId)
                );
                const totalQtyForProduct = assigned.reduce(
                  (sum, i) => sum + i.quantity,
                  0
                );

                return (
                  <li key={productId} className="px-4 py-4 flex flex-col gap-3">
                    {/* Product header */}
                    <div className="flex gap-3 items-start">
                      <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-[#1f1f1f] flex items-center justify-center border border-white/5">
                        {template.imageUrl ? (
                          <Image
                            src={template.imageUrl}
                            alt={template.name}
                            width={44}
                            height={44}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <ShoppingBag size={16} className="text-white/20" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white leading-snug line-clamp-2">
                          {template.name}
                        </p>
                        <p className="text-xs text-[#a5fcad] font-mono mt-0.5">
                          {formatWire(template.priceWei)}
                        </p>
                      </div>

                      <button
                        onClick={() => onRemoveProduct(productId)}
                        className="text-white/20 hover:text-white/60 transition-colors mt-0.5 shrink-0"
                        aria-label="Remove product"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Ticket multi-select dropdown */}
                    {venueTickets.length === 0 ? (
                      <div className="flex items-center gap-1.5 text-amber-400 text-xs">
                        <AlertTriangle size={11} className="shrink-0" />
                        <span>No eligible tickets for this venue</span>
                      </div>
                    ) : (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === productId ? null : productId
                            )
                          }
                          className={`w-full flex items-center justify-between gap-2 bg-[#141414] border rounded-lg px-3 py-2 text-xs transition-colors ${
                            openDropdown === productId
                              ? "border-[#56a963]/40"
                              : selectedTokenIds.size === 0
                              ? "border-amber-500/30 hover:border-amber-500/50"
                              : "border-white/10 hover:border-[#56a963]/30"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Ticket
                              size={12}
                              className={`shrink-0 ${
                                selectedTokenIds.size === 0
                                  ? "text-amber-400/60"
                                  : "text-[#a5fcad]"
                              }`}
                            />
                            <span
                              className={
                                selectedTokenIds.size === 0
                                  ? "text-white/30"
                                  : "text-white"
                              }
                            >
                              {selectedTokenIds.size === 0
                                ? "Select tickets…"
                                : `${selectedTokenIds.size} ticket${selectedTokenIds.size > 1 ? "s" : ""} selected`}
                            </span>
                          </div>
                          <ChevronDown
                            size={12}
                            className={`text-white/30 shrink-0 transition-transform ${
                              openDropdown === productId ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {openDropdown === productId && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden">
                            {venueTickets.map((t) => {
                              const isSelected = selectedTokenIds.has(t.tokenId);
                              const wouldExceedStock =
                                !isSelected &&
                                totalQtyForProduct >=
                                  template.availableUnits;
                              return (
                                <button
                                  key={t.tokenId}
                                  onClick={() => {
                                    if (!wouldExceedStock) {
                                      onToggleTicket(productId, t.tokenId);
                                    }
                                  }}
                                  disabled={wouldExceedStock}
                                  className={`w-full flex items-center gap-2.5 px-3 py-3 text-left transition-colors ${
                                    wouldExceedStock
                                      ? "opacity-30 cursor-not-allowed"
                                      : "hover:bg-white/5"
                                  }`}
                                >
                                  <div
                                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                                      isSelected
                                        ? "bg-[#56a963] border-[#56a963]"
                                        : "border-white/20"
                                    }`}
                                  >
                                    {isSelected && (
                                      <Check size={9} className="text-[#002a0c]" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-medium truncate ${isSelected ? "text-[#a5fcad]" : "text-white/70"}`}>
                                      {t.label}
                                    </p>
                                    {t.matchTitle && (
                                      <p className="text-[10px] text-white/40 truncate mt-0.5">{t.matchTitle}</p>
                                    )}
                                    {t.matchTime && (
                                      <p className="text-[10px] text-white/30 truncate mt-0.5">
                                        {new Date(t.matchTime).toLocaleString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
                                      </p>
                                    )}
                                    {t.venueName && (
                                      <p className="text-[10px] text-white/30 truncate mt-0.5">{t.venueName}</p>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* No tickets selected hint */}
                    {hasPlaceholder && assigned.length === 0 && (
                      <p className="text-[10px] text-amber-400/60">
                        Select at least one ticket above to proceed.
                      </p>
                    )}

                    {/* Per-ticket qty rows */}
                    {assigned.map((item) => {
                      const ticketLabel = venueTickets.find(
                        (t) => t.tokenId === item.ticketTokenId
                      )?.label;
                      return (
                        <div
                          key={item.cartItemId}
                          className="flex items-center gap-2 bg-white/[0.02] rounded-lg px-2.5 py-2"
                        >
                          <Ticket
                            size={11}
                            className="text-[#a5fcad]/50 shrink-0"
                          />
                          <span className="text-[10px] text-white/50 truncate flex-1 min-w-0">
                            {ticketLabel ?? `#${item.ticketTokenId}`}
                          </span>
                          <button
                            onClick={() =>
                              onUpdateQuantity(
                                item.cartItemId,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            disabled={item.quantity <= 1}
                            className="w-5 h-5 rounded border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
                          >
                            <Minus size={9} />
                          </button>
                          <span className="text-xs text-white font-medium w-4 text-center shrink-0">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              onUpdateQuantity(
                                item.cartItemId,
                                item.quantity + 1
                              )
                            }
                            disabled={
                              totalQtyForProduct >= template.availableUnits
                            }
                            className="w-5 h-5 rounded border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
                          >
                            <Plus size={9} />
                          </button>
                          <button
                            onClick={() =>
                              onToggleTicket(productId, item.ticketTokenId)
                            }
                            className="text-white/20 hover:text-white/50 transition-colors shrink-0 ml-0.5"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      );
                    })}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {productIds.length > 0 && (
          <div className="border-t border-white/5 px-4 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 uppercase tracking-wider">
                Total
              </span>
              <span className="text-sm font-bold font-mono text-[#a5fcad]">
                {formatWire(totalWei)}
              </span>
            </div>

            <button
              onClick={onCheckout}
              disabled={isCheckoutDisabled}
              className={`w-full py-3 rounded-xl font-bold text-sm text-[#002a0c] transition-opacity ${
                isCheckoutDisabled
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:opacity-90"
              }`}
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)",
              }}
            >
              Confirm Purchase
            </button>

            {isCheckoutDisabled && (
              <p className="text-xs text-white/30 text-center leading-snug">
                Select a ticket for each item to proceed
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
