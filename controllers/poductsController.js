const Product = require("../models/productsmodel");

exports.addProducts = async (req, res) => {
  const { name, price, image, description } = req.body;

  try {
    const newProduct = new Product({ name, price, image, description });

    await newProduct.save();

    res.send(`
      <script>
        alert("Product saved successfully ✅");
        window.location.href = "/vendor";
      </script>
    `);
  } catch (err) {
    console.log(err);
    res.send("Error occurred during saving product");
  }
};
