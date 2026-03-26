import { useRoute } from "wouter";
import { useGetProduct, useAddToCart, useToggleWishlist, getGetCartQueryKey, getGetProductQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { formatKES, cn } from "@/lib/utils";
import { MapPin, Heart, ShoppingCart, ArrowLeft, ShieldCheck, Share2, User, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const id = params?.id || "";
  const queryClient = useQueryClient();

  const { data: product, isLoading, isError } = useGetProduct(id);
  const { isAuthenticated, openAuthModal } = useAuth();
  const addToCartMutation = useAddToCart();
  const wishlistMutation = useToggleWishlist();

  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-primary">
        <div className="w-10 h-10 border-4 border-[#0A2342]/20 border-t-[#0A2342] rounded-full animate-spin" />
        <span className="font-semibold text-sm text-muted-foreground">Loading item...</span>
      </div>
    );
  }
  if (isError || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="text-5xl">😕</div>
        <h2 className="text-xl font-bold">Item not found</h2>
        <p className="text-muted-foreground text-sm">This listing may have been removed.</p>
        <Link href="/market" className="px-6 py-2.5 bg-[#0A2342] text-white rounded-xl font-semibold text-sm hover:bg-[#0A2342]/90">
          Back to Market
        </Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) { openAuthModal(); return; }
    try {
      await addToCartMutation.mutateAsync({ data: { productId: product.id, quantity } });
      await queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { openAuthModal(); return; }
    try {
      await wishlistMutation.mutateAsync({ data: { productId: product.id } });
      await queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(id) });
    } catch (err) {
      console.error(err);
    }
  };

  const isWishlisted = product.isWishlisted;
  const isActive = product.status === "active";

  return (
    <div className="bg-background min-h-screen pb-28">
      {/* Back bar (mobile) */}
      <div className="sticky top-14 z-30 bg-white/80 backdrop-blur-xl border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <Link href="/market" className="p-1.5 -ml-1.5 rounded-full hover:bg-muted transition-colors flex items-center gap-2 text-sm font-medium text-foreground">
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back to Market</span>
        </Link>
        <div className="flex gap-1">
          <button className="p-2 rounded-full hover:bg-muted transition-colors">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={handleWishlist}
            disabled={wishlistMutation.isPending}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <Heart className={cn("w-5 h-5 transition-colors", isWishlisted ? "fill-[#D0282E] text-[#D0282E]" : "text-foreground")} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto md:px-8 md:py-8 flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Images */}
        <div className="w-full md:w-1/2 lg:w-[55%]">
          <div className="aspect-square md:rounded-3xl bg-white md:border border-border overflow-hidden relative">
            {product.images && product.images.length > 0 ? (
              <img src={product.images[activeImage]} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl bg-muted/30">📦</div>
            )}
            {product.badge && (
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#D0282E] text-white text-xs font-bold rounded-lg tracking-wider">
                {product.badge}
              </div>
            )}
            {!isActive && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-white px-4 py-2 rounded-full font-bold text-foreground text-sm">Sold Out</span>
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 px-4 md:px-0 mt-4 overflow-x-auto hide-scrollbar">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                    activeImage === i ? "border-[#0A2342]" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2 lg:w-[45%] px-4 md:px-0 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0A2342] uppercase tracking-wider bg-[#0A2342]/10 px-2.5 py-1 rounded-md">
              {product.category}
            </span>
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#1A7A4A]" />
              {product.condition?.replace("_", " ")}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground leading-tight">
            {product.title}
          </h1>

          <div className="flex items-end gap-3">
            <span className="text-3xl font-display font-bold text-[#1A7A4A]">
              {formatKES(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through mb-0.5">
                {formatKES(product.originalPrice)}
              </span>
            )}
            {product.originalPrice && (
              <span className="mb-0.5 px-2 py-0.5 bg-[#D0282E]/10 text-[#D0282E] text-xs font-bold rounded-md">
                {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-3 rounded-xl">
            <MapPin className="w-4 h-4 text-[#0A2342] shrink-0" />
            <span className="text-sm">Located at <strong className="text-foreground">{product.campus}</strong></span>
          </div>

          <div>
            <h3 className="text-base font-bold text-foreground mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.description || "No description provided."}
            </p>
          </div>

          {/* Quantity Selector */}
          {isActive && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Qty:</span>
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-lg font-bold hover:bg-gray-50"
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-lg font-bold hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Seller Info */}
          <div className="border border-border rounded-2xl p-4 flex items-center justify-between bg-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
                {product.sellerAvatar ? (
                  <img src={product.sellerAvatar} alt="Seller" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">Sold by</p>
                <p className="font-bold text-foreground text-sm">@{product.sellerUsername}</p>
              </div>
            </div>
            <button className="px-4 py-2 border-2 border-[#0A2342]/20 text-[#0A2342] font-semibold rounded-xl hover:bg-[#0A2342]/5 text-sm transition-colors">
              Chat
            </button>
          </div>

          {/* Desktop Add to Cart */}
          <div className="hidden md:block mt-auto pt-4">
            <button
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending || !isActive}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all",
                addedToCart
                  ? "bg-[#1A7A4A] text-white"
                  : isActive
                  ? "bg-[#0A2342] text-white hover:-translate-y-1 hover:shadow-2xl active:scale-95"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {addedToCart ? (
                <><CheckCircle className="w-6 h-6" /> Added to Cart!</>
              ) : addToCartMutation.isPending ? (
                "Adding..."
              ) : isActive ? (
                <><ShoppingCart className="w-6 h-6" /> Add to Cart — {formatKES(product.price * quantity)}</>
              ) : (
                "Sold Out"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-white/95 backdrop-blur-xl border-t border-border z-50 md:hidden flex gap-3">
        <button
          onClick={handleWishlist}
          disabled={wishlistMutation.isPending}
          className={cn(
            "w-13 h-13 shrink-0 flex items-center justify-center rounded-2xl border-2 transition-all",
            isWishlisted ? "border-[#D0282E] bg-[#D0282E]/10" : "border-border bg-muted/50"
          )}
        >
          <Heart className={cn("w-5 h-5", isWishlisted ? "fill-[#D0282E] text-[#D0282E]" : "text-muted-foreground")} />
        </button>
        <button
          onClick={handleAddToCart}
          disabled={addToCartMutation.isPending || !isActive}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 font-bold text-base rounded-2xl shadow-lg transition-all",
            addedToCart
              ? "bg-[#1A7A4A] text-white"
              : isActive
              ? "bg-[#0A2342] text-white active:scale-95"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {addedToCart ? (
            <><CheckCircle className="w-5 h-5" /> Added!</>
          ) : addToCartMutation.isPending ? (
            "Adding..."
          ) : isActive ? (
            <><ShoppingCart className="w-5 h-5" /> Add to Cart · {formatKES(product.price * quantity)}</>
          ) : (
            "Sold Out"
          )}
        </button>
      </div>
    </div>
  );
}
