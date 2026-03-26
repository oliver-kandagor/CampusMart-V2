import { useState, useEffect, useRef, useCallback } from "react";
import { Search, SlidersHorizontal, Plus, X } from "lucide-react";
import { ProductCard } from "@/components/shared";
import { useListProducts } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import type { Product } from "@workspace/api-client-react";
import SellModal from "@/components/sell-modal";

const FILTERS = ["All", "Books", "Electronics", "Fashion", "Stationery", "Services", "Furniture"];
const LIMIT = 10;

export default function Market() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showSellModal, setShowSellModal] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { openAuthModal, isAuthenticated } = useAuth();

  const { data, isFetching, isLoading } = useListProducts({
    category: activeFilter === "All" ? undefined : activeFilter.toLowerCase(),
    search: search || undefined,
    page,
    limit: LIMIT,
  });

  // Reset list when filter/search changes
  useEffect(() => {
    setPage(1);
    setAllProducts([]);
  }, [activeFilter, search]);

  // Accumulate products page by page
  useEffect(() => {
    if (!data?.products) return;
    if (page === 1) {
      setAllProducts(data.products);
    } else {
      setAllProducts((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const newOnes = data.products.filter((p: Product) => !ids.has(p.id));
        return [...prev, ...newOnes];
      });
    }
  }, [data?.products, page]);

  // Infinite scroll via IntersectionObserver
  const hasMore = page < (data?.totalPages ?? 1);
  const loadMore = useCallback(() => {
    if (!isFetching && hasMore) setPage((p) => p + 1);
  }, [isFetching, hasMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handlePostListing = () => {
    if (!isAuthenticated) { openAuthModal(); return; }
    setShowSellModal(true);
  };

  const clearSearch = () => { setSearchInput(""); setSearch(""); };

  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto py-4 md:py-8 min-h-screen">
      {/* Title & Search */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Marketplace</h1>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-border shadow-sm rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </button>
        </div>
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-border/80 rounded-xl text-sm focus:border-[#0A2342] focus:ring-2 focus:ring-[#0A2342]/10 outline-none transition-all"
          />
          {searchInput && (
            <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </form>
      </div>

      {/* Category Pills */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 -mx-4 px-4 md:mx-0 md:px-0">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all",
              activeFilter === filter
                ? "bg-[#0A2342] text-white shadow-md"
                : "bg-white border border-border/80 text-muted-foreground hover:border-[#0A2342]/50"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Search tag */}
      {search && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">Results for:</span>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-[#0A2342]/10 text-[#0A2342] text-sm font-medium rounded-full">
            {search}
            <button onClick={clearSearch}><X className="w-3 h-3" /></button>
          </span>
        </div>
      )}

      {/* Grid */}
      {isLoading && page === 1 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-muted animate-pulse rounded-2xl aspect-[3/4]" />
          ))}
        </div>
      ) : allProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Loading more skeleton */}
          {isFetching && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 mt-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-muted animate-pulse rounded-2xl aspect-[3/4]" />
              ))}
            </div>
          )}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-10 mt-2" />

          {!hasMore && !isFetching && (
            <p className="text-center text-muted-foreground text-sm py-6">
              {allProducts.length} items shown — that's everything!
            </p>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 mb-4 text-5xl flex items-center justify-center bg-white rounded-3xl shadow-sm border border-border/50">
            📭
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No items found</h3>
          <p className="text-muted-foreground mb-6 text-sm">
            {search ? `No results for "${search}"` : "Try a different category."}
          </p>
          <button
            onClick={() => { clearSearch(); setActiveFilter("All"); }}
            className="px-6 py-2 bg-[#0A2342]/10 text-[#0A2342] font-semibold rounded-full hover:bg-[#0A2342]/20 transition-colors text-sm"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* FAB — Post Listing */}
      <button
        onClick={handlePostListing}
        className="fixed bottom-20 right-5 w-14 h-14 bg-[#1A7A4A] text-white rounded-full flex items-center justify-center shadow-xl shadow-[#1A7A4A]/40 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all z-40 group"
      >
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {showSellModal && <SellModal onClose={() => setShowSellModal(false)} />}
    </div>
  );
}
