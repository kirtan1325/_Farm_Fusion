import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { predictCrop } from "../api/mlService";
import { useAuth } from "../context/AuthContext";
import SharedSidebar from "../components/SharedSidebar";

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const getInitials = (name = "") => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

export default function CropRecommendation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [form, setForm] = useState({ soil_type: "Loamy", season: "Kharif", location: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState("");

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await predictCrop({
        soil_type: form.soil_type,
        season: form.season,
        location: form.location || user?.location || "Unknown"
      });
      if (data.success) {
        setResult(data);
      } else {
        setError("Prediction failed.");
      }
    } catch (err) {
      setError("Unable to connect to ML service. Is it running on port 5001?");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <SharedSidebar activePath="/crop-recommendation" open={sidebarOpen} setOpen={setSidebarOpen} user={user} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        <header className="flex items-center gap-3 px-4 sm:px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden cursor-pointer"><MenuIcon /></button>
          <span className="text-xl">🤖</span>
          <span className="font-bold text-gray-900 flex-1">AI Crop Recommendation</span>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-8 max-w-4xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">What should you plant?</h1>
            <p className="text-gray-500 mt-2 text-sm">Use our AI model to predict the most profitable crop based on your local conditions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative items-start">
            {/* Input Form */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -z-0"></div>
              <form onSubmit={handlePredict} className="relative z-10 flex flex-col gap-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Soil Type</label>
                  <select value={form.soil_type} onChange={e => setForm({...form, soil_type: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-50 transition-all cursor-pointer">
                    {["Loamy", "Clay", "Sandy", "Peaty", "Saline", "Silty"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Season</label>
                  <select value={form.season} onChange={e => setForm({...form, season: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-50 transition-all cursor-pointer">
                    {["Kharif", "Rabi", "Zaid", "Year-round"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Location (State/District)</label>
                  <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder={user?.location || "e.g. Punjab"}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-50 transition-all" />
                </div>
                
                {error && <div className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}

                <button type="submit" disabled={loading}
                  className="mt-2 w-full bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 cursor-pointer">
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : "🔮 Generate Prediction"}
                </button>
              </form>
            </div>

            {/* Results Area */}
            <div className={`transition-all duration-500 ${result ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}`}>
              {result && (
                <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden h-full">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mx-20 -my-20 pointer-events-none" />
                  
                  <div className="relative z-10">
                    <p className="text-purple-200 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> AI Confidence: {result.confidence}%
                    </p>
                    <h2 className="text-4xl font-black mb-6 flex items-center gap-3">
                      <span>🌾</span> {result.recommended_crop}
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                        <p className="text-purple-200 text-xs font-bold uppercase tracking-wider mb-1">Recommended Fertilizer</p>
                        <p className="font-semibold">{result.fertilizer}</p>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                        <p className="text-purple-200 text-xs font-bold uppercase tracking-wider mb-1">Irrigation Schedule</p>
                        <p className="font-semibold">{result.irrigation_schedule}</p>
                      </div>
                    </div>

                    <p className="text-[10px] text-purple-300/60 mt-6 text-center">Prediction based on historical yield data & ML metrics</p>
                  </div>
                </div>
              )}
              {!result && !loading && (
                 <div className="h-full border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center p-8 text-center bg-gray-50/50">
                    <div>
                      <div className="text-5xl opacity-40 mb-3">🌱</div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Awaiting Input</p>
                      <p className="text-xs text-gray-400 mt-2">Fill the form to see AI insights.</p>
                    </div>
                 </div>
              )}
              {!result && loading && (
                <div className="h-full border border-purple-100 rounded-3xl flex flex-col items-center justify-center p-8 text-center bg-purple-50/50">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-purple-200 rounded-full animate-ping"></div>
                    <div className="absolute inset-2 border-4 border-purple-600 rounded-full animate-spin border-t-transparent"></div>
                  </div>
                  <p className="text-sm font-bold text-purple-700 uppercase tracking-widest mt-6">Analyzing Soil Data...</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
