/**
 * PATCH & POSY — Cart
 * A small localStorage-backed cart. Only products tagged "AVAILABLE" in
 * products-data.js can be added (see main.js card rendering).
 */

const CART_STORAGE_KEY = "patchAndPosyCart";

function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartBadge();
}

/* Only bread cloths and tea cozies can be bought in more than one, and their stock is counted.
   The most that can go in one order for each design is set here. Every other product is always 1. */
const BREAD_MAX_QTY = 4;
const TEA_MAX_QTY = 3;
const STOCK_TRACKED_MAX = { "Bread Cloths": BREAD_MAX_QTY, "Tea Cozies": TEA_MAX_QTY };

/* Stock-counted products are limited by the stock left for each design (and never more than the per-order cap).
   Everything else is always 1. */
function maxQtyFor(product) {
  const cap = product ? STOCK_TRACKED_MAX[product.category] : undefined;
  if (!cap) return 1;
  return Math.min(cap, breadStockOf(product));
}

/* True for products whose stock is counted (bread cloths and tea cozies). Others are sold out after one order. */
function isStockTracked(item) {
  const p = typeof getAllProducts === "function" ? getAllProducts().find((x) => x.id === item.id) : null;
  return !!p && !!STOCK_TRACKED_MAX[p.category];
}

function addToCart(product, quantity = 1) {
  const cart = getCart();
  const max = maxQtyFor(product);
  if (max < 1) return;   // sold out
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.max = max;
    existing.qty = Math.min(Math.max(existing.qty, 1) + quantity, max);
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || product.card || (product.photos && product.photos[0]) || "",
      qty: Math.min(Math.max(quantity, 1), max),
      max: max
    });
  }
  saveCart(cart);
  renderCartDrawer();
  openCartDrawer();
}

function updateCartQty(id, qty) {
  let cart = getCart();
  if (qty <= 0) {
    cart = cart.filter((item) => item.id !== id);
  } else {
    const item = cart.find((i) => i.id === id);
    if (item) item.qty = Math.min(qty, item.max || 1);
  }
  saveCart(cart);
  renderCartDrawer();
}

function removeFromCart(id) {
  updateCartQty(id, 0);
}

function clearCart() {
  saveCart([]);
  renderCartDrawer();
}

function cartSubtotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

function cartItemCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge() {
  const badge = document.querySelector(".bag-btn");
  if (badge) badge.textContent = `Bag · ${cartItemCount()}`;
}

/* ---------- Cart drawer UI ---------- */
function openCartDrawer() {
  const overlay = document.getElementById("cart-overlay");
  const drawer = document.getElementById("cart-drawer");
  if (!overlay || !drawer) return;
  overlay.classList.add("is-open");
  drawer.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function closeCartDrawer() {
  const overlay = document.getElementById("cart-overlay");
  const drawer = document.getElementById("cart-drawer");
  if (!overlay || !drawer) return;
  overlay.classList.remove("is-open");
  drawer.classList.remove("is-open");
  document.body.style.overflow = "";
}

/* Brings saved basket lines up to date with the current catalogue
   (photo, name and price). Lines for products that no longer exist are removed. */
function refreshCartItems() {
  if (typeof getAllProducts !== "function") return;
  const cart = getCart();
  if (cart.length === 0) return;
  const all = getAllProducts();
  const next = [];
  let changed = false;
  cart.forEach((item) => {
    const p = all.find((x) => x.id === item.id);
    if (!p) { changed = true; return; }
    const image = p.image || p.card || (p.photos && p.photos[0]) || "";
    const max = maxQtyFor(p);
    if (max < 1) { changed = true; return; }   // sold out since it was added: take it out of the bag
    const qty = Math.min(Math.max(item.qty, 1), max);
    const updated = { ...item, name: p.name, price: p.price, image, max, qty };
    if (JSON.stringify(updated) !== JSON.stringify(item)) changed = true;
    next.push(updated);
  });
  if (changed) saveCart(next);
}

function renderCartDrawer() {
  const body = document.getElementById("cart-drawer-body");
  const footer = document.getElementById("cart-drawer-footer");
  if (!body || !footer) return;

  refreshCartItems();
  const cart = getCart();

  if (cart.length === 0) {
    body.innerHTML = `<p class="cart-empty">Your bag is empty. Browse the collection to find your favourite pieces.</p>`;
    footer.innerHTML = "";
    return;
  }

  body.innerHTML = cart.map((item) => `
    <div class="cart-line" data-id="${escapeHTML(item.id)}">
      <div class="cart-line-photo"${item.image ? "" : ` style="background:linear-gradient(135deg,#E0A83E,#C0396B);"`}>${item.image
        ? `<img src="${escapeHTML(String(item.image).replace(/^images\//, "images/small/"))}" alt="${escapeHTML(item.name)}">`
        : ""}</div>
      <div class="cart-line-info">
        <h4>${escapeHTML(item.name)}</h4>
        <p class="cart-line-price">${formatPKR(item.price)}</p>
        ${item.max > 1 ? `<div class="cart-qty">
          <button type="button" class="qty-btn" data-action="dec">−</button>
          <span>${item.qty}</span>
          <button type="button" class="qty-btn" data-action="inc"${item.qty >= item.max ? " disabled" : ""} title="Maximum ${item.max} for each design">+</button>
        </div>` : ""}
      </div>
      <button type="button" class="cart-line-remove" aria-label="Remove ${escapeHTML(item.name)}">✕</button>
    </div>
  `).join("");

  const subtotal = cartSubtotal();
  footer.innerHTML = `
    <div class="cart-subtotal-row">
      <span>Subtotal</span>
      <span>${formatPKR(subtotal)}</span>
    </div>
    <p class="cart-note">Our team will contact you by call or WhatsApp to confirm your order. Payment details and delivery charges will be discussed at that time.</p>
    <button type="button" class="btn-primary cart-checkout-btn" id="go-to-checkout">Checkout</button>
  `;

  body.querySelectorAll(".cart-line").forEach((line) => {
    const id = line.dataset.id;
    const cartItem = cart.find((i) => i.id === id);
    const incBtn = line.querySelector('[data-action="inc"]');
    const decBtn = line.querySelector('[data-action="dec"]');
    if (incBtn) incBtn.addEventListener("click", () => {
      updateCartQty(id, Math.min(cartItem.qty + 1, cartItem.max || 1));
    });
    if (decBtn) decBtn.addEventListener("click", () => {
      updateCartQty(id, cartItem.qty - 1);
    });
    line.querySelector(".cart-line-remove").addEventListener("click", () => {
      removeFromCart(id);
    });
  });

  const checkoutBtn = document.getElementById("go-to-checkout");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      closeCartDrawer();
      closeOtherDialogs();
      openCheckoutModal();
    });
  }
}

/* Close any open product, category, photo or patchwork popup, so checkout opens on a clean screen */
function closeOtherDialogs() {
  const keep = ["checkout-overlay", "checkout-modal", "confirm-overlay", "confirm-modal", "cart-overlay"];
  document.querySelectorAll(".modal.is-open, .drawer-overlay.is-open").forEach((el) => {
    if (keep.includes(el.id)) return;
    el.classList.remove("is-open");
  });
  document.body.style.overflow = "";
}

function initCart() {
  updateCartBadge();
  renderCartDrawer();

  const bagBtn = document.querySelector(".bag-btn");
  if (bagBtn) {
    bagBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openCartDrawer();
    });
  }

  const closeBtn = document.getElementById("cart-drawer-close");
  if (closeBtn) closeBtn.addEventListener("click", closeCartDrawer);

  const overlay = document.getElementById("cart-overlay");
  if (overlay) overlay.addEventListener("click", closeCartDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCartDrawer();
  });
}
