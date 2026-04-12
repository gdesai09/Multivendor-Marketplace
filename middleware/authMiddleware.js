const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Vendor = require("../models/vendorModel");

// ✅ Verifies JWT cookie and attaches user/vendor to req.user
exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authorised, please login ❌" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Route to correct model based on role in token
    if (decoded.role === "vendor") {
      req.user = await Vendor.findById(decoded._id).select("-password").lean();
    } else {
      req.user = await User.findById(decoded._id).select("-password").lean();
    }

    if (!req.user) {
      return res.status(401).json({ message: "Account not found ❌" });
    }

    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token ❌" });
  }
};

// ✅ Only allows vendors through
exports.isVendor = (req, res, next) => {
  if (req.user?.role !== "vendor") {
    return res.status(403).json({ message: "Vendor access only ❌" });
  }
  next();
};

// ✅ Only allows admins through
exports.isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access only ❌" });
  }
  next();
};