// frontend/src/pages/Notifications.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "../api/notificationService";
import { useNotifications } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import SharedSidebar from "../components/SharedSidebar";

const MenuIcon   = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);

const getInitials = (name = "") => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
const fmtDate    = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const TYPE_UI = {
  request_received:  { icon: "📋", bg: "bg-blue-50",   border: "border-blue-100"   },
  request_accepted:  { icon: "✅", bg: "bg-green-50",  border: "border-green-100"  },
  request_rejected:  { icon: "❌", bg: "bg-red-50",    border: "border-red-100"    },
  request_cancelled: { icon: "🚫", bg: "bg-gray-50",   border: "border-gray-100"   },
  payment_received:  { icon: "💰", bg: "bg-green-50",  border: "border-green-100"  },
  order_shipped:     { icon: "🚚", bg: "bg-blue-50",   border: "border-blue-100"   },
  order_delivered:   { icon: "📦", bg: "bg-green-50",  border: "border-green-100"  },
  system:            { icon: "🔔", bg: "bg-yellow-50", border: "border-yellow-100" },
};

export default function Notifications() {
  const { user, logout }    = useAuth();
  const navigate            = useNavigate();
  const toast               = useToast();
  const { refreshCount, badges } = useNotifications();

  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [notifications,setNotifications]= useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState("all");  // all | unread
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [unreadCount,  setUnreadCount]  = useState(0);

  const dashPath = user?.role === "farmer" ? "/farmer/dashboard" : "/buyer/dashboard";

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filter === "unread") params.unreadOnly = "true";
      const data = await getNotifications(params);
      setNotifications(data.data || []);
      setTotalPages(Math.max(1, Math.ceil((data.total || 0) / 15)));
      setUnreadCount(data.unreadCount || 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, [filter, page]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      refreshCount();
    } catch { toast.error("Failed to mark as read"); }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      refreshCount();
      toast.success("All notifications marked as read");
    } catch { toast.error("Failed to mark all as read"); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      refreshCount();
    } catch { toast.error("Failed to delete notification"); }
  };

  const handleClickNotification = async (notif) => {
    if (!notif.isRead) await handleMarkRead(notif._id);
    if (notif.link) navigate(notif.link);
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <SharedSidebar open={sidebarOpen} setOpen={setSidebarOpen} user={user} onLogout={handleLogout} activePath="/notifications" />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden cursor-pointer"><MenuIcon /></button>
          <span className="text-xl">🔔</span>
          <span className="font-bold text-gray-900 flex-1">Notifications</span>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead}
              className="text-xs font-semibold text-green-700 hover:text-green-900 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-all cursor-pointer">
              Mark all read
            </button>
          )}
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-5 max-w-3xl w-full mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-500 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
              </p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
            {[{ id: "all", label: "All" }, { id: "unread", label: `Unread ${unreadCount > 0 ? `(${unreadCount})` : ""}` }].map(f => (
              <button key={f.id} onClick={() => { setFilter(f.id); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
                  ${filter === f.id ? "bg-white text-yellow-800 shadow font-semibold" : "text-gray-500 hover:text-gray-700"}`}>
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <svg className="animate-spin w-10 h-10 text-yellow-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-6xl mb-3">🔔</div>
              <p className="font-semibold text-gray-500 text-lg">No notifications</p>
              <p className="text-sm mt-1">{filter === "unread" ? "No unread notifications." : "You're all caught up!"}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {notifications.map(notif => {
                const ui = TYPE_UI[notif.type] || TYPE_UI.system;
                return (
                  <div key={notif._id}
                    className={`relative flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md
                      ${notif.isRead ? "bg-white border-gray-100" : `${ui.bg} ${ui.border}`}`}
                    onClick={() => handleClickNotification(notif)}>

                    {/* Unread dot */}
                    {!notif.isRead && (
                      <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0" />
                    )}

                    {/* Icon */}
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                      {ui.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <p className={`text-sm leading-snug ${notif.isRead ? "text-gray-700" : "text-gray-900 font-semibold"}`}>
                        <span className="font-bold">{notif.title}</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1.5">{fmtDate(notif.createdAt)}</p>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(notif._id); }}
                      className="absolute top-3 right-8 text-gray-300 hover:text-red-500 transition-colors cursor-pointer text-lg leading-none opacity-0 group-hover:opacity-100 hover:opacity-100">
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-yellow-400 hover:text-yellow-600 disabled:opacity-30 cursor-pointer transition-all">‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-full text-sm font-semibold cursor-pointer transition-all
                    ${page === p ? "bg-yellow-500 text-white" : "border border-gray-200 text-gray-600 hover:border-yellow-400"}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-yellow-400 hover:text-yellow-600 disabled:opacity-30 cursor-pointer transition-all">›</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
