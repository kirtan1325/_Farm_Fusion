// frontend/src/pages/Forum.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPosts, createPost, upvotePost, deletePost } from "../api/forumService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import SharedSidebar from "../components/SharedSidebar";

const MenuIcon   = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
const PlusIcon   = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);

const getInitials = (name = "") => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

const CATEGORIES = ["All","general","disease","weather","market","technique","equipment","other"];
const CAT_COLORS = {
  general: "bg-gray-100 text-gray-700", disease: "bg-red-100 text-red-700",
  weather: "bg-blue-100 text-blue-700", market: "bg-green-100 text-green-700",
  technique: "bg-purple-100 text-purple-700", equipment: "bg-orange-100 text-orange-700",
  other: "bg-gray-100 text-gray-700",
};
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });

export default function Forum() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast    = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posts,     setPosts]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [category,  setCategory]  = useState("All");
  const [page,      setPage]      = useState(1);
  const [totalPages,setTotalPages]= useState(1);
  const [showNew,   setShowNew]   = useState(false);

  // New post form
  const [newTitle,   setNewTitle]   = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCat,     setNewCat]     = useState("general");
  const [newImage,   setNewImage]   = useState("");
  const [submitting, setSubmitting] = useState(false);

  const dashPath = user?.role === "farmer" ? "/farmer/dashboard" : "/buyer/dashboard";

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (category !== "All") params.category = category;
      if (search.trim())      params.search    = search.trim();
      const data = await getPosts(params);
      setPosts(data.data || []);
      setTotalPages(data.pages || 1);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(fetchPosts, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [category, search, page]);

  const handleUpvote = async (id) => {
    try {
      const res = await upvotePost(id);
      setPosts(prev => prev.map(p => p._id === id ? { ...p, upvoteCount: res.upvoteCount } : p));
    } catch { toast.error("Failed to upvote"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await deletePost(id);
      setPosts(prev => prev.filter(p => p._id !== id));
      toast.success("Post deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) { toast.error("Title and content are required"); return; }
    setSubmitting(true);
    try {
      const data = await createPost({ title: newTitle, content: newContent, category: newCat, imageUrl: newImage.trim() });
      setPosts(prev => [data.data, ...prev]);
      setNewTitle(""); setNewContent(""); setNewCat("general"); setNewImage("");
      setShowNew(false);
      toast.success("Post published!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post");
    } finally { setSubmitting(false); }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <SharedSidebar open={sidebarOpen} setOpen={setSidebarOpen} user={user} onLogout={handleLogout} activePath="/forum" />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden cursor-pointer"><MenuIcon /></button>
          <span className="text-xl">💬</span>
          <span className="font-bold text-gray-900 flex-1">Community Forum</span>
          <button onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 bg-green-800 hover:bg-green-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition-all">
            <PlusIcon /> Ask Question
          </button>
        </header>

        {/* New post modal */}
        {showNew && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-lg">Ask the Community</h3>
                <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer text-2xl leading-none">&times;</button>
              </div>
              <form onSubmit={handleSubmitPost} className="p-6 flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Category</label>
                  <select value={newCat} onChange={e => setNewCat(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 cursor-pointer">
                    {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Title *</label>
                  <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Why are my tomato leaves yellowing?" required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Description *</label>
                  <textarea value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} placeholder="Describe your question in detail..." required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all resize-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Image URL (Optional)</label>
                  <input value={newImage} onChange={e => setNewImage(e.target.value)} placeholder="https://example.com/leaf-disease.jpg" type="url"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowNew(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-2.5 bg-green-800 hover:bg-green-900 text-white rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
                    {submitting ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> : null}
                    {submitting ? "Posting..." : "Post Question"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-5 max-w-4xl w-full mx-auto">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Community Forum</h1>
            <p className="text-sm text-gray-500 mt-1">Ask questions, share knowledge, help each other grow.</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 flex-1 max-w-sm focus-within:border-orange-400 transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..." className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400" />
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer capitalize transition-all
                    ${category === c ? "bg-orange-600 text-white border-orange-600" : "bg-white text-gray-600 border-gray-200 hover:border-orange-400"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><svg className="animate-spin w-10 h-10 text-orange-600" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-3">💬</div><p className="font-semibold">No posts yet</p>
              <button onClick={() => setShowNew(true)} className="mt-4 bg-green-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer hover:bg-green-900">Be the first to ask!</button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {posts.map(p => (
                <div key={p._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/forum/${p._id}`)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {p.isPinned && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">📌 Pinned</span>}
                        {p.isResolved && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">✅ Resolved</span>}
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${CAT_COLORS[p.category] || CAT_COLORS.other}`}>{p.category}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-base leading-tight hover:text-green-800 transition-colors">{p.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.content}</p>
                      {p.imageUrl && (
                        <div className="mt-2 text-xs font-semibold text-orange-600 flex items-center gap-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          Contains Image
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-green-800 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">{getInitials(p.author?.name)}</div>
                          <span className="font-medium text-gray-600">{p.author?.name}</span>
                          <span className={`capitalize px-1.5 py-0.5 rounded-full text-[10px] font-bold ${p.author?.role === "admin" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}>{p.author?.role}</span>
                        </div>
                        <span>{fmtDate(p.createdAt)}</span>
                        <span>👁 {p.views}</span>
                        <span>💬 {p.commentCount || 0}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1 flex-shrink-0" onClick={e => { e.stopPropagation(); handleUpvote(p._id); }}>
                      <button className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all cursor-pointer text-gray-600">▲</button>
                      <span className="text-xs font-bold text-gray-600">{p.upvoteCount || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-600 disabled:opacity-30 cursor-pointer transition-all">‹</button>
              {Array.from({length: totalPages}, (_, i) => i+1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-full text-sm font-semibold cursor-pointer transition-all ${page===p ? "bg-orange-600 text-white" : "border border-gray-200 text-gray-600 hover:border-orange-400"}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-600 disabled:opacity-30 cursor-pointer transition-all">›</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
