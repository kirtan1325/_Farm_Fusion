// frontend/src/pages/Weather.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getWeather, getForecast } from "../api/weatherService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import SharedSidebar from "../components/SharedSidebar";

const MenuIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
const SearchIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);

const getInitials = (name = "") => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

const WEATHER_ICONS = {
  "01d": "☀️", "01n": "🌙", "02d": "⛅", "02n": "⛅",
  "03d": "☁️", "03n": "☁️", "04d": "☁️", "04n": "☁️",
  "09d": "🌧️", "09n": "🌧️", "10d": "🌦️", "10n": "🌧️",
  "11d": "⛈️", "11n": "⛈️", "13d": "❄️", "13n": "❄️",
  "50d": "🌫️", "50n": "🌫️",
};

const POPULAR_CITIES = ["Ahmedabad", "Mumbai", "Delhi", "Pune", "Surat", "Jaipur", "Lucknow", "Nagpur", "Bhopal", "Indore"];

export default function Weather() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const toast     = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [city,    setCity]    = useState("Ahmedabad");
  const [input,   setInput]   = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast,setForecast]= useState([]);
  const [loading, setLoading] = useState(true);

  const dashPath = user?.role === "farmer" ? "/farmer/dashboard" : "/buyer/dashboard";

  const fetchWeather = async (c) => {
    setLoading(true);
    try {
      const [w, f] = await Promise.all([getWeather({ city: c }), getForecast({ city: c })]);
      setWeather(w.data);
      setForecast(f.data || []);
      if (w.mock) toast.info("Showing sample weather — add WEATHER_API_KEY to .env for real data");
    } catch (err) {
      toast.error(err.response?.data?.message || "City not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWeather(city); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setCity(input.trim());
    fetchWeather(input.trim());
    setInput("");
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const FARM_ADVICE = (temp, desc) => {
    const d = desc?.toLowerCase() || "";
    if (d.includes("rain") || d.includes("drizzle")) return { icon: "🌧️", msg: "Heavy Rain Alert! Delay irrigation by 2 days. Avoid spraying pesticides today as rain will wash them off.", color: "bg-blue-50 border-blue-200 text-blue-800", isAlert: true };
    if (d.includes("storm") || d.includes("thunder"))  return { icon: "⛈️", msg: "Storm Alert! Stay safe — avoid field work and secure equipment.", color: "bg-red-50 border-red-200 text-red-800", isAlert: true };
    if (temp > 38)  return { icon: "🌡️", msg: "Heatwave Alert! Very hot. Irrigate crops in early morning or evening to prevent water stress.", color: "bg-orange-50 border-orange-200 text-orange-800", isAlert: true };
    if (temp < 10)  return { icon: "❄️", msg: "Frost Alert! Cold wave expected. Protect sensitive crops with mulching or light evening irrigation.", color: "bg-indigo-50 border-indigo-200 text-indigo-800", isAlert: true };
    return { icon: "✅", msg: "Good weather for field work and crop spraying today. Maintain standard irrigation schedule.", color: "bg-green-50 border-green-200 text-green-800", isAlert: false };
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <SharedSidebar activePath="/weather" open={sidebarOpen} setOpen={setSidebarOpen} user={user} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden cursor-pointer"><MenuIcon /></button>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xl">🌦️</span>
            <span className="font-bold text-gray-900">Weather Information</span>
          </div>
          {/* Search */}
          <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 w-56 focus-within:border-blue-400 transition-all">
            <SearchIcon />
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Search city..." className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400" />
          </form>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 max-w-5xl w-full mx-auto">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Weather for Farmers</h1>
            <p className="text-sm text-gray-500 mt-1">Location-based weather to plan your farming activities.</p>
          </div>

          {/* Mobile search */}
          <form onSubmit={handleSearch} className="sm:hidden flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 focus-within:border-blue-400 transition-all">
            <SearchIcon />
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Search city..." className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400" />
            <button type="submit" className="text-xs font-semibold text-blue-600 cursor-pointer">Search</button>
          </form>

          {/* Popular cities */}
          <div className="flex flex-wrap gap-2">
            {POPULAR_CITIES.map(c => (
              <button key={c} onClick={() => { setCity(c); fetchWeather(c); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer
                  ${city === c ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-700"}`}>
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <svg className="animate-spin w-10 h-10 text-blue-600" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            </div>
          ) : weather ? (
            <>
              {/* Main weather card */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-3xl font-extrabold">{weather.city}, {weather.country}</h2>
                    <p className="text-blue-200 text-sm mt-1 capitalize">{weather.description}</p>
                    <div className="flex items-end gap-2 mt-4">
                      <span className="text-7xl font-black">{weather.temp}°</span>
                      <span className="text-blue-200 text-lg mb-3">Feels like {weather.feelsLike}°C</span>
                    </div>
                  </div>
                  <span className="text-8xl">{WEATHER_ICONS[weather.icon] || "🌡️"}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-white/20">
                  {[
                    { label: "Humidity",    value: `${weather.humidity}%`,       icon: "💧" },
                    { label: "Wind Speed",  value: `${weather.windSpeed} m/s`,    icon: "💨" },
                    { label: "Sunrise",     value: weather.sunrise,              icon: "🌅" },
                    { label: "Sunset",      value: weather.sunset,               icon: "🌇" },
                  ].map(s => (
                    <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
                      <div className="text-xl mb-1">{s.icon}</div>
                      <div className="text-sm font-bold">{s.value}</div>
                      <div className="text-xs text-blue-200">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Farming advice */}
              {(() => { const advice = FARM_ADVICE(weather.temp, weather.description);
                return (
                  <div className={`flex items-start sm:items-center gap-3 px-5 py-4 rounded-xl border text-sm font-medium ${advice.color} ${advice.isAlert ? 'shadow-sm animate-pulse-slow ring-1 ring-opacity-50' : ''}`}>
                    <span className="text-3xl flex-shrink-0 mt-1 sm:mt-0">{advice.icon}</span>
                    <div>
                      <p className={`font-bold mb-0.5 uppercase tracking-wide text-xs ${advice.isAlert ? '' : 'opacity-70'}`}>
                        {advice.isAlert ? "🚨 Critical Alert" : "Today's Farming Advice"}
                      </p>
                      <p className={advice.isAlert ? "text-base" : ""}>{advice.msg}</p>
                    </div>
                  </div>
                );
              })()}

              {/* 5-day forecast */}
              {forecast.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-3">5-Day Forecast</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {forecast.map((f, i) => (
                      <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                        <p className="text-xs text-gray-400 mb-1 font-medium">{f.time?.split(" ")[0] || `Day ${i+1}`}</p>
                        <div className="text-3xl my-2">{WEATHER_ICONS[f.icon] || "🌡️"}</div>
                        <p className="font-bold text-xl text-gray-900">{f.temp}°C</p>
                        <p className="text-xs text-gray-400 capitalize mt-1">{f.description}</p>
                        <p className="text-xs text-blue-500 mt-1">💧 {f.humidity}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
