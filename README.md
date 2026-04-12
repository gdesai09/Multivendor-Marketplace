# 🛒 Multi Vendor Marketplace

Welcome to the **Multi Vendor Marketplace** 🚀
This is a full-stack web application where multiple vendors can add products and users can browse, add to cart, and purchase them.

---

## 📌 Features

### 👤 User Side

* User Registration & Login
* View All Products
* Add to Cart 🛒
* Buy Products

### 🏪 Vendor Side

* Vendor Registration & Login
* Add Products
* View Own Products
* Vendor Dashboard

---

## 🛠️ Technologies Used

* Node.js
* Express.js
* MongoDB
* EJS (Template Engine)
* HTML, CSS, JavaScript

---

## 📂 Project Structure

myProject/
│
├── controllers/
│   ├── userController.js
│   ├── productController.js
│   ├── cartController.js
│   ├── orderController.js
│   └── vendorloginController.js
│
├── models/
│   └── productsmodel.js
│
├── routes/
│   ├── userRoutes.js
│   └── vendorRoutes.js
│
├── views/
│   ├── index.ejs
│   ├── products.ejs
│   ├── vendor.html
│   ├── additem.html
│   ├── login.html
│   └── register.html
│
├── public/
│   ├── CSS/
│   ├── js/
│   └── images/
│
├── utils/
│   └── pathutils.js
│
├── app.js
└── README.md

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

git clone https://github.com/your-username/your-repo-name.git

### 2️⃣ Install dependencies

npm install

### 3️⃣ Start the server

nodemon app.js

or
npm start

---
### 4 open webpage
http://localhost:3000/


## 🌐 Routes Overview

### 👤 User Routes

* `/` → Home Page
* `/products` → View Products
* `/login` → User Login
* `/register` → User Register
* `/cart` → Cart Page

### 🏪 Vendor Routes

* `/vendor` → Vendor Dashboard
* `/additem` → Add Product
* `/my_products/:id` → Vendor Products

---

## 📸 Screens (Pages Included)

* Home Page with Featured Products
* Product Listing Page
* Vendor Dashboard
* Add Product Page

---

## 🚀 Future Improvements

* 🔍 Product Search
* 📂 Category Filter
* 💳 Payment Gateway
* ⭐ Product Ratings
* 📸 Image Upload


## ⭐ Conclusion

This project demonstrates a complete **multi-vendor e-commerce system** with both user and vendor functionalities using modern web technologies.

