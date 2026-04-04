const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.log("Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
