import { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { ArrowLeft, UploadCloud, FileText, Droplets, Leaf, Activity } from "lucide-react";

export default function SoilHealthCard() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [formData, setFormData] = useState({
    location: "",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    phLevel: "",
    organicCarbon: ""
  });

  const fetchTests = async () => {
    try {
      const { data } = await api.get("/soil-health");
      if (data.success) setTests(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTests(); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/soil-health", {
        ...formData,
        nitrogen: Number(formData.nitrogen),
        phosphorus: Number(formData.phosphorus),
        potassium: Number(formData.potassium),
        phLevel: Number(formData.phLevel),
        organicCarbon: Number(formData.organicCarbon || 0)
      });
      
      if (data.success) {
        toast.success("Soil test uploaded & analyzed successfully!");
        setFormData({ location: "", nitrogen: "", phosphorus: "", potassium: "", phLevel: "", organicCarbon: "" });
        fetchTests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit test");
    }
  };

  const getHealthColor = (score) => {
    if (score >= 85) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading soil data...</div>;

  return (
    <div className="container p-6 mx-auto max-w-7xl animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/farmer/dashboard" className="p-2 text-gray-600 transition-colors bg-gray-100 rounded-full hover:bg-gray-200">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Soil Health Digital Card</h1>
          <p className="text-gray-500">Upload test data to auto-generate government-style health reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Upload Form */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl h-fit">
          <div className="flex items-center gap-2 mb-4">
            <UploadCloud className="text-amber-600" />
            <h2 className="text-xl font-semibold">Upload Test Data</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm text-gray-600">Sample Location / Plot Name</label>
              <input required type="text" name="location" value={formData.location} onChange={handleChange} placeholder="North Field A" className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-amber-500" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block mb-1 text-sm text-gray-600">Nitrogen (N)</label>
                <input required type="number" name="nitrogen" value={formData.nitrogen} onChange={handleChange} placeholder="kg/ha" className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-600">Phosphorus (P)</label>
                <input required type="number" name="phosphorus" value={formData.phosphorus} onChange={handleChange} placeholder="kg/ha" className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-600">Potassium (K)</label>
                <input required type="number" name="potassium" value={formData.potassium} onChange={handleChange} placeholder="kg/ha" className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-amber-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm text-gray-600">pH Level</label>
                <input required type="number" step="0.1" name="phLevel" value={formData.phLevel} onChange={handleChange} placeholder="6.5" className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-600">Organic Carbon (%)</label>
                <input type="number" step="0.1" name="organicCarbon" value={formData.organicCarbon} onChange={handleChange} placeholder="0.5" className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-amber-500" />
              </div>
            </div>
            <button type="submit" className="w-full py-3 mt-4 text-white transition-colors rounded-lg bg-amber-600 hover:bg-amber-700 font-semibold">
              Generate Health Card
            </button>
          </form>
        </div>

        {/* Digital Cards */}
        <div className="space-y-6 lg:col-span-2">
          {tests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 p-8 text-gray-400 bg-white border border-dashed border-gray-200 rounded-xl">
              <FileText size={48} className="mb-4 opacity-50" />
              <p>No soil tests recorded yet. Upload data to generate your first digital card.</p>
            </div>
          ) : (
            tests.map(test => (
              <div key={test._id} className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl relative">
                {/* Gov style header */}
                <div className="p-4 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/250px-Emblem_of_India.svg.png" alt="Emblem" className="h-10 opacity-80 mix-blend-multiply" />
                    <div>
                      <h3 className="font-bold text-gray-800 tracking-wide uppercase">Soil Health Card</h3>
                      <p className="text-xs text-amber-700 font-medium">Auto-Generated Report</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">{test.location}</p>
                    <p className="text-xs text-gray-500">{new Date(test.sampleDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap gap-6 items-start">
                    {/* Gauge/Score */}
                    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl min-w-[120px]">
                      <span className={`text-4xl font-extrabold ${getHealthColor(test.healthScore).split(' ')[0]}`}>
                        {test.healthScore}
                      </span>
                      <span className="text-xs font-bold text-gray-500 uppercase mt-1">Health Score</span>
                    </div>

                    {/* NPK Grid */}
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-3 bg-blue-50 bg-opacity-50 rounded-lg border border-blue-100 items-center justify-between flex flex-col">
                        <span className="text-xs font-semibold text-blue-600 uppercase">Nitrogen</span>
                        <span className="text-lg font-bold text-gray-800">{test.nitrogen} <span className="text-xs text-gray-500 font-normal">kg/ha</span></span>
                      </div>
                      <div className="p-3 bg-orange-50 bg-opacity-50 rounded-lg border border-orange-100 items-center justify-between flex flex-col">
                        <span className="text-xs font-semibold text-orange-600 uppercase">Phosphorus</span>
                        <span className="text-lg font-bold text-gray-800">{test.phosphorus} <span className="text-xs text-gray-500 font-normal">kg/ha</span></span>
                      </div>
                      <div className="p-3 bg-red-50 bg-opacity-50 rounded-lg border border-red-100 items-center justify-between flex flex-col">
                        <span className="text-xs font-semibold text-red-600 uppercase">Potassium</span>
                        <span className="text-lg font-bold text-gray-800">{test.potassium} <span className="text-xs text-gray-500 font-normal">kg/ha</span></span>
                      </div>
                      <div className="p-3 bg-emerald-50 bg-opacity-50 rounded-lg border border-emerald-100 items-center justify-between flex flex-col">
                        <span className="text-xs font-semibold text-emerald-600 uppercase">pH Level</span>
                        <span className="text-lg font-bold text-gray-800">{test.phLevel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Deficiencies */}
                    <div className="p-4 border border-red-100 bg-red-50/30 rounded-xl">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-red-800 mb-3 uppercase tracking-wider">
                        <Activity size={16} /> Key Deficiencies
                      </h4>
                      {test.deficiencies?.length > 0 ? (
                        <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                          {test.deficiencies.map(d => <li key={d}>{d}</li>)}
                        </ul>
                      ) : (
                        <p className="text-sm text-green-600 font-medium">No major deficiencies detected.</p>
                      )}
                    </div>

                    {/* Recommendations */}
                    <div className="p-4 border border-emerald-100 bg-emerald-50/30 rounded-xl">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-800 mb-3 uppercase tracking-wider">
                        <Leaf size={16} /> Recommendations
                      </h4>
                      <div className="space-y-3 text-sm">
                        {test.recommendations?.fertilizers?.length > 0 && (
                          <div>
                            <span className="font-semibold text-gray-700 block mb-1 text-xs">Recommended Fertilizers:</span>
                            <div className="flex flex-wrap gap-2">
                              {test.recommendations.fertilizers.map(f => (
                                <span key={f} className="px-2 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-md text-xs font-medium">{f}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {test.recommendations?.crops?.length > 0 && (
                          <div>
                            <span className="font-semibold text-gray-700 block mb-1 text-xs mt-2">Suitable Crops:</span>
                            <div className="flex flex-wrap gap-2">
                              {test.recommendations.crops.map(c => (
                                <span key={c} className="px-2 py-1 bg-white border border-blue-200 text-blue-700 rounded-md text-xs font-medium">{c}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
      </div>
    </div>
  );
}
