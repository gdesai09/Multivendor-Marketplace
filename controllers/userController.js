const User = require('../models/userModel');

// REGISTER
exports.postRegister = async (req, res) => {
  const { name, email, password, confirm_password } = req.body;
    if (password !== confirm_password) {
    return res.send(`
      <script>
      alert("Passwords do not match ❌");
      window.location.href= "/register";
      </script>
      `);
  }

  try {
    const newUser = new User({ name, email, password });
    await newUser.save();

    res.send(`
      <script>
            alert("User Registered Successfully ✅");
            window.location.href = "/register";
        </script>
      `)

  } catch (err) {
    console.log(err);
    res.send("Error occur in saving user");
  }

  res.sendFile(path.join(rootDir, "views", "index.html"));
};

//Login
exports.postLogin = async (req,res)=>{
  const { email, password } = req.body;
  
  try{
    const user = await User.findOne({email});

    if(!user){
      return res.send(`
        <script>
        alert("user not found");
        window.location.href = "/login";
        </script>
        `)
    }
    if(user.password!== password){
      return res.send(`
        <script>
        alert("incorrect password");
        window.location.href = "/login";
        </script>
        `)
    }
  }catch(err){
    console.log(err);
    res.send("error in login");
  }

};