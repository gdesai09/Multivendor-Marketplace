const Vendor = require("../models/vendorModel");
const jwt    = require("jsonwebtoken");

// ── REGISTER ──────────────────────────────────────────
exports.postRegister = async (req, res) => {
  try {
    const { name, email, password, confirm_password, shopName, mobile } = req.body;

    if (!name || !email || !password || !confirm_password || !shopName) {
      return res.status(400).json({ message: "All fields are required ❌" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters ❌" });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ message: "Passwords do not match ❌" });
    }

    const [emailExists, shopExists] = await Promise.all([
      Vendor.findOne({ email: email.toLowerCase().trim() }),
      Vendor.findOne({ shopName: shopName.trim() }),
    ]);

    if (emailExists) {
      return res.status(409).json({ message: "Email already registered ❌" });
    }

    if (shopExists) {
      return res.status(409).json({ message: "Shop name already taken ❌" });
    }

    const vendor = new Vendor({
      name:       name.trim(),
      email:      email.toLowerCase().trim(),
      password,
      shopName:   shopName.trim(),
      mobile:     mobile?.trim(),
      role:       "vendor",
      isApproved: false,
    });

    await vendor.save();

    return res.status(201).json({
      message: "Registered successfully. Await admin approval ✅",
    });

  } catch (err) {
    console.error("[postRegister]", err);
    return res.status(500).json({ message: "Registration failed ❌" });
  }
};

// ── LOGIN ─────────────────────────────────────────────
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required ❌" });
    }

    const vendor = await Vendor.findOne({ email: email.toLowerCase().trim() });

    if (!vendor) {
      return res.status(401).json({ message: "Invalid credentials ❌" });
    }

    if (!vendor.isActive) {
      return res.status(403).json({ message: "Account suspended ❌" });
    }

    if (!vendor.isApproved) {
      return res.status(403).json({ message: "Account pending admin approval ⏳" });
    }

    const isMatch = await vendor.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials ❌" });
    }

    const token = jwt.sign(
      {
        _id:      vendor._id,
        role:     vendor.role,
        shopName: vendor.shopName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge:   7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful ✅",
      vendor: {
        _id:      vendor._id,
        name:     vendor.name,
        shopName: vendor.shopName,
        role:     vendor.role,
      },
    });

  } catch (err) {
    console.error("[postLogin]", err);
    return res.status(500).json({ message: "Login failed ❌" });
  }
};

// ── LOGOUT ────────────────────────────────────────────
exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  // ✅ Fixed — /vendor/login is served by vendorRoutes.get("/login")
  // /vendor_login was returning 404 because the file wasn't found
  res.redirect("/");
};