const express = require("express");
const path = require("path");

const userRoutes = express.Router();
const rootDir = require("../utils/pathutils");
const userController = require("../controllers/userController");

userRoutes.get("/", (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "index.html"));
});

userRoutes.get("/products", (req, res, next) => {
  res.render("products", { products: [] });
});

userRoutes.get("/login", (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "login.html"));
});

userRoutes.post("/login-user", userController.postLogin);

userRoutes.get("/register", (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "register.html"));
});

userRoutes.post("/register-User", userController.postRegister);

userRoutes.get("/cart", (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "cart.html"));
});

userRoutes.get("/checkout", (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "checkout.html"));
});
userRoutes.get("/logout", (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "login.html"));
});
module.exports = userRoutes;