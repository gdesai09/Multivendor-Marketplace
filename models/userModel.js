const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,       // ✅ prevents duplicate accounts
      lowercase: true,    // ✅ normalises "User@Mail.com" → "user@mail.com"
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    mobile: {
      type: String,
      match: [/^\d{10}$/, "Enter a valid 10-digit mobile number"], // ✅ validation
    },

    // ✅ Needed for protect/isVendor middleware
    role: {
      type: String,
      enum: ["user", "vendor", "admin"],
      default: "user",
    },

    // ✅ Soft ban without deleting account
    isActive: {
      type: Boolean,
      default: true,
    },
  },

  { timestamps: true }
);

// ✅ Hash password before saving — never store plain text
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});
// ✅ Clean method to compare password at login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);