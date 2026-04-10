import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMyCrops, createCrop, deleteCrop } from "../api/cropService";
import { getFarmerStats } from "../api/statsService";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

// ── Icons ──────────────────────────────────────────────
const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);
const CropIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22V12M12 12C12 7 7 3 2 3c0 5 4 9 10 9zM12 12c0-5 5-9 10-9-1 5-5 9-10 9" />
  </svg>
);
const SalesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);
const RequestsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const TrendUpIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);
const TrendDownIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
  </svg>
);
const DotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" />
  </svg>
);
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const NAV_ITEMS = [
  { id: "dashboard",   label: "Dashboard",   path: "/farmer/dashboard",   icon: <DashboardIcon /> },
  { id: "crops",       label: "My Crops",    path: "/farmer/dashboard",   icon: <CropIcon /> },
  { id: "sales",       label: "Sales",       path: "/farmer/dashboard",   icon: <SalesIcon /> },
  { id: "requests",    label: "Requests",    path: "/farmer/requests",    icon: <RequestsIcon /> },
  { id: "inventory",   label: "Inventory",   path: "/farmer/inventory",   icon: <SalesIcon /> },
  { id: "soil-health", label: "Soil Health", path: "/farmer/soil-health", icon: <RequestsIcon /> },
  { id: "messages",    label: "Messages",    path: "/messages",           icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { id: "crop-ai",     label: "Crop AI",     path: "/crop-recommendation",icon: <DashboardIcon /> },
  { id: "disease-ai",  label: "Disease AI",  path: "/disease-detection",  icon: <CropIcon /> },
  { id: "settings",    label: "Settings",    path: "/farmer/settings",    icon: <SettingsIcon /> },
];

const EMOJI_OPTIONS = ["🌾","🍅","🥔","🥕","🌽","🥦","🧅","🧄","🥬","🫑","🍆","🥒","🫘","🍋"];
const CATEGORY_OPTIONS = ["vegetables","fruits","grains","herbs","other"];
const UNIT_OPTIONS = ["kg","lb","unit","bunch"];
const statusStyle = (s) =>
  s === "available"
    ? "bg-green-100 text-green-700 border border-green-200"
    : s === "reserved"
    ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
    : "bg-gray-100 text-gray-500 border border-gray-200";

// ── Helpers ─────────────────────────────────────────────
const fmt = (n) => `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
const getInitials = (name = "") => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

// ── Add Crop Modal ──────────────────────────────────────
function AddCropModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: "", subtitle: "", category: "vegetables", quantity: "",
    unit: "kg", pricePerUnit: "", emoji: "🌾", location: "", badge: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.quantity || !form.pricePerUnit) {
      setError("Name, quantity and price are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({ ...form, quantity: Number(form.quantity), pricePerUnit: Number(form.pricePerUnit) });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save crop.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">Add New Crop</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 cursor-pointer"><XIcon /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>}

          {/* Emoji picker */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Crop Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map(e => (
                <button key={e} onClick={() => set("emoji", e)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all cursor-pointer
                    ${form.emoji === e ? "bg-green-100 ring-2 ring-green-500" : "bg-gray-100 hover:bg-gray-200"}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          {[
            { label: "Crop Name *",    key: "name",         type: "text",   placeholder: "e.g. Organic Tomatoes" },
            { label: "Subtitle",       key: "subtitle",     type: "text",   placeholder: "e.g. Harvested 2 days ago" },
            { label: "Location",       key: "location",     type: "text",   placeholder: "e.g. Idaho" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all" />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Category</label>
              <select value={form.category} onChange={e => set("category", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 cursor-pointer">
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Unit</label>
              <select value={form.unit} onChange={e => set("unit", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 cursor-pointer">
                {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Quantity *</label>
              <input type="number" min="0" placeholder="e.g. 500" value={form.quantity}
                onChange={e => set("quantity", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Price / {form.unit} *</label>
              <input type="number" min="0" step="0.01" placeholder="e.g. 2.50" value={form.pricePerUnit}
                onChange={e => set("pricePerUnit", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all" />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer transition-all">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 bg-green-800 hover:bg-green-900 text-white rounded-xl text-sm font-semibold cursor-pointer transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> : null}
            {saving ? "Saving..." : "Save Crop"}
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
          <div className="flex items-center gap-2.5 px-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-green-800 flex items-center justify-center text-white text-lg">🚜</div>
            <span className="font-bold text-green-900 text-base tracking-tight">Farm Fusion</span>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const badgeCount = badges[item.path] || 0;
              return (
                <button key={item.id} onClick={() => { setActive(item.id); setOpen(false); onNavigate(item.path); }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-150 w-full text-left cursor-pointer
                    ${active === item.id ? "bg-green-100 text-green-800" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}>
                  <div className="flex items-center gap-3">
                    <span className={active === item.id ? "text-green-700" : "text-gray-400"}>{item.icon}</span>
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
        </div>
        <div>
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 mb-3">
            <div className="w-9 h-9 rounded-full bg-green-800 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || "Farmer"}</p>
              <p className="text-xs text-gray-400 capitalize truncate">{user?.tierLevel || "member"}</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl w-full transition-colors cursor-pointer">
            <LogoutIcon /> Log Out
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Main Component ──────────────────────────────────────
export default function FarmerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [active, setActive]         = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch]           = useState("");
  const [showModal, setShowModal]     = useState(false);
  const [menuOpenId, setMenuOpenId]   = useState(null);

  // API state
  const [crops,   setCrops]   = useState([]);
  const [stats,   setStats]   = useState({ activeListings: 0, totalSales: 0, pendingRequests: 0 });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [cropsData, statsData] = await Promise.all([getMyCrops(), getFarmerStats()]);
      setCrops(cropsData.data);
      setStats(statsData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddCrop = async (cropData) => {
    await createCrop(cropData);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this crop listing?")) return;
    try {
      await deleteCrop(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    }
    setMenuOpenId(null);
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const filteredCrops = crops.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.subtitle || "").toLowerCase().includes(search.toLowerCase())
  );

  const STAT_CARDS = [
    {
      label: "Active Listings", value: stats.activeListings, trend: "Live count", up: true,
      bg: "bg-green-100", iconColor: "text-green-700",
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    },
    {
      label: "Total Sales", value: fmt(stats.totalSales), trend: "All time revenue", up: true,
      bg: "bg-green-100", iconColor: "text-green-700",
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9 12h6M12 9v6" /></svg>,
    },
    {
      label: "Pending Requests", value: stats.pendingRequests, trend: "Awaiting review", up: stats.pendingRequests === 0,
      bg: "bg-amber-100", iconColor: "text-amber-600",
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="12" y2="17" /></svg>,
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
      {showModal && <AddCropModal onClose={() => setShowModal(false)} onSave={handleAddCrop} />}

      <Sidebar active={active} setActive={setActive} open={sidebarOpen} setOpen={setSidebarOpen}
        user={user} onLogout={handleLogout} onNavigate={navigate} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* ── Top bar ── */}
        <header className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-gray-900 mr-1 cursor-pointer">
            <MenuIcon />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 truncate">
              Welcome, {user?.name?.split(" ")[0] || "Farmer"}!
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5 hidden sm:block">
              Here's what's happening on your farm today.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 w-56 lg:w-64 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all">
            <SearchIcon />
            <input type="text" placeholder="Search crops..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400" />
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-green-800 hover:bg-green-900 active:scale-[0.97] text-white text-xs sm:text-sm font-semibold px-3 sm:px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex-shrink-0">
            <PlusIcon />
            <span className="hidden sm:inline">Add New Crop</span>
            <span className="sm:hidden">Add</span>
          </button>
        </header>

        {/* Mobile search */}
        <div className="md:hidden px-4 pb-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all">
            <SearchIcon />
            <input type="text" placeholder="Search crops..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400" />
          </div>
        </div>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 flex flex-col gap-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center justify-between">
              {error}
              <button onClick={fetchData} className="text-xs font-semibold underline cursor-pointer ml-4">Retry</button>
            </div>
          )}

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STAT_CARDS.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center flex-shrink-0 ${s.iconColor}`}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">{s.label}</p>
                  <p className="text-2xl font-extrabold text-gray-900 leading-tight">{s.value}</p>
                  <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${s.up ? "text-green-600" : "text-amber-600"}`}>
                    {s.up ? <TrendUpIcon /> : <TrendDownIcon />}
                    {s.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Crop listings ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">My Crop Listings</h2>
              <span className="text-xs text-gray-400">{filteredCrops.length} crop{filteredCrops.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Crop Details","Quantity","Price","Status","Actions"].map(h => (
                      <th key={h} className={`text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-${h === "Crop Details" ? "6" : "4"} py-3`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCrops.map((crop) => (
                    <tr key={crop._id} className="hover:bg-gray-50 transition-colors relative">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                            {crop.emoji || "🌾"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{crop.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{crop.subtitle || crop.location || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-700">{crop.quantity} {crop.unit}</td>
                      <td className="px-4 py-4 font-semibold text-gray-900">${crop.pricePerUnit?.toFixed(2)} / {crop.unit}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusStyle(crop.status)}`}>
                          {crop.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 relative">
                        <button onClick={() => setMenuOpenId(menuOpenId === crop._id ? null : crop._id)}
                          className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-100">
                          <DotsIcon />
                        </button>
                        {menuOpenId === crop._id && (
                          <div className="absolute right-4 top-12 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 min-w-[120px]">
                            <button onClick={() => { setMenuOpenId(null); }}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                              Edit
                            </button>
                            <button onClick={() => handleDelete(crop._id)}
                              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer">
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredCrops.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                      {crops.length === 0 ? "No crop listings yet. Click Add New Crop to get started." : "No crops match your search."}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filteredCrops.map((crop) => (
                <div key={crop._id} className="flex items-start gap-3 px-4 py-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                    {crop.emoji || "🌾"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{crop.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{crop.subtitle || ""}</p>
                      </div>
                      <button onClick={() => handleDelete(crop._id)}
                        className="text-gray-400 hover:text-red-500 mt-0.5 flex-shrink-0 cursor-pointer text-xs font-medium">
                        Delete
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-xs text-gray-500">{crop.quantity} {crop.unit}</span>
                      <span className="text-xs font-semibold text-gray-900">${crop.pricePerUnit?.toFixed(2)} / {crop.unit}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyle(crop.status)}`}>
                        {crop.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredCrops.length === 0 && (
                <p className="text-center py-8 text-gray-400 text-sm">
                  {crops.length === 0 ? "No listings yet." : "No crops match your search."}
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}