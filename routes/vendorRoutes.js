const express = require("express");
const path = require("path");

const vendorRoutes = express.Router();
const rootDir = require("../utils/pathutils");
const productsController = require("../controllers/poductsController");
const vendorloginController = require('../controllers/vendorloginController');

vendorRoutes.get("/vendor", (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "vendor.html"));
});

// Dashboard page
vendorRoutes.post("/vendor", vendorloginController.postLogin );

// Login page
vendorRoutes.get("/vendor_login", (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "vendor_login.html"));
});

vendorRoutes.get("/vendor_register", (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "vendor_register.html"));
});

vendorRoutes.post("/vendor_register", vendorloginController.postRegister);

// Add product page
vendorRoutes.get("/additem", (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "additem.html"));
});

vendorRoutes.post("/add-product", productsController.addProducts);

vendorRoutes.get("/my_products", (req, res, next) => {
  res.render("products", { products: [] });
});

module.exports = vendorRoutes;
