import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMarketplaceCrops } from "../api/cropService";
import { getBuyerStats } from "../api/statsService";
import { createRequest } from "../api/requestService";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

// ── Icons ──────────────────────────────────────────────
const DashboardIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>);
const MarketIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1-6h16l1 6" /><path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" /><path d="M5 9v11h14V9" /></svg>);
const OrdersIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>);
const AnalyticsIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>);
const SettingsIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>);
const BellIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>);
const SearchIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const CartIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>);
const TrendUpIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>);
const StarIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
const MenuIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>);
const LogoutIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>);

const NAV_ITEMS = [
  { id: "dashboard",   label: "Dashboard",   path: "/buyer/dashboard", icon: <DashboardIcon /> },
  { id: "marketplace", label: "Marketplace", path: "/marketplace",     icon: <MarketIcon /> },
  { id: "orders",      label: "My Orders",   path: "/buyer/orders",    icon: <OrdersIcon /> },
  { id: "messages",    label: "Messages",    path: "/messages",        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { id: "analytics",   label: "Analytics",   path: "/buyer/dashboard", icon: <AnalyticsIcon /> },
  { id: "settings",    label: "Settings",    path: "/buyer/settings",  icon: <SettingsIcon /> },
];

const BADGE_STYLES = {
  organic:    "bg-white/90 text-gray-800",
  flash_sale: "bg-red-600/90 text-white",
  new:        "bg-green-700/90 text-white",
  best_deal:  "bg-green-900/90 text-white",
  limited:    "bg-white/90 text-gray-800",
};

const BG_GRADIENTS = [
  "from-red-900 to-red-700","from-amber-900 to-amber-700","from-green-900 to-green-700",
  "from-orange-800 to-orange-600","from-purple-900 to-purple-700","from-teal-900 to-teal-700",
  "from-blue-900 to-blue-700","from-lime-900 to-lime-700",
];

const getInitials = (name = "") => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

// ── Product Card ────────────────────────────────────────
function ProductCard({ crop }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const bgIdx = crop._id ? crop._id.charCodeAt(crop._id.length - 1) % BG_GRADIENTS.length : 0;

  const handleRequest = async () => {
    if (sent) return;
    setLoading(true);
    try {
      await createRequest({ cropId: crop._id, quantity: 1 });
      setSent(true);
      setTimeout(() => setSent(false), 2000);
    } catch {
      setSent(true);
      setTimeout(() => setSent(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">
      <div className={`relative h-44 bg-gradient-to-br ${BG_GRADIENTS[bgIdx]} flex items-center justify-center`}>
        <span className="text-7xl select-none">{crop.emoji || "🌾"}</span>
        {crop.badge && (
          <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full ${BADGE_STYLES[crop.badge] || "bg-white/90 text-gray-800"}`}>
            {crop.badge.replace("_", " ").toUpperCase()}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1 gap-1">
        <div className="flex items-center gap-1">
          <StarIcon />
          <span className="text-xs font-semibold text-gray-700">4.8</span>
          <span className="text-xs text-gray-400">(reviews)</span>
        </div>
        <h3 className="font-bold text-gray-900 text-sm leading-snug">{crop.name}</h3>
        <p className="text-xs text-gray-400">{crop.farmer?.farmName || crop.farmer?.name || "Farm"}</p>
        <div className="flex items-end justify-between mt-auto pt-3">
          <div>
            <p className="text-xs text-gray-400">Price per {crop.unit}</p>
            <p className="text-lg font-extrabold text-gray-900">${crop.pricePerUnit?.toFixed(2)}</p>
          </div>
          <button onClick={handleRequest} disabled={loading}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer flex-shrink-0
              ${sent ? "bg-green-700 text-white scale-95" : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"}
              ${loading ? "opacity-60 cursor-not-allowed" : ""}`}>
            {sent ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            ) : <CartIcon />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ─────────────────────────────────────────────
function Sidebar({ active, setActive, open, setOpen, user, onLogout, onNavigate }) {
  const { badges } = useNotifications();

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-100 z-30
        flex flex-col justify-between py-6 px-4 transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto lg:h-screen`}>
        <div>
          <div className="flex items-center gap-2.5 px-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-800 flex items-center justify-center text-white text-lg">🌿</div>
            <div>
              <p className="font-bold text-green-900 text-sm leading-tight tracking-tight">Farm Fusion</p>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Buyer Dashboard</p>
            </div>
          </div>
          <div className="h-px bg-gray-100 my-4" />
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const badgeCount = badges[item.path] || 0;
              return (
                <button key={item.id} onClick={() => { setActive(item.id); setOpen(false); onNavigate(item.path); }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-150 w-full text-left cursor-pointer
                    ${active === item.id ? "bg-green-800 text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}>
                  <div className="flex items-center gap-3">
                    <span className={active === item.id ? "text-white" : "text-gray-400"}>{item.icon}</span>
                    {item.label}
                  </div>
                  {badgeCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="mt-4 mx-1">
            <button className="w-full flex items-center justify-center gap-2 bg-green-800 hover:bg-green-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer">
              + Post Request
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-green-800 flex items-center justify-center text-white text-base flex-shrink-0 font-bold text-sm">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || "Buyer"}</p>
              <p className="text-xs text-gray-400 truncate">{user?.isPremium ? "Premium Buyer" : "Buyer"}</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl w-full transition-colors cursor-pointer">
            <LogoutIcon /> Log Out
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Main Component ──────────────────────────────────────
export default function BuyerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [active, setActive]           = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch]           = useState("");

  // API state
  const [stats,    setStats]    = useState({ activeRequests: 0, cropsSaved: 0, recentPurchases: 0 });
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [notifCount] = useState(3);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, cropsData] = await Promise.all([
        getBuyerStats(),
        getMarketplaceCrops({ status: "available", limit: 4 }),
      ]);
      setStats(statsData);
      setProducts(cropsData.data.slice(0, 4));
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogout = () => { logout(); navigate("/login"); };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.farmer?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const STAT_CARDS = [
    {
      id: "requests", label: "ACTIVE REQUESTS",
      value: String(stats.activeRequests), sub: "Pending responses",
      subColor: "text-green-600", trendIcon: true,
      bg: "bg-green-50", iconColor: "text-green-700",
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="2" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="12" y2="16" /></svg>,
    },
    {
      id: "saved", label: "CROPS SAVED",
      value: String(stats.cropsSaved), valueSuffix: " kg",
      sub: "Total kg ordered", subColor: "text-orange-500", trendIcon: false,
      bg: "bg-orange-50", iconColor: "text-orange-500",
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>,
    },
    {
      id: "purchases", label: "RECENT PURCHASES",
      value: String(stats.recentPurchases), sub: "Completed orders",
      subColor: "text-blue-500", trendIcon: false,
      bg: "bg-blue-50", iconColor: "text-blue-500",
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>,
    },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <svg className="animate-spin w-10 h-10 text-green-700" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar active={active} setActive={setActive} open={sidebarOpen} setOpen={setSidebarOpen}
        user={user} onLogout={handleLogout} onNavigate={navigate} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* ── Top bar ── */}
        <header className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 py-3 bg-white border-b border-gray-100 flex-shrink-0 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-gray-900 cursor-pointer mr-1"><MenuIcon /></button>
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 max-w-xl focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all">
            <SearchIcon />
            <input type="text" placeholder="Search crops, farms, or categories..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400 min-w-0" />
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button onClick={() => navigate("/notifications")} className="relative w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
              <BellIcon />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{notifCount}</span>
              )}
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name || "Buyer"}</p>
                <p className="text-xs text-gray-400">{user?.isPremium ? "Premium Buyer" : "Buyer"}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-green-800 flex items-center justify-center text-white text-sm font-bold">
                {getInitials(user?.name)}
              </div>
            </div>
          </div>
        </header>

        {/* ── Page body ── */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Welcome, {user?.name?.split(" ")[0] || "Buyer"}!</h1>
            <p className="text-gray-500 text-sm mt-1">Here's what's happening with your supply chain today.</p>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STAT_CARDS.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center ${s.iconColor} mb-4`}>{s.icon}</div>
                <p className="text-xs font-semibold text-gray-400 tracking-wider mb-1">{s.label}</p>
                <p className="text-3xl font-extrabold text-gray-900 leading-tight">
                  {s.value}
                  {s.valueSuffix && <span className="text-lg font-semibold text-gray-500 ml-1">{s.valueSuffix}</span>}
                </p>
                <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${s.subColor}`}>
                  {s.trendIcon && <TrendUpIcon />}
                  {s.sub}
                </div>
              </div>
            ))}
          </div>

          {/* ── Suggested for You ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Suggested for You</h2>
              <button onClick={() => navigate("/marketplace")}
                className="text-sm text-green-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer">
                View Marketplace
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </button>
            </div>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredProducts.map((p) => <ProductCard key={p._id} crop={p} />)}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
                {products.length === 0 ? "No products available right now." : "No products match your search."}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}