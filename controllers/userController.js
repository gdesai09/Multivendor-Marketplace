const User = require("../models/userModel");
const jwt  = require("jsonwebtoken");

// ── REGISTER ──────────────────────────────────────────
exports.postRegister = async (req, res) => {
  try {
    const { name, email, password, confirm_password, mobile } = req.body;

    // ✅ Validate required fields
    if (!name || !email || !password || !confirm_password) {
      return res.status(400).json({ message: "All fields are required ❌" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters ❌" });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ message: "Passwords do not match ❌" });
    }

    // ✅ Check for existing email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered ❌" });
    }

    const user = new User({
      name:     name.trim(),
      email:    email.toLowerCase().trim(),
      password,                  // ✅ hashed by userModel pre-save hook
      mobile:   mobile?.trim(),
      role:     "user",
    });

    await user.save();

    // ✅ Redirect to login after successful registration
    return res.redirect("/login");

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

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // ✅ Vague on purpose — never reveal if email exists
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials ❌" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account suspended ❌" });
    }

    // ✅ bcrypt compare via matchPassword from userModel
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials ❌" });
    }

    // ✅ Sign JWT
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ HttpOnly cookie — JS cannot read it, protects against XSS
    res.cookie("token", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge:   7 * 24 * 60 * 60 * 1000,   // 7 days
    });

    // ✅ Redirect to home after login
    return res.redirect("/");

  } catch (err) {
    console.error("[postLogin]", err);
    return res.status(500).json({ message: "Login failed ❌" });
  }
};

// ── LOGOUT ────────────────────────────────────────────
exports.logout = (req, res) => {
  // ✅ Must pass same options as when cookie was set
  res.clearCookie("token", {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  return res.redirect("/login");
};