const Order    = require("../models/ordermodel");
const mongoose = require("mongoose");

exports.updateTracking = async (req, res) => {
  try {
    const { orderId, status, note } = req.body;
    const vendorId = req.user._id;

    // ✅ Validate orderId is a real ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid Order ID ❌" });
    }

    // ✅ Matches orderModel enum exactly — including Cancelled
    const validStatuses = [
      "Order Placed",
      "Processing",
      "Packed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",    // ✅ was missing in your original
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status ❌" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found ❌" });
    }

    // ✅ Vendor can only update their own orders
    if (order.vendorId.toString() !== vendorId.toString()) {
      return res.status(403).json({ message: "Access denied ❌" });
    }

    // ✅ Cannot update a delivered or cancelled order
    if (["Delivered", "Cancelled"].includes(order.status)) {
      return res.status(400).json({
        message: `Order already ${order.status} — cannot update ❌`,
      });
    }

    // ✅ Push to tracking timeline
    order.tracking.push({
      status,
      note:      note?.trim() || "",
      updatedAt: new Date(),
    });

    // ✅ Keep top-level status in sync
    order.status = status;

    await order.save();

    return res.status(200).json({ message: "Tracking updated ✅" });

  } catch (err) {
    console.error("[updateTracking]", err);
    return res.status(500).json({ message: "Server error ❌" });
  }
};