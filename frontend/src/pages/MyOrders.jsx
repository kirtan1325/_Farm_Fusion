import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMyRequests, cancelRequest, payRequest } from "../api/requestService";
import { useAuth } from "../context/AuthContext";
import NegotiationModal from "../components/NegotiationModal";
import SharedSidebar from "../components/SharedSidebar";

// ── Icons ──────────────────────────────────────────────
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const BellIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const ChevLeft = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ChevRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);


const FILTER_TABS = ["All", "PENDING", "ACCEPTED", "REJECTED"];

const STATUS_UI = {
  pending:   { badge: "bg-yellow-100 text-yellow-800 border border-yellow-200", dot: "bg-yellow-400", label: "PENDING"  },
  accepted:  { badge: "bg-green-100 text-green-800 border border-green-200",   dot: "bg-green-500",  label: "ACCEPTED" },
  rejected:  { badge: "bg-red-100 text-red-700 border border-red-200",         dot: "bg-red-400",    label: "REJECTED" },
  cancelled: { badge: "bg-gray-100 text-gray-500 border border-gray-200",      dot: "bg-gray-400",   label: "CANCELLED"},
};

const BG_GRADIENTS = [
  "from-red-900 to-red-700", "from-amber-900 to-amber-700", "from-green-900 to-green-700",
  "from-orange-800 to-orange-600", "from-purple-900 to-purple-700", "from-teal-900 to-teal-700",
  "from-blue-900 to-blue-700", "from-lime-900 to-lime-700",
];

// ── Helpers ─────────────────────────────────────────────
const fmt     = (n) => `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const getInitials = (name = "") => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
const getBg = (id = "") => BG_GRADIENTS[id.charCodeAt(id.length - 1) % BG_GRADIENTS.length];


// ── Order Card ──────────────────────────────────────────
function OrderCard({ request, onCancel, onPay, onNegotiate, cancelling, paying }) {
  const ui = STATUS_UI[request.status] || STATUS_UI.pending;
  const isPaid = request.isPaid;
  const bg = getBg(request._id || "");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4 hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${bg} flex items-center justify-center text-4xl flex-shrink-0`}>
        {request.crop?.emoji || "🌾"}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-bold text-gray-900 text-base leading-tight">{request.crop?.name || "—"}</h3>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${ui.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${ui.dot}`} />
            {ui.label}
          </span>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          {[
            { label: "Farmer",       value: request.farmer?.name || "—" },
            { label: "Quantity",     value: `${request.quantity} ${request.unit}` },
            { label: "Total Price",  value: fmt(request.totalPrice) },
            { label: "Requested On", value: fmtDate(request.createdAt) },
          ].map(m => (
            <div key={m.label}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{m.label}</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Rejection reason banner */}
        {request.status === "rejected" && request.rejectedReason && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-3 text-xs text-red-700 font-medium">
            <AlertIcon />
            <span>Reason: {request.rejectedReason}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {request.status === "pending" && (
            <>
              <button onClick={onNegotiate} className="text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer px-4 py-2 rounded-xl">
                Chat/Bid
              </button>
              <button onClick={() => onCancel(request._id)} disabled={cancelling}
                className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1">
                {cancelling
                  ? <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  : null}
                Cancel
              </button>
            </>
          )}

          {request.status === "accepted" && !isPaid && (
            <>
              <button className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                View Contract
              </button>
              <button onClick={() => onPay(request._id)} disabled={paying}
                className="flex items-center gap-1.5 bg-green-800 hover:bg-green-900 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-60">
                {paying
                  ? <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  : null}
                {paying ? "Processing..." : "Make Payment"}
              </button>
            </>
          )}

          {request.status === "accepted" && isPaid && (
            <>
              <button className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                Track Delivery
              </button>
              <span className="text-sm font-semibold text-gray-400 bg-gray-100 border border-gray-200 px-4 py-2 rounded-xl">
                Paid ✓
              </span>
            </>
          )}

          {request.status === "rejected" && (
            <button className="text-sm font-semibold text-gray-700 border border-gray-200 hover:border-green-500 hover:text-green-800 px-4 py-2 rounded-xl transition-all cursor-pointer">
              Re-negotiate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────
export default function MyOrders() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeNav,    setActiveNav]    = useState("orders");
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [filter,       setFilter]       = useState("All");
  const [search,       setSearch]       = useState("");
  const [sortOrder,    setSortOrder]    = useState("Latest First");
  const [currentPage,  setCurrentPage]  = useState(1);

  // API state
  const [requests,   setRequests]   = useState([]);
  const [tabCounts,  setTabCounts]  = useState({ All: 0, PENDING: 0, ACCEPTED: 0, REJECTED: 0 });
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");

  // Per-action loading
  const [cancellingId, setCancellingId] = useState(null);
  const [payingId,     setPayingId]     = useState(null);
  const [negotiateTarget, setNegotiateTarget] = useState(null);

  const PER_PAGE = 4;

  const filterToStatus = {
    "All":      undefined,
    "PENDING":  "pending",
    "ACCEPTED": "accepted",
    "REJECTED": "rejected",
  };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [mainRes, allRes, pendRes, accRes, rejRes] = await Promise.all([
        getMyRequests({ status: filterToStatus[filter], page: currentPage, limit: PER_PAGE }),
        getMyRequests({ limit: 1 }),
        getMyRequests({ status: "pending",  limit: 1 }),
        getMyRequests({ status: "accepted", limit: 1 }),
        getMyRequests({ status: "rejected", limit: 1 }),
      ]);

      // Sort client-side
      let data = [...mainRes.data];
      if (sortOrder === "Oldest First")      data.reverse();
      if (sortOrder === "Price: High to Low") data.sort((a, b) => b.totalPrice - a.totalPrice);
      if (sortOrder === "Price: Low to High") data.sort((a, b) => a.totalPrice - b.totalPrice);

      // Client-side search
      if (search.trim()) {
        const s = search.toLowerCase();
        data = data.filter(r =>
          r.crop?.name?.toLowerCase().includes(s) ||
          r.farmer?.name?.toLowerCase().includes(s) ||
          r.farmer?.farmName?.toLowerCase().includes(s)
        );
      }

      setRequests(data);
      setTotalPages(mainRes.pages);
      setTotalItems(mainRes.total);
      setTabCounts({
        All:      allRes.total,
        PENDING:  pendRes.total,
        ACCEPTED: accRes.total,
        REJECTED: rejRes.total,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your orders.");
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, sortOrder, search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchRequests(), search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchRequests, search]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    setCancellingId(id);
    try {
      await cancelRequest(id);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel request.");
    } finally {
      setCancellingId(null);
    }
  };

  const handlePay = async (id) => {
    setPayingId(id);
    try {
      await payRequest(id, {
        paymentMethod: "card",
        transactionId: `TXN_${Date.now()}`,
      });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setPayingId(null);
    }
  };

  const handleFilterChange = (f) => {
    setFilter(f);
    setCurrentPage(1);
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {negotiateTarget && <NegotiationModal request={negotiateTarget} onClose={() => setNegotiateTarget(null)} isFarmer={false} />}
      <SharedSidebar activePath="/buyer/orders" open={sidebarOpen} setOpen={setSidebarOpen} user={user} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* ── Topbar ── */}
        <header className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-white border-b border-gray-100 sticky top-0 z-10 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 cursor-pointer mr-1"><MenuIcon /></button>

          {/* Search */}
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 max-w-lg focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search orders or crops..." value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400" />
          </div>

          {/* Bell */}
          <button className="relative w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
            <BellIcon />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </button>

          {/* New Request button */}
          <button onClick={() => navigate("/marketplace")}
            className="hidden sm:flex items-center gap-1.5 bg-green-800 hover:bg-green-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex-shrink-0">
            <PlusIcon />
            New Request
          </button>
        </header>

        {/* ── Body ── */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-5">

          {/* Page heading */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">My Purchase Requests</h1>
            <p className="text-sm text-gray-500 mt-1">Real-time tracking of your crop sourcing and negotiations.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center justify-between">
              {error}
              <button onClick={fetchRequests} className="text-xs font-semibold underline cursor-pointer ml-4">Retry</button>
            </div>
          )}

          {/* ── Controls ── */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2">
              {FILTER_TABS.map(f => {
                const countKey = f === "All" ? "All" : f;
                return (
                  <button key={f} onClick={() => handleFilterChange(f)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all cursor-pointer
                      ${filter === f
                        ? "bg-green-800 text-white border-green-800"
                        : "bg-white text-gray-600 border-gray-200 hover:border-green-500 hover:text-green-700"}`}>
                    {f === "All" ? "All Requests" : f.charAt(0) + f.slice(1).toLowerCase()}
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full
                      ${filter === f ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                      {tabCounts[countKey] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium whitespace-nowrap hidden sm:inline">Sort by:</span>
              <select value={sortOrder} onChange={e => { setSortOrder(e.target.value); setCurrentPage(1); }}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 bg-white outline-none focus:border-green-500 cursor-pointer">
                <option>Latest First</option>
                <option>Oldest First</option>
                <option>Price: High to Low</option>
                <option>Price: Low to High</option>
              </select>
            </div>
          </div>

          {/* ── Order cards list ── */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <svg className="animate-spin w-10 h-10 text-green-700" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100">
              <span className="text-5xl mb-4">📋</span>
              <p className="font-semibold text-gray-600 text-base">No requests found</p>
              <p className="text-sm text-gray-400 mt-1">
                {search
                  ? "Try a different search term."
                  : filter === "All"
                  ? "You haven't made any purchase requests yet."
                  : `No ${filter.toLowerCase()} requests.`}
              </p>
              {filter === "All" && !search && (
                <button onClick={() => navigate("/marketplace")}
                  className="mt-5 bg-green-800 hover:bg-green-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all cursor-pointer">
                  Browse Marketplace
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {requests.map(r => (
                <OrderCard
                  key={r._id}
                  request={r}
                  onCancel={handleCancel}
                  onPay={handlePay}
                  onNegotiate={() => setNegotiateTarget(r)}
                  cancelling={cancellingId === r._id}
                  paying={payingId === r._id}
                />
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between py-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Showing {Math.min((currentPage - 1) * PER_PAGE + 1, totalItems)}–{Math.min(currentPage * PER_PAGE, totalItems)} of {totalItems}
              </span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-500 hover:text-green-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors">
                  <ChevLeft />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setCurrentPage(p)}
                    className={`w-9 h-9 rounded-full text-sm font-semibold transition-all cursor-pointer
                      ${currentPage === p ? "bg-green-800 text-white" : "border border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-700"}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-500 hover:text-green-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors">
                  <ChevRight />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}