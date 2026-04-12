exports.validateProduct = (req, res, next) => {
  const { name, price, image } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2)
    errors.push("Product name must be at least 2 characters");

  if (!price || isNaN(price) || Number(price) <= 0)
    errors.push("Price must be a positive number");

  if (!image || image.trim().length === 0)
    errors.push("Image URL is required");

  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join(", ") + " ❌" });
  }

  req.body.name  = name.trim();
  req.body.image = image.trim();
  req.body.price = Number(price);

  next();
};

exports.validateCart = (req, res, next) => {
  const { productId } = req.body;

  if (!productId || productId.trim().length === 0) {
    return res.status(400).json({ message: "Product ID is required ❌" });
  }

  next();
};

exports.validateOrder = (req, res, next) => {
  const { name, address, city, pincode } = req.body;
  const errors = [];

  if (!name    || name.trim().length    < 2) errors.push("Valid name is required");
  if (!address || address.trim().length < 5) errors.push("Valid address is required");
  if (!city    || city.trim().length    < 2) errors.push("Valid city is required");
  if (!/^\d{6}$/.test(pincode))              errors.push("Pincode must be 6 digits");

  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join(", ") + " ❌" });
  }

  req.body.name    = name.trim();
  req.body.address = address.trim();
  req.body.city    = city.trim();

  next();
};