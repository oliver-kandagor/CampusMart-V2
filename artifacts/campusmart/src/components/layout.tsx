import React from "react";
import { Link, useLocation } from "wouter";
import { Home, ShoppingBag, UtensilsCrossed, Building2, User, Search, Bell, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useGetCart } from "@workspace/api-client-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/market", label: "Market", icon: ShoppingBag },
  { href: "/food", label: "Food", icon: UtensilsCrossed },
  { href: "/nrooms", label: "Nrooms", icon: Building2 },
  { href: "/profile", label: "Profile", icon: User },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { openAuthModal, isAuthenticated } = useAuth();
  const { data: cart } = useGetCart({ query: { enabled: isAuthenticated, retry: false } });

  const cartCount = cart?.itemCount || 0;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pt-20 flex flex-col md:flex-row max-w-7xl mx-auto">
      {/* Desktop Header */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-border z-50 items-center justify-between px-8 shadow-sm">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-2xl font-display font-extrabold text-primary tracking-tight">Campus</span>
            <span className="text-2xl font-display font-extrabold text-secondary tracking-tight">Mart</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-full font-medium transition-all",
                  location === item.href 
                    ? "bg-primary/5 text-primary" 
                    : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search products, food, rooms..."
              className="w-72 pl-10 pr-4 py-2.5 bg-muted/50 border border-transparent rounded-full focus:bg-white focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all"
            />
          </div>
          <button className="p-2.5 rounded-full hover:bg-muted/80 text-foreground transition-colors relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-accent rounded-full border-2 border-white"></span>
          </button>
          <Link href="/cart" className="p-2.5 rounded-full hover:bg-muted/80 text-foreground transition-colors relative">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center px-1 bg-accent text-white text-[10px] font-bold rounded-full border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>
          {!isAuthenticated ? (
            <button 
              onClick={openAuthModal}
              className="ml-2 px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
            >
              Sign In
            </button>
          ) : null}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] z-50" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-stretch justify-around h-[58px]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 gap-[3px] py-2"
              >
                <Icon
                  className={cn(
                    "w-[22px] h-[22px] transition-colors",
                    isActive ? "text-[#0A2342]" : "text-[#9AA5B8]"
                  )}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span className={cn(
                  "text-[10px] font-medium leading-none transition-colors",
                  isActive ? "text-[#0A2342] font-semibold" : "text-[#9AA5B8]"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
