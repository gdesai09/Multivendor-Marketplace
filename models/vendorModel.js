const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // ✅ Critical — every product and order references shopName
    shopName: {
      type: String,
      required: true,
      unique: true,   // two vendors can't have the same shop name
      trim: true,
    },

    mobile: {
      type: String,
      match: [/^\d{10}$/, "Enter a valid 10-digit mobile number"],
    },

    // ✅ Shop profile extras
    description: {
      type: String,
      default: "",
    },

    logo: {
      type: String,   // image URL
      default: "",
    },

    // ✅ Admin can approve/suspend vendors
    isActive: {
      type: Boolean,
      default: true,
    },

    isApproved: {
      type: Boolean,
      default: false, // admin approves before vendor can list products
    },

    role: {
      type: String,
      default: "vendor",   // fixed role — no enum needed
    },
  },

  { timestamps: true }
);

// ✅ Hash password before saving
vendorSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});
// ✅ Clean login comparison
vendorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Vendor", vendorSchema);