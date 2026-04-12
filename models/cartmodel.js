const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    // ✅ Who owns this cart item
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,   // ✅ fast lookups by user
    },

    // ✅ Which product
    productId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Product",
      required: true,
    },

    // ✅ Which vendor sold it
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "Vendor",
    },

    // ✅ Denormalised fields — copied from product at add time
    // so cart still works even if product is deleted/edited
    shopName: {
      type:    String,
      default: "",
    },

    name: {
      type:     String,
      required: true,
      trim:     true,
    },

    price: {
      type:     Number,
      required: true,
      min:      0,
    },

    image: {
      type:    String,
      default: "",
    },

    category: {
      type:    String,
      default: "General",
    },

    quantity: {
      type:    Number,
      default: 1,
      min:     1,
    },
  },

  { timestamps: true }
);

// ✅ Compound index — one entry per user per product
// prevents duplicate cart entries at the DB level
cartSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model("Cart", cartSchema);