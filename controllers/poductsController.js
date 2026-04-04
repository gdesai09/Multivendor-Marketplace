const product = require('../models/productsmodel');

exports.addProducts = async (req,res)=>{
  const { name , price , image ,description } = req.body;

  try{
    const product = new product({ name , price , image , description});
    await product.save();
      res.send(`
      <script>
            alert("Product save Successfully ✅");
            window.location.href = "/register";
        </script>
      `);
  }catch(err){
    console.log(err);
    res.send('error oucr during saving product');
  }
}