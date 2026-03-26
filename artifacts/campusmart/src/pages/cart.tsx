import { useAuth } from "@/lib/auth-context";
import { useGetCart, useRemoveCartItem, useUpdateCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { formatKES } from "@/lib/utils";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function Cart() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const queryClient = useQueryClient();
  const { data: cart, isLoading } = useGetCart({ query: { enabled: isAuthenticated } });

  const updateMutation = useUpdateCartItem();
  const removeMutation = useRemoveCartItem();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleUpdate = async (itemId: string, quantity: number) => {
    await updateMutation.mutateAsync({ itemId, data: { quantity } });
    queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
  };

  const handleRemove = async (itemId: string) => {
    await removeMutation.mutateAsync({ itemId });
    queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
  };

  const handleCheckout = () => {
    setCheckingOut(true);
    // Simulate checkout
    setTimeout(() => setCheckingOut(false), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="w-20 h-20 bg-muted rounded-3xl mb-5 flex items-center justify-center">
          <ShoppingBag className="w-9 h-9 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Sign in to view your cart</h2>
        <p className="text-muted-foreground mb-8 text-sm max-w-xs">
          Access your saved items and checkout across devices.
        </p>
        <button
          onClick={openAuthModal}
          className="px-8 py-3.5 bg-[#0A2342] text-white font-bold rounded-xl shadow-lg shadow-[#0A2342]/20 hover:scale-105 transition-all"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-xl mb-8" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-border mb-4">
            <div className="w-24 h-24 bg-muted animate-pulse rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
              <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="w-20 h-20 bg-muted rounded-3xl mb-5 flex items-center justify-center">
          <ShoppingBag className="w-9 h-9 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8 text-sm max-w-xs">
          Looks like you haven't added anything yet. Start shopping!
        </p>
        <Link
          href="/market"
          className="px-8 py-3.5 bg-[#1A7A4A] text-white font-bold rounded-xl shadow-lg shadow-[#1A7A4A]/20 hover:scale-105 transition-all"
        >
          Browse Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8 min-h-screen pb-44">
      <h1 className="text-2xl md:text-3xl font-display font-bold mb-6">
        My Cart <span className="text-muted-foreground font-normal text-xl">({cart.itemCount})</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Items */}
        <div className="flex-1 space-y-3">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-3 p-3 md:p-4 bg-white rounded-2xl border border-border shadow-sm">
              <Link href={`/product/${item.productId}`} className="w-20 h-20 md:w-24 md:h-24 bg-muted rounded-xl shrink-0 overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                )}
              </Link>
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <Link href={`/product/${item.productId}`}>
                      <h3 className="font-semibold text-foreground line-clamp-2 leading-tight text-sm hover:text-[#0A2342] transition-colors">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">@{item.sellerUsername}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={removeMutation.isPending}
                    className="p-1.5 text-muted-foreground hover:text-[#D0282E] hover:bg-[#D0282E]/10 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="font-display font-bold text-[#1A7A4A] text-base">
                    {formatKES(item.price * item.quantity)}
                  </div>
                  <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                    <button
                      onClick={() => handleUpdate(item.id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1 || updateMutation.isPending}
                      className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-40 transition-all"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-semibold text-sm w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdate(item.id, item.quantity + 1)}
                      disabled={updateMutation.isPending}
                      className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-40 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:w-80 shrink-0">
          <div className="sticky top-24 bg-white p-5 rounded-3xl border border-border shadow-lg shadow-black/5">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <div className="space-y-2.5 text-sm text-muted-foreground mb-5">
              <div className="flex justify-between">
                <span>Subtotal ({cart.itemCount} items)</span>
                <span className="text-foreground font-medium">{formatKES(cart.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery fee</span>
                <span className="text-[#1A7A4A] font-medium">FREE</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="font-bold text-foreground text-base">Total</span>
                <span className="font-display font-bold text-2xl text-[#1A7A4A]">{formatKES(cart.total)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0A2342] text-white font-bold rounded-xl shadow-lg shadow-[#0A2342]/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70"
            >
              {checkingOut ? (
                <>Processing...</>
              ) : (
                <>Proceed to Checkout <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
            <Link
              href="/market"
              className="mt-3 block text-center text-sm text-muted-foreground hover:text-[#0A2342] transition-colors font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile fixed checkout bar */}
      <div className="fixed bottom-[58px] left-0 right-0 bg-white border-t border-border p-3 lg:hidden z-40 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-display font-bold text-[#1A7A4A] text-lg leading-none">{formatKES(cart.total)}</p>
        </div>
        <button
          onClick={handleCheckout}
          disabled={checkingOut}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0A2342] text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-70"
        >
          {checkingOut ? "Processing..." : <>Checkout <ArrowRight className="w-4 h-4" /></>}
        </button>
      </div>
    </div>
  );
}
