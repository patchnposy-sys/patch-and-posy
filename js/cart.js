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

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || "",
      qty: 1
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
    if (item) item.qty = qty;
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

function renderCartDrawer() {
  const body = document.getElementById("cart-drawer-body");
  const footer = document.getElementById("cart-drawer-footer");
  if (!body || !footer) return;

  const cart = getCart();

  if (cart.length === 0) {
    body.innerHTML = `<p class="cart-empty">Your bag is empty. Browse the shop and add a few handmade favourites.</p>`;
    footer.innerHTML = "";
    return;
  }

  body.innerHTML = cart.map((item) => `
    <div class="cart-line" data-id="${escapeHTML(item.id)}">
      <div class="cart-line-photo" style="${item.image
        ? `background-image:url('${escapeHTML(item.image)}');background-size:cover;background-position:center;`
        : `background:linear-gradient(135deg,#E0A83E,#C0396B);`}"></div>
      <div class="cart-line-info">
        <h4>${escapeHTML(item.name)}</h4>
        <p class="cart-line-price">${formatPKR(item.price)}</p>
        <div class="cart-qty">
          <button type="button" class="qty-btn" data-action="dec">−</button>
          <span>${item.qty}</span>
          <button type="button" class="qty-btn" data-action="inc">+</button>
        </div>
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
    <p class="cart-note">Delivery charges are calculated at checkout.</p>
    <button type="button" class="btn-primary cart-checkout-btn" id="go-to-checkout">Checkout</button>
  `;

  body.querySelectorAll(".cart-line").forEach((line) => {
    const id = line.dataset.id;
    const cartItem = cart.find((i) => i.id === id);
    line.querySelector('[data-action="inc"]').addEventListener("click", () => {
      updateCartQty(id, cartItem.qty + 1);
    });
    line.querySelector('[data-action="dec"]').addEventListener("click", () => {
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
      openCheckoutModal();
    });
  }
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
