const express = require("express");
const path = require("path");

const userRoutes = express.Router();

userRoutes.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname, "../views/index.html"));
});

// userRoutes.get("/products", (req, res, next) => {
//   res.sendFile(path.join(__dirname, "../views/products.html"));
// });

userRoutes.get("/login", (req, res, next) => {
  res.sendFile(path.join(__dirname, "../views/login.html"));
});

userRoutes.post("/login-user", (req, res, next) => {
  res.sendFile(path.join(__dirname, "../views/index.html"));
});

userRoutes.get("/register", (req, res, next) => {
  res.sendFile(path.join(__dirname, "../views/register.html"));
});

userRoutes.get("/cart", (req, res, next) => {
  res.sendFile(path.join(__dirname, "../views/cart.html"));
});

userRoutes.get("/products", (req, res, next) => {
  res.sendFile(path.join(__dirname, "../views/products.html"));
});

userRoutes.get("/vendor_login", (req, res, next) => {
  res.sendFile(path.join(__dirname, "../views/vendor_login.html"));
});
module.exports = userRoutes;
