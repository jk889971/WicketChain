import { Suspense } from "react";
import { ScanLine, Loader2 } from "lucide-react";
import { VerifyContent } from "@/components/verify/VerifyContent";

export const metadata = { title: "Verify Ticket | WicketChain" };

export default function VerifyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 min-[350px]:w-10 min-[350px]:h-10 rounded-xl bg-[#56a963]/10 flex items-center justify-center shrink-0">
          <ScanLine size={18} className="text-[#56a963]" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg min-[350px]:text-2xl font-bold font-heading truncate">Ticket Verification</h1>
          <p className="text-xs min-[350px]:text-sm text-white/40">WicketChain QR Check-In</p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4 py-16">
            <Loader2 size={28} className="text-[#56a963] animate-spin" />
            <p className="text-sm text-white/40">Loading verification…</p>
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
    </div>
  );
}
