"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import {
  Wallet,
  Send,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { TxStep } from "@/hooks/useContractWrite";

interface TransactionProgressModalProps {
  open: boolean;
  onClose: () => void;
  step: TxStep;
  txHash?: string;
  errorMessage?: string;
  onBuyMore?: () => void;
  successTitle?: string;
  successDescription?: string;
  /** Fully replaces the button area on the success screen */
  successActions?: ReactNode;
}

const STEPS = [
  {
    key: "confirming",
    title: "Confirm in Wallet",
    subtitle: "Waiting for wallet signature",
    icon: Wallet,
  },
  {
    key: "pending",
    title: "Transaction Submitted",
    subtitle: "TX Sent",
    icon: Send,
  },
  {
    key: "success",
    title: "Confirmed on Chain",
    subtitle: "Receipt received",
    icon: CheckCircle2,
  },
] as const;

function getStepState(
  stepKey: string,
  currentStep: TxStep
): "active" | "completed" | "pending" {
  const order = ["confirming", "pending", "success"];
  const currentIdx = order.indexOf(currentStep);
  const stepIdx = order.indexOf(stepKey);

  if (stepIdx < currentIdx) return "completed";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

export function TransactionProgressModal({
  open,
  onClose,
  step,
  txHash,
  errorMessage,
  onBuyMore,
  successTitle,
  successDescription,
  successActions,
}: TransactionProgressModalProps) {
  const isSuccess = step === "success";
  const isError = step === "error";

  const shortHash = txHash
    ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}`
    : "";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && isSuccess && onClose()}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 w-[calc(100%-2rem)] max-w-[460px] translate-x-[-50%] translate-y-[-50%] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          onPointerDownOutside={(e) => {
            if (!isSuccess && !isError) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (!isSuccess && !isError) e.preventDefault();
          }}
        >
          <div className="backdrop-blur-xl bg-[rgba(14,14,14,0.9)] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            {/* Progress Section */}
            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold font-heading text-white tracking-tight">
                  {isError ? "Transaction Failed" : "Transaction in Progress"}
                </h2>
                <p className="text-sm text-[#ababab] mt-1">
                  {isError
                    ? errorMessage || "Something went wrong"
                    : "Processing your request on the blockchain"}
                </p>
              </div>

              {/* Vertical Stepper */}
              {!isError && (
                <div className="relative">
                  {/* Connector line */}
                  <div className="absolute left-[18px] top-[18px] bottom-[18px] w-[2px] bg-white/5" />

                  <div className="space-y-0">
                    {STEPS.map((s, i) => {
                      const state = getStepState(s.key, step);
                      const Icon = s.icon;
                      const isActive = state === "active";
                      const isCompleted = state === "completed";

                      return (
                        <div
                          key={s.key}
                          className={`flex gap-4 items-start ${
                            i < STEPS.length - 1 ? "pb-6" : ""
                          }`}
                        >
                          {/* Step icon */}
                          <div
                            className={`relative z-10 w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              isActive || isCompleted
                                ? "bg-[#5fb26b]"
                                : "bg-[#262626]"
                            }`}
                            style={
                              isActive
                                ? {
                                    boxShadow:
                                      "0 0 0 4px rgba(165,252,173,0.2)",
                                  }
                                : undefined
                            }
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={15} className="text-white" />
                            ) : (
                              <Icon
                                size={15}
                                className={
                                  isActive || isCompleted
                                    ? "text-white"
                                    : "text-white/40"
                                }
                              />
                            )}
                            {isActive && (
                              <div className="absolute inset-0 rounded-xl animate-ping bg-[#5fb26b]/30" />
                            )}
                          </div>

                          {/* Step text */}
                          <div
                            className={`pt-1 ${
                              !isActive && !isCompleted ? "opacity-40" : ""
                            }`}
                          >
                            <p
                              className={`font-semibold font-heading ${
                                isActive
                                  ? "text-[#a5fcad]"
                                  : "text-white"
                              }`}
                            >
                              {s.title}
                            </p>
                            <p className="text-sm text-[#ababab] font-mono">
                              {s.key === "pending" && txHash
                                ? `TX Sent: ${shortHash}`
                                : s.subtitle}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Success / Error Footer */}
            {(isSuccess || isError) && (
              <div className="bg-[rgba(19,19,19,0.5)] border-t border-white/5 px-6 py-5 text-center">
                {isSuccess && (
                  <>
                    {/* Success icon */}
                    <div className="w-12 h-12 rounded-full bg-[rgba(86,169,99,0.1)] flex items-center justify-center mx-auto mb-3">
                      <ShieldCheck size={22} className="text-[#56a963]" />
                    </div>
                    <h3 className="text-lg font-bold font-heading text-white mb-1">
                      {successTitle ?? "Tickets Minted!"}
                    </h3>
                    <p className="text-sm text-[#ababab] mb-4">
                      {successDescription ??
                        "Your digital tickets are now secured on the blockchain."}
                    </p>
                    {successActions ?? (
                      onBuyMore ? (
                        <div className="grid grid-cols-2 gap-3">
                          <Link
                            href="/tickets"
                            className="flex items-center justify-center py-2.5 rounded-xl bg-[#56a963] text-[#002a0c] font-bold text-sm"
                          >
                            View My Tickets
                          </Link>
                          <button
                            onClick={() => {
                              onBuyMore();
                              onClose();
                            }}
                            className="py-2.5 rounded-xl border border-white/10 text-white font-medium text-sm hover:bg-white/5 transition-colors"
                          >
                            Buy More
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={onClose}
                          className="w-full py-2.5 rounded-xl bg-[#56a963] text-[#002a0c] font-bold text-sm hover:bg-[#56a963]/90 transition-colors"
                        >
                          Done
                        </button>
                      )
                    )}
                  </>
                )}

                {isError && (
                  <>
                    <p className="text-red-400 text-sm mb-4">
                      {errorMessage || "Transaction failed. Please try again."}
                    </p>
                    <button
                      onClick={onClose}
                      className="w-full py-2.5 rounded-xl border border-white/10 text-white font-medium text-sm hover:bg-white/5 transition-colors"
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
