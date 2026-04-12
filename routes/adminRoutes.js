const express        = require("express");
const router         = express.Router();
const adminController = require("../controllers/adminController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

// ── PUBLIC ────────────────────────────────────────────
router.get ("/admin/login",  adminController.getLogin);
router.post("/admin/login",  adminController.postLogin);
router.get ("/admin/logout", adminController.logout);

// ── PROTECTED ─────────────────────────────────────────
router.get("/admin/dashboard", protect, isAdmin, adminController.getDashboard);
router.get("/admin/vendors",   protect, isAdmin, adminController.getVendors);
router.get("/admin/users",     protect, isAdmin, adminController.getUsers);
router.get("/admin/orders",    protect, isAdmin, adminController.getOrders);

// vendor actions
router.patch("/admin/vendors/:vendorId/approve",    protect, isAdmin, adminController.approveVendor);
router.patch("/admin/vendors/:vendorId/suspend",    protect, isAdmin, adminController.suspendVendor);
router.patch("/admin/vendors/:vendorId/reactivate", protect, isAdmin, adminController.reactivateVendor);

// user actions
router.patch("/admin/users/:userId/suspend",    protect, isAdmin, adminController.suspendUser);
router.patch("/admin/users/:userId/reactivate", protect, isAdmin, adminController.reactivateUser);

module.exports = router;