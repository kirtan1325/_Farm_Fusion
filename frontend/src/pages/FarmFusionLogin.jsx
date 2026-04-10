import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginUser, registerUser } from "../api/authService";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  {
    id: "farmer",
    label: "Farmer",
    description: "List & sell your crops directly",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: "buyer",
    label: "Buyer",
    description: "Source fresh crops from farmers",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    ),
  },
];

// ── Icons ──────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);
const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const EyeIcon = ({ open }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
    ) : (
      <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
    )}
  </svg>
);
const MailIcon     = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>);
const LockIcon     = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
const PersonIcon   = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const BuildingIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>);
const PinIcon      = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);

const InputField = ({ label, type = "text", placeholder, value, onChange, icon, rightElement, required }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2.5 bg-white focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100 transition-all">
      {icon}
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} required={required}
        className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400 min-w-0"/>
      {rightElement}
    </div>
  </div>
);

export default function FarmFusionLogin() {
  const [tab, setTab] = useState("login");
  const [role, setRole] = useState("farmer");

  // ── LOGIN form state (isolated) ────────────────────
  const [loginEmail,    setLoginEmail]    = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [remember,      setRemember]      = useState(false);

  // ── REGISTER form state (isolated) ─────────────────
  const [regName,        setRegName]        = useState("");
  const [regEmail,       setRegEmail]       = useState("");
  const [regPassword,    setRegPassword]    = useState("");
  const [regConfirm,     setRegConfirm]     = useState("");
  const [regFarmName,    setRegFarmName]    = useState("");
  const [regCompany,     setRegCompany]     = useState("");
  const [regLocation,    setRegLocation]    = useState("");
  const [showRegPass,    setShowRegPass]    = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);

  // ── Shared UI state ─────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  const { login }      = useAuth();
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedRole   = ROLES.find((r) => r.id === role);

  // Show error if OAuth failed
  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError) {
      setError(
        oauthError === "google_not_configured"   ? "Google login is not set up yet. Add GOOGLE_CLIENT_ID to your backend .env file." :
        oauthError === "facebook_not_configured" ? "Facebook login is not set up yet. Add FACEBOOK_APP_ID to your backend .env file." :
        oauthError === "google_failed"           ? "Google sign-in failed. Please try again." :
        oauthError === "facebook_failed"         ? "Facebook sign-in failed. Please try again." :
        "Social login failed. Please use email login instead."
      );
    }
  }, [searchParams]);

  const switchTab = (t) => {
    setTab(t);
    setError("");
    // Do NOT clear form fields when switching — just clear error
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser({ email: loginEmail, password: loginPassword });
      login(data);
      setSuccess(true);
      setTimeout(() => {
        if (data.user.role === "farmer")     navigate("/farmer/dashboard");
        else if (data.user.role === "buyer") navigate("/buyer/dashboard");
        else                                 navigate("/marketplace");
      }, 700);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (regPassword !== regConfirm) { setError("Passwords do not match."); return; }
    if (regPassword.length < 6)     { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const data = await registerUser({
        name:        regName,
        email:       regEmail,
        password:    regPassword,
        role,
        farmName:    role === "farmer" ? regFarmName : undefined,
        companyName: role === "buyer"  ? regCompany  : undefined,
        location:    regLocation,
      });
      login(data);
      setSuccess(true);
      setTimeout(() => {
        if (data.user.role === "farmer")     navigate("/farmer/dashboard");
        else if (data.user.role === "buyer") navigate("/buyer/dashboard");
        else                                 navigate("/marketplace");
      }, 700);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // OAuth — redirect browser to backend which handles the full OAuth flow
  const BACKEND = "http://localhost:5000";
  const handleGoogle   = () => { window.location.href = `${BACKEND}/api/auth/google`; };
  const handleFacebook = () => { window.location.href = `${BACKEND}/api/auth/facebook`; };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 font-sans">

      {/* ── Navbar ── */}
      <nav className="w-full bg-white border-b border-green-100 shadow-sm px-4 sm:px-8 h-14 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl leading-none">🌿</span>
          <span className="font-bold text-green-900 text-base sm:text-lg tracking-tight">Farm Fusion</span>
        </div>
        <button className="hidden sm:flex items-center gap-1.5 text-sm text-green-800 border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-50 transition-colors cursor-pointer">
          ? Support
        </button>
      </nav>

      {/* ── Main ── */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-0">

          {/* ── Left Panel ── */}
          <div className="w-full lg:w-[42%] bg-gradient-to-b from-green-900 via-green-800 to-emerald-700 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl leading-none">🚜</span>
                <span className="text-white font-bold text-lg">Farm Fusion</span>
              </div>
              <h1 className="text-white font-bold text-2xl sm:text-[1.75rem] leading-snug mb-4">
                Cultivating the future<br/>of agriculture.
              </h1>
              <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                <p className="text-white/85 text-sm leading-relaxed">
                  Join thousands of farmers and buyers connecting directly to build a smarter, fresher supply chain.
                </p>
              </div>
            </div>

            {/* Role selector — active only on register tab */}
            <div>
              <p className="text-white/55 text-xs font-semibold uppercase tracking-widest mb-3">
                {tab === "register" ? "I want to join as" : "Welcome back"}
              </p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {ROLES.map((r) => (
                  <button key={r.id} onClick={() => tab === "register" && setRole(r.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 text-white text-xs font-medium
                      transition-all duration-200 border
                      ${tab === "login" ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                      ${role === r.id && tab === "register"
                        ? "bg-white/20 border-white/75 scale-105 shadow-lg"
                        : "bg-white/5 border-white/15 hover:bg-white/10"}`}>
                    <span className="opacity-90">{r.icon}</span>
                    <span>{r.label}</span>
                    {role === r.id && tab === "register" && <span className="w-1.5 h-1.5 rounded-full bg-white"/>}
                  </button>
                ))}
              </div>
              <p className="text-white/50 text-xs text-center">
                {tab === "register"
                  ? selectedRole?.description
                  : "Your role is loaded from your account automatically"}
              </p>
            </div>

            {/* Trust row */}
            <div className="flex items-center gap-3">
              <div className="flex">
                {["👩‍🌾","👨‍🌾","🧑‍🌾"].map((emoji, i) => (
                  <span key={i} className={`w-8 h-8 rounded-full bg-green-800 border-2 border-green-600 flex items-center justify-center text-sm ${i > 0 ? "-ml-2" : ""}`}>{emoji}</span>
                ))}
              </div>
              <span className="text-white/70 text-sm">Trusted by 5,000+ farmers</span>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="w-full lg:w-[58%] p-6 sm:p-8 flex flex-col justify-center">

            <div className="mb-5">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {tab === "login" ? "Welcome Back" : "Create Your Account"}
              </h2>
              <p className="text-gray-500 text-sm">
                {tab === "login" ? "Sign in to access your dashboard" : `Registering as a ${selectedRole?.label}`}
              </p>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
              {["login","register"].map((t) => (
                <button key={t} onClick={() => switchTab(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                    ${tab === t ? "bg-white text-green-800 shadow font-semibold" : "text-gray-500 hover:text-gray-700"}`}>
                  {t === "login" ? "Login" : "Register"}
                </button>
              ))}
            </div>

            {/* Social buttons — wired to real OAuth */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button onClick={handleGoogle}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                <GoogleIcon /> Continue with Google
              </button>
              <button onClick={handleFacebook}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                <FacebookIcon /> Continue with Facebook
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200"/>
              <span className="text-xs text-gray-400 font-medium tracking-wider whitespace-nowrap">OR CONTINUE WITH EMAIL</span>
              <div className="flex-1 h-px bg-gray-200"/>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700 font-medium mb-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            {/* ══ LOGIN FORM ══ */}
            {tab === "login" && (
              <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
                <InputField label="Email Address" type="email" placeholder="you@example.com"
                  value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                  icon={<MailIcon/>} required/>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <button type="button" className="text-xs text-green-700 hover:underline font-medium cursor-pointer">
                      Forgot password?
                    </button>
                  </div>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2.5 bg-white focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100 transition-all">
                    <LockIcon/>
                    <input type={showLoginPass ? "text" : "password"} placeholder="••••••••"
                      value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required
                      className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400 min-w-0"/>
                    <button type="button" onClick={() => setShowLoginPass(!showLoginPass)}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer flex-shrink-0">
                      <EyeIcon open={showLoginPass}/>
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)}
                    className="w-4 h-4 rounded border-gray-300 accent-green-700 cursor-pointer"/>
                  <span className="text-sm text-gray-600">Remember me for 30 days</span>
                </label>

                <button type="submit" disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 bg-green-800 hover:bg-green-900 active:scale-[0.98]
                    text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-md cursor-pointer mt-1
                    ${loading ? "opacity-75 cursor-not-allowed" : ""}`}>
                  {loading
                    ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                    : null}
                  {loading ? "Signing in..." : success ? "✓ Success!" : "→ Login to Dashboard"}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Don't have an account?{" "}
                  <button type="button" onClick={() => switchTab("register")} className="text-green-700 font-semibold hover:underline cursor-pointer">
                    Create Account
                  </button>
                </p>
              </form>
            )}

            {/* ══ REGISTER FORM ══ */}
            {tab === "register" && (
              <form onSubmit={handleRegister} className="flex flex-col gap-3">
                <InputField label="Full Name *" placeholder="John Farmer"
                  value={regName} onChange={(e) => setRegName(e.target.value)}
                  icon={<PersonIcon/>} required/>

                <InputField label="Email Address *" type="email" placeholder="you@example.com"
                  value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                  icon={<MailIcon/>} required/>

                <div className="grid grid-cols-2 gap-3">
                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Password *</label>
                    <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2.5 bg-white focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100 transition-all">
                      <LockIcon/>
                      <input type={showRegPass ? "text" : "password"} placeholder="Min. 6 chars"
                        value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required
                        className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400 min-w-0"/>
                      <button type="button" onClick={() => setShowRegPass(!showRegPass)}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer flex-shrink-0">
                        <EyeIcon open={showRegPass}/>
                      </button>
                    </div>
                  </div>
                  {/* Confirm */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Confirm *</label>
                    <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2.5 bg-white focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100 transition-all">
                      <LockIcon/>
                      <input type={showRegConfirm ? "text" : "password"} placeholder="Repeat"
                        value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} required
                        className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400 min-w-0"/>
                      <button type="button" onClick={() => setShowRegConfirm(!showRegConfirm)}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer flex-shrink-0">
                        <EyeIcon open={showRegConfirm}/>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Role-specific field */}
                {role === "farmer" && (
                  <InputField label="Farm Name" placeholder="e.g. Green Acres Farm"
                    value={regFarmName} onChange={(e) => setRegFarmName(e.target.value)} icon={<BuildingIcon/>}/>
                )}
                {role === "buyer" && (
                  <InputField label="Company Name" placeholder="e.g. Fresh Market Co."
                    value={regCompany} onChange={(e) => setRegCompany(e.target.value)} icon={<BuildingIcon/>}/>
                )}

                <InputField label="Location" placeholder="e.g. Gujarat, India"
                  value={regLocation} onChange={(e) => setRegLocation(e.target.value)} icon={<PinIcon/>}/>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input type="checkbox" required className="w-4 h-4 rounded border-gray-300 accent-green-700 cursor-pointer"/>
                  <span className="text-sm text-gray-600">I agree to the Terms & Privacy Policy</span>
                </label>

                <button type="submit" disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 bg-green-800 hover:bg-green-900 active:scale-[0.98]
                    text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-md cursor-pointer
                    ${loading ? "opacity-75 cursor-not-allowed" : ""}`}>
                  {loading
                    ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                    : null}
                  {loading ? "Creating account..." : success ? "✓ Account created!" : "→ Create Account"}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Already have an account?{" "}
                  <button type="button" onClick={() => switchTab("login")} className="text-green-700 font-semibold hover:underline cursor-pointer">
                    Sign In
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-gray-400 flex flex-wrap items-center justify-center gap-2 px-4">
        <span>© 2024 Farm Fusion Inc. All rights reserved.</span>
        <span className="hidden sm:inline">|</span>
        <a href="#" className="hover:text-green-700 transition-colors">Privacy Policy</a>
        <span>|</span>
        <a href="#" className="hover:text-green-700 transition-colors">Terms of Service</a>
      </footer>
    </div>
  );
}