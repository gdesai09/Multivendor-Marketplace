const mongoose = require("mongoose");
const Cart = require("../models/cartmodel");
const Product = require("../models/productsmodel");

// ── ADD TO CART ──────────────────────────────────────
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    // ✅ Validate ObjectId before hitting DB
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID ❌" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found ❌" });
    }

    if (!product.isActive) {
      return res.status(400).json({ message: "Product is unavailable ❌" });
    }

    // ✅ Already in cart — increment quantity
    const existing = await Cart.findOne({ userId, productId });

    if (existing) {
      existing.quantity += 1;
      await existing.save();
      return res.status(200).json({
        message: "Quantity updated ✅",
        cart: existing,
      });
    }

    // ✅ New item — pull everything from DB, never trust client
    const cartItem = new Cart({
      userId,
      productId,
      vendorId: product.vendorId,
      shopName: product.shopName,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: 1,
    });

    await cartItem.save();
    res.status(201).json({ message: "Added to cart ✅", cart: cartItem });
  } catch (err) {
    console.error("[addToCart]", err);
    res.status(500).json({ message: "Error adding to cart ❌" });
  }
};

// ── GET CART ─────────────────────────────────────────
exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cartItems = await Cart.find({ userId }).lean();

    // ✅ Compute total server-side — never trust client
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    res.status(200).json({ cartItems, total });
  } catch (err) {
    console.error("[getCart]", err);
    res.status(500).json({ message: "Error fetching cart ❌" });
  }
};

// ── UPDATE QUANTITY ───────────────────────────────────
exports.updateQuantity = async (req, res) => {
  try {
    const userId           = req.user._id;
    const { productId, quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1 ❌" });
    }

    const item = await Cart.findOne({ userId, productId });

    if (!item) {
      return res.status(404).json({ message: "Item not in cart ❌" });
    }

    item.quantity = quantity;
    await item.save();

    res.status(200).json({ message: "Quantity updated ✅", cart: item });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating quantity ❌" });
  }
};

// ── REMOVE SINGLE ITEM ────────────────────────────────
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    // ✅ Validate ObjectId — this was causing the silent failure
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID ❌" });
    }

    const deleted = await Cart.findOneAndDelete({ userId, productId });

    if (!deleted) {
      return res.status(404).json({ message: "Item not found in cart ❌" });
    }

    res.status(200).json({ message: "Item removed ✅" });
  } catch (err) {
    console.error("[removeFromCart]", err);
    res.status(500).json({ message: "Error removing item ❌" });
  }
};

// ── CLEAR ENTIRE CART ─────────────────────────────────
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Cart.deleteMany({ userId });

    res.status(200).json({
      message: `Cart cleared ✅`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("[clearCart]", err);
    res.status(500).json({ message: "Error clearing cart ❌" });
  }
};
