const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // ✅ Vendor reference
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    shopName: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    // ✅ Number not String — fixes buyNow total calculation
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      required: true,
    },

    // ✅ Used in dashboard EJS
    category: {
      type: String,
      default: "General",
    },

    // ✅ Track stock
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ✅ Hide out-of-stock or unlisted products
    isActive: {
      type: Boolean,
      default: true,
    },
  },

  { timestamps: true }
);

// ✅ Fixed — was console.log instead of return
productSchema.statics.findByShopName = function (shopName) {
  return this.find({ shopName });
};

// ✅ Only fetch active products for a vendor
productSchema.statics.findByVendorId = function (vendorId) {
  return this.find({ vendorId, isActive: true }).lean();
};

module.exports = mongoose.model("Product", productSchema);