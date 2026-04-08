const Vendor = require('../models/vendorModel');

// ================= REGISTER =================
exports.postRegister = async (req, res) => {
  const { name, email, password, confirm_password } = req.body;

  if (password !== confirm_password) {
    return res.send(`
      <script>
        alert("Passwords do not match ❌");
        window.location.href = "/vendor_register";
      </script>
    `);
  }

  try {
    const newVendor = new Vendor({ name, email, password });
    console.log("Saving Vendor:", newVendor);
    await newVendor.save();

    return res.send(`
      <script>
        alert("Vendor Registered Successfully ✅");
        window.location.href = "/vendor_login";
      </script>
    `);

  } catch (err) {
    console.log(err);
    res.send("Error occurred in saving vendor");
  }
};

// ================= LOGIN =================
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingVendor = await Vendor.findOne({ email });

    if (!existingVendor) {
      return res.send(`
        <script>
          alert("Vendor not found ❌");
          window.location.href = "/vendor_login";
        </script>
      `);
    }

    if (existingVendor.password !== password) {
      return res.send(`
        <script>
          alert("Incorrect password ❌");
          window.location.href = "/vendor_login";
        </script>
      `);
    }

    // SUCCESS LOGIN
    return res.send(`
      <script>
        alert("Login Successful ✅");
        window.location.href = "/vendor";
      </script>
    `);

  } catch (err) {
    console.log(err);
    res.send("Error in login");
  }
};