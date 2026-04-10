import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMarketplaceCrops } from "../api/cropService";
import { createRequest } from "../api/requestService";
import { useAuth } from "../context/AuthContext";
import SharedSidebar from "../components/SharedSidebar";

// ── Icons ──────────────────────────────────────────────
const SearchIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);
const BellIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>);
const CartIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>);
const MenuIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
const UserIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const MsgIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>);
const ChevronDown = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>);
const ChevronLeft = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>);
const ChevronRight = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>);

const SORT_OPTIONS     = ["Newest Arrivals", "Price: Low to High", "Price: High to Low", "Most Popular"];
const CATEGORY_OPTIONS = ["All", "Vegetables", "Fruits", "Grains", "Herbs"];
const PRICE_OPTIONS    = ["Any", "Under $1", "$1–$3", "$3–$5", "Above $5"];
const LOCATION_OPTIONS = ["All Locations", "California", "Idaho", "Arizona", "Texas"];

const BADGE_STYLE = {
  organic:    "bg-white/90 text-gray-800",
  flash_sale: "bg-red-600/90 text-white",
  new:        "bg-green-700/90 text-white",
  hot:        "bg-orange-600/90 text-white",
  best_deal:  "bg-green-900/90 text-white",
  limited:    "bg-white/90 text-gray-800",
};

const BG_GRADIENTS = [
  "from-red-900 to-red-700","from-amber-900 to-amber-700","from-green-900 to-green-700",
  "from-orange-800 to-orange-600","from-purple-900 to-purple-700","from-teal-900 to-teal-700",
  "from-blue-900 to-blue-700","from-lime-900 to-lime-700","from-violet-900 to-violet-700",
  "from-rose-900 to-rose-700","from-cyan-900 to-cyan-700","from-yellow-800 to-yellow-600",
];

const getInitials = (name = "") => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
const PER_PAGE = 8;

// ── Filter Dropdown ─────────────────────────────────────
function FilterDropdown({ icon, label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-green-400 hover:bg-green-50 transition-all cursor-pointer">
        {icon && <span className="text-gray-500">{icon}</span>}
        {label}
        <ChevronDown />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 min-w-[160px]">
          {options.map((opt) => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer
                ${value === opt ? "text-green-800 font-semibold bg-green-50" : "text-gray-600 hover:bg-gray-50"}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Product Card ────────────────────────────────────────
function ProductCard({ crop, user }) {
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const bgIdx = crop._id ? crop._id.charCodeAt(crop._id.length - 1) % BG_GRADIENTS.length : 0;

  const handleSend = async () => {
    if (sent || loading) return;
    setLoading(true);
    try {
      await createRequest({ cropId: crop._id, quantity: 1 });
    } catch {
      // still show feedback even if not authenticated
    } finally {
      setLoading(false);
      setSent(true);
      setTimeout(() => setSent(false), 1800);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">
      <div className={`relative h-44 bg-gradient-to-br ${BG_GRADIENTS[bgIdx]} flex items-center justify-center`}>
        <span className="text-7xl select-none">{crop.emoji || "🌾"}</span>
        {crop.badge && (
          <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${BADGE_STYLE[crop.badge] || "bg-white/90 text-gray-800"}`}>
            {crop.badge.replace("_", " ").toUpperCase()}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-900 text-sm leading-snug">{crop.name}</h3>
          <span className="text-green-700 font-extrabold text-sm whitespace-nowrap flex-shrink-0">
            ${crop.pricePerUnit?.toFixed(2)}<span className="text-gray-400 font-normal text-xs">/{crop.unit}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <UserIcon />
          <span>Farmer: {crop.farmer?.name || "Unknown"}</span>
        </div>
        {user?.role !== "farmer" && (
          <button onClick={handleSend} disabled={loading}
            className={`mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer
              ${sent ? "bg-green-600 text-white" : "bg-green-800 hover:bg-green-900 active:scale-[0.97] text-white"}
              ${loading ? "opacity-60 cursor-not-allowed" : ""}`}>
            {loading
              ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              : <MsgIcon />}
            {sent ? "Request Sent ✓" : loading ? "Sending..." : "Send Purchase Request"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Pagination ──────────────────────────────────────────
function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 py-6">
      <button onClick={() => onChange(Math.max(1, current - 1))} disabled={current === 1}
        className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-500 hover:text-green-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
        <ChevronLeft />
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onChange(p)}
          className={`w-9 h-9 rounded-full text-sm font-semibold transition-all cursor-pointer
            ${current === p ? "bg-green-800 text-white shadow-sm" : "border border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-700"}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onChange(Math.min(total, current + 1))} disabled={current === total}
        className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-500 hover:text-green-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
        <ChevronRight />
      </button>
    </div>
  );
}


// ── Main Component ──────────────────────────────────────
export default function Marketplace() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [active, setActive]           = useState("marketplace");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch]           = useState("");
  const [category, setCategory]       = useState("All");
  const [priceRange, setPriceRange]   = useState("Any");
  const [location, setLocation]       = useState("All Locations");
  const [sortBy, setSortBy]           = useState("Newest Arrivals");
  const [page, setPage]               = useState(1);
  const [cartCount, setCartCount]     = useState(0);

  // API state
  const [allCrops, setAllCrops]     = useState([]);
  const [loading,  setLoading]      = useState(true);
  const [error,    setError]        = useState("");
  const [totalPages, setTotalPages] = useState(1);

  const fetchCrops = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const filters = { status: "available" };
      if (category !== "All") filters.category = category.toLowerCase();
      if (location !== "All Locations") filters.location = location;
      if (priceRange === "Under $1")  { filters.maxPrice = 1; }
      if (priceRange === "$1–$3")     { filters.minPrice = 1;   filters.maxPrice = 3; }
      if (priceRange === "$3–$5")     { filters.minPrice = 3;   filters.maxPrice = 5; }
      if (priceRange === "Above $5")  { filters.minPrice = 5; }
      if (search.trim()) filters.search = search.trim();

      const data = await getMarketplaceCrops(filters);
      let crops = data.data || [];

      // Only show crops listed by other farmers
      if (user?._id) {
        crops = crops.filter(c => c.farmer?._id !== user._id);
      }

      if (sortBy === "Price: Low to High") crops = [...crops].sort((a, b) => a.pricePerUnit - b.pricePerUnit);
      if (sortBy === "Price: High to Low") crops = [...crops].sort((a, b) => b.pricePerUnit - a.pricePerUnit);

      setAllCrops(crops);
      setTotalPages(Math.max(1, Math.ceil(crops.length / PER_PAGE)));
      setPage(1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [category, priceRange, location, sortBy, search]);

  useEffect(() => { fetchCrops(); }, [fetchCrops]);

  const handleLogout = () => { logout(); navigate("/login"); };

  // Paginate client-side
  const pagedCrops = allCrops.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <SharedSidebar activePath="/marketplace" open={sidebarOpen} setOpen={setSidebarOpen} user={user} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* ── Topbar ── */}
        <header className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-white border-b border-gray-100 sticky top-0 z-10 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-gray-900 cursor-pointer mr-1"><MenuIcon /></button>
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 max-w-2xl focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all">
            <SearchIcon />
            <input type="text" placeholder="Search for fresh crops, farmers, or varieties..."
              value={search} onChange={(e) => { setSearch(e.target.value); }}
              className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400 min-w-0" />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="relative w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
              <BellIcon />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <button onClick={() => setCartCount(c => c + 1)}
              className="relative w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-green-700 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* ── Page body ── */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Marketplace</h1>
            <p className="text-gray-500 text-sm mt-1">Discover fresh, high-quality harvests directly from local farms.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center justify-between">
              {error} <button onClick={fetchCrops} className="text-xs font-semibold underline cursor-pointer ml-4">Retry</button>
            </div>
          )}

          {/* ── Filters ── */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <FilterDropdown label={category === "All" ? "Category" : category} options={CATEGORY_OPTIONS} value={category}
                onChange={(v) => { setCategory(v); }} icon={null} />
              <FilterDropdown label={priceRange === "Any" ? "Price Range" : priceRange} options={PRICE_OPTIONS} value={priceRange}
                onChange={(v) => { setPriceRange(v); }} icon={null} />
              <FilterDropdown label={location === "All Locations" ? "Location" : location} options={LOCATION_OPTIONS} value={location}
                onChange={(v) => { setLocation(v); }} icon={null} />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium whitespace-nowrap">Sort by:</span>
              <FilterDropdown label={sortBy} options={SORT_OPTIONS} value={sortBy} onChange={setSortBy} icon={null} />
            </div>
          </div>

          {/* ── Product Grid ── */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <svg className="animate-spin w-10 h-10 text-green-700" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </div>
          ) : pagedCrops.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {pagedCrops.map((crop) => <ProductCard key={crop._id} crop={crop} user={user} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <span className="text-5xl mb-4">🌾</span>
              <p className="text-base font-medium">No products found</p>
              <p className="text-sm mt-1">Try adjusting your filters or search term</p>
            </div>
          )}

          {!loading && <Pagination current={page} total={totalPages} onChange={setPage} />}
        </main>
      </div>
    </div>
  );
}