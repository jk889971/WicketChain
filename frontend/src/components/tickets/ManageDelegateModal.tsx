"use client";

import { useState, useEffect } from "react";
import { X, Info, Wallet, UserCheck, Lock, Copy, Check } from "lucide-react";
import { useReadContract } from "wagmi";
import { isAddress } from "viem";
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { CONTRACTS } from "@/config/contracts";
import { ticketNftAbi } from "@/lib/contracts/generated";
import { truncateAddress } from "@/lib/utils/truncateAddress";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export interface ManageDelegateTicketInfo {
  tokenId: number;
  isEntered: boolean;
  ownerAddress: string;
}

interface ManageDelegateModalProps {
  open: boolean;
  onClose: () => void;
  ticket: ManageDelegateTicketInfo | null;
  onSetDelegate: (tokenId: number, delegateAddress: string) => void;
  onRemoveDelegate: (tokenId: number) => void;
  isLoading?: boolean;
}

export function ManageDelegateModal({
  open,
  onClose,
  ticket,
  onSetDelegate,
  onRemoveDelegate,
  isLoading = false,
}: ManageDelegateModalProps) {
  const [inputAddress, setInputAddress] = useState("");
  const [inputError, setInputError]     = useState<string | null>(null);
  const [copied, setCopied]             = useState(false);

  /* ── Read current delegate from chain ───────────────── */
  const { data: currentDelegate, isLoading: delegateLoading, refetch } = useReadContract({
    address:      CONTRACTS.ticketNFT,
    abi:          ticketNftAbi,
    functionName: "getDelegate",
    args:         [BigInt(ticket?.tokenId ?? 0)],
    query:        { enabled: open && !!ticket },
  });

  // Reset input whenever modal opens
  useEffect(() => {
    if (open) {
      setInputAddress("");
      setInputError(null);
      setCopied(false);
      refetch();
    }
  }, [open, refetch]);

  const hasDelegate =
    !!currentDelegate &&
    currentDelegate !== ZERO_ADDRESS &&
    currentDelegate.toLowerCase() !== ticket?.ownerAddress?.toLowerCase();

  /* ── Validation ── */
  function validateAndSet() {
    const trimmed = inputAddress.trim();
    if (!trimmed) {
      setInputError("Please enter a wallet address.");
      return;
    }
    if (!isAddress(trimmed)) {
      setInputError("Invalid Ethereum address. Must start with 0x and be 42 characters.");
      return;
    }
    if (trimmed.toLowerCase() === ZERO_ADDRESS) {
      setInputError("Cannot delegate to the zero address.");
      return;
    }
    if (trimmed.toLowerCase() === ticket?.ownerAddress?.toLowerCase()) {
      setInputError("You cannot delegate to yourself.");
      return;
    }
    setInputError(null);
    onSetDelegate(ticket!.tokenId, trimmed);
  }

  function handleCopy() {
    if (!currentDelegate) return;
    navigator.clipboard.writeText(currentDelegate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => { if (!v && !isLoading) onClose(); }}
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
                Manage Delegate
              </h2>
            </div>

            {/* Body */}
            <div className="px-6 pb-6 flex flex-col gap-5">

              {/* ── Ticket entered — locked ── */}
              {ticket?.isEntered && (
                <div className="flex flex-col items-center text-center py-4 gap-4">
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Lock size={22} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">Delegate Management Locked</p>
                    <p className="text-xs text-[#ababab]">
                      This ticket has already been used for stadium entry. Delegate changes are permanently disabled once entry is marked on-chain.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-full py-3 rounded-xl border border-white/[0.08] text-[#ababab] text-sm font-bold font-heading hover:bg-white/[0.03] transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}

              {/* ── Normal flow (not entered) ── */}
              {!ticket?.isEntered && (
                <>
                  {/* Info box */}
                  <div className="flex gap-3 bg-[rgba(86,169,99,0.07)] border border-[rgba(165,252,173,0.12)] rounded-lg p-4">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-[rgba(86,169,99,0.2)] flex items-center justify-center mt-0.5">
                      <Info size={12} className="text-[#a5fcad]" />
                    </div>
                    <p className="text-xs text-[#ababab] leading-relaxed">
                      Delegates can enter the stadium on your behalf using their own wallet to generate QR codes.{" "}
                      <span className="text-white font-semibold">You remain the ticket owner.</span>
                    </p>
                  </div>

                  {/* Loading skeleton */}
                  {delegateLoading && (
                    <div className="flex flex-col gap-3">
                      <div className="h-4 w-40 bg-white/5 rounded animate-pulse" />
                      <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
                      <div className="h-10 w-full bg-white/5 rounded-xl animate-pulse mt-1" />
                    </div>
                  )}

                  {/* ── No delegate — set form ── */}
                  {!delegateLoading && !hasDelegate && (
                    <>
                      <div>
                        {/* Label row */}
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-[#ababab]">
                            Delegate Wallet Address
                          </p>
                          <span className="text-[9px] font-bold uppercase tracking-[1px] text-[#56a963] bg-[rgba(86,169,99,0.1)] px-2 py-0.5 rounded">
                            ERC-20 Compliant
                          </span>
                        </div>

                        {/* Input */}
                        <div
                          className={`
                            flex items-center gap-3 bg-[#1a1a1a] border rounded-xl px-4 py-3 transition-colors
                            ${inputError
                              ? "border-red-500/40 focus-within:border-red-500/60"
                              : "border-white/[0.08] focus-within:border-[rgba(165,252,173,0.3)]"}
                          `}
                        >
                          <Wallet size={14} className="text-white/30 shrink-0" />
                          <input
                            type="text"
                            value={inputAddress}
                            onChange={(e) => {
                              setInputAddress(e.target.value);
                              if (inputError) setInputError(null);
                            }}
                            placeholder="0x..."
                            spellCheck={false}
                            disabled={isLoading}
                            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none font-mono disabled:opacity-50"
                          />
                        </div>

                        {/* Error or helper */}
                        {inputError ? (
                          <p className="text-[11px] text-red-400 mt-1.5">{inputError}</p>
                        ) : (
                          <p className="text-[11px] text-white/30 mt-1.5">
                            Verify the address carefully. This action requires a small gas fee.
                          </p>
                        )}
                      </div>

                      {/* Set button */}
                      <button
                        onClick={validateAndSet}
                        disabled={isLoading || !inputAddress.trim()}
                        className="w-full py-3.5 rounded-xl bg-[#56a963] text-white text-sm font-bold font-heading hover:bg-[#56a963]/90 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                        style={{ boxShadow: "0px 8px 16px -4px rgba(86,169,99,0.3)" }}
                      >
                        Set Delegate
                      </button>

                      {/* Cancel link */}
                      <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full py-1.5 text-sm text-[#ababab] hover:text-white transition-colors disabled:opacity-40"
                      >
                        Cancel and return
                      </button>
                    </>
                  )}

                  {/* ── Delegate exists — show + remove ── */}
                  {!delegateLoading && hasDelegate && (
                    <>
                      {/* Current delegate card */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-[#ababab] mb-2">
                          Current Delegate
                        </p>
                        <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[rgba(165,252,173,0.12)] rounded-xl px-4 py-3">
                          <div className="w-8 h-8 rounded-full bg-[rgba(86,169,99,0.15)] flex items-center justify-center shrink-0">
                            <UserCheck size={14} className="text-[#a5fcad]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-mono text-white truncate">
                              {currentDelegate ? truncateAddress(currentDelegate) : ""}
                            </p>
                            <p className="text-[10px] text-[#ababab] mt-0.5">Delegate address</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight bg-[rgba(86,169,99,0.15)] text-[#77f5af]">
                              Active
                            </span>
                            <button
                              onClick={handleCopy}
                              className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
                              title="Copy address"
                            >
                              {copied ? <Check size={12} className="text-[#a5fcad]" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-white/30 -mt-2">
                        To assign a different delegate, remove the current one first.
                      </p>

                      {/* Remove button */}
                      <button
                        onClick={() => onRemoveDelegate(ticket!.tokenId)}
                        disabled={isLoading}
                        className="w-full py-3.5 rounded-xl border border-[rgba(255,115,81,0.25)] text-[#ff7351] text-sm font-bold font-heading hover:bg-red-500/[0.05] transition-colors disabled:opacity-40 disabled:pointer-events-none"
                      >
                        Remove Delegate
                      </button>

                      {/* Cancel link */}
                      <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full py-1.5 text-sm text-[#ababab] hover:text-white transition-colors disabled:opacity-40"
                      >
                        Cancel and return
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Footer branding */}
            <div className="bg-[rgba(38,38,38,0.3)] border-t border-white/[0.03] py-2.5 flex items-center justify-center">
              <p className="text-[9px] font-bold uppercase tracking-[1px] text-white/20">
                Powered by WicketChain
              </p>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
