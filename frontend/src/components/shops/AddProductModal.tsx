"use client";

import { useState, useEffect, useRef } from "react";
import { X, Package, ImagePlus, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { supabase } from "@/lib/supabase";

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    venueId: number;
    name: string;
    imageURI: string;
    priceInWire: string;
    availableUnits: number;
  }) => void;
  shopVenues: Array<{ venueIdOnchain: number; name: string; city: string }>;
  isLoading: boolean;
  editProduct?: {
    name: string;
    imageUrl: string | null;
    priceDisplay: string | null;
    priceWei: string;
    availableUnits: number;
  } | null;
}

const BUCKET      = "shop-images";
const MAX_SIZE_MB = 10;

export function AddProductModal({
  open,
  onClose,
  onSave,
  shopVenues,
  isLoading,
  editProduct = null,
}: AddProductModalProps) {
  const { address } = useAccount();
  const isEditMode = editProduct != null;

  const [selectedVenueId, setSelectedVenueId] = useState<number>(
    shopVenues[0]?.venueIdOnchain ?? 0
  );
  const [name, setName]               = useState("");
  const [priceInWire, setPriceInWire] = useState("");
  const [availableUnits, setAvailableUnits] = useState("");

  // Image upload state
  const fileInputRef                        = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview]     = useState<string | null>(null);
  const [imagePublicUrl, setImagePublicUrl] = useState<string>("");
  const [imageError, setImageError]         = useState<string>("");
  const [uploading, setUploading]           = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{
    name?: string;
    image?: string;
    price?: string;
    units?: string;
  }>({});

  // Prefill / reset when modal opens
  useEffect(() => {
    if (open && isEditMode && editProduct) {
      setName(editProduct.name);
      if (editProduct.imageUrl) {
        setImagePreview(editProduct.imageUrl);
        setImagePublicUrl(editProduct.imageUrl);
      } else {
        setImagePreview(null);
        setImagePublicUrl("");
      }
      if (editProduct.priceDisplay) {
        setPriceInWire(editProduct.priceDisplay.replace(/\s*WIRE$/i, "").trim());
      } else {
        setPriceInWire("");
      }
      setAvailableUnits(editProduct.availableUnits > 0 ? String(editProduct.availableUnits) : "");
    } else if (open && !isEditMode) {
      // Re-sync venue selection every time the modal opens in add mode so we
      // never send venueId=0 when shopVenues loads after initial mount.
      setSelectedVenueId(shopVenues[0]?.venueIdOnchain ?? 0);
    }
  }, [open, isEditMode, editProduct, shopVenues]);

  // ── Image handling ────────────────────────────────────────────

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
      const path = `products/${address?.toLowerCase() ?? "anon"}/${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(data.path);

      setImagePublicUrl(publicUrl);
      setErrors((p) => ({ ...p, image: undefined }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message
        : (err as { message?: string })?.message ?? "Unknown error";
      setImageError(`Upload failed: ${msg}`);
      setImagePublicUrl("");
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setImagePublicUrl("");
    setImageError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Validation ───────────────────────────────────────────────

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Product name is required.";
    if (!imagePublicUrl) newErrors.image = "Product image is required.";
    const priceNum = parseFloat(priceInWire);
    if (isNaN(priceNum) || priceNum < 0.000001)
      newErrors.price = "Price must be at least 0.000001 WIRE.";
    if (!isEditMode) {
      const unitsNum = parseInt(availableUnits, 10);
      if (isNaN(unitsNum) || unitsNum < 1) newErrors.units = "Units must be at least 1.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (uploading) return;
    if (!validate()) return;
    onSave({
      venueId: selectedVenueId,
      name: name.trim(),
      imageURI: imagePublicUrl,
      priceInWire: priceInWire.trim(),
      availableUnits: parseInt(availableUnits, 10),
    });
  };

  const handleClose = () => {
    if (isLoading || uploading) return;
    setName("");
    clearImage();
    setPriceInWire("");
    setAvailableUnits("");
    setErrors({});
    setSelectedVenueId(shopVenues[0]?.venueIdOnchain ?? 0);
    onClose();
  };

  const showVenueSelector = !isEditMode && shopVenues.length > 1;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-[calc(100%-2rem)] max-w-[460px] translate-x-[-50%] translate-y-[-50%] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="backdrop-blur-[10px] bg-[rgba(25,25,25,0.85)] border border-white/5 rounded-xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">

            {/* Header */}
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#56a963]/20 flex items-center justify-center">
                  <Package size={16} className="text-[#a5fcad]" />
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading || uploading}
                  className="text-white/40 hover:text-white/80 transition-colors disabled:opacity-30"
                >
                  <X size={16} />
                </button>
              </div>
              <h2 className="text-xl font-bold font-heading text-white tracking-tight leading-tight">
                {isEditMode ? "Edit Product" : "Add Product"}
              </h2>
              <p className="text-xs text-[#ababab] mt-1">
                {isEditMode
                  ? "Update the product details below."
                  : "Fill in the details for your new product."}
              </p>
            </div>

            {/* Form */}
            <div className="overflow-y-auto flex-1 px-5 py-3 space-y-3">
              {/* Venue selector (multi-venue shops, add mode only) */}
              {showVenueSelector && (
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">
                    Venue
                  </label>
                  <select
                    value={selectedVenueId}
                    onChange={(e) => setSelectedVenueId(Number(e.target.value))}
                    className="w-full bg-[#1a1a1a] border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#56a963]/50"
                  >
                    {shopVenues.map((v) => (
                      <option key={v.venueIdOnchain} value={v.venueIdOnchain}>
                        {v.name}, {v.city}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Product Name */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
                  placeholder="e.g. Cricket Cap"
                  className="w-full bg-[#1a1a1a] border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#56a963]/50 placeholder:text-white/20"
                />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
              </div>

              {/* Product Image */}
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-widest mb-2 block">
                  Product Image <span className="text-red-400">*</span>
                  <span className="text-white/20 normal-case tracking-normal"> · Square, max {MAX_SIZE_MB} MB</span>
                </label>

                {imagePreview ? (
                  <div className="relative w-full aspect-square max-h-[120px] overflow-hidden rounded-xl border border-white/10 bg-[#141414]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2">
                        <Loader2 size={18} className="text-white animate-spin" />
                        <span className="text-xs text-white">Uploading…</span>
                      </div>
                    )}
                    {!uploading && imagePublicUrl && (
                      <div className="absolute top-2 right-2 bg-[#56a963] rounded-full px-2 py-0.5 text-[10px] font-bold text-[#002a0c]">
                        ✓ Uploaded
                      </div>
                    )}
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
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full aspect-square max-h-[120px] rounded-xl border border-dashed bg-[#141414] hover:bg-[#56a963]/5 transition-colors flex flex-col items-center justify-center gap-2 group ${
                      errors.image ? "border-red-500/40" : "border-white/15 hover:border-[#56a963]/40"
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
                {imageError && <p className="text-[11px] text-amber-400/80 mt-1.5">{imageError}</p>}
                {errors.image && !imageError && <p className="text-xs text-red-400 mt-1">{errors.image}</p>}
              </div>

              {/* Price */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">
                  Price (WIRE) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={priceInWire}
                  onChange={(e) => { setPriceInWire(e.target.value); setErrors((p) => ({ ...p, price: undefined })); }}
                  placeholder="0.00"
                  min="0.000001"
                  step="0.000001"
                  className="w-full bg-[#1a1a1a] border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#56a963]/50 placeholder:text-white/20"
                />
                {errors.price && <p className="text-xs text-red-400 mt-1">{errors.price}</p>}
              </div>

              {/* Available Units — add mode only */}
              {!isEditMode && (
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">
                    Available Units <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={availableUnits}
                    onChange={(e) => { setAvailableUnits(e.target.value); setErrors((p) => ({ ...p, units: undefined })); }}
                    placeholder="100"
                    min="1"
                    step="1"
                    className="w-full bg-[#1a1a1a] border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#56a963]/50 placeholder:text-white/20"
                  />
                  {errors.units && <p className="text-xs text-red-400 mt-1">{errors.units}</p>}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 pt-2 pb-5 space-y-2">
              <button
                onClick={handleSave}
                disabled={isLoading || uploading}
                className="w-full py-2.5 rounded-xl font-bold font-heading text-sm text-[#002a0c] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
              >
                {uploading && <Loader2 size={14} className="animate-spin" />}
                {uploading
                  ? "Uploading image…"
                  : isLoading
                  ? isEditMode ? "Saving..." : "Adding..."
                  : isEditMode ? "Save Changes" : "Add Product"}
              </button>
              <button
                onClick={handleClose}
                disabled={isLoading || uploading}
                className="w-full py-2 text-center text-sm text-[#ababab] hover:text-white transition-colors font-medium disabled:opacity-30"
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
