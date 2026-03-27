const express = require('express');
const path = require('path')

const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(express.static(path.join(__dirname, './public')));
app.use((req,res,next)=>{
  console.log(req.url,req.method);
  next();
});
app.use(userRoutes);

const hostname = '127.0.0.1'
const port = 3000;
app.listen(port,hostname, ()=>{
  console.log(`server is running on http://${hostname}:${port}/`)
})