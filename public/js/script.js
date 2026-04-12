// ================= CURSOR ─────────────────────────────
const cursorEl = document.getElementById("cursor");
if (cursorEl) {
  const dot = cursorEl.querySelector(".cursor-dot");
  const ring = cursorEl.querySelector(".cursor-ring");
  let mx = 0,
    my = 0,
    rx = 0,
    ry = 0;
  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
  });
  (function animCursor() {
    dot.style.cssText = `left:${mx}px;top:${my}px`;
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.cssText = `left:${rx}px;top:${ry}px`;
    requestAnimationFrame(animCursor);
  })();
}

// ================= SCROLL REVEAL ──────────────────────
const obs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in"); // ✅ only "in" — matches CSS .reveal.in
        obs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1 },
);
document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));

// ================= PROFILE MENU ───────────────────────
function toggleProfile() {
  const menu = document.getElementById("profile-menu");
  if (!menu) return;
  const isOpen = menu.style.display === "block";
  menu.style.display = isOpen ? "none" : "block";
  document.body.classList.toggle("overlay", !isOpen);
}

document.addEventListener("click", (e) => {
  const menu = document.getElementById("profile-menu");
  if (!menu) return;
  if (!e.target.closest("#profile-menu") && !e.target.closest(".nav-avatar")) {
    menu.style.display = "none";
    document.body.classList.remove("overlay");
  }
});

// ================= IMAGE SLIDER ───────────────────────
const images = [
  "/images/image1.jpg",
  "/images/image2.jpg",
  "/images/image3.jpg",
  "/images/image4.jpg",
];
let slideIndex = 0;
setInterval(() => {
  const slide = document.getElementById("slide");
  if (!slide) return;
  slide.src = images[slideIndex];
  slideIndex = (slideIndex + 1) % images.length;
}, 3000);

// ================= TOAST MESSAGE ──────────────────────
function showMessage(text, success = true) {
  const existing = document.getElementById("vendra-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "vendra-toast";
  const ok = success;

  toast.innerHTML = `
    <span style="width:26px;height:26px;border-radius:6px;flex-shrink:0;
      background:${ok ? "rgba(212,132,58,.15)" : "rgba(224,80,80,.15)"};
      border:1px solid ${ok ? "rgba(212,132,58,.3)" : "rgba(224,80,80,.3)"};
      display:flex;align-items:center;justify-content:center;
      font-size:.65rem;color:${ok ? "#d4843a" : "#e05050"}">${ok ? "✦" : "✕"}</span>
    <span>${text}</span>`;

  Object.assign(toast.style, {
    position: "fixed",
    bottom: "2rem",
    right: "2rem",
    zIndex: "9999",
    display: "flex",
    alignItems: "center",
    gap: ".75rem",
    background: ok ? "#1a1714" : "#1a0f0f",
    color: ok ? "#f0e8d8" : "#f0d8d8",
    border: `1px solid ${ok ? "rgba(212,132,58,.25)" : "rgba(224,80,80,.25)"}`,
    padding: ".85rem 1.2rem",
    borderRadius: "10px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: ".82rem",
    fontWeight: "500",
    boxShadow: "0 16px 40px rgba(0,0,0,.55)",
    maxWidth: "340px",
    opacity: "0",
    transform: "translateY(14px)",
    transition: "opacity .3s ease, transform .3s ease",
  });

  document.body.appendChild(toast);
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    }),
  );
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(14px)";
    setTimeout(() => toast.remove(), 320);
  }, 3500);
}

// ================= CART COUNT ─────────────────────────
async function updateCartCount() {
  const countEl = document.getElementById("cart-count");
  if (!countEl) return;
  try {
    const res = await fetch("/api/cart", { credentials: "include" });
    if (!res.ok) return;
    const data = await res.json();
    const total = data.cartItems?.reduce((s, i) => s + i.quantity, 0) ?? 0;
    countEl.textContent = total;
  } catch (err) {
    // not logged in — leave as 0
  }
}

// ================= ADD TO CART ────────────────────────
async function addToCart(productId) {
  try {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ productId }),
    });
    const data = await res.json();
    showMessage(data.message, res.ok);
    if (res.ok) updateCartCount();
  } catch (err) {
    console.error(err);
    showMessage("Error adding to cart ❌", false);
  }
}

function handleAddToCart(btn, productId) {
  addToCart(productId);
  const orig = btn.textContent;
  btn.textContent = "✓ Added";
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = orig;
    btn.disabled = false;
  }, 1800);
}

// ================= LOAD CART ──────────────────────────
async function loadCart() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  try {
    const res = await fetch("/api/cart", { credentials: "include" });
    const data = await res.json();

    if (!res.ok) {
      container.innerHTML = `<p style="color:#e05050">${data.message}</p>`;
      return;
    }

    renderCart(data.cartItems, data.total);
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p style="color:#e05050">Could not load cart.</p>`;
  }
}

// ================= RENDER CART ────────────────────────
function renderCart(items, total) {
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  const subtotalEl = document.getElementById("subtotal");
  const countEl = document.getElementById("item-count");
  const heroSub = document.getElementById("hero-sub");
  const buyBtn = document.getElementById("buy-btn");
  if (!container) return;

  if (!items || items.length === 0) {
    if (heroSub) heroSub.textContent = "Your cart is empty";
    if (countEl) countEl.textContent = "0";
    if (buyBtn) buyBtn.disabled = true;
    container.innerHTML = `
      <div style="text-align:center;padding:4rem 2rem;color:#7a7068">
        <div style="font-size:3rem;margin-bottom:1rem">🛒</div>
        <p style="font-family:'Cormorant Garamond',serif;font-size:1.5rem;color:#f0e8d8">
          Your cart is empty
        </p>
        <a href="/products"
          style="display:inline-block;margin-top:1rem;color:#d4843a;font-size:.82rem;
                 letter-spacing:.08em;text-transform:uppercase;text-decoration:none">
          Browse Products →
        </a>
      </div>`;
    return;
  }

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  if (heroSub)
    heroSub.textContent = `${totalQty} item${totalQty !== 1 ? "s" : ""} in your cart`;
  if (countEl) countEl.textContent = totalQty;
  if (buyBtn) buyBtn.disabled = false;

  container.innerHTML = items
    .map(
      (item, idx) => `
    <div class="cart-item" data-id="${item.productId}" style="animation-delay:${idx * 60}ms">
      <img src="${item.image}" alt="${item.name}" />
      <div class="item-details">
        <p class="item-name">${item.name}</p>
        <p class="item-shop">${item.shopName || ""}</p>
        <p class="item-price">₹${item.price}</p>
      </div>
      <div class="item-qty">
        <button onclick="changeQty('${item.productId}', ${item.quantity - 1})">−</button>
        <span>${item.quantity}</span>
        <button onclick="changeQty('${item.productId}', ${item.quantity + 1})">+</button>
      </div>
      <p class="item-subtotal">₹${(item.price * item.quantity).toLocaleString("en-IN")}</p>
      <button class="remove-btn" onclick="removeItem('${item.productId}')">✕</button>
    </div>
  `,
    )
    .join("");

  const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");
  if (subtotalEl) subtotalEl.textContent = fmt(total);
  if (totalEl) totalEl.textContent = fmt(total);
}

// ================= CHANGE QTY ─────────────────────────
async function changeQty(productId, quantity) {
  if (quantity < 1) {
    removeItem(productId);
    return;
  }

  // ✅ Fixed — PUT /api/cart matches userRoutes.js
  const res = await fetch("/api/cart", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ productId, quantity }),
  });

  if (res.ok) {
    loadCart();
    updateCartCount();
  }
}

// ================= REMOVE ITEM ────────────────────────
async function removeItem(productId) {
  // ✅ Fixed — DELETE /api/cart/:productId matches userRoutes.js
  const res = await fetch(`/api/cart/${productId}`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await res.json();
  showMessage(data.message, res.ok);
  if (res.ok) {
    loadCart();
    updateCartCount();
  }
}

// ================= CLEAR CART ─────────────────────────
async function clearCart() {
  if (!confirm("Remove all items from your cart?")) return;
  const res = await fetch("/api/cart", {
    method: "DELETE",
    credentials: "include",
  });
  const data = await res.json();
  showMessage(data.message, res.ok);
  if (res.ok) {
    loadCart();
    updateCartCount();
  }
}

// ================= LOAD PRODUCTS ─────────────────────
async function loadProducts() {
  const container = document.getElementById("product-list");
  if (!container) return;
    console.log("product-list children:", container.children.length);
  // ✅ EJS already rendered products server-side — skip fetch
  if (container.children.length > 0) {
    updateCount();
    return;
  }

  try {
    // ✅ Fixed — /products with Accept header, not /api/products
    const res = await fetch("/products", {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return;
    const products = await res.json();

    container.innerHTML = "";

    if (!products || products.length === 0) {
      container.innerHTML = `<div class="empty-state">
        <div class="empty-icon">🔍</div>
        <p>No products found</p>
      </div>`;
      return;
    }

    products.forEach((product) => {
      const div = document.createElement("div");
      div.className = "product-card";
      div.innerHTML = `
        <button class="product-wish" onclick="toggleWish(this)">♡</button>
        <div class="product-img-wrap">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
        </div>
        <div class="product-body">
          <div class="product-cat">${product.category || "Product"}</div>
          <div class="product-name">${product.name}</div>
          <div class="product-vendor">by ${product.shopName || "Vendor"}</div>
          <div class="product-footer">
            <div class="product-price">₹${product.price}</div>
            <button class="btn-cart" onclick="handleAddToCart(this, '${product._id}')">
              Add to Cart
            </button>
          </div>
        </div>`;
      container.appendChild(div);
    });

    updateCount();
  } catch (err) {
    console.error(err);
  }
}

// ================= PRODUCT COUNT ─────────────────────
function updateCount() {
  const countEl = document.getElementById("count");
  if (!countEl) return;
  countEl.textContent = document.querySelectorAll(".product-card").length;
}

// ================= SEARCH ────────────────────────────
document.getElementById("search-input")?.addEventListener("input", function () {
  const q = this.value.toLowerCase();
  document.querySelectorAll(".product-card").forEach((card) => {
    const name = card.querySelector(".product-name")?.textContent.toLowerCase();
    card.style.display = name?.includes(q) ? "" : "none";
  });
  const visible = document.querySelectorAll(
    ".product-card:not([style*='none'])",
  ).length;
  const countEl = document.getElementById("count");
  if (countEl) countEl.textContent = visible;
});

// ================= SORT ──────────────────────────────
document.getElementById("sort-select")?.addEventListener("change", function () {
  const val = this.value;
  const grid = document.getElementById("product-list");
  if (!grid) return;
  const cards = [...grid.querySelectorAll(".product-card")];

  cards.sort((a, b) => {
    const priceA = parseFloat(
      a.querySelector(".product-price")?.textContent.replace(/[₹,]/g, ""),
    );
    const priceB = parseFloat(
      b.querySelector(".product-price")?.textContent.replace(/[₹,]/g, ""),
    );
    const nameA = a.querySelector(".product-name")?.textContent;
    const nameB = b.querySelector(".product-name")?.textContent;
    if (val === "price-asc") return priceA - priceB;
    if (val === "price-desc") return priceB - priceA;
    if (val === "name-asc") return nameA?.localeCompare(nameB);
    return 0;
  });

  cards.forEach((card) => grid.appendChild(card));
});

// ================= PRICE FILTER ──────────────────────
document.getElementById("price-range")?.addEventListener("input", function () {
  const max = Number(this.value);
  const label = document.getElementById("price-max-label");
  if (label) label.textContent = `Up to ₹${max.toLocaleString("en-IN")}`;

  document.querySelectorAll(".product-card").forEach((card) => {
    const price = parseFloat(
      card.querySelector(".product-price")?.textContent.replace(/[₹,]/g, ""),
    );
    card.style.display = price <= max ? "" : "none";
  });

  const visible = document.querySelectorAll(
    ".product-card:not([style*='none'])",
  ).length;
  const countEl = document.getElementById("count");
  if (countEl) countEl.textContent = visible;
});

// ================= CONFIRM ORDER ─────────────────────
async function confirmOrder() {
  try {
    const name = document.getElementById("name")?.value;
    const address = document.getElementById("address")?.value;
    const city = document.getElementById("city")?.value;
    const pincode = document.getElementById("pincode")?.value;
    const payment = document.getElementById("payment")?.value;

    if (!name || !address || !city || !pincode) {
      showMessage("Please fill all details ❌", false);
      return;
    }

    const res = await fetch("/api/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, address, city, pincode, payment }),
    });
    const data = await res.json();

    if (!res.ok) {
      showMessage(data.message, false);
      return;
    }

    showMessage("Order placed ✅");
    const firstOrderId = data.orderIds?.[0];
    if (firstOrderId) window.location.href = `/track-order/${firstOrderId}`;
  } catch (err) {
    console.error(err);
    showMessage("Error placing order ❌", false);
  }
}

// ================= TRACK ORDER ───────────────────────
function trackOrder() {
  const id = prompt("Enter your Order ID:");
  if (!id || id.trim().length === 0) return;
  window.location.href = `/track-order/${id.trim()}`;
}

// ================= PAYMENT FIELDS ────────────────────
function togglePaymentFields() {
  const method = document.getElementById("paymentMethod")?.value;
  const onlineFields = document.getElementById("onlineFields");
  if (!onlineFields) return;
  onlineFields.style.display = method === "online" ? "block" : "none";
}

function payViaUPI() {
  const upiId = document.getElementById("upiId")?.value;
  if (!upiId) {
    showMessage("Please enter UPI ID ❌", false);
    return;
  }
  showMessage("Payment request sent to " + upiId);
}

// ================= VENDOR TRACKING UPDATE ────────────
async function updateTracking() {
  const orderId = document.getElementById("trackOrderId")?.value.trim();
  const status = document.getElementById("trackStatus")?.value;
  const note = document.getElementById("trackNote")?.value.trim();
  const msg = document.getElementById("trackMsg");

  if (!orderId || !status) {
    if (msg) {
      msg.style.color = "#e05050";
      msg.textContent = "Order ID and status are required ❌";
    }
    return;
  }

  try {
    const res = await fetch("/vendor/update-tracking", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ orderId, status, note }),
    });
    const data = await res.json();
    if (msg) {
      msg.style.color = res.ok ? "#4caf7d" : "#e05050";
      msg.textContent = data.message;
    }
  } catch (err) {
    console.error(err);
    if (msg) msg.textContent = "Server error ❌";
  }
}

// ================= WISHLIST ───────────────────────────
function toggleWish(btn) {
  btn.classList.toggle("active");
  btn.textContent = btn.classList.contains("active") ? "♥" : "♡";
}

// ================= BUY NOW ───────────────────────────
function buyNow() {
  window.location.href = "/checkout";
}

// ================= AUTO LOAD ──────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadCart();
  updateCartCount();

  // ✅ Force all reveal elements visible after short delay
  setTimeout(() => {
    document.querySelectorAll(".reveal").forEach(el => {
      el.classList.add("in");
    });
  }, 100);
});