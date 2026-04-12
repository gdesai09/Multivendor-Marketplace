const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // ✅ Vendor reference
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    // ✅ User reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    shopName: {
      type: String,
      required: true,
    },

    // Products
    items: [
      {
        name:     { type: String },
        price:    { type: Number },
        image:    { type: String },
        quantity: { type: Number, default: 1 }, // ✅ quantity was missing
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    customerDetails: {
      name:     { type: String },
      address:  { type: String },
      city:     { type: String },
      pincode:  { type: String },
      payment:  { type: String },
    },

    status: {
      type: String,
      enum: [                        // ✅ enum prevents invalid statuses
        "Order Placed",
        "Processing",
        "Packed",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Order Placed",
    },

    // ✅ Full tracking timeline
    tracking: [
      {
        status:    { type: String },
        note:      { type: String, default: "" },  // vendor's optional note
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  
  { timestamps: true } // ✅ auto handles createdAt + updatedAt, remove manual createdAt
);

module.exports = mongoose.model("Order", orderSchema);