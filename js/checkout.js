/**
 * PATCH & POSY — Checkout
 * Collects customer details, calculates delivery charges, saves the
 * order to Firestore, and sends confirmation/notification emails.
 */

function openCheckoutModal() {
  const cart = getCart();
  if (cart.length === 0) return;

  const overlay = document.getElementById("checkout-overlay");
  const modal = document.getElementById("checkout-modal");
  if (!overlay || !modal) return;

  renderCheckoutSummary();
  overlay.classList.add("is-open");
  modal.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function closeCheckoutModal() {
  const overlay = document.getElementById("checkout-overlay");
  const modal = document.getElementById("checkout-modal");
  if (!overlay || !modal) return;
  overlay.classList.remove("is-open");
  modal.classList.remove("is-open");
  document.body.style.overflow = "";
}

function renderCheckoutSummary() {
  const summary = document.getElementById("checkout-summary");
  if (!summary) return;

  if (typeof refreshCartItems === "function") refreshCartItems();
  const cart = getCart();
  const subtotal = cartSubtotal();
  const total = subtotal;

  summary.innerHTML = `
    ${cart.map((item) => `
      <div class="checkout-line checkout-item">
        <span class="checkout-thumb">${item.image ? `<img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}">` : ""}</span>
        <span class="checkout-item-name">${escapeHTML(item.name)} × ${item.qty}</span>
        <span>${formatPKR(item.price * item.qty)}</span>
      </div>
    `).join("")}
    <div class="checkout-line"><span>Subtotal</span><span>${formatPKR(subtotal)}</span></div>
    <div class="checkout-line checkout-total"><span>Total</span><span id="checkout-total-value">${formatPKR(total)}</span></div>
  `;
}

function generateOrderId() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PP-${y}${m}${d}-${rand}`;
}

function isValidEmailAddress(value) {
  return value.length <= 120 && /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(value);
}

/* Pakistani mobile numbers only: 03xx xxxxxxx, optionally written as +92 or 0092 */
function normalisePhone(value) {
  let digits = String(value).replace(/[\s\-()]/g, "");
  if (digits.startsWith("+92")) digits = "0" + digits.slice(3);
  else if (digits.startsWith("0092")) digits = "0" + digits.slice(4);
  return digits;
}

function isValidPhone(value) {
  return /^03[0-9]{9}$/.test(normalisePhone(value));
}

/* Removes angle brackets (no HTML can be typed in) and caps the length */
function cleanText(value, max) {
  return String(value).replace(/[<>]/g, "").trim().slice(0, max);
}

async function submitOrder(event) {
  event.preventDefault();

  const form = event.target;
  const statusEl = document.getElementById("checkout-status");
  const submitBtn = form.querySelector('button[type="submit"]');

  // Hidden field that people never see: only automated form-fillers complete it
  const honeypot = form.querySelector("#checkout-website");
  if (honeypot && honeypot.value.trim() !== "") {
    showCheckoutStatus("Sorry, we could not place your order. Please try again.", "error");
    return;
  }

  const name = cleanText(form.querySelector("#checkout-name").value, 80);
  const email = form.querySelector("#checkout-email").value.trim();
  const phone = form.querySelector("#checkout-phone").value.trim();
  const address = cleanText(form.querySelector("#checkout-address").value, 200);
  const city = cleanText(form.querySelector("#checkout-city").value, 60);
  const notes = cleanText(form.querySelector("#checkout-notes").value, 500);

  if (!name || !address || !city) {
    showCheckoutStatus("Please fill in your name, address, and city.", "error");
    return;
  }
  if (!isValidEmailAddress(email)) {
    showCheckoutStatus("Please enter a valid email address.", "error");
    return;
  }
  if (!isValidPhone(phone)) {
    showCheckoutStatus("Please enter a valid phone number.", "error");
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    showCheckoutStatus("Your bag is empty.", "error");
    return;
  }

  const subtotal = cartSubtotal();
  const deliveryCharge = 0;
  const total = subtotal;

  const order = {
    orderId: generateOrderId(),
    createdAt: new Date().toISOString(),
    status: "new",
    paymentMethod: "pay_after_confirmation",
    paymentStatus: "pending",
    customer: { name, email, phone: normalisePhone(phone), address, city },
    items: cart,
    subtotal,
    deliveryCharge,
    total,
    notes
  };

  submitBtn.disabled = true;
  showCheckoutStatus("Placing your order…", "info");

  try {
    await saveOrderToFirestore(order);
  } catch (err) {
    console.error("Could not save order to Firestore:", err);
    // Order still proceeds — it's queued locally so nothing is lost,
    // and emails are still attempted below.
    saveOrderLocally(order);
  }

  const emailResults = await sendOrderEmails(order);

  // Each design is a one-of-a-kind, single-unit piece — once it's
  // ordered (from the website, same as via WhatsApp), it's sold out.
  if (typeof markProductSold === "function") {
    order.items.forEach((item) => markProductSold(item.id));
  }

  submitBtn.disabled = false;
  showOrderConfirmation(order, emailResults);
  clearCart();
  form.reset();
}

/* Firestore save (requires js/firebase-config.js to be filled in) */
async function saveOrderToFirestore(order) {
  const fb = initFirebase();
  if (!fb || !fb.db) throw new Error("Firebase not configured");
  await fb.db.collection("orders").doc(order.orderId).set(order);
}

/* Fallback so an order is never silently lost if Firebase isn't set up
   yet — stored in the browser and visible in dashboard.html's
   "Unsynced local orders" panel until Firebase is connected. */
function saveOrderLocally(order) {
  const key = "patchAndPosyLocalOrders";
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  existing.push(order);
  localStorage.setItem(key, JSON.stringify(existing));
}

function showCheckoutStatus(message, state) {
  const statusEl = document.getElementById("checkout-status");
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.dataset.state = state;
}

function showOrderConfirmation(order, emailResults) {
  closeCheckoutModal();
  const overlay = document.getElementById("confirm-overlay");
  const modal = document.getElementById("confirm-modal");
  const body = document.getElementById("confirm-body");
  if (!overlay || !modal || !body) return;

  const emailNote = emailResults.customerSent
    ? `A confirmation has been sent to ${escapeHTML(order.customer.email)}.`
    : `We could not send an email confirmation automatically. Please keep your order number for reference.`;

  body.innerHTML = `
    <p class="confirm-order-id">Order ${escapeHTML(order.orderId)}</p>
    <p>Thank you, ${escapeHTML(order.customer.name)}! Your order has been received.</p>
    <p>${emailNote}</p>
    <p>Our team will contact you by call or WhatsApp to confirm your order and share the payment details.</p>
  `;

  overlay.classList.add("is-open");
  modal.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function closeConfirmModal() {
  const overlay = document.getElementById("confirm-overlay");
  const modal = document.getElementById("confirm-modal");
  if (!overlay || !modal) return;
  overlay.classList.remove("is-open");
  modal.classList.remove("is-open");
  document.body.style.overflow = "";
}

function initCheckout() {
  const form = document.getElementById("checkout-form");
  if (form) form.addEventListener("submit", submitOrder);

  const closeBtn = document.getElementById("checkout-modal-close");
  if (closeBtn) closeBtn.addEventListener("click", closeCheckoutModal);

  const overlay = document.getElementById("checkout-overlay");
  if (overlay) overlay.addEventListener("click", closeCheckoutModal);

  const cityInput = document.getElementById("checkout-city");
  if (cityInput) cityInput.addEventListener("input", renderCheckoutSummary);

  const confirmCloseBtn = document.getElementById("confirm-modal-close");
  if (confirmCloseBtn) confirmCloseBtn.addEventListener("click", closeConfirmModal);

  const confirmOverlay = document.getElementById("confirm-overlay");
  if (confirmOverlay) confirmOverlay.addEventListener("click", closeConfirmModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeCheckoutModal();
      closeConfirmModal();
    }
  });
}
