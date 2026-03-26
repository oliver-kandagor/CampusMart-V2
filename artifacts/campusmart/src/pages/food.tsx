import { useState } from "react";
import { VendorCard } from "@/components/shared";
import { useListFoodVendors, useListFoodItems } from "@workspace/api-client-react";
import { formatKES, cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const CATEGORIES = ["All", "Meals", "Snacks", "Drinks", "Combos", "Healthy"];

export default function Food() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const { data: vendors, isLoading } = useListFoodVendors();
  const { data: menuItems, isLoading: menuLoading } = useListFoodItems(
    selectedVendorId || "",
    { query: { enabled: !!selectedVendorId } }
  );
  const { isAuthenticated, openAuthModal } = useAuth();

  const selectedVendor = vendors?.find((v) => v.id === selectedVendorId);

  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto py-4 md:py-8 min-h-screen">
      {/* Title */}
      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">🍽️ Campus Food</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Order from the best vendors around campus, delivered fast.
        </p>
      </div>

      {/* Vendor menu overlay */}
      {selectedVendorId && selectedVendor && (
        <div className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setSelectedVendorId(null)}>
          <div
            className="w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg text-foreground">{selectedVendor.name}</h2>
                <p className="text-xs text-muted-foreground">{selectedVendor.deliveryTime || "20-30 min"} delivery</p>
              </div>
              <button
                onClick={() => setSelectedVendorId(null)}
                className="px-4 py-1.5 bg-muted rounded-full text-sm font-medium hover:bg-muted/80"
              >
                Close
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              {menuLoading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-white rounded-xl border border-border animate-pulse">
                    <div className="w-16 h-16 bg-muted rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))
              ) : menuItems?.length ? (
                menuItems.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-white rounded-xl border border-border hover:border-[#D0282E]/30 transition-all">
                    <div className="w-16 h-16 bg-muted rounded-xl overflow-hidden shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-foreground text-sm leading-tight">{item.name}</h4>
                        <span className="font-bold text-[#1A7A4A] text-sm shrink-0">{formatKES(item.price)}</span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                      )}
                      <button
                        onClick={() => { if (!isAuthenticated) { openAuthModal(); return; } }}
                        className="mt-2 px-3 py-1 bg-[#D0282E] text-white text-xs font-bold rounded-lg hover:bg-[#D0282E]/90 active:scale-95 transition-all"
                      >
                        Add to Order
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No menu items available right now.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-5 -mx-4 px-4 md:mx-0 md:px-0">
        {CATEGORIES.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all",
              activeFilter === filter
                ? "bg-[#D0282E] text-white shadow-md"
                : "bg-white border border-border/80 text-muted-foreground hover:border-[#D0282E]/50"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-muted animate-pulse rounded-2xl h-60 w-full" />
          ))}
        </div>
      ) : vendors?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {vendors.map((vendor) => (
            <div key={vendor.id} onClick={() => setSelectedVendorId(vendor.id)} className="cursor-pointer">
              <VendorCard vendor={vendor} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border/60">
          <div className="text-5xl mb-4">🍽️</div>
          <p className="text-muted-foreground">No vendors open right now. Check back later!</p>
        </div>
      )}
    </div>
  );
}
