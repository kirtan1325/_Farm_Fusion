// frontend/src/pages/CropPrices.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCropPrices } from "../api/cropPriceService";
import { predictPrice } from "../api/mlService";
import { useAuth } from "../context/AuthContext";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import SharedSidebar from "../components/SharedSidebar";

const MenuIcon   = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);

const getInitials = (name = "") => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
const CATEGORIES = ["All", "vegetables", "fruits", "grains", "herbs", "other"];

export default function CropPrices() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prices,   setPrices]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("All");

  // Prediction State
  const [showPredict,   setShowPredict]   = useState(false);
  const [predictCrop,   setPredictCrop]   = useState("Wheat");
  const [forecast,      setForecast]      = useState(null);
  const [predictLoading,setPredictLoading]= useState(false);
  const [predictError,  setPredictError]  = useState("");

  const dashPath = user?.role === "farmer" ? "/farmer/dashboard" : "/buyer/dashboard";

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      try {
        const params = {};
        if (category !== "All") params.category = category;
        if (search.trim())      params.search    = search.trim();
        const data = await getCropPrices(params);
        setPrices(data.data || []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    const timer = setTimeout(fetchPrices, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [category, search]);

  const handleLogout = () => { logout(); navigate("/login"); };

  const handlePredict = async (e) => {
    e?.preventDefault();
    setPredictLoading(true);
    setPredictError("");
    try {
      const data = await predictPrice({ crop: predictCrop });
      if (data.success) {
        // format for recharts
        const formatted = data.forecast_30_days.map((val, idx) => ({
          day: `Day ${idx + 1}`,
          price: Math.round(val)
        }));
        setForecast({ ...data, chartData: formatted });
      } else {
        setPredictError("Failed to fetch prediction.");
      }
    } catch {
      setPredictError("ML Service not reachable.");
    } finally {
      setPredictLoading(false);
    }
  };

  const trendColor = (t) => t === "up" ? "text-green-600" : t === "down" ? "text-red-500" : "text-gray-500";
  const trendIcon  = (t) => t === "up" ? "↑" : t === "down" ? "↓" : "→";

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <SharedSidebar activePath="/crop-prices" open={sidebarOpen} setOpen={setSidebarOpen} user={user} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden cursor-pointer"><MenuIcon /></button>
          <span className="text-xl">📈</span>
          <span className="font-bold text-gray-900 flex-1">Live Crop Market Prices</span>
          <button onClick={() => setShowPredict(true)}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 active:scale-95 transition-all text-white text-sm font-bold px-4 py-2 rounded-xl cursor-pointer">
            <span>🔮</span> AI Forecast
          </button>
        </header>

        {/* AI Prediction Modal */}
        {showPredict && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
                <h3 className="text-white font-extrabold text-xl flex items-center gap-2"><span>🔮</span> Smart Price Prediction</h3>
                <button onClick={() => setShowPredict(false)} className="text-white hover:text-amber-200 text-2xl leading-none cursor-pointer">&times;</button>
              </div>
              <div className="p-6 overflow-y-auto">
                <form onSubmit={handlePredict} className="flex flex-col sm:flex-row gap-3 mb-6 items-end">
                  <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Select Crop to Forecast</label>
                    <input type="text" value={predictCrop} onChange={e => setPredictCrop(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-50 transition-all" />
                  </div>
                  <button type="submit" disabled={predictLoading}
                    className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-xl cursor-pointer transition-all disabled:opacity-70 h-[46px] flex items-center justify-center">
                    {predictLoading ? "Forecasting..." : "Generate 30-Day Forecast"}
                  </button>
                </form>

                {predictError && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl mb-4 font-semibold border border-red-100">{predictError}</p>}

                {forecast && !predictLoading && (
                  <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Best Time to Sell</p>
                        <p className="text-xl font-extrabold text-green-600">{forecast.best_time_to_sell}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Max Projected Price</p>
                        <p className="text-xl font-extrabold text-amber-600">₹{Math.round(forecast.max_price).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-800 mb-4 text-center">30-Day Price Forecast (₹ / Quintal)</h4>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={forecast.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="day" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                            <YAxis tick={{fontSize: 10}} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                            <Line type="monotone" dataKey="price" stroke="#d97706" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-5 max-w-5xl w-full mx-auto">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Mandi Prices Today</h1>
            <p className="text-sm text-gray-500 mt-1">Today's wholesale crop prices from major mandis across India.</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 flex-1 max-w-sm focus-within:border-amber-400 transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search crop..." className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400" />
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all capitalize
                    ${category === c ? "bg-amber-600 text-white border-amber-600" : "bg-white text-gray-600 border-gray-200 hover:border-amber-400"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><svg className="animate-spin w-10 h-10 text-amber-600" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {["Crop","Market","Min Price","Max Price","Modal Price","Trend","Change"].map(h => (
                        <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {prices.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-16 text-gray-400">No prices found</td></tr>
                    ) : prices.map(p => (
                      <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{p.emoji}</span>
                            <div>
                              <p className="font-bold text-gray-900">{p.cropName}</p>
                              <p className="text-xs text-gray-400 capitalize">{p.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-gray-700 font-medium">{p.market}</p>
                          <p className="text-xs text-gray-400">{p.state}</p>
                        </td>
                        <td className="px-4 py-4 text-gray-600">₹{p.minPrice.toLocaleString()}</td>
                        <td className="px-4 py-4 text-gray-600">₹{p.maxPrice.toLocaleString()}</td>
                        <td className="px-4 py-4 font-bold text-gray-900">₹{p.modalPrice.toLocaleString()}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 text-sm font-bold ${trendColor(p.trend)}`}>
                            {trendIcon(p.trend)} <span className="capitalize">{p.trend}</span>
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`font-bold ${p.changePercent > 0 ? "text-green-600" : p.changePercent < 0 ? "text-red-500" : "text-gray-400"}`}>
                            {p.changePercent > 0 ? "+" : ""}{p.changePercent}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
                Prices are indicative. Actual mandi prices may vary. Source: Agmarknet / Local mandis.
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
