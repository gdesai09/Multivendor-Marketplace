const express = require("express");
const path = require("path");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const connectDB = require("./config/db");

connectDB();

const app = express();

//  (IMPORTANT)
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "./public")));

app.use((req, res, next) => {
  console.log(req.url, req.method);
  next();
});

app.use(userRoutes);
app.use(vendorRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.PORT}`);
});
