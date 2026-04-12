const Order = require("../models/ordermodel");
const mongoose = require("mongoose");

exports.trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).render("error", { message: "Invalid Order ID ❌" });
    }

    const order = await Order
      .findById(orderId)
      .populate("vendorId", "shopName logo")  // ✅ pulls shop name + logo for tracking page
      .lean();

    if (!order) {
      return res.status(404).render("error", { message: "Order not found ❌" });
    }

    // ✅ Guard against old orders with no userId field
    if (!order.userId) {
      return res.status(403).render("error", { message: "Access denied ❌" });
    }

    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).render("error", { message: "Access denied ❌" });
    }

    // ✅ Sort tracking newest → oldest
    if (order.tracking?.length) {
      order.tracking.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    res.render("trackingResult", { order });

  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Something went wrong ❌" });
  }
};