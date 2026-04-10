import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

const getInitials = (name = "") => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

const LogoutIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);

export default function SharedSidebar({ activePath, open, setOpen, user, onLogout }) {
  const navigate = useNavigate();
  const { badges } = useNotifications();

  const buyerLinks = [
    { label: "Dashboard",   path: "/buyer/dashboard" },
    { label: "Marketplace", path: "/marketplace" },
    { label: "My Orders",   path: "/buyer/orders" },
    { label: "Messages",    path: "/messages" },
    { label: "Notifications", path: "/notifications" },
    { label: "Forum",       path: "/forum" },
    { label: "Settings",    path: "/buyer/settings" },
  ];

  const farmerLinks = [
    { label: "Dashboard",     path: "/farmer/dashboard" },
    { label: "Marketplace",   path: "/marketplace" },
    { label: "Requests",      path: "/farmer/requests" },
    { label: "Inventory",     path: "/farmer/inventory" },
    { label: "Soil Health",   path: "/farmer/soil-health" },
    { label: "Messages",      path: "/messages" },
    { label: "Notifications", path: "/notifications" },
    { label: "Weather",       path: "/weather" },
    { label: "Crop Prices",   path: "/crop-prices" },
    { label: "Gov. Schemes",  path: "/schemes" },
    { label: "Crop Advisory", path: "/advisory" },
    { label: "Crop AI",       path: "/crop-recommendation" },
    { label: "Disease AI",    path: "/disease-detection" },
    { label: "Forum",         path: "/forum" },
    { label: "Settings",      path: "/farmer/settings" },
  ];

  const links = user?.role === "farmer" ? farmerLinks : buyerLinks;

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-100 z-30 flex flex-col justify-between py-6 px-4 transition-transform duration-300 overflow-y-auto ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:h-screen lg:flex-shrink-0`}>
        <div>
          <div className="flex items-center gap-2.5 px-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-green-800 flex items-center justify-center text-white text-lg">🌿</div>
            <div>
              <p className="font-bold text-green-900 text-sm">Farm Fusion</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">{user?.role === "farmer" ? "Farmer" : "Buyer"}</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            {links.map(item => {
              const bgBadge = badges?.[item.path] || 0;
              const isActive = activePath === item.path;
              return (
                <button key={item.path} onClick={() => { setOpen(false); navigate(item.path); }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left cursor-pointer transition-all
                    ${isActive ? (user?.role === "farmer" ? "bg-green-100 text-green-800" : "bg-green-800 text-white") : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}>
                  <div className="flex items-center gap-3">{item.label}</div>
                  {bgBadge > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{bgBadge}</span>}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="mt-6">
          <div className="flex items-center gap-2.5 px-2 py-3 bg-gray-50 rounded-xl mb-2">
            <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center text-white text-xs font-bold">{getInitials(user?.name)}</div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || "User"}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={() => { if(onLogout) onLogout(); else navigate("/login"); }} className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl w-full font-semibold cursor-pointer">
            <LogoutIcon /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
