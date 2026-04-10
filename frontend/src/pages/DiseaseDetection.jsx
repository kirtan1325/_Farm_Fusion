import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { detectDisease } from "../api/mlService";
import { useAuth } from "../context/AuthContext";
import SharedSidebar from "../components/SharedSidebar";

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const getInitials = (name = "") => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

export default function DiseaseDetection() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl]     = useState("");
  const [loading, setLoading]           = useState(false);
  const [result, setResult]             = useState(null);
  const [error, setError]               = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please upload a valid image file.");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError("");
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      const data = await detectDisease(formData);
      if (data.success) {
        setResult(data);
      } else {
        setError("Analysis failed. Try again.");
      }
    } catch (err) {
      setError("Could not connect to the ML Service. Ensure it's running.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <SharedSidebar activePath="/disease-detection" open={sidebarOpen} setOpen={setSidebarOpen} user={user} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="flex items-center gap-3 px-4 sm:px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden cursor-pointer"><MenuIcon /></button>
          <span className="text-xl">🍃</span>
          <span className="font-bold text-gray-900 flex-1">AI Disease Detection</span>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-8 max-w-5xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Crop Health Scanner</h1>
            <p className="text-gray-500 mt-2 text-sm">Upload a photo of a diseased or pest-infested plant leaf to instantly identify the issue and get organic/chemical remedies.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Upload Area */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              
              {!previewUrl ? (
                <div onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-square border-2 border-dashed border-rose-200 rounded-2xl bg-rose-50/50 flex flex-col items-center justify-center cursor-pointer hover:bg-rose-50 transition-colors group">
                  <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">📸</div>
                  <p className="font-bold text-rose-900">Tap to Upload Photo</p>
                  <p className="text-xs text-rose-500 mt-2 font-medium">JPEG, PNG or WebP</p>
                </div>
              ) : (
                <div className="w-full relative rounded-2xl overflow-hidden shadow-inner group">
                  <img src={previewUrl} alt="Crop Leaf" className="w-full h-auto aspect-square object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button onClick={() => fileInputRef.current?.click()} className="bg-white text-gray-800 text-xs font-bold px-4 py-2 rounded-lg hover:scale-105 transition-transform cursor-pointer">Change</button>
                    <button onClick={clearSelection} className="bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:scale-105 transition-transform cursor-pointer">Remove</button>
                  </div>
                </div>
              )}

              {error && <p className="text-red-500 text-sm mt-4 font-semibold text-center w-full">{error}</p>}

              <button onClick={handleAnalyze} disabled={!selectedFile || loading}
                className="w-full mt-6 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-rose-600/20">
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : "🔍 Analyze Image"}
              </button>
            </div>

            {/* Results Area */}
            <div className={`transition-all duration-500 ${result ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}`}>
              {result && (
                <div className="bg-gradient-to-br from-rose-900 to-red-900 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden h-full">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mx-20 -my-20 pointer-events-none" />
                  
                  <div className="relative z-10">
                    <p className="text-rose-200 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Analysis Complete
                    </p>
                    <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                       {result.disease === "Healthy" ? "✅" : "⚠️"} {result.disease}
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                        <p className="text-rose-200 text-xs font-bold uppercase tracking-wider mb-1">Recommended Treatment</p>
                        <p className="font-semibold">{result.treatment}</p>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                        <p className="text-rose-200 text-xs font-bold uppercase tracking-wider mb-1">Organic Alternative</p>
                        <p className="font-semibold text-green-300">{result.organic_alternatives}</p>
                      </div>
                    </div>

                    <p className="text-[10px] text-rose-300/60 mt-6 text-center">Powered by Deep Convolutional Neural Networks</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
