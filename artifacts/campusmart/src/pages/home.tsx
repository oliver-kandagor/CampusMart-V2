import { Search, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { ProductCard } from "@/components/shared";
import { useListProducts } from "@workspace/api-client-react";
import { useState } from "react";

const CATEGORIES = [
  { name: "Books", image: "/images/cat_books.png", href: "/market" },
  { name: "Electronics", image: "/images/cat_electronics.png", href: "/market" },
  { name: "Fashion", image: "/images/cat_fashion.png", href: "/market" },
  { name: "Food", image: "/images/cat_food.png", href: "/food" },
  { name: "Nrooms", image: "/images/cat_nrooms.png", href: "/nrooms" },
  { name: "Stationery", image: "/images/cat_stationery.png", href: "/market" },
  { name: "Furniture", emoji: "🛋️", color: "bg-amber-100", href: "/market" },
];

const BANNERS = [
  { bg: "from-[#0A2342] to-[#1a3a6b]", tag: "MARKET", title: "Cheap Textbooks", emoji: "📚", href: "/market" },
  { bg: "from-[#1A7A4A] to-[#14603A]", tag: "NROOMS", title: "Find a Room", emoji: "🏠", href: "/nrooms" },
  { bg: "from-[#D0282E] to-[#a81f24]", tag: "FOOD", title: "Late Night Bites", emoji: "🍔", href: "/food" },
];

export default function Home() {
  const [, navigate] = useLocation();
  const [searchVal, setSearchVal] = useState("");
  const { data: featuredData, isLoading, isError: featuredError } = useListProducts({ featured: true, limit: 8 });
  const { data: recentData, isError: recentError } = useListProducts({ sort: "newest", limit: 6 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) navigate(`/market?search=${encodeURIComponent(searchVal.trim())}`);
  };

  const hasError = featuredError || recentError;

  return (
    <div className="pb-6">
      <div className="px-4 md:px-8 max-w-7xl mx-auto space-y-6 pt-3 md:pt-6">

        {/* API Error Banner */}
        {hasError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm">
            <p className="text-red-800 font-semibold">⚠️ Connection Issue</p>
            <p className="text-red-700 text-xs mt-1">Unable to load products. Make sure the API server is running on port 5000.</p>
          </div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search products, food, rooms..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-border/80 shadow-sm rounded-2xl focus:border-[#0A2342] focus:ring-2 focus:ring-[#0A2342]/10 outline-none transition-all text-sm"
          />
        </form>

        {/* Hero Banners Carousel */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {BANNERS.map((banner, i) => (
            <Link
              key={i}
              href={banner.href}
              className={`min-w-[85%] md:min-w-[40%] shrink-0 snap-start rounded-3xl bg-gradient-to-br ${banner.bg} p-6 flex flex-col justify-between h-36 md:h-44 relative overflow-hidden hover:scale-[0.99] active:scale-[0.97] transition-all`}
            >
              <div className="absolute -right-4 -bottom-4 text-[80px] md:text-[100px] opacity-25 select-none">
                {banner.emoji}
              </div>
              <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full w-max backdrop-blur-sm">
                {banner.tag}
              </span>
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-1">{banner.title}</h2>
                <div className="flex items-center gap-1 text-white/80 text-sm font-medium">
                  Explore <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Categories */}
        <section>
          <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            {CATEGORIES.map((cat: any) => (
              <Link key={cat.name} href={cat.href} className="flex flex-col items-center gap-1.5 shrink-0 group">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-300 border border-gray-100">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-2xl ${cat.color}`}>
                      {cat.emoji}
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-medium text-foreground">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Products */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">🔥 Trending Near You</h2>
            <Link href="/market" className="text-sm font-semibold text-[#1A7A4A] hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-muted animate-pulse rounded-2xl aspect-[3/4]" />
              ))}
            </div>
          ) : featuredData?.products?.length ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {featuredData.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-border">
              <p className="text-muted-foreground text-sm">No trending products yet.</p>
            </div>
          )}
        </section>

        {/* Recently Added */}
        {recentData?.products && recentData.products.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">🆕 Just Listed</h2>
              <Link href="/market" className="text-sm font-semibold text-[#1A7A4A] hover:underline flex items-center gap-1">
                See More <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {recentData.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Promo banner */}
        <div className="bg-gradient-to-r from-[#0A2342] to-[#1a3a6b] rounded-3xl p-6 flex items-center justify-between overflow-hidden relative">
          <div className="absolute right-0 top-0 w-40 h-full opacity-10 text-[120px] flex items-center">🛍️</div>
          <div className="relative z-10">
            <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Sell on CampusMart</p>
            <h3 className="text-white text-xl font-display font-bold mb-1">Turn clutter into cash</h3>
            <p className="text-white/70 text-sm">List your items for free, sell to fellow students.</p>
          </div>
          <Link
            href="/market"
            className="relative z-10 shrink-0 ml-4 px-4 py-2.5 bg-[#1A7A4A] text-white font-bold rounded-xl text-sm shadow-lg hover:bg-[#1A7A4A]/90 transition-all active:scale-95"
          >
            Start Selling
          </Link>
        </div>

      </div>
    </div>
  );
}
