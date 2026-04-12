const Product  = require("../models/productsmodel");
const Order    = require("../models/ordermodel");
const { Types } = require("mongoose");

// ── ADD PRODUCT ───────────────────────────────────────
exports.addProducts = async (req, res) => {
  try {
    const { name, price, image, category } = req.body;
    const vendorId = req.user._id;
    const shopName = req.user.shopName;

    if (!name || !price || !image) {
      return res.status(400).json({ message: "Name, price and image are required ❌" });
    }

    if (isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({ message: "Price must be a positive number ❌" });
    }

    const product = new Product({
      vendorId,
      shopName,
      name:     name.trim(),
      price:    Number(price),
      image:    image.trim(),
      category: category || "General",
      isActive: true,
    });

    await product.save();

    res.status(201).json({ message: "Product added ✅", product });

  } catch (err) {
    console.error("[addProducts]", err);
    res.status(500).json({ message: "Error saving product ❌" });
  }
};

// ── ALL PRODUCTS FOR USERS ────────────────────────────
exports.getProducts = async (req, res) => {
  try {
    // ✅ Temporarily remove isActive filter to test
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const products = await Product.find(filter).lean();

    console.log("Products found:", products.length); // ← tells you exactly how many

    const isApi = req.xhr ||
                  req.headers.accept?.includes("application/json");

    if (isApi) return res.status(200).json(products);

    res.render("products", {
      products,
      category: req.query.category || null,
    });

  } catch (err) {
    console.error("[getProducts]", err);
    res.render("products", { products: [], category: null });
  }
};

// ── VENDOR'S OWN PRODUCTS ─────────────────────────────
exports.getMyProducts = async (req, res) => {
  try {
    const vendorId = req.user._id;

    const products = await Product
      .find({ vendorId })
      .sort({ createdAt: -1 })
      .lean();

    // ✅ render vendor-specific view not public products page
    res.render("myProducts", {
      products,
      user: req.user,
    });

  } catch (err) {
    console.error("[getMyProducts]", err);
    res.render("myProducts", { products: [], user: null });
  }
};

// ── VENDOR DASHBOARD ──────────────────────────────────
exports.getVendorDashboard = async (req, res) => {
  try {
    const vendorId = req.user._id;

    const [totalProducts, totalOrders, revenueData, recentProducts] =
      await Promise.all([
        Product.countDocuments({ vendorId }),
        Order.countDocuments({ vendorId }),
        Order.aggregate([
          { $match: { vendorId: new Types.ObjectId(vendorId) } },
          { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
        ]),
        Product
          .find({ vendorId })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

    const totalRevenue = revenueData[0]?.totalRevenue ?? 0;

    res.render("vendorDashboard", {
      totalProducts,
      totalOrders,
      totalRevenue,
      recentProducts,
      user: req.user,
    });

  } catch (err) {
    console.error("[getVendorDashboard]", err);
    res.render("vendorDashboard", {
      totalProducts:  0,
      totalOrders:    0,
      totalRevenue:   0,
      recentProducts: [],
      user:           null,
    });
  }
};

// ── VENDOR ORDERS ─────────────────────────────────────
exports.getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user._id;

    const orders = await Order
      .find({ vendorId })
      .populate("userId", "name email mobile")
      .sort({ createdAt: -1 })
      .lean();

    res.render("vendorOrders", {
      orders,
      user: req.user,
    });

  } catch (err) {
    console.error("[getVendorOrders]", err);
    res.status(500).render("error", { message: "Could not fetch orders ❌" });
  }
};

// ── Edits ─────────────────────────────────────
exports.getEditProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, vendorId: req.user._id }).lean();
    if (!product) return res.status(404).render("error", { message: "Product not found ❌" });
    res.render("editProduct", { product, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Something went wrong ❌" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, price, image, category } = req.body;
    await Product.findOneAndUpdate(
      { _id: req.params.id, vendorId: req.user._id },
      { name, price: Number(price), image, category },
      { new: true }
    );
    res.redirect("/vendor/my-products");
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Update failed ❌" });
  }
};