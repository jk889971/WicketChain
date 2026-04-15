"use client";

import { useState, useEffect, useRef } from "react";
import { X, Store, Loader2, ImagePlus } from "lucide-react";
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useAccount } from "wagmi";
import { supabase } from "@/lib/supabase";

const BUCKET      = "shop-images";
const MAX_SIZE_MB = 10;

interface EditShopModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description: string; imageURI: string }) => void;
  isLoading?: boolean;
  currentShop: {
    name: string;
    description: string | null;
    imageUrl: string | null;
  };
}

export function EditShopModal({
  open,
  onClose,
  onSave,
  isLoading = false,
  currentShop,
}: EditShopModalProps) {
  const { address } = useAccount();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview]     = useState<string>("");
  const [imagePublicUrl, setImagePublicUrl] = useState<string>("");
  const [uploading, setUploading]           = useState(false);
  const [imageError, setImageError]         = useState("");
  const [errors, setErrors]                 = useState<{ name?: string }>({});

  useEffect(() => {
    if (open) {
      setName(currentShop.name);
      setDescription(currentShop.description ?? "");
      setImagePreview(currentShop.imageUrl ?? "");
      setImagePublicUrl(currentShop.imageUrl ?? "");
      setImageError("");
      setErrors({});
    }
  }, [open, currentShop]);

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

    setImagePreview(URL.createObjectURL(file));
    setImagePublicUrl("");
    setUploading(true);
    try {
      const ext  = file.name.split(".").pop() ?? "jpg";
      const path = `${address?.toLowerCase() ?? "anon"}/${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
      setImagePublicUrl(publicUrl);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message ?? "Unknown error";
      setImageError(`Upload failed: ${msg}. Please try again.`);
      setImagePublicUrl("");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Shop name is required.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onSave({
      name: name.trim(),
      description: description.trim(),
      imageURI: imagePublicUrl,
    });
  };

  const handleClose = () => {
    if (isLoading || uploading) return;
    onClose();
  };

  const isBusy = isLoading || uploading;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-[calc(100%-2rem)] max-w-[420px] translate-x-[-50%] translate-y-[-50%] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 focus:outline-none">
          <div className="backdrop-blur-[10px] bg-[rgba(25,25,25,0.85)] border border-white/5 rounded-xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">

            {/* Header */}
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#56a963]/20 flex items-center justify-center">
                  <Store size={16} className="text-[#a5fcad]" />
                </div>
                <button
                  onClick={handleClose}
                  disabled={isBusy}
                  className="text-white/40 hover:text-white/80 transition-colors disabled:opacity-30"
                >
                  <X size={16} />
                </button>
              </div>
              <h2 className="text-xl font-bold font-heading text-white tracking-tight leading-tight">
                Edit Shop
              </h2>
              <p className="text-xs text-[#ababab] mt-1">
                Update your shop&apos;s identifying details on-chain.
              </p>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-5 py-3 space-y-4">

              {/* Name */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">
                  Shop Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
                  className="w-full bg-[#1a1a1a] border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#56a963]/50 placeholder:text-white/20"
                  placeholder="Enter shop name"
                  disabled={isBusy}
                />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#56a963]/50 placeholder:text-white/20 min-h-[80px] resize-none"
                  placeholder="Describe your shop..."
                  disabled={isBusy}
                />
              </div>

              {/* Shop Image Upload */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">
                  Shop Image
                </label>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileChange(file);
                  }}
                />

                {imagePreview ? (
                  /* Preview area */
                  <div className="relative w-full aspect-video max-h-[140px] rounded-xl overflow-hidden border border-white/10 bg-[#0d0d0d]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Shop preview"
                      className="w-full h-full object-cover"
                    />

                    {/* Uploading overlay */}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                        <Loader2 size={20} className="animate-spin text-[#a5fcad]" />
                        <span className="text-xs text-white/70">Uploading…</span>
                      </div>
                    )}

                    {/* Uploaded badge */}
                    {!uploading && imagePublicUrl && (
                      <div className="absolute top-2 left-2 bg-[#56a963]/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Uploaded
                      </div>
                    )}

                    {/* Change button */}
                    {!uploading && (
                      <div className="absolute bottom-2 right-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isBusy}
                          className="bg-black/60 hover:bg-black/80 text-white text-[10px] px-2 py-1 rounded-lg transition-colors disabled:opacity-40"
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Drop zone */
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isBusy}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileChange(file);
                    }}
                    className="w-full aspect-video max-h-[140px] rounded-xl border-2 border-dashed border-white/10 hover:border-[#56a963]/50 bg-[#0d0d0d] flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ImagePlus size={22} className="text-white/20" />
                    <span className="text-xs text-white/30">Click or drag to upload</span>
                    <span className="text-[10px] text-white/20">PNG, JPG, GIF up to {MAX_SIZE_MB} MB</span>
                  </button>
                )}

                {imageError && <p className="text-xs text-red-400 mt-1.5">{imageError}</p>}
              </div>

              <div className="pt-1">
                <p className="text-[10px] text-white/20">
                  ⛓ Saving changes will prompt a wallet transaction.
                </p>
              </div>
            </form>

            {/* Footer */}
            <div className="px-5 pt-3 pb-6">
              <button
                onClick={() => handleSubmit()}
                disabled={isBusy}
                className="w-full py-3 rounded-xl font-bold font-heading text-sm text-[#002a0c] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
              >
                {isLoading && <Loader2 size={15} className="animate-spin" />}
                {isLoading ? "Broadcasting..." : uploading ? "Uploading image…" : "Save Changes"}
              </button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
