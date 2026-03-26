import { useState } from "react";
import { X, Camera, Package } from "lucide-react";
import { useCreateProduct, getListProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Books", "Electronics", "Fashion", "Stationery", "Services", "Furniture", "Food", "Other"];
const CONDITIONS = ["new", "like_new", "good", "fair"];
const CAMPUSES = ["University of Nairobi", "Kenyatta University", "JKUAT", "Strathmore University", "Moi University"];

const conditionLabel: Record<string, string> = {
  new: "Brand New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
};

export default function SellModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const createProduct = useCreateProduct();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [category, setCategory] = useState("Books");
  const [condition, setCondition] = useState("good");
  const [campus, setCampus] = useState("University of Nairobi");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct.mutateAsync({
        data: {
          title,
          description,
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : undefined,
          category: category.toLowerCase(),
          condition,
          campus,
        },
      });
      await queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      setSuccess(true);
      setTimeout(onClose, 1800);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-xl font-display font-bold text-[#0A2342]">Post a Listing</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Sell to students on your campus</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-16 h-16 bg-[#1A7A4A]/10 rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-[#1A7A4A]" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Listing Posted!</h3>
            <p className="text-muted-foreground text-sm">Your item is now live on CampusMart.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
            {/* Photo placeholder */}
            <div className="flex gap-3">
              <button
                type="button"
                className="w-24 h-24 shrink-0 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-muted-foreground hover:border-[#0A2342]/40 hover:bg-muted/30 transition-all"
              >
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium">Add Photo</span>
              </button>
              <div className="flex-1">
                <label className="text-xs font-semibold text-foreground mb-1 block">Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Introduction to Biology Textbook"
                  required
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-[#0A2342] focus:ring-2 focus:ring-[#0A2342]/10 transition-all"
                />
              </div>
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
                <label className="text-xs font-semibold text-foreground mb-1 block">Original Price (KES)</label>
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

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Category *</label>
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
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Condition *</label>
              <div className="grid grid-cols-4 gap-2">
                {CONDITIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCondition(c)}
                    className={cn(
                      "py-2 rounded-xl text-xs font-semibold transition-all border",
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
              <label className="text-xs font-semibold text-foreground mb-1 block">Campus *</label>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="w-full px-3 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-[#0A2342] focus:ring-2 focus:ring-[#0A2342]/10 bg-white transition-all"
              >
                {CAMPUSES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {createProduct.isError && (
              <p className="text-[#D0282E] text-xs font-medium">Failed to post listing. Please try again.</p>
            )}

            <button
              type="submit"
              disabled={createProduct.isPending}
              className="w-full py-3.5 bg-[#0A2342] text-white font-bold rounded-xl shadow-lg hover:bg-[#0A2342]/90 active:scale-95 transition-all disabled:opacity-50"
            >
              {createProduct.isPending ? "Posting..." : "Post Listing"}
            </button>

            <div className="h-2" />
          </form>
        )}
      </div>
    </div>
  );
}
