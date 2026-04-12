const User   = require("../models/userModel");
const Vendor = require("../models/vendorModel");
const Order  = require("../models/ordermodel");

// ── DASHBOARD ─────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalVendors,
      pendingVendors,
      totalOrders,
      revenueData,
    ] = await Promise.all([
      User.countDocuments(),
      Vendor.countDocuments(),
      Vendor.countDocuments({ isApproved: false }),
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
    ]);

    const totalRevenue = revenueData[0]?.total ?? 0;

    res.render("admin/dashboard", {
      totalUsers,
      totalVendors,
      pendingVendors,
      totalOrders,
      totalRevenue,
    });

  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Dashboard error ❌" });
  }
};

// ── ALL VENDORS ───────────────────────────────────────
exports.getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().lean();
    res.render("admin/vendors", { vendors });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Error fetching vendors ❌" });
  }
};

// ── APPROVE VENDOR ────────────────────────────────────
exports.approveVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    await Vendor.findByIdAndUpdate(vendorId, { isApproved: true });

    res.status(200).json({ message: "Vendor approved ✅" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error approving vendor ❌" });
  }
};

// ── SUSPEND VENDOR ────────────────────────────────────
exports.suspendVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    await Vendor.findByIdAndUpdate(vendorId, { isActive: false });

    res.status(200).json({ message: "Vendor suspended ✅" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error suspending vendor ❌" });
  }
};

// ── REACTIVATE VENDOR ─────────────────────────────────
exports.reactivateVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    await Vendor.findByIdAndUpdate(vendorId, { isActive: true });

    res.status(200).json({ message: "Vendor reactivated ✅" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error reactivating vendor ❌" });
  }
};

// ── ALL USERS ─────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().lean();
    res.render("admin/users", { users });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Error fetching users ❌" });
  }
};

// ── SUSPEND USER ──────────────────────────────────────
exports.suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;

    await User.findByIdAndUpdate(userId, { isActive: false });

    res.status(200).json({ message: "User suspended ✅" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error suspending user ❌" });
  }
};

// ── REACTIVATE USER ───────────────────────────────────
exports.reactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    await User.findByIdAndUpdate(userId, { isActive: true });

    res.status(200).json({ message: "User reactivated ✅" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error reactivating user ❌" });
  }
};

// ── ALL ORDERS ────────────────────────────────────────
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order
      .find()
      .populate("userId",   "name email")
      .populate("vendorId", "shopName")
      .sort({ createdAt: -1 })
      .lean();

    res.render("admin/orders", { orders });

  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Error fetching orders ❌" });
  }
};

// ── ADMIN LOGIN PAGE ──────────────────────────────────
exports.getLogin = (req, res) => {
  res.render("admin/login");
};

// ── ADMIN LOGIN ───────────────────────────────────────
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const jwt = require("jsonwebtoken");

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Invalid credentials ❌" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials ❌" });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge:   7 * 24 * 60 * 60 * 1000,
    });

    res.redirect("/admin/dashboard");

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed ❌" });
  }
};

// ── ADMIN LOGOUT ──────────────────────────────────────
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/admin/login");
};