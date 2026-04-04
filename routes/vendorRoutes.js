const express = require("express");
const path = require("path");

const vendorRoutes = express.Router();
const rootDir = require("../utils/pathutils");

vendorRoutes.post("/vendor",(req,res,next)=>{
  res.sendFile(path.join(rootDir , 'views' , 'vendor.html'));
})

vendorRoutes.get("/vendor_login", (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "vendor_login.html"));
});


module.exports = vendorRoutes;