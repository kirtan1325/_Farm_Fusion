// frontend/src/pages/CropAdvisory.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdvisory, getCropNames } from "../api/schemeService";
import { useAuth } from "../context/AuthContext";
import SharedSidebar from "../components/SharedSidebar";

const MenuIcon   = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);

const getInitials = (name = "") => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
const SEASONS = ["All", "Kharif", "Rabi", "Zaid", "All Year"];
const WATER_COLOR = { High: "text-blue-600", Medium: "text-green-600", Low: "text-yellow-600" };

export default function CropAdvisory() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [advisories, setAdvisories]   = useState([]);
  const [cropNames,  setCropNames]    = useState([]);
  const [loading,    setLoading]      = useState(true);
  const [search,     setSearch]       = useState("");
  const [season,     setSeason]       = useState("All");
  const [selected,   setSelected]     = useState(null);

  const dashPath = user?.role === "farmer" ? "/farmer/dashboard" : "/buyer/dashboard";

  useEffect(() => {
    getCropNames().then(d => setCropNames(d.data || []));
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search.trim()) params.crop   = search.trim();
        if (season !== "All") params.season = season;
        const data = await getAdvisory(params);
        setAdvisories(data.data || []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    const t = setTimeout(fetch, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [search, season]);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <SharedSidebar activePath="/advisory" open={sidebarOpen} setOpen={setSidebarOpen} user={user} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden cursor-pointer"><MenuIcon /></button>
          <span className="text-xl">🌾</span>
          <span className="font-bold text-gray-900 flex-1">Crop Advisory</span>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-5 max-w-5xl w-full mx-auto">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Crop Advisory Guide</h1>
            <p className="text-sm text-gray-500 mt-1">Expert growing tips, disease info, and best practices for each crop.</p>
          </div>

          {/* Quick crop buttons */}
          <div className="flex flex-wrap gap-2">
            {cropNames.map(c => (
              <button key={c} onClick={() => setSearch(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all
                  ${search === c ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-600 border-gray-200 hover:border-green-500"}`}>
                {c}
              </button>
            ))}
            {search && <button onClick={() => setSearch("")} className="px-3 py-1.5 rounded-full text-xs font-semibold border bg-gray-100 text-gray-500 cursor-pointer hover:bg-gray-200">Clear ×</button>}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 w-56 focus-within:border-green-500 transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search crop..." className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400" />
            </div>
            <div className="flex flex-wrap gap-2">
              {SEASONS.map(s => (
                <button key={s} onClick={() => setSeason(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all
                    ${season === s ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-600 border-gray-200 hover:border-green-500"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><svg className="animate-spin w-10 h-10 text-green-700" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>
          ) : advisories.length === 0 ? (
            <div className="text-center py-20 text-gray-400"><div className="text-5xl mb-3">🌾</div><p className="font-semibold">No advisories found</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {advisories.map(a => (
                <div key={a._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelected(selected?._id === a._id ? null : a)}>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">{a.emoji}</span>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{a.cropName}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{a.season}</span>
                          <span className={`text-xs font-semibold ${WATER_COLOR[a.waterNeeds]}`}>💧 {a.waterNeeds}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      {a.temperature   && <div><span className="font-semibold text-gray-700">🌡️ Temp:</span> {a.temperature}</div>}
                      {a.sowingTime    && <div><span className="font-semibold text-gray-700">🌱 Sow:</span> {a.sowingTime}</div>}
                      {a.harvestTime   && <div><span className="font-semibold text-gray-700">🌾 Harvest:</span> {a.harvestTime}</div>}
                      {a.soilType      && <div><span className="font-semibold text-gray-700">🌍 Soil:</span> {a.soilType}</div>}
                    </div>
                  </div>

                  {selected?._id === a._id && (
                    <div className="border-t border-gray-100 bg-gray-50 p-5 flex flex-col gap-4">
                      {a.fertilizer && (
                        <div><p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">🧪 Fertilizer</p>
                          <p className="text-sm text-gray-700">{a.fertilizer}</p></div>
                      )}
                      {a.commonPests && (
                        <div><p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">🐛 Common Pests</p>
                          <p className="text-sm text-gray-700">{a.commonPests}</p></div>
                      )}
                      {a.tips?.length > 0 && (
                        <div><p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">💡 Tips</p>
                          <ul className="flex flex-col gap-1.5">
                            {a.tips.map((tip, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-700"><span className="text-green-500 font-bold flex-shrink-0">✓</span>{tip}</li>)}
                          </ul>
                        </div>
                      )}
                      {a.diseases?.length > 0 && (
                        <div><p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">🦠 Diseases & Remedies</p>
                          <div className="flex flex-col gap-2">
                            {a.diseases.map((d, i) => (
                              <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-3">
                                <p className="font-bold text-red-700 text-sm">{d.name}</p>
                                <p className="text-xs text-gray-600 mt-0.5"><span className="font-semibold">Symptom:</span> {d.symptom}</p>
                                <p className="text-xs text-green-700 mt-0.5"><span className="font-semibold">Remedy:</span> {d.remedy}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
