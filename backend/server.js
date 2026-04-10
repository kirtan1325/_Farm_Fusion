// backend/server.js
const express   = require("express");
const http      = require("http");
const cors      = require("cors");
const dotenv    = require("dotenv");
const connectDB = require("./config/db");

// ── Load .env FIRST before anything reads process.env ──
dotenv.config();
connectDB();

const app = express();

// ── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Passport (loaded AFTER dotenv) ───────────────────────
const passport = require("./config/passport");
app.use(passport.initialize());

// ── Routes ───────────────────────────────────────────────
app.use("/api/auth",          require("./routes/authRoutes"));
app.use("/api/users",         require("./routes/userRoutes"));
app.use("/api/crops",         require("./routes/cropRoutes"));
app.use("/api/requests",      require("./routes/requestRoutes"));
app.use("/api/orders",        require("./routes/orderRoutes"));
app.use("/api/stats",         require("./routes/statsRoutes"));
app.use("/api/messages",      require("./routes/messageRoutes"));

// V2 — Notifications
app.use("/api/notifications", require("./routes/notificationRoutes"));

// V3 — Useful Tools
app.use("/api/weather",       require("./routes/weatherRoutes"));
app.use("/api/prices",        require("./routes/cropPriceRoutes"));
app.use("/api/schemes",       require("./routes/schemeRoutes"));
app.use("/api/advisory",      require("./routes/advisoryRoutes"));
app.use("/api/inventory",     require("./routes/inventoryRoutes"));
app.use("/api/soil-health",   require("./routes/soilTestRoutes"));

// V4 — Community Forum
app.use("/api/forum",         require("./routes/forumRoutes"));

// V5 — Admin
app.use("/api/admin",         require("./routes/adminRoutes"));

// ── Health check ─────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "Farm Fusion API running ✅" }));

// ── Global error handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ── Create HTTP server + attach Socket.IO ─────────────────
const PORT = process.env.PORT || 5001;
const server = http.createServer(app);

// Initialize Socket.IO
const { initSocket } = require("./config/socketManager");
initSocket(server);

server.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`   JWT_SECRET  : ${process.env.JWT_SECRET     ? "set ✅" : "MISSING ❌"}`);
  console.log(`   MONGO_URI   : ${process.env.MONGO_URI      ? "set ✅" : "MISSING ❌"}`);
  console.log(`   CLIENT_URL  : ${process.env.CLIENT_URL     ? "set ✅" : "MISSING ❌"}`);
  console.log(`   WEATHER_KEY : ${process.env.WEATHER_API_KEY && process.env.WEATHER_API_KEY !== "your_openweather_key_here" ? "set ✅" : "mock mode ⚠️"}`);
  console.log(`   Socket.IO   : enabled ✅\n`);
});
