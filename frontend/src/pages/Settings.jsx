import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";
import SharedSidebar from "../components/SharedSidebar";

// ── Icons ──────────────────────────────────────────────
const MenuIcon    = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
const LogoutIcon  = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);
const SaveIcon    = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>);

const getInitials = (name = "") => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);


// ── Settings Sections ───────────────────────────────────
const SECTIONS = ["Profile", "Security", "Notifications", "Account"];

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Profile");

  // Profile form
  const [name,        setName]        = useState(user?.name        || "");
  const [farmName,    setFarmName]    = useState(user?.farmName    || "");
  const [companyName, setCompanyName] = useState(user?.companyName || "");
  const [location,    setLocation]    = useState(user?.location    || "");

  // Security form
  const [currentPass, setCurrentPass] = useState("");
  const [newPass,     setNewPass]     = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");

  const handleLogout = () => { logout(); navigate("/login"); };

  const showMsg = (msg, isError = false) => {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setSuccess(""); setError(""); }, 3000);
  };

  const saveProfile = async () => {
    setSaving(true);
    setError(""); setSuccess("");
    try {
      const body = { name, location };
      if (user?.role === "farmer") body.farmName    = farmName;
      if (user?.role === "buyer")  body.companyName = companyName;
      const { data } = await api.put("/users/profile", body);
      updateUser(data.user);
      showMsg("Profile updated successfully!");
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to update profile.", true);
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (!currentPass || !newPass || !confirmPass) { showMsg("Please fill all password fields.", true); return; }
    if (newPass !== confirmPass) { showMsg("New passwords do not match.", true); return; }
    if (newPass.length < 6)     { showMsg("Password must be at least 6 characters.", true); return; }
    setSaving(true);
    try {
      await api.put("/users/password", { currentPassword: currentPass, newPassword: newPass });
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
      showMsg("Password changed successfully!");
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to change password.", true);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all bg-white text-gray-800";
  const labelCls = "text-sm font-semibold text-gray-600 mb-1.5 block";

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <SharedSidebar activePath={`/${user?.role}/settings`} open={sidebarOpen} setOpen={setSidebarOpen} user={user} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Topbar */}
        <header className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-white border-b border-gray-100 sticky top-0 z-10 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 cursor-pointer mr-1"><MenuIcon /></button>
          <div className="flex items-center gap-2 flex-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
            <span className="font-bold text-gray-900 text-sm sm:text-base">Settings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center text-white text-xs font-bold">
              {getInitials(user?.name)}
            </div>
            <span className="hidden sm:block text-sm font-semibold text-gray-700">{user?.name}</span>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 max-w-4xl w-full mx-auto">

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your account preferences and profile information.</p>
          </div>

          {/* Alert banners */}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              {success}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {/* Section tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
            {SECTIONS.map(s => (
              <button key={s} onClick={() => setActiveSection(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
                  ${activeSection === s ? "bg-white text-green-800 shadow font-semibold" : "text-gray-500 hover:text-gray-700"}`}>
                {s}
              </button>
            ))}
          </div>

          {/* ── Profile Section ── */}
          {activeSection === "Profile" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-lg">Profile Information</h2>
                <p className="text-sm text-gray-500 mt-0.5">Update your personal details and public profile.</p>
              </div>
              <div className="p-6 flex flex-col gap-5">

                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-800 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {getInitials(user?.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-sm text-gray-400 capitalize">{user?.role} · {user?.email}</p>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Full Name</label>
                    <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
                  </div>
                  <div>
                    <label className={labelCls}>Email Address</label>
                    <input className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`} value={user?.email || ""} disabled />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className={labelCls}>Location</label>
                    <input className={inputCls} value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Gujarat, India" />
                  </div>
                  <div>
                    <label className={labelCls}>Role</label>
                    <input className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed capitalize`} value={user?.role || ""} disabled />
                  </div>
                  {user?.role === "farmer" && (
                    <div>
                      <label className={labelCls}>Farm Name</label>
                      <input className={inputCls} value={farmName} onChange={e => setFarmName(e.target.value)} placeholder="e.g. Green Acres Farm" />
                    </div>
                  )}
                  {user?.role === "buyer" && (
                    <div>
                      <label className={labelCls}>Company Name</label>
                      <input className={inputCls} value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Fresh Market Co." />
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button onClick={saveProfile} disabled={saving}
                    className="flex items-center gap-2 bg-green-800 hover:bg-green-900 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-60">
                    {saving
                      ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                      : <SaveIcon />}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Security Section ── */}
          {activeSection === "Security" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-lg">Change Password</h2>
                <p className="text-sm text-gray-500 mt-0.5">Update your password to keep your account secure.</p>
              </div>
              <div className="p-6 flex flex-col gap-4 max-w-md">
                <div>
                  <label className={labelCls}>Current Password</label>
                  <input type="password" className={inputCls} value={currentPass} onChange={e => setCurrentPass(e.target.value)} placeholder="••••••••" />
                </div>
                <div>
                  <label className={labelCls}>New Password</label>
                  <input type="password" className={inputCls} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min. 6 characters" />
                </div>
                <div>
                  <label className={labelCls}>Confirm New Password</label>
                  <input type="password" className={inputCls} value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Repeat new password" />
                </div>
                <div className="flex justify-end pt-2">
                  <button onClick={savePassword} disabled={saving}
                    className="flex items-center gap-2 bg-green-800 hover:bg-green-900 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-60">
                    {saving ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> : <SaveIcon />}
                    {saving ? "Saving..." : "Update Password"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Notifications Section ── */}
          {activeSection === "Notifications" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-lg">Notification Preferences</h2>
                <p className="text-sm text-gray-500 mt-0.5">Choose what you get notified about.</p>
              </div>
              <div className="p-6 flex flex-col gap-4">
                {[
                  { label: "New purchase requests",     sub: "Get notified when a buyer sends a request",   def: true  },
                  { label: "Request accepted",          sub: "When a farmer accepts your purchase request", def: true  },
                  { label: "Request rejected",          sub: "When a farmer rejects your request",          def: true  },
                  { label: "Payment confirmations",     sub: "Confirmation when a payment is processed",    def: true  },
                  { label: "New crop listings",         sub: "When farmers add new crops to marketplace",   def: false },
                  { label: "Platform announcements",    sub: "Updates and news from Farm Fusion",           def: false },
                ].map(n => (
                  <label key={n.label} className="flex items-center justify-between gap-4 py-3 border-b border-gray-50 last:border-0 cursor-pointer">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{n.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.sub}</p>
                    </div>
                    <input type="checkbox" defaultChecked={n.def}
                      className="w-4 h-4 rounded accent-green-700 cursor-pointer flex-shrink-0" />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ── Account Section ── */}
          {activeSection === "Account" && (
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900 text-lg">Account Details</h2>
                </div>
                <div className="p-6 flex flex-col gap-3">
                  {[
                    { label: "Account ID",    value: user?._id           },
                    { label: "Role",          value: user?.role          },
                    { label: "Member since",  value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—" },
                    { label: "Status",        value: user?.isActive ? "Active" : "Inactive" },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-500 font-medium">{r.label}</span>
                      <span className="text-sm font-semibold text-gray-800 font-mono text-right break-all max-w-xs">{r.value || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <h3 className="font-bold text-red-800 mb-1">Danger Zone</h3>
                <p className="text-sm text-red-600 mb-4">These actions are permanent and cannot be undone.</p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 bg-white border border-red-300 text-red-600 hover:bg-red-600 hover:text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer">
                    <LogoutIcon /> Sign Out
                  </button>
                  <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}