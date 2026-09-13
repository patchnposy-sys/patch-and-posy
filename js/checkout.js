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

  const cart = getCart();
  const subtotal = cartSubtotal();
  const cityInput = document.getElementById("checkout-city");
  const currentCity = cityInput ? cityInput.value : "";
  const delivery = getDeliveryCharge(currentCity, subtotal);
  const total = subtotal + delivery;

  summary.innerHTML = `
    ${cart.map((item) => `
      <div class="checkout-line">
        <span>${escapeHTML(item.name)} × ${item.qty}</span>
        <span>${formatPKR(item.price * item.qty)}</span>
      </div>
    `).join("")}
    <div class="checkout-line"><span>Subtotal</span><span>${formatPKR(subtotal)}</span></div>
    <div class="checkout-line"><span>Delivery</span><span id="checkout-delivery-value">${delivery === 0 ? "Free" : formatPKR(delivery)}</span></div>
    <div class="checkout-line checkout-total"><span>Total</span><span id="checkout-total-value">${formatPKR(total)}</span></div>
    <div class="checkout-bank-box">
      <h4>Bank / Account Transfer details</h4>
      <p>${escapeHTML(STORE_CONFIG.bankDetails.bankName)} — ${escapeHTML(STORE_CONFIG.bankDetails.accountTitle)}</p>
      <p>Account No: ${escapeHTML(STORE_CONFIG.bankDetails.accountNumber)}</p>
      <p>IBAN: ${escapeHTML(STORE_CONFIG.bankDetails.iban)}</p>
      <p class="checkout-bank-note">Please transfer the total above and place your order — we'll confirm once payment is received.</p>
    </div>
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
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  return /^[0-9+\-\s()]{7,20}$/.test(value);
}

async function submitOrder(event) {
  event.preventDefault();

  const form = event.target;
  const statusEl = document.getElementById("checkout-status");
  const submitBtn = form.querySelector('button[type="submit"]');

  const name = form.querySelector("#checkout-name").value.trim();
  const email = form.querySelector("#checkout-email").value.trim();
  const phone = form.querySelector("#checkout-phone").value.trim();
  const address = form.querySelector("#checkout-address").value.trim();
  const city = form.querySelector("#checkout-city").value.trim();
  const notes = form.querySelector("#checkout-notes").value.trim();

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
  const deliveryCharge = getDeliveryCharge(city, subtotal);
  const total = subtotal + deliveryCharge;

  const order = {
    orderId: generateOrderId(),
    createdAt: new Date().toISOString(),
    status: "new",
    paymentMethod: "bank_transfer",
    paymentStatus: "pending",
    customer: { name, email, phone, address, city },
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
    : `We couldn't send an email confirmation automatically — please save your order number below.`;

  body.innerHTML = `
    <p class="confirm-order-id">Order ${escapeHTML(order.orderId)}</p>
    <p>Thank you, ${escapeHTML(order.customer.name)}! Your order has been received.</p>
    <p>${emailNote}</p>
    <div class="checkout-bank-box">
      <h4>Please complete your transfer to:</h4>
      <p>${escapeHTML(STORE_CONFIG.bankDetails.bankName)} — ${escapeHTML(STORE_CONFIG.bankDetails.accountTitle)}</p>
      <p>Account No: ${escapeHTML(STORE_CONFIG.bankDetails.accountNumber)}</p>
      <p>IBAN: ${escapeHTML(STORE_CONFIG.bankDetails.iban)}</p>
      <p class="checkout-bank-note">Amount: ${formatPKR(order.total)}</p>
    </div>
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
