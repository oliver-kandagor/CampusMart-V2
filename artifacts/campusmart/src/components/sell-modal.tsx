import { useState, useRef } from "react";
import { X, Camera, Package, CheckCircle, AlertCircle, Trash2, ImagePlus } from "lucide-react";
import { useCreateProduct, getListProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const CATEGORIES = ["Books", "Electronics", "Fashion", "Stationery", "Services", "Furniture", "Food", "Other"];
const CONDITIONS = ["new", "like_new", "good", "fair"] as const;
const CAMPUSES = ["University of Nairobi", "Kenyatta University", "JKUAT", "Strathmore University", "Moi University"];

const conditionLabel: Record<string, string> = {
  new: "Brand New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
};

interface SellModalProps {
  onClose: () => void;
}

export default function SellModal({ onClose }: SellModalProps) {
  const queryClient = useQueryClient();
  const createProduct = useCreateProduct();
  const { user } = useAuth();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [category, setCategory] = useState("Books");
  const [condition, setCondition] = useState("good");
  const [campus, setCampus] = useState(user?.campus || CAMPUSES[0]);
  const [images, setImages] = useState<string[]>([]);     // base64 data-URLs
  const [previews, setPreviews] = useState<string[]>([]);  // same, for UI
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [step, setStep] = useState<1 | 2>(1); // step 1 = details, step 2 = confirm

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Image handling ──────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = 4 - images.length;
    const toProcess = files.slice(0, remaining);

    toProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Each image must be under 5 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setImages((prev) => [...prev, dataUrl]);
        setPreviews((prev) => [...prev, dataUrl]);
        setErrorMsg("");
      };
      reader.readAsDataURL(file);
    });

    // Reset input so the same file can be re-added after removal
    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Submit ──────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) { setErrorMsg("Please enter a title."); return; }
    if (!price || Number(price) <= 0) { setErrorMsg("Please enter a valid price."); return; }
    if (originalPrice && Number(originalPrice) <= Number(price)) {
      setErrorMsg("Original price must be higher than selling price."); return;
    }

    try {
      await createProduct.mutateAsync({
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : undefined,
          category: category.toLowerCase(),
          condition,
          campus,
          images: images.length > 0 ? images : undefined,
          stock: 1,
        },
      });

      // Global refresh so pagination resets to page 1 and item shows at top
      setSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      const msg =
        err?.data?.message || err?.data?.error || err?.message || "Failed to post listing. Please try again.";
      setErrorMsg(msg);
    }
  };

  // ── Success screen ──────────────────────────────────────
  if (success) {
    return (
      <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative z-10 w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl p-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-[#1A7A4A]/10 rounded-full flex items-center justify-center mb-5">
            <CheckCircle className="w-10 h-10 text-[#1A7A4A]" />
          </div>
          <h3 className="text-2xl font-bold text-[#0A2342] mb-2">Listing Posted! 🎉</h3>
          <p className="text-muted-foreground text-sm">Your item is now live on the marketplace.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-[#0A2342]">Post a Listing</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Sell to students on your campus</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-6 pt-4 pb-0">
          {([1, 2] as const).map((s) => (
            <div key={s} className={cn(
              "h-1 flex-1 rounded-full transition-all",
              step >= s ? "bg-[#0A2342]" : "bg-muted"
            )} />
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4 space-y-5">

          {/* ── Step 1: Item Details ── */}
          {step === 1 && (
            <>
              {/* Photo upload */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-2 block">
                  Photos <span className="text-muted-foreground font-normal">(up to 4)</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {previews.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border shrink-0">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 rounded-full"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {images.length < 4 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 shrink-0 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:border-[#0A2342]/50 hover:bg-muted/20 transition-all"
                    >
                      <ImagePlus className="w-6 h-6 mb-0.5" />
                      <span className="text-[10px] font-medium">Add Photo</span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Introduction to Biology Textbook"
                  required
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-[#0A2342] focus:ring-2 focus:ring-[#0A2342]/10 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe your item — condition, edition, any defects..."
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm resize-none outline-none focus:border-[#0A2342] focus:ring-2 focus:ring-[#0A2342]/10 transition-all"
                />
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Selling Price (KES) *</label>
                  <input
                    type="number"
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="500"
                    required
                    className="w-full px-3 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-[#0A2342] focus:ring-2 focus:ring-[#0A2342]/10 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Original Price <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="1200"
                    className="w-full px-3 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-[#0A2342] focus:ring-2 focus:ring-[#0A2342]/10 transition-all"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!title.trim()) { setErrorMsg("Please enter a title."); return; }
                  if (!price || Number(price) <= 0) { setErrorMsg("Please enter a valid price."); return; }
                  setErrorMsg("");
                  setStep(2);
                }}
                className="w-full py-3 bg-[#0A2342] text-white font-bold rounded-xl hover:bg-[#0A2342]/90 transition-all"
              >
                Next: Category & Condition →
              </button>
            </>
          )}

          {/* ── Step 2: Category, Condition, Campus ── */}
          {step === 2 && (
            <>
              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-2 block">Category *</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
                        category === c
                          ? "bg-[#0A2342] text-white border-[#0A2342]"
                          : "bg-white text-muted-foreground border-border hover:border-[#0A2342]/40"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-2 block">Condition *</label>
                <div className="grid grid-cols-4 gap-2">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCondition(c)}
                      className={cn(
                        "py-2.5 rounded-xl text-xs font-semibold transition-all border",
                        condition === c
                          ? "bg-[#1A7A4A] text-white border-[#1A7A4A]"
                          : "bg-white text-muted-foreground border-border hover:border-[#1A7A4A]/40"
                      )}
                    >
                      {conditionLabel[c]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campus */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Your Campus *</label>
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-[#0A2342] focus:ring-2 focus:ring-[#0A2342]/10 bg-white transition-all"
                >
                  {CAMPUSES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Summary card */}
              <div className="bg-muted/30 rounded-2xl p-4 border border-border/60 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Item</span>
                  <span className="font-semibold text-foreground truncate ml-4 max-w-[180px]">{title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-bold text-[#1A7A4A]">KES {Number(price).toLocaleString()}</span>
                </div>
                {images.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Photos</span>
                    <span className="font-semibold">{images.length} added</span>
                  </div>
                )}
              </div>

              {/* Error */}
              {errorMsg && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-red-700 text-xs font-medium">{errorMsg}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-all text-sm"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={createProduct.isPending}
                  className="flex-1 py-3 bg-[#1A7A4A] text-white font-bold rounded-xl hover:bg-[#1A7A4A]/90 active:scale-95 transition-all disabled:opacity-50"
                >
                  {createProduct.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Posting...
                    </span>
                  ) : "Post Listing 🚀"}
                </button>
              </div>
            </>
          )}

          <div className="h-1" />
        </form>
      </div>
    </div>
  );
}
