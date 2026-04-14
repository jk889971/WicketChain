"use client";

import { useState } from "react";
import { X, UserCircle2 } from "lucide-react";
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { keccak256, encodePacked } from "viem";

interface CreateProfileModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    profileHash: `0x${string}`;
  }) => void;
  walletAddress: string;
  isLoading: boolean;
}

export function CreateProfileModal({
  open,
  onClose,
  onConfirm,
  walletAddress,
  isLoading,
}: CreateProfileModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [city, setCity]         = useState("");
  const [errors, setErrors]     = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "Full name is required.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "A valid email is required.";
    if (!phone.trim()) e.phone = "Phone number is required.";
    return e;
  };

  const handleConfirm = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    // Compute keccak256(abi.encodePacked(name, email, phone, address))
    // matches the NatSpec in UserProfile.sol
    const profileHash = keccak256(
      encodePacked(
        ["string", "string", "string", "address"],
        [fullName.trim(), email.trim(), phone.trim(), walletAddress as `0x${string}`]
      )
    );

    onConfirm({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
      profileHash,
    });
  };

  const handleClose = () => {
    if (isLoading) return;
    setFullName(""); setEmail(""); setPhone(""); setCity("");
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-[calc(100%-2rem)] max-w-[420px] translate-x-[-50%] translate-y-[-50%] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="backdrop-blur-[10px] bg-[rgba(25,25,25,0.92)] border border-white/8 rounded-xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="px-4 sm:px-8 pt-5 sm:pt-7 pb-4 sm:pb-5">
              <div className="flex items-start justify-between mb-5">
                <div className="w-10 h-10 rounded-lg bg-[#56a963]/20 flex items-center justify-center">
                  <UserCircle2 size={18} className="text-[#a5fcad]" />
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="text-white/30 hover:text-white/70 transition-colors disabled:opacity-30 mt-0.5"
                >
                  <X size={15} />
                </button>
              </div>

              <h2 className="text-[22px] font-bold font-heading text-white tracking-tight leading-tight">
                Create Your Profile
              </h2>
              <p className="text-xs text-[#ababab] mt-1">
                A verified profile is required before you can open a shop.
              </p>
            </div>

            {/* Fields */}
            <div className="px-4 sm:px-8 pb-2 space-y-4 max-h-[300px] overflow-y-auto">
              {/* Full Name */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <span className={`text-[10px] ${fullName.length >= 80 ? "text-red-400" : "text-white/25"}`}>
                    {fullName.length}/80
                  </span>
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: "" })); }}
                  placeholder="e.g. Ahmed Khan"
                  maxLength={80}
                  className="w-full bg-[#141414] border border-white/8 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#56a963]/50 placeholder:text-white/15"
                />
                {errors.fullName && <p className="text-[11px] text-red-400 mt-1">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-widest mb-1.5 block">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                  placeholder="you@example.com"
                  maxLength={254}
                  className="w-full bg-[#141414] border border-white/8 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#56a963]/50 placeholder:text-white/15"
                />
                {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-widest mb-1.5 block">
                  Phone <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: "" })); }}
                  placeholder="+92 300 1234567"
                  maxLength={20}
                  className="w-full bg-[#141414] border border-white/8 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#56a963]/50 placeholder:text-white/15"
                />
                {errors.phone && <p className="text-[11px] text-red-400 mt-1">{errors.phone}</p>}
              </div>

              {/* City */}
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-widest mb-1.5 block">
                  City <span className="text-white/20 normal-case tracking-normal">· Optional</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Lahore"
                  maxLength={50}
                  className="w-full bg-[#141414] border border-white/8 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#56a963]/50 placeholder:text-white/15"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="px-4 sm:px-8 pt-4 pb-5 sm:pb-7 space-y-2.5">
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-bold font-heading text-sm text-[#002a0c] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
              >
                {isLoading ? "Creating Profile…" : "Create Profile"}
              </button>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="w-full py-2 text-center text-sm text-white/35 hover:text-white/70 transition-colors font-medium disabled:opacity-30"
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
