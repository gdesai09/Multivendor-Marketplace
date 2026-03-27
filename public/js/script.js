// PROFILE MENU

function toggleProfile(){

let menu = document.getElementById("profile-menu");

if(menu){
if(menu.style.display === "block"){
menu.style.display = "none";
}
else{
menu.style.display = "block";
}
}

}


// IMAGE SLIDER

let images = [
"/images/image1.jpg",
"/images/image2.jpg",
"/images/image3.jpg",
"/images/image4.jpg"
];

let i = 0;

setInterval(()=>{

let slide = document.getElementById("slide");

if(!slide) return;

slide.src = images[i];

i++;

if(i >= images.length){
i = 0;
}

},3000);



// ADD TO CART (STORE IN FLASK)

async function addToCart(name,price,image){

await fetch("/api/cart",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
name:name,
price:price,
image:image
})
});

showMessage();

}



// CART DISPLAY (LOAD FROM FLASK)

async function loadCart(){

let cartContainer = document.getElementById("cart-items");

if(!cartContainer) return;

let response = await fetch("/api/cart");

let cart = await response.json();

let total = 0;

cartContainer.innerHTML = "";

cart.forEach(function(item){

let div = document.createElement("div");

div.innerHTML =
"<img src='"+item.image+"' width='80'> "+
item.name + " - ₹" + item.price;

cartContainer.appendChild(div);

total += item.price;

});

let totalElement = document.getElementById("total");

if(totalElement){
totalElement.innerHTML = "Total: ₹" + total;
}

}

loadCart();



// CART NOTIFICATION

function showMessage(){

let msg = document.createElement("div");

msg.innerHTML = "Product added to cart";

msg.style.position="fixed";
msg.style.bottom="20px";
msg.style.right="20px";
msg.style.background="green";
msg.style.color="white";
msg.style.padding="10px";
msg.style.borderRadius="6px";

document.body.appendChild(msg);

setTimeout(()=>{
msg.remove();
},2000);

}



// GET CATEGORY FROM URL

let params = new URLSearchParams(window.location.search);
let selectedCategory = params.get("category");



// LOAD PRODUCTS FROM FLASK

async function loadProducts(){

let productContainer = document.getElementById("product-list");

if(!productContainer) return;

let response = await fetch("/api/products");

let products = await response.json();

productContainer.innerHTML = "";

products.forEach(function(product){

if(selectedCategory && product.category && product.category.toLowerCase() !== selectedCategory.toLowerCase()){
return;
}

let div = document.createElement("div");

div.className = "card";

div.innerHTML =
"<img src='"+product.image+"' width='200'>" +
"<p>"+product.name+"</p>" +
"<p>₹"+product.price+"</p>" +
"<button onclick=\"addToCart('"+product.name+"',"+product.price+",'"+product.image+"')\">Add to Cart</button>" +
"<button onclick='deleteProduct("+product.id+")'>Delete</button>";

productContainer.appendChild(div);

});

}

loadProducts();



// LOAD PRODUCTS FROM API (DUMMY PRODUCTS)

async function loadAPIProducts(){

let container = document.getElementById("product-list");

if(!container) return;

try{

let response = await fetch("https://dummyjson.com/products?limit=20");

let data = await response.json();

data.products.forEach(product => {

let div = document.createElement("div");

div.className = "card";

div.innerHTML =
"<img src='"+product.thumbnail+"' width='200'>" +
"<p>"+product.title+"</p>" +
"<p>₹"+product.price+"</p>" +
"<button onclick=\"addToCart('"+product.title+"',"+product.price+",'"+product.thumbnail+"')\">Add to Cart</button>";

container.appendChild(div);

});

}
catch(error){
console.log("API Error:", error);
}

}

loadAPIProducts();



// USER REGISTRATION

async function registerUser(e){

e.preventDefault();

let name = document.getElementById("name");
let email = document.getElementById("email");
let password = document.getElementById("password");

let response = await fetch("/api/register",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
name:name.value,
email:email.value,
password:password.value
})
});

let data = await response.json();

alert(data.message);

// CLEAR INPUT FIELDS
name.value="";
email.value="";
password.value="";

window.location.href="/login";

}



// LOGIN USER

async function loginUser(e){

e.preventDefault();

let email = document.getElementById("email");
let password = document.getElementById("password");

let response = await fetch("/api/login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
email:email.value,
password:password.value
})
});

let data = await response.json();

if(data.status === "success"){

alert("Login Successful");

// CLEAR INPUT FIELDS
email.value="";
password.value="";

window.location.href="/";

}
else{
alert("Invalid login credentials");
}

}



// DELETE PRODUCT

async function deleteProduct(id){

let response = await fetch("/api/delete-product/"+id,{
method:"DELETE"
});

let data = await response.json();

alert(data.message);

location.reload();

}



// BUY NOW

async function buyNow(){

let response = await fetch("/api/cart");

let cart = await response.json();

if(cart.length === 0){
alert("Cart is empty");
return;
}

alert("Order placed successfully");

}