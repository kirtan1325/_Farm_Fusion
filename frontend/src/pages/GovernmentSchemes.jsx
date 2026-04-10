// frontend/src/pages/GovernmentSchemes.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSchemes } from "../api/schemeService";
import { useAuth } from "../context/AuthContext";
import SharedSidebar from "../components/SharedSidebar";

const MenuIcon   = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);

const getInitials = (name = "") => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

const CATEGORIES   = ["All", "subsidy", "loan", "insurance", "training", "equipment", "other"];
const CATEGORY_UI  = {
  subsidy:   { bg: "bg-green-100",  text: "text-green-800",  label: "Subsidy"   },
  loan:      { bg: "bg-blue-100",   text: "text-blue-800",   label: "Loan"      },
  insurance: { bg: "bg-purple-100", text: "text-purple-800", label: "Insurance" },
  training:  { bg: "bg-orange-100", text: "text-orange-800", label: "Training"  },
  equipment: { bg: "bg-amber-100",  text: "text-amber-800",  label: "Equipment" },
  other:     { bg: "bg-gray-100",   text: "text-gray-700",   label: "Other"     },
};

export default function GovernmentSchemes() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [schemes,   setSchemes]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [category,  setCategory]  = useState("All");
  const [expanded,  setExpanded]  = useState(null);

  const dashPath = user?.role === "farmer" ? "/farmer/dashboard" : "/buyer/dashboard";

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = {};
        if (category !== "All") params.category = category;
        if (search.trim())      params.search    = search.trim();
        const data = await getSchemes(params);
        setSchemes(data.data || []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    const t = setTimeout(fetch, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [category, search]);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <SharedSidebar activePath="/schemes" open={sidebarOpen} setOpen={setSidebarOpen} user={user} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden cursor-pointer"><MenuIcon /></button>
          <span className="text-xl">🏛️</span>
          <span className="font-bold text-gray-900 flex-1">Government Schemes</span>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-5 max-w-4xl w-full mx-auto">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Government Schemes for Farmers</h1>
            <p className="text-sm text-gray-500 mt-1">Subsidies, loans, insurance and more — all in one place.</p>
          </div>

          {/* Eligibility Checker Wizard */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
              <span className="text-xl">✨</span> Smart Eligibility Checker
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="number" placeholder="Land Size (acres)" id="landSize" className="flex-1 p-2.5 rounded-xl border border-purple-200 outline-none focus:border-purple-400 text-sm" />
              <input type="text" placeholder="Crop Type (e.g. Wheat)" id="cropType" className="flex-1 p-2.5 rounded-xl border border-purple-200 outline-none focus:border-purple-400 text-sm" />
              <select id="schemeCategory" className="flex-1 p-2.5 rounded-xl border border-purple-200 outline-none focus:border-purple-400 text-sm bg-white">
                <option value="All">Any Category</option>
                {CATEGORIES.slice(1).map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
              <button onClick={async () => {
                const landSize = document.getElementById("landSize").value;
                const cropType = document.getElementById("cropType").value;
                const cat = document.getElementById("schemeCategory").value;
                setLoading(true);
                try {
                  const res = await fetch("http://localhost:5000/api/schemes/check-eligibility", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                    body: JSON.stringify({ landSize, cropType, category: cat })
                  });
                  const data = await res.json();
                  setSchemes(data.data || []);
                } catch (err) {
                  console.error(err);
                } finally {
                  setLoading(false);
                }
              }} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-sm whitespace-nowrap text-sm cursor-pointer">
                Check Eligibility
              </button>
            </div>
          </div>

          {/* Search + category filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2.5 flex-1 focus-within:border-purple-400 transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search schemes..." className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400" />
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer capitalize transition-all
                    ${category === c ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-600 border-gray-200 hover:border-purple-400"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><svg className="animate-spin w-10 h-10 text-purple-600" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>
          ) : schemes.length === 0 ? (
            <div className="text-center py-20 text-gray-400"><div className="text-5xl mb-3">🏛️</div><p className="font-semibold">No schemes found</p></div>
          ) : (
            <div className="flex flex-col gap-4">
              {schemes.map(s => {
                const ui = CATEGORY_UI[s.category] || CATEGORY_UI.other;
                const isOpen = expanded === s._id;
                return (
                  <div key={s._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 cursor-pointer" onClick={() => setExpanded(isOpen ? null : s._id)}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ui.bg} ${ui.text}`}>{ui.label}</span>
                            {s.deadline && <span className="text-xs text-red-500 font-medium">⏰ Deadline: {new Date(s.deadline).toLocaleDateString("en-IN")}</span>}
                          </div>
                          <h3 className="font-bold text-gray-900 text-lg leading-tight">{s.title}</h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{s.description}</p>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          className={`flex-shrink-0 transition-transform mt-1 ${isOpen ? "rotate-180" : ""}`}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="border-t border-gray-100 p-5 flex flex-col gap-4 bg-gray-50">
                        {[
                          { label: "📋 Eligibility",  value: s.eligibility },
                          { label: "🎁 Benefits",      value: s.benefits    },
                          { label: "📝 How to Apply",  value: s.howToApply  },
                        ].map(row => row.value && (
                          <div key={row.label}>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{row.label}</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{row.value}</p>
                          </div>
                        ))}
                        {s.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {s.tags.map(tag => <span key={tag} className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">#{tag}</span>)}
                          </div>
                        )}
                        {s.officialLink && (
                          <a href={s.officialLink} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all w-fit cursor-pointer">
                            🔗 Apply on Official Website
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
