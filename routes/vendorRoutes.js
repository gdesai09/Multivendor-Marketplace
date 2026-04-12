const express      = require("express");
const vendorRoutes = express.Router();

const productsController       = require("../controllers/productController");
const vendorloginController    = require("../controllers/vendorloginController");
const vendorTrackingController = require("../controllers/vendorTrackingController");
const { protect, isVendor }    = require("../middleware/authMiddleware");

// ── PUBLIC PAGES ──────────────────────────────
// ✅ mounted at /vendor so these become /vendor/login, /vendor/register
vendorRoutes.get("/login",    (req, res) => res.sendFile("vendor_login.html",    { root: "views" }));
vendorRoutes.get("/register", (req, res) => res.sendFile("vendor_register.html", { root: "views" }));

// ── AUTH ACTIONS ──────────────────────────────
vendorRoutes.post("/login",    vendorloginController.postLogin);
vendorRoutes.post("/register", vendorloginController.postRegister);
vendorRoutes.get ("/logout",   vendorloginController.logout);

// ── PROTECTED PAGES ───────────────────────────
vendorRoutes.get("/",           protect, isVendor, productsController.getVendorDashboard);
vendorRoutes.get("/additem",    protect, isVendor, (req, res) => res.sendFile("additem.html", { root: "views" }));
vendorRoutes.get("/my-products",protect, isVendor, productsController.getMyProducts);
vendorRoutes.get("/orders",     protect, isVendor, productsController.getVendorOrders);

// ── PROTECTED API ─────────────────────────────
vendorRoutes.post ("/add-product",      protect, isVendor, productsController.addProducts);
vendorRoutes.patch("/update-tracking",  protect, isVendor, vendorTrackingController.updateTracking);

// ── edit product ─────────────────────────────
vendorRoutes.get("/edit-product/:id", protect, isVendor, productsController.getEditProduct);
vendorRoutes.post("/edit-product/:id", protect, isVendor, productsController.updateProduct);

module.exports = vendorRoutes;