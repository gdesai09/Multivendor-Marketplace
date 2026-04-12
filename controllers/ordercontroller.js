const mongoose = require("mongoose");
const Cart     = require("../models/cartmodel");
const Order    = require("../models/ordermodel");

exports.buyNow = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, address, city, pincode, payment } = req.body;

    // ✅ Validate delivery details
    if (!name || !address || !city || !pincode) {
      return res.status(400).json({ message: "Please fill all delivery details ❌" });
    }

    // ✅ Validate pincode format
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ message: "Pincode must be 6 digits ❌" });
    }

    // ✅ Fetch this user's cart
    const cartItems = await Cart.find({ userId }).lean();

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty ❌" });
    }

    // ✅ Group by vendorId — guaranteed unique, safer than shopName
    const grouped = cartItems.reduce((acc, item) => {
      const key = item.vendorId.toString();
      (acc[key] ??= []).push(item);
      return acc;
    }, {});

    const createdOrders = [];

    for (const [vendorKey, items] of Object.entries(grouped)) {

      // ✅ Validate vendorId before using
      if (!mongoose.Types.ObjectId.isValid(vendorKey)) continue;

      const vendorId = items[0].vendorId;
      const shopName = items[0].shopName;

      // ✅ Pull only what's needed — never trust client for price/name
      const cleanItems = items.map(item => ({
        name:     item.name,
        price:    item.price,
        image:    item.image,
        quantity: item.quantity ?? 1,
      }));

      // ✅ Compute total server-side
      const totalAmount = cleanItems.reduce(
        (sum, i) => sum + Number(i.price) * i.quantity,
        0
      );

      const newOrder = new Order({
        userId,
        vendorId,
        shopName,
        items:       cleanItems,
        totalAmount,
        customerDetails: {
          name,
          address,
          city,
          pincode,
          payment: payment || "COD",   // ✅ default to COD if not provided
        },
        status: "Order Placed",
        tracking: [{
          status:    "Order Placed",
          note:      "Your order has been received.",
          updatedAt: new Date(),
        }],
      });

      const savedOrder = await newOrder.save();
      createdOrders.push(savedOrder._id);
    }

    // ✅ Nothing was created — all vendorIds were invalid
    if (createdOrders.length === 0) {
      return res.status(400).json({ message: "No valid orders could be created ❌" });
    }

    // ✅ Clear only this user's cart after all orders saved
    await Cart.deleteMany({ userId });

    return res.status(201).json({
      message:  "Order placed successfully ✅",
      orderIds: createdOrders,         // frontend redirects to first orderId
    });

  } catch (err) {
    console.error("[buyNow]", err);
    return res.status(500).json({ message: "Error placing order ❌" });
  }
};