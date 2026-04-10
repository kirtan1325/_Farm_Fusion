import { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { PlusCircle, Trash2, ArrowLeft } from "lucide-react";

export default function InventoryTracker() {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({ totalCost: 0, categoryData: [] });
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [formData, setFormData] = useState({
    category: "Seed",
    itemName: "",
    quantity: "",
    unit: "kg",
    cost: "",
    cropRef: ""
  });

  const fetchExpenses = async () => {
    try {
      const { data } = await api.get("/inventory");
      if (data.success) setExpenses(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/inventory/stats");
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchExpenses(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/inventory", {
        ...formData,
        quantity: Number(formData.quantity),
        cost: Number(formData.cost)
      });
      
      if (data.success) {
        toast.success("Expense added successfully!");
        setFormData({ ...formData, itemName: "", quantity: "", cost: "", cropRef: "" });
        fetchExpenses();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add expense");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      const { data } = await api.delete(`/inventory/${id}`);
      if (data.success) {
        toast.success("Expense deleted");
        fetchExpenses();
        fetchStats();
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#6b7280"];

  if (loading) return <div className="p-8 text-center text-gray-500">Loading inventory data...</div>;

  return (
    <div className="container p-6 mx-auto max-w-7xl animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/farmer/dashboard" className="p-2 text-gray-600 transition-colors bg-gray-100 rounded-full hover:bg-gray-200">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Smart Inventory Tracker</h1>
          <p className="text-gray-500">Track and analyze your farming expenses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Add Form */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
          <h2 className="mb-4 text-xl font-semibold">Add Expense</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm text-gray-600">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-green-500">
                <option>Seed</option>
                <option>Fertilizer</option>
                <option>Pesticide</option>
                <option>Labor</option>
                <option>Equipment</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm text-gray-600">Item Name</label>
              <input required type="text" name="itemName" value={formData.itemName} onChange={handleChange} placeholder="e.g. Urea 46%, Tractor Rent" className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-green-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm text-gray-600">Quantity</label>
                <input required type="number" min="0.1" step="0.1" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-600">Unit</label>
                <select name="unit" value={formData.unit} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-green-500">
                  <option>kg</option>
                  <option>liters</option>
                  <option>bags</option>
                  <option>hours</option>
                  <option>days</option>
                  <option>units</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm text-gray-600">Total Cost (₹)</label>
              <input required type="number" min="1" name="cost" value={formData.cost} onChange={handleChange} placeholder="5000" className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block mb-1 text-sm text-gray-600">Crop (Optional)</label>
              <input type="text" name="cropRef" value={formData.cropRef} onChange={handleChange} placeholder="e.g. Kharif Cotton 2024" className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-green-500" />
            </div>
            <button type="submit" className="flex items-center justify-center w-full gap-2 p-3 text-white transition-opacity bg-green-600 rounded-lg hover:bg-green-700">
              <PlusCircle size={20} />
              Add Expense
            </button>
          </form>
        </div>

        {/* Analytics & List */}
        <div className="space-y-8 lg:col-span-2">
          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-700">Expense Breakdown</h3>
              <div className="h-64">
                {stats.categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {stats.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No data available</div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col justify-center p-6 text-center text-white bg-gradient-to-br from-green-500 to-emerald-700 shadow-sm rounded-xl">
              <h3 className="text-lg font-medium opacity-90">Total Expenses</h3>
              <p className="mt-2 font-bold text-5xl">₹{stats.totalCost.toLocaleString()}</p>
              <p className="mt-4 text-sm opacity-80">Track costs effectively to maximize profits when selling crops.</p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl">
            <h3 className="p-6 pb-4 text-lg font-semibold border-b border-gray-100">Recent Expenses</h3>
            {expenses.length === 0 ? (
               <p className="p-6 text-gray-500">No expenses recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm">
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium">Item & Category</th>
                      <th className="p-4 font-medium">Quantity</th>
                      <th className="p-4 font-medium">Cost</th>
                      <th className="p-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100">
                    {expenses.map((exp) => (
                      <tr key={exp._id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-gray-500">{new Date(exp.date).toLocaleDateString()}</td>
                        <td className="p-4">
                          <p className="font-medium text-gray-800">{exp.itemName}</p>
                          <p className="text-xs text-gray-500">{exp.category} {exp.cropRef ? `• ${exp.cropRef}` : ''}</p>
                        </td>
                        <td className="p-4 text-gray-600">{exp.quantity} {exp.unit}</td>
                        <td className="p-4 font-medium text-red-600">₹{exp.cost.toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDelete(exp._id)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
