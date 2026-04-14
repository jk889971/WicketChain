"use client";

import { useState, useRef } from "react";
import { X, Store, MapPin, ImagePlus, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { supabase } from "@/lib/supabase";

interface RegisterShopModalProps {
  open: boolean;
  onClose: () => void;
  onRegister: (data: {
    name: string;
    description: string;
    imageURI: string;         // public URL after upload (empty string if none)
    venueIds: number[];       // on-chain IDs for the contract call
    venueUUIDs: string[];     // Supabase UUIDs for DB insert
    locations: string[];
  }) => void;
  venues: Array<{
    id: string;
    venueIdOnchain: number;
    name: string;
    city: string;
  }>;
  isLoading: boolean;
}

type Step = 1 | 2 | 3;

const STEP_LABELS = ["Shop Info", "Venues", "Review"];
const MAX_SIZE_MB  = 10;
const BUCKET       = "shop-images";

export function RegisterShopModal({
  open,
  onClose,
  onRegister,
  venues,
  isLoading,
}: RegisterShopModalProps) {
  const { address } = useAccount();

  const [step, setStep] = useState<Step>(1);

  /* ── Step 1 fields ── */
  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError]     = useState("");

  /* ── Image upload ── */
  const fileInputRef               = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile]  = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePublicUrl, setImagePublicUrl] = useState<string>("");
  const [imageError, setImageError]  = useState<string>("");
  const [uploading, setUploading]    = useState(false);

  /* ── Step 2 fields ── */
  const [selectedVenueIds, setSelectedVenueIds] = useState<Set<number>>(new Set());
  const [locations, setLocations]               = useState<Record<number, string>>({});
  const [venueError, setVenueError]             = useState("");

  /* ───────────────────────────────────── image handling ── */
  const handleFileChange = async (file: File) => {
    setImageError("");

    if (!file.type.startsWith("image/")) {
      setImageError("Please select an image file.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setImageError(`Image must be under ${MAX_SIZE_MB} MB.`);
      return;
    }

    // Local preview immediately
    const preview = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(preview);
    setImagePublicUrl(""); // reset previous URL

    // Upload to Supabase storage
    setUploading(true);
    try {
      const ext  = file.name.split(".").pop() ?? "jpg";
      const path = `${address?.toLowerCase() ?? "anon"}/${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(data.path);

      setImagePublicUrl(publicUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message
        : (err as { message?: string })?.message ?? "Unknown error";
      console.error("Image upload failed:", err);
      setImageError(`Upload failed: ${msg}. Please try again.`);
      setImagePublicUrl("");
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImagePublicUrl("");
    setImageError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ───────────────────────────────────── venue helpers ── */
  const toggleVenue = (id: number) => {
    setSelectedVenueIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setVenueError("");
  };

  /* ───────────────────────────────────── navigation ── */
  const goNext = () => {
    if (step === 1) {
      if (!name.trim()) { setNameError("Shop name is required."); return; }
      if (uploading)    { setImageError("Please wait for the image to finish uploading."); return; }
      if (!imagePublicUrl) { setImageError("Shop image is required."); return; }
      setNameError("");
      setImageError("");
      setStep(2);
    } else if (step === 2) {
      if (selectedVenueIds.size === 0) { setVenueError("Select at least one venue."); return; }
      setVenueError("");
      setStep(3);
    }
  };

  const handleRegister = () => {
    const selected = venues.filter((v) => selectedVenueIds.has(v.venueIdOnchain));
    onRegister({
      name:        name.trim(),
      description: description.trim(),
      imageURI:    imagePublicUrl,
      venueIds:    selected.map((v) => v.venueIdOnchain),
      venueUUIDs:  selected.map((v) => v.id),
      locations:   selected.map((v) => locations[v.venueIdOnchain] ?? ""),
    });
  };

  const handleClose = () => {
    if (isLoading || uploading) return;
    // reset all state
    setStep(1); setName(""); setDescription(""); setNameError("");
    clearImage();
    setSelectedVenueIds(new Set()); setLocations({}); setVenueError("");
    onClose();
  };

  const selectedVenueList = venues.filter((v) => selectedVenueIds.has(v.venueIdOnchain));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-[calc(100%-2rem)] max-w-[460px] translate-x-[-50%] translate-y-[-50%] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="backdrop-blur-[10px] bg-[rgba(25,25,25,0.92)] border border-white/8 rounded-xl shadow-2xl overflow-hidden">

            {/* ── Header ── */}
            <div className="px-4 sm:px-8 pt-5 sm:pt-7 pb-4 sm:pb-5">
              <div className="flex items-start justify-between mb-5">
                <div className="w-10 h-10 rounded-lg bg-[#56a963]/20 flex items-center justify-center">
                  <Store size={18} className="text-[#a5fcad]" />
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading || uploading}
                  className="text-white/30 hover:text-white/70 transition-colors disabled:opacity-30 mt-0.5"
                >
                  <X size={15} />
                </button>
              </div>

              <h2 className="text-[22px] font-bold font-heading text-white tracking-tight leading-tight">
                Register Your Shop
              </h2>
              <p className="text-xs text-[#ababab] mt-1">
                {step === 1 && "Tell us about your shop."}
                {step === 2 && "Choose where you'll be selling."}
                {step === 3 && "Review before submitting."}
              </p>

              {/* Step pill track */}
              <div className="flex items-center gap-1.5 mt-4">
                {STEP_LABELS.map((label, i) => {
                  const s       = (i + 1) as Step;
                  const done    = s < step;
                  const current = s === step;
                  return (
                    <div key={s} className="flex items-center gap-1.5">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                        current ? "bg-[#56a963] text-[#002a0c]"
                        : done   ? "bg-[#56a963]/20 text-[#a5fcad]"
                        :          "bg-white/5 text-white/25"
                      }`}>
                        <span>{s}</span>
                        <span>{label}</span>
                      </div>
                      {i < 2 && <div className="w-4 h-px bg-white/10" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Step content (scrollable) ── */}
            <div className="px-4 sm:px-8 pb-2 max-h-[320px] overflow-y-auto">

              {/* ── Step 1: Shop Info ── */}
              {step === 1 && (
                <div className="space-y-4">
                  {/* Shop image upload */}
                  <div>
                    <label className="text-[10px] text-white/40 uppercase tracking-widest mb-2 block">
                      Shop Image <span className="text-red-400">*</span> <span className="text-white/20 normal-case tracking-normal">· Square, max {MAX_SIZE_MB} MB</span>
                    </label>

                    {imagePreview ? (
                      /* Preview */
                      <div className="relative w-full aspect-square max-h-[160px] overflow-hidden rounded-xl border border-white/10 bg-[#141414]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePreview}
                          alt="Shop preview"
                          className="w-full h-full object-cover"
                        />
                        {/* Upload progress overlay */}
                        {uploading && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2">
                            <Loader2 size={18} className="text-white animate-spin" />
                            <span className="text-xs text-white">Uploading…</span>
                          </div>
                        )}
                        {/* Uploaded tick */}
                        {!uploading && imagePublicUrl && (
                          <div className="absolute top-2 right-2 bg-[#56a963] rounded-full px-2 py-0.5 text-[10px] font-bold text-[#002a0c]">
                            ✓ Uploaded
                          </div>
                        )}
                        {/* Remove button */}
                        {!uploading && (
                          <button
                            onClick={clearImage}
                            className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/70 text-white/70 hover:text-white flex items-center justify-center transition-colors"
                          >
                            <X size={11} />
                          </button>
                        )}
                      </div>
                    ) : (
                      /* Drop zone */
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full aspect-square max-h-[160px] rounded-xl border border-dashed bg-[#141414] hover:bg-[#56a963]/5 transition-colors flex flex-col items-center justify-center gap-2 group ${
                          imageError ? "border-red-500/40" : "border-white/15 hover:border-[#56a963]/40"
                        }`}
                      >
                        <ImagePlus size={24} className="text-white/20 group-hover:text-[#a5fcad]/60 transition-colors" />
                        <span className="text-xs text-white/30 group-hover:text-white/50 transition-colors">
                          Click to upload
                        </span>
                        <span className="text-[10px] text-white/15">
                          JPG, PNG, WEBP · 1:1 ratio recommended
                        </span>
                      </button>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileChange(file);
                      }}
                    />
                    {imageError && (
                      <p className="text-[11px] text-red-400 mt-1.5">{imageError}</p>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest">
                        Shop Name <span className="text-red-400">*</span>
                      </label>
                      <span className={`text-[10px] ${name.length >= 50 ? "text-red-400" : "text-white/25"}`}>
                        {name.length}/50
                      </span>
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setNameError(""); }}
                      placeholder="e.g. Crescent Eats"
                      maxLength={50}
                      className="w-full bg-[#141414] border border-white/8 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#56a963]/50 placeholder:text-white/15"
                    />
                    {nameError && <p className="text-[11px] text-red-400 mt-1">{nameError}</p>}
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest">Description</label>
                      <span className={`text-[10px] ${description.length >= 300 ? "text-red-400" : "text-white/25"}`}>
                        {description.length}/300
                      </span>
                    </div>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of your shop…"
                      rows={2}
                      maxLength={300}
                      className="w-full bg-[#141414] border border-white/8 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#56a963]/50 placeholder:text-white/15 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* ── Step 2: Select Venues ── */}
              {step === 2 && (
                <div className="space-y-2">
                  {venues.length === 0 ? (
                    <p className="text-sm text-white/30 text-center py-4">No venues available.</p>
                  ) : venues.map((venue) => {
                    const sel = selectedVenueIds.has(venue.venueIdOnchain);
                    return (
                      <div key={venue.id}>
                        <label className={`flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 border transition-colors ${
                          sel
                            ? "bg-[#56a963]/8 border-[#56a963]/25"
                            : "bg-white/[0.02] border-white/[0.05] hover:border-white/10"
                        }`}>
                          {/* Custom checkbox */}
                          <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors ${
                            sel ? "bg-[#56a963] border-[#56a963]" : "border-white/20"
                          }`}>
                            {sel && (
                              <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium leading-none">{venue.name}</p>
                            <p className="text-[11px] text-white/35 flex items-center gap-1 mt-0.5">
                              <MapPin size={9} />{venue.city}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={sel}
                            onChange={() => toggleVenue(venue.venueIdOnchain)}
                            className="sr-only"
                          />
                        </label>
                        {sel && (
                          <div className="mx-3 mt-1 mb-1">
                            <input
                              type="text"
                              value={locations[venue.venueIdOnchain] ?? ""}
                              onChange={(e) =>
                                setLocations((p) => ({ ...p, [venue.venueIdOnchain]: e.target.value }))
                              }
                              placeholder="Your stand location (e.g. Gate 3, Section B)"
                              maxLength={100}
                              className="w-full bg-[#141414] border border-white/8 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#56a963]/40 placeholder:text-white/15"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {venueError && <p className="text-[11px] text-red-400 pt-1">{venueError}</p>}
                </div>
              )}

              {/* ── Step 3: Review ── */}
              {step === 3 && (
                <div className="space-y-3">
                  <div className="bg-[#141414] border border-white/8 rounded-xl overflow-hidden">
                    {/* Image banner */}
                    {imagePreview && (
                      <div className="w-full h-24 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagePreview} alt="Shop" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        {!imagePreview && (
                          <div className="w-9 h-9 rounded-lg bg-[#56a963]/15 flex items-center justify-center shrink-0">
                            <Store size={15} className="text-[#a5fcad]" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-white">{name}</p>
                          {description && (
                            <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{description}</p>
                          )}
                        </div>
                      </div>
                      <div className="border-t border-white/5 pt-3 space-y-1.5">
                        <p className="text-[10px] uppercase tracking-widest text-white/25 mb-2">Venues</p>
                        {selectedVenueList.map((v) => (
                          <div key={v.id} className="flex items-center gap-2 text-xs text-white/50">
                            <MapPin size={10} className="text-[#56a963] shrink-0" />
                            <span>
                              {v.name}, {v.city}
                              {locations[v.venueIdOnchain] && (
                                <span className="text-white/25"> · {locations[v.venueIdOnchain]}</span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-white/25 text-center leading-relaxed pb-1">
                    Your shop will be reviewed by admins before going live to fans.
                  </p>
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="px-4 sm:px-8 pt-4 pb-5 sm:pb-7 space-y-2.5">
              {step < 3 ? (
                <button
                  onClick={goNext}
                  disabled={uploading}
                  className="w-full py-3 rounded-xl font-bold font-heading text-sm text-[#002a0c] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
                >
                  {uploading && <Loader2 size={14} className="animate-spin" />}
                  {uploading ? "Uploading image…" : "Continue"}
                </button>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl font-bold font-heading text-sm text-[#002a0c] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
                >
                  {isLoading ? "Registering…" : "Register Shop"}
                </button>
              )}

              {step > 1 && !isLoading ? (
                <button
                  onClick={() => setStep((s) => (s - 1) as Step)}
                  className="w-full py-2 text-center text-sm text-white/35 hover:text-white/70 transition-colors font-medium"
                >
                  ← Back
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  disabled={isLoading || uploading}
                  className="w-full py-2 text-center text-sm text-white/35 hover:text-white/70 transition-colors font-medium disabled:opacity-30"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
