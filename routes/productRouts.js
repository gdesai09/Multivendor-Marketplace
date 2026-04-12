const express         = require("express");
const router          = express.Router();
const adminController = require("../controllers/adminController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

// ── PUBLIC ────────────────────────────────────────────
router.get ("/login",  adminController.getLogin);
router.post("/login",  adminController.postLogin);
router.get ("/logout", adminController.logout);

// ── PROTECTED ─────────────────────────────────────────
router.get("/dashboard", protect, isAdmin, adminController.getDashboard);
router.get("/vendors",   protect, isAdmin, adminController.getVendors);
router.get("/users",     protect, isAdmin, adminController.getUsers);
router.get("/orders",    protect, isAdmin, adminController.getOrders);

// ── VENDOR ACTIONS ────────────────────────────────────
router.patch("/vendors/:vendorId/approve",    protect, isAdmin, adminController.approveVendor);
router.patch("/vendors/:vendorId/suspend",    protect, isAdmin, adminController.suspendVendor);
router.patch("/vendors/:vendorId/reactivate", protect, isAdmin, adminController.reactivateVendor);

// ── USER ACTIONS ──────────────────────────────────────
router.patch("/users/:userId/suspend",    protect, isAdmin, adminController.suspendUser);
router.patch("/users/:userId/reactivate", protect, isAdmin, adminController.reactivateUser);

module.exports = router;