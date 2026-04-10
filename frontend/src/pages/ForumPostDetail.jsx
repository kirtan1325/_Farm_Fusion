// frontend/src/pages/ForumPostDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPost, addComment, upvotePost, upvoteComment, deleteComment, resolvePost } from "../api/forumService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const getInitials = (name = "") => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });

export default function ForumPostDetail() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast    = useToast();

  const [post,       setPost]       = useState(null);
  const [comments,   setComments]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const data = await getPost(id);
      setPost(data.data);
      setComments(data.data.comments || []);
    } catch {
      toast.error("Post not found");
      navigate("/forum");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPost(); }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const data = await addComment(id, { content: newComment });
      setComments(prev => [...prev, data.data]);
      setNewComment("");
      toast.success("Comment added!");
    } catch { toast.error("Failed to add comment"); }
    finally { setSubmitting(false); }
  };

  const handleUpvotePost = async () => {
    try {
      const data = await upvotePost(id);
      setPost(prev => ({ ...prev, upvoteCount: data.upvoteCount }));
    } catch { toast.error("Failed to upvote"); }
  };

  const handleUpvoteComment = async (cid) => {
    try {
      const data = await upvoteComment(cid);
      setComments(prev => prev.map(c => c._id === cid ? { ...c, upvoteCount: data.upvoteCount } : c));
    } catch { toast.error("Failed to upvote"); }
  };

  const handleDeleteComment = async (cid) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(cid);
      setComments(prev => prev.filter(c => c._id !== cid));
      toast.success("Comment deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const handleResolve = async () => {
    try {
      await resolvePost(id);
      setPost(prev => ({ ...prev, isResolved: true }));
      toast.success("Post marked as resolved!");
    } catch { toast.error("Failed to mark resolved"); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <svg className="animate-spin w-10 h-10 text-orange-600" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  );

  if (!post) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 px-4 sm:px-6 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/forum")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 cursor-pointer font-medium">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Forum
        </button>
        <span className="text-gray-300">|</span>
        <span className="font-bold text-gray-900 flex-1 truncate">💬 Community Forum</span>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Post */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start gap-4">
            {/* Upvote */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <button onClick={handleUpvotePost}
                className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-all cursor-pointer text-gray-600 text-lg">
                ▲
              </button>
              <span className="text-sm font-bold text-gray-700">{post.upvoteCount || 0}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {post.isPinned    && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">📌 Pinned</span>}
                {post.isResolved  && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">✅ Resolved</span>}
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold capitalize">{post.category}</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-3">{post.title}</h1>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
              {post.imageUrl && (
                <div className="mt-4 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                  <img src={post.imageUrl} alt="Post content" className="w-full h-auto max-h-[400px] object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              )}

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-800 flex items-center justify-center text-white text-[9px] font-bold">{getInitials(post.author?.name)}</div>
                  <span className="font-medium text-gray-600">{post.author?.name}</span>
                  {post.author?.role === "admin" && <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">Expert</span>}
                </div>
                <span>{fmtDate(post.createdAt)}</span>
                <span>👁 {post.views} views</span>
                <span>💬 {comments.length} replies</span>

                {/* Owner actions */}
                {post.author?._id === user?._id && !post.isResolved && (
                  <button onClick={handleResolve}
                    className="ml-auto text-green-600 hover:text-green-800 font-semibold cursor-pointer text-xs border border-green-200 px-2 py-1 rounded-lg hover:bg-green-50 transition-all">
                    ✅ Mark Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div>
          <h2 className="font-bold text-gray-900 text-lg mb-3">{comments.length} Replies</h2>
          <div className="flex flex-col gap-3">
            {comments.map(c => (
              <div key={c._id} className={`bg-white rounded-2xl border shadow-sm p-5 ${c.isExpert ? "border-orange-200 bg-orange-50" : "border-gray-100"}`}>
                {c.isExpert && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">⭐ Expert Answer</span>
                  </div>
                )}
                <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{c.content}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-5 h-5 rounded-full bg-green-800 flex items-center justify-center text-white text-[9px] font-bold">{getInitials(c.author?.name)}</div>
                    <span className="font-medium text-gray-600">{c.author?.name}</span>
                    <span>{fmtDate(c.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleUpvoteComment(c._id)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-orange-600 cursor-pointer transition-colors">
                      ▲ {c.upvoteCount || 0}
                    </button>
                    {(c.author?._id === user?._id || user?.role === "admin") && (
                      <button onClick={() => handleDeleteComment(c._id)}
                        className="text-xs text-red-400 hover:text-red-600 cursor-pointer transition-colors">Delete</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add comment */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-3">Add Your Reply</h3>
          <form onSubmit={handleComment} className="flex flex-col gap-3">
            <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
              rows={4} placeholder="Share your knowledge or experience..." required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all resize-none" />
            <div className="flex justify-end">
              <button type="submit" disabled={submitting || !newComment.trim()}
                className="flex items-center gap-2 bg-green-800 hover:bg-green-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer disabled:opacity-50 transition-all">
                {submitting ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> : null}
                {submitting ? "Posting..." : "Post Reply"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}