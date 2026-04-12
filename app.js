const express      = require("express");
const path         = require("path");
const cookieParser = require("cookie-parser");
const helmet       = require("helmet");
require("dotenv").config();

const connectDB = require("./config/db");
connectDB();

const userRoutes   = require("./routes/userRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const adminRoutes  = require("./routes/adminRoutes");

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.originalUrl}`);
    next();
  });
}

// ── ROUTES ───────────────────────────────────
app.use("/",       adminRoutes);   // ✅ first
app.use("/vendor", vendorRoutes);  // ✅ /vendor prefix
app.use("/",       userRoutes);    // ✅ last

// ── 404 ──────────────────────────────────────
app.use((req, res) => {
  const isApi = req.originalUrl.startsWith("/api") ||
                req.headers.accept?.includes("application/json");
  if (isApi) {
    return res.status(404).json({ message: "Route not found ❌" });
  }
  res.status(404).send(`
    <div style="text-align:center;padding:4rem;font-family:sans-serif;background:#0d0b09;color:#f0e8d8;min-height:100vh">
      <h1 style="font-size:4rem;color:#d4843a">404</h1>
      <p style="color:#7a7068">Page not found</p>
      <a href="/" style="color:#d4843a">Go Home</a>
    </div>
  `);
});

// ── ERROR HANDLER ─────────────────────────────
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.stack);
  const isApi = req.originalUrl.startsWith("/api") ||
                req.headers.accept?.includes("application/json");
  if (isApi) {
    return res.status(err.status || 500).json({
      message: process.env.NODE_ENV === "production"
        ? "Something went wrong ❌"
        : err.message,
    });
  }
  res.status(err.status || 500).render("error", {
    message: err.message || "Something went wrong ❌",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));