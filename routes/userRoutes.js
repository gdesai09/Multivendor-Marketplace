const express = require("express");
const router  = express.Router();

const userController     = require("../controllers/userController");
const cartController     = require("../controllers/cartController");
const orderController    = require("../controllers/orderController");
const productController  = require("../controllers/productController");
const trackingController = require("../controllers/trackingController");
const { protect }        = require("../middleware/authMiddleware");

// ── PUBLIC ────────────────────────────────────────────
router.get("/",         (req, res) => res.sendFile("index.html",    { root: "views" }));
router.get("/login",    (req, res) => res.sendFile("login.html",    { root: "views" }));
router.get("/register", (req, res) => res.sendFile("register.html", { root: "views" }));
router.get("/products", productController.getProducts);

// ✅ JSON endpoint for script.js fetch
router.get("/api/products", async (req, res) => {
  try {
    const Product  = require("../models/productsmodel");
    const products = await Product.find({ isActive: true }).lean();
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

router.post("/login-user",    userController.postLogin);
router.post("/register-user", userController.postRegister);

// ── AUTH ──────────────────────────────────────────────
router.get("/logout", userController.logout);

// ── PROTECTED PAGES ───────────────────────────────────
router.get("/cart",     protect, (req, res) => res.sendFile("cart.html",     { root: "views" }));
router.get("/checkout", protect, (req, res) => res.sendFile("checkout.html", { root: "views" }));
router.get("/track",    protect, (req, res) => res.sendFile("tracking.html", { root: "views" }));

// ── CART API ──────────────────────────────────────────
router.post  ("/api/cart",                   protect, cartController.addToCart);
router.get   ("/api/cart",                   protect, cartController.getCart);
router.patch ("/api/cart/update",            protect, cartController.updateQuantity); // ✅ PATCH not PUT
router.delete("/api/cart/remove/:productId", protect, cartController.removeFromCart); // ✅ /remove/:id
router.delete("/api/cart/clear",             protect, cartController.clearCart);      // ✅ /clear

// ── ORDER ─────────────────────────────────────────────
router.post("/api/buy", protect, orderController.buyNow);

// ── TRACKING ──────────────────────────────────────────
router.get("/track-order/:orderId", protect, trackingController.trackOrder);

module.exports = router;