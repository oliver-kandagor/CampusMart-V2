import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useGetCurrentUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import {
  Package, Heart, LogOut, ChevronRight, MapPin, Star,
  User, Edit2, X, Bell, Shield, Phone, Mail, Building2, PlusCircle
} from "lucide-react";
import SellModal from "@/components/sell-modal";

type Tab = "account" | "orders" | "saved" | "settings";

export default function Profile() {
  const queryClient = useQueryClient();
  const { isAuthenticated, openAuthModal, logout, token } = useAuth();
  const { data: user, isLoading } = useGetCurrentUser({
    query: { queryKey: ["currentUser", isAuthenticated], enabled: isAuthenticated, retry: false }
  });

  const updateProfileObj = useMutation({
    mutationFn: async (data: { username?: string, campus?: string, phone?: string }) => {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const resp = await fetch(`${baseUrl}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update profile");
      }
      return resp.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
    }
  });

  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [editOpen, setEditOpen] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editCampus, setEditCampus] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Not signed in ──────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="w-24 h-24 bg-gradient-to-br from-[#0A2342]/10 to-[#1A7A4A]/10 rounded-full mb-6 flex items-center justify-center">
          <User className="w-10 h-10 text-[#0A2342]" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-[#0A2342]">You're not signed in</h2>
        <p className="text-muted-foreground text-center mb-8 max-w-sm">
          Sign in to view your profile, manage listings, and track orders on CampusMart.
        </p>
        <button
          onClick={openAuthModal}
          className="px-8 py-3.5 bg-[#0A2342] text-white font-bold rounded-2xl shadow-lg hover:bg-[#0A2342]/90 hover:scale-105 transition-all"
        >
          Sign In / Sign Up
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 space-y-4">
        <div className="h-36 bg-muted animate-pulse rounded-3xl" />
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const openEdit = () => {
    setEditUsername(user?.username ?? "");
    setEditCampus(user?.campus ?? "University of Nairobi");
    setEditPhone(user?.phone ?? "");
    setSaveSuccess(false);
    setEditOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileObj.mutateAsync({
        username: editUsername || undefined,
        campus: editCampus || undefined,
        phone: editPhone || undefined,
      });
      setSaveSuccess(true);
      setTimeout(() => setEditOpen(false), 1200);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Tabs content ────────────────────────────────────────
  const CAMPUSES = ["University of Nairobi","Kenyatta University","JKUAT","Strathmore University","Moi University"];

  return (
    <div className="max-w-2xl mx-auto py-6 md:py-10 px-4 md:px-0 pb-10">

      {/* ── Profile Header ── */}
      <div className="bg-[#0A2342] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white p-1 shrink-0 shadow-lg">
            <img
              src={user?.avatarUrl || `/images/avatar-placeholder.png`}
              alt={user?.username}
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username ?? "U")}&background=0A2342&color=fff&size=128`;
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold mb-1 truncate">@{user?.username}</h1>
            <p className="text-white/70 text-sm truncate mb-1">{user?.email}</p>
            <div className="flex items-center gap-1 text-white/80 text-sm">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{user?.campus || "No campus set"}</span>
            </div>
          </div>
          <button
            onClick={openEdit}
            className="shrink-0 p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            <Edit2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-3 gap-3 mt-5">
        {[
          { label: "Orders", value: "0" },
          { label: "Listings", value: "0" },
          { label: "Rating", value: "—", icon: <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 inline ml-0.5" /> },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-2xl border border-border shadow-sm text-center">
            <div className="text-2xl font-bold text-[#0A2342] mb-0.5">{stat.value}{stat.icon}</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex bg-muted/60 rounded-2xl p-1 mt-6 gap-1">
        {(["account","orders","saved","settings"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
              activeTab === tab
                ? "bg-white text-[#0A2342] shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab: Account ── */}
      {activeTab === "account" && (
        <div className="mt-5 space-y-2">
          <div className="bg-white rounded-2xl border border-border overflow-hidden divide-y divide-border">
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-semibold text-foreground text-sm truncate">{user?.email || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-semibold text-foreground text-sm">{(user as any)?.phone || "Not set"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Campus</p>
                <p className="font-semibold text-foreground text-sm">{user?.campus || "Not set"}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowSellModal(true)}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-[#1A7A4A]/5 rounded-2xl border border-[#1A7A4A]/20 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#1A7A4A] text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block font-bold text-[#1A7A4A]">Post an Item</span>
                <span className="text-xs font-semibold text-emerald-700/70">Start selling quickly</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#1A7A4A] group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={openEdit}
            className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-border hover:border-[#0A2342]/30 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
                <Edit2 className="w-5 h-5" />
              </div>
              <span className="font-semibold text-foreground">Edit Profile</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-[#0A2342] transition-colors" />
          </button>
        </div>
      )}

      {/* ── Tab: Orders ── */}
      {activeTab === "orders" && (
        <div className="mt-5">
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-dashed border-border">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="font-bold text-foreground mb-1">No orders yet</h3>
            <p className="text-muted-foreground text-sm">Your purchase history will appear here.</p>
          </div>
        </div>
      )}

      {/* ── Tab: Saved ── */}
      {activeTab === "saved" && (
        <div className="mt-5">
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-dashed border-border">
            <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="font-bold text-foreground mb-1">No saved items</h3>
            <p className="text-muted-foreground text-sm">Items you save will show up here.</p>
          </div>
        </div>
      )}

      {/* ── Tab: Settings ── */}
      {activeTab === "settings" && (
        <div className="mt-5 space-y-2">
          <div className="bg-white rounded-2xl border border-border overflow-hidden divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Notifications</p>
                  <p className="text-xs text-muted-foreground">Push & email alerts</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-10 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-[#0A2342]/20 rounded-full peer peer-checked:bg-[#1A7A4A] transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
              </label>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Privacy</p>
                  <p className="text-xs text-muted-foreground">Control who sees your info</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-10 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-[#0A2342]/20 rounded-full peer peer-checked:bg-[#1A7A4A] transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
              </label>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2.5 p-4 text-[#D0282E] font-bold bg-[#D0282E]/5 rounded-2xl hover:bg-[#D0282E]/10 transition-colors border border-[#D0282E]/10"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      )}

      {/* ── Sign Out (always visible on account tab) ── */}
      {activeTab === "account" && (
        <button
          onClick={logout}
          className="w-full mt-4 flex items-center justify-center gap-2.5 p-4 text-[#D0282E] font-bold bg-[#D0282E]/5 rounded-2xl hover:bg-[#D0282E]/10 transition-colors border border-[#D0282E]/10"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      )}

      {/* ── Edit Profile Modal ── */}
      {editOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditOpen(false)} />
          <div className="relative z-10 w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-lg text-[#0A2342]">Edit Profile</h2>
              <button onClick={() => setEditOpen(false)} className="p-2 rounded-full hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Username</label>
                <input
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="johndoe"
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-[#0A2342] focus:ring-2 focus:ring-[#0A2342]/10"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Phone</label>
                <input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="07XX XXX XXX"
                  type="tel"
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-[#0A2342] focus:ring-2 focus:ring-[#0A2342]/10"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Campus</label>
                <select
                  value={editCampus}
                  onChange={(e) => setEditCampus(e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-[#0A2342] bg-white"
                >
                  {CAMPUSES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {updateProfileObj.isError && (
                <p className="text-[#D0282E] text-xs font-medium">Failed to save changes. Please try again.</p>
              )}
              {saveSuccess && (
                <p className="text-[#1A7A4A] text-xs font-medium flex items-center gap-1">
                  ✓ Profile updated successfully!
                </p>
              )}

              <button
                type="submit"
                disabled={updateProfileObj.isPending}
                className="w-full py-3 bg-[#0A2342] text-white font-bold rounded-xl hover:bg-[#0A2342]/90 transition-all disabled:opacity-50"
              >
                {updateProfileObj.isPending ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Sell Modal ── */}
      {showSellModal && <SellModal onClose={() => setShowSellModal(false)} />}
    </div>
  );
}
