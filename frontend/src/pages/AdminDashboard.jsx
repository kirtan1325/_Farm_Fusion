// frontend/src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminStats, getAdminCrops, removeCrop } from "../api/adminService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import AdminUsers from "./AdminUsers";
import AdminSchemes from "./AdminSchemes";

const MenuIcon   = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
const LogoutIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);

const getInitials = (name = "") => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

const ADMIN_TABS = ["Overview", "Users", "Schemes", "Crops", "Forum"];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast    = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab,   setActiveTab]   = useState("Overview");

  // Overview
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  // Crops tab
  const [crops,       setCrops]       = useState([]);
  const [cropSearch,  setCropSearch]  = useState("");
  const [cropLoading, setCropLoading] = useState(false);

  useEffect(() => {
    getAdminStats().then(d => { setStats(d.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab !== "Crops") return;
    const fetch = async () => {
      setCropLoading(true);
      try {
        const params = {};
        if (cropSearch.trim()) params.search = cropSearch.trim();
        const data = await getAdminCrops(params);
        setCrops(data.data || []);
      } catch { /* silent */ }
      finally { setCropLoading(false); }
    };
    const t = setTimeout(fetch, cropSearch ? 400 : 0);
    return () => clearTimeout(t);
  }, [activeTab, cropSearch]);

  const handleRemoveCrop = async (id, name) => {
    if (!window.confirm(`Remove crop listing "${name}"?`)) return;
    try {
      await removeCrop(id);
      setCrops(prev => prev.filter(c => c._id !== id));
      toast.success("Crop listing removed");
    } catch { toast.error("Failed to remove"); }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const inputCls = "border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-red-400 transition-all bg-white";

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-100 z-30 flex flex-col justify-between py-6 px-4 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:h-screen`}>
        <div>
          <div className="flex items-center gap-2.5 px-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-red-700 flex items-center justify-center text-white text-lg">🛡️</div>
            <div><p className="font-bold text-red-900 text-sm">Farm Fusion</p><p className="text-[10px] text-gray-400 uppercase tracking-widest">Admin Portal</p></div>
          </div>
          <nav className="flex flex-col gap-1">
            {ADMIN_TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left cursor-pointer transition-all
                  ${activeTab === tab ? "bg-red-50 text-red-800" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}>
                {tab === "Overview" ? "📊" : tab === "Users" ? "👥" : tab === "Crops" ? "🌾" : tab === "Schemes" ? "🏛️" : "💬"} {tab}
              </button>
            ))}
            <div className="h-px bg-gray-100 my-2" />
            <button onClick={() => navigate("/advisory")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left cursor-pointer transition-all text-gray-500 hover:bg-gray-50">
              🌾 Manage Advisory
            </button>
          </nav>
        </div>
        <div>
          <div className="flex items-center gap-2.5 px-2 py-3 bg-gray-50 rounded-xl mb-2">
            <div className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center text-white text-xs font-bold">{getInitials(user?.name)}</div>
            <div><p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p><p className="text-xs text-red-400 font-semibold">Administrator</p></div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl w-full font-semibold cursor-pointer"><LogoutIcon /> Logout</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden cursor-pointer"><MenuIcon /></button>
          <span className="text-xl">🛡️</span>
          <span className="font-bold text-gray-900 flex-1">Admin Dashboard</span>
          <span className="text-xs bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded-full">Admin</span>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 max-w-6xl w-full mx-auto">

          {/* Tab nav */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
            {ADMIN_TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
                  ${activeTab === tab ? "bg-white text-red-800 shadow font-semibold" : "text-gray-500 hover:text-gray-700"}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* ── Overview ── */}
          {activeTab === "Overview" && (
            loading ? (
              <div className="flex justify-center py-20"><svg className="animate-spin w-10 h-10 text-red-600" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>
            ) : (
              <div className="flex flex-col gap-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Platform Overview</h1>
                  <p className="text-sm text-gray-500 mt-1">Full control of Farm Fusion platform.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Total Users",    value: stats?.totalUsers    || 0, icon: "👥", color: "bg-blue-50 text-blue-700"   },
                    { label: "Farmers",        value: stats?.totalFarmers  || 0, icon: "👨‍🌾", color: "bg-green-50 text-green-700" },
                    { label: "Buyers",         value: stats?.totalBuyers   || 0, icon: "🛒", color: "bg-purple-50 text-purple-700"},
                    { label: "Pending Approval", value: stats?.pendingFarmers || 0, icon: "⏳", color: "bg-yellow-50 text-yellow-700"},
                    { label: "Crop Listings",  value: stats?.totalCrops    || 0, icon: "🌾", color: "bg-green-50 text-green-700" },
                    { label: "Requests",       value: stats?.totalRequests || 0, icon: "📋", color: "bg-blue-50 text-blue-700"   },
                    { label: "Schemes",        value: stats?.totalSchemes  || 0, icon: "🏛️", color: "bg-indigo-50 text-indigo-700"},
                    { label: "Forum Posts",    value: stats?.totalPosts    || 0, icon: "💬", color: "bg-orange-50 text-orange-700"},
                  ].map(s => (
                    <div key={s.label} className={`rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-3 ${s.color.split(" ")[0]}`}>
                      <span className="text-3xl flex-shrink-0">{s.icon}</span>
                      <div>
                        <p className={`text-2xl font-extrabold ${s.color.split(" ")[1]}`}>{s.value}</p>
                        <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {stats?.pendingFarmers > 0 && (
                  <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="font-bold text-yellow-800">{stats.pendingFarmers} farmer{stats.pendingFarmers !== 1 ? "s" : ""} awaiting approval</p>
                      <p className="text-sm text-yellow-600">Review and approve new farmer registrations.</p>
                    </div>
                    <button onClick={() => { setActiveTab("Users"); }}
                      className="ml-auto bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold px-4 py-2 rounded-xl cursor-pointer transition-all flex-shrink-0">
                      Review Now
                    </button>
                  </div>
                )}
              </div>
            )
          )}

          {/* ── Users ── */}
          {activeTab === "Users" && <AdminUsers />}

          {/* ── Schemes ── */}
          {activeTab === "Schemes" && <AdminSchemes />}

          {/* ── Crops ── */}
          {activeTab === "Crops" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-gray-900">Manage Crop Listings</h2>
              <input value={cropSearch} onChange={e => setCropSearch(e.target.value)} placeholder="Search crops..." className={`${inputCls} w-64`} />
              {cropLoading ? (
                <div className="flex justify-center py-12"><svg className="animate-spin w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          {["Crop", "Farmer", "Qty", "Price", "Status", "Action"].map(h => (
                            <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {crops.length === 0 ? (
                          <tr><td colSpan={6} className="text-center py-12 text-gray-400">No crops found</td></tr>
                        ) : crops.map(c => (
                          <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{c.emoji || "🌾"}</span>
                                <div>
                                  <p className="font-semibold text-gray-900">{c.name}</p>
                                  <p className="text-xs text-gray-400 capitalize">{c.category}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{c.farmer?.name || "—"}</td>
                            <td className="px-4 py-3 text-gray-600">{c.quantity} {c.unit}</td>
                            <td className="px-4 py-3 font-semibold text-gray-900">₹{c.pricePerUnit}/{c.unit}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${c.status === "available" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{c.status}</span>
                            </td>
                            <td className="px-4 py-3">
                              <button onClick={() => handleRemoveCrop(c._id, c.name)}
                                className="text-xs font-semibold text-red-600 hover:text-red-800 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 cursor-pointer transition-all">
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Forum (redirect) ── */}
          {activeTab === "Forum" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-gray-900">Manage Forum</h2>
              <p className="text-sm text-gray-500">Visit the forum to pin/remove posts and reply as an expert.</p>
              <button onClick={() => navigate("/forum")}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-5 py-3 rounded-xl cursor-pointer transition-all w-fit">
                💬 Go to Forum
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
