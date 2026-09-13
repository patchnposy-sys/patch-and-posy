/**
 * PATCH & POSY — Dashboard
 * Gated by Firebase Authentication. Only a signed-in user can read,
 * list, or update orders — that's enforced server-side by the Firestore
 * Security Rules described in SETUP.md, not just by this file, so the
 * data stays private even if someone finds this page's URL.
 */

let allOrders = [];

document.addEventListener("DOMContentLoaded", () => {
  const fb = initFirebase();
  if (!fb || !fb.auth) {
    showLoginStatus("Firebase isn't configured yet. See SETUP.md, then js/firebase-config.js.", "error");
    return;
  }

  fb.auth.onAuthStateChanged((user) => {
    if (user) {
      showDashboard(user);
      loadOrders();
    } else {
      showLoginScreen();
    }
  });

  initLoginForm(fb);
  initLogout(fb);
  initTabs();
  initOrderFilters();
  initOrderDetailModal();
  renderLocalOrders();
});

/* ---------- Login ---------- */
function initLoginForm(fb) {
  const form = document.getElementById("dash-login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("dash-email").value.trim();
    const password = document.getElementById("dash-password").value;
    showLoginStatus("Signing in…", "info");

    try {
      await fb.auth.signInWithEmailAndPassword(email, password);
      showLoginStatus("", "info");
    } catch (err) {
      console.error(err);
      showLoginStatus("Sign-in failed — check your email and password.", "error");
    }
  });
}

function showLoginStatus(message, state) {
  const el = document.getElementById("dash-login-status");
  if (!el) return;
  el.textContent = message;
  el.dataset.state = state;
}

function initLogout(fb) {
  const btn = document.getElementById("dash-logout-btn");
  if (!btn) return;
  btn.addEventListener("click", () => fb.auth.signOut());
}

function showLoginScreen() {
  document.getElementById("dash-login-screen").hidden = false;
  document.getElementById("dash-app").hidden = true;
}

function showDashboard(user) {
  document.getElementById("dash-login-screen").hidden = true;
  document.getElementById("dash-app").hidden = false;
  const emailEl = document.getElementById("dash-user-email");
  if (emailEl) emailEl.textContent = user.email;
}

/* ---------- Tabs ---------- */
function initTabs() {
  document.querySelectorAll(".dash-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".dash-tab").forEach((t) => t.classList.remove("is-active"));
      document.querySelectorAll(".dash-panel").forEach((p) => p.classList.remove("is-active"));
      tab.classList.add("is-active");
      document.getElementById(`panel-${tab.dataset.tab}`).classList.add("is-active");
      if (tab.dataset.tab === "clients") renderClients();
      if (tab.dataset.tab === "products") loadProductStatuses();
      if (tab.dataset.tab === "local") renderLocalOrders();
    });
  });
}

/* ---------- Orders ---------- */
async function loadOrders() {
  const fb = initFirebase();
  const tbody = document.getElementById("orders-table-body");
  if (!fb || !fb.db) return;

  try {
    const snapshot = await fb.db.collection("orders").orderBy("createdAt", "desc").get();
    allOrders = snapshot.docs.map((doc) => doc.data());
    renderOrdersTable();
  } catch (err) {
    console.error("Failed to load orders:", err);
    tbody.innerHTML = `<tr><td colspan="8" class="dash-empty">Couldn't load orders. Check your Firestore Security Rules (see SETUP.md).</td></tr>`;
  }
}

function renderOrdersTable() {
  const tbody = document.getElementById("orders-table-body");
  const filter = document.getElementById("orders-status-filter").value;
  const filtered = filter ? allOrders.filter((o) => o.status === filter) : allOrders;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="dash-empty">No orders yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((order) => `
    <tr>
      <td>${escapeHTML(order.orderId)}</td>
      <td>${formatDate(order.createdAt)}</td>
      <td>${escapeHTML(order.customer?.name || "")}</td>
      <td>${escapeHTML(order.customer?.city || "")}</td>
      <td>${formatPKR(order.total)}</td>
      <td>${escapeHTML(order.paymentStatus || "pending")}</td>
      <td>
        <select class="dash-status-select" data-order-id="${escapeHTML(order.orderId)}">
          ${["new", "confirmed", "shipped", "completed", "cancelled"].map(s =>
            `<option value="${s}" ${order.status === s ? "selected" : ""}>${s}</option>`
          ).join("")}
        </select>
      </td>
      <td><button type="button" class="dash-view-btn" data-order-id="${escapeHTML(order.orderId)}">View</button></td>
    </tr>
  `).join("");

  tbody.querySelectorAll(".dash-status-select").forEach((select) => {
    select.addEventListener("change", () => updateOrderStatus(select.dataset.orderId, select.value));
  });
  tbody.querySelectorAll(".dash-view-btn").forEach((btn) => {
    btn.addEventListener("click", () => openOrderDetail(btn.dataset.orderId));
  });
}

async function updateOrderStatus(orderId, status) {
  const fb = initFirebase();
  if (!fb || !fb.db) return;
  try {
    await fb.db.collection("orders").doc(orderId).update({ status });
    const order = allOrders.find((o) => o.orderId === orderId);
    if (order) order.status = status;
  } catch (err) {
    console.error("Failed to update status:", err);
    alert("Couldn't update this order's status. Please try again.");
  }
}

function initOrderFilters() {
  const filter = document.getElementById("orders-status-filter");
  if (filter) filter.addEventListener("change", renderOrdersTable);
  const refreshBtn = document.getElementById("orders-refresh-btn");
  if (refreshBtn) refreshBtn.addEventListener("click", loadOrders);
}

/* ---------- Order detail modal ---------- */
function initOrderDetailModal() {
  const closeBtn = document.getElementById("order-detail-close");
  const overlay = document.getElementById("order-detail-overlay");
  if (closeBtn) closeBtn.addEventListener("click", closeOrderDetail);
  if (overlay) overlay.addEventListener("click", closeOrderDetail);
}

function openOrderDetail(orderId) {
  const order = allOrders.find((o) => o.orderId === orderId);
  if (!order) return;

  document.getElementById("order-detail-title").textContent = `Order ${order.orderId}`;
  document.getElementById("order-detail-body").innerHTML = `
    <p><strong>${escapeHTML(order.customer?.name || "")}</strong></p>
    <p>${escapeHTML(order.customer?.email || "")} · ${escapeHTML(order.customer?.phone || "")}</p>
    <p>${escapeHTML(order.customer?.address || "")}, ${escapeHTML(order.customer?.city || "")}</p>
    <hr>
    ${(order.items || []).map((item) => `
      <div class="checkout-line"><span>${escapeHTML(item.name)} × ${item.qty}</span><span>${formatPKR(item.price * item.qty)}</span></div>
    `).join("")}
    <div class="checkout-line"><span>Subtotal</span><span>${formatPKR(order.subtotal)}</span></div>
    <div class="checkout-line"><span>Delivery</span><span>${formatPKR(order.deliveryCharge)}</span></div>
    <div class="checkout-line checkout-total"><span>Total</span><span>${formatPKR(order.total)}</span></div>
    ${order.notes ? `<p><em>Note: ${escapeHTML(order.notes)}</em></p>` : ""}
  `;

  document.getElementById("order-detail-overlay").classList.add("is-open");
  document.getElementById("order-detail-modal").classList.add("is-open");
}

function closeOrderDetail() {
  document.getElementById("order-detail-overlay").classList.remove("is-open");
  document.getElementById("order-detail-modal").classList.remove("is-open");
}

/* ---------- Clients (derived from orders) ---------- */
function renderClients() {
  const tbody = document.getElementById("clients-table-body");
  if (!tbody) return;

  const byEmail = {};
  allOrders.forEach((order) => {
    const email = order.customer?.email;
    if (!email) return;
    if (!byEmail[email]) {
      byEmail[email] = {
        name: order.customer.name,
        email,
        phone: order.customer.phone,
        city: order.customer.city,
        orderCount: 0,
        totalSpent: 0
      };
    }
    byEmail[email].orderCount += 1;
    byEmail[email].totalSpent += order.total || 0;
  });

  const clients = Object.values(byEmail).sort((a, b) => b.totalSpent - a.totalSpent);

  if (clients.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="dash-empty">No clients yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = clients.map((c) => `
    <tr>
      <td>${escapeHTML(c.name)}</td>
      <td>${escapeHTML(c.email)}</td>
      <td>${escapeHTML(c.phone)}</td>
      <td>${escapeHTML(c.city)}</td>
      <td>${c.orderCount}</td>
      <td>${formatPKR(c.totalSpent)}</td>
    </tr>
  `).join("");
}

/* ---------- Local (unsynced) orders fallback ---------- */
function renderLocalOrders() {
  const tbody = document.getElementById("local-orders-table-body");
  if (!tbody) return;

  const key = "patchAndPosyLocalOrders";
  const local = JSON.parse(localStorage.getItem(key) || "[]");

  if (local.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="dash-empty">None right now.</td></tr>`;
    return;
  }

  tbody.innerHTML = local.map((order, index) => `
    <tr>
      <td>${escapeHTML(order.orderId)}</td>
      <td>${formatDate(order.createdAt)}</td>
      <td>${escapeHTML(order.customer?.name || "")}</td>
      <td>${formatPKR(order.total)}</td>
      <td><button type="button" class="dash-sync-btn" data-index="${index}">Sync now</button></td>
    </tr>
  `).join("");

  tbody.querySelectorAll(".dash-sync-btn").forEach((btn) => {
    btn.addEventListener("click", () => syncLocalOrder(Number(btn.dataset.index)));
  });
}

async function syncLocalOrder(index) {
  const fb = initFirebase();
  if (!fb || !fb.db) {
    alert("Firebase still isn't configured — finish SETUP.md first.");
    return;
  }
  const key = "patchAndPosyLocalOrders";
  const local = JSON.parse(localStorage.getItem(key) || "[]");
  const order = local[index];
  if (!order) return;

  try {
    await fb.db.collection("orders").doc(order.orderId).set(order);
    local.splice(index, 1);
    localStorage.setItem(key, JSON.stringify(local));
    renderLocalOrders();
    loadOrders();
  } catch (err) {
    console.error("Sync failed:", err);
    alert("Sync failed — check your connection and Firestore rules.");
  }
}

/* ---------- Products (live AVAILABLE / SOLD status) ---------- */
let liveProductStatuses = {};

function getCatalogProducts() {
  return [
    ...(typeof SPREADS !== "undefined" ? SPREADS : []),
    ...(typeof TABLECLOTHS !== "undefined" ? TABLECLOTHS : []),
    ...(typeof ACCESSORIES !== "undefined" ? ACCESSORIES : [])
  ];
}

async function loadProductStatuses() {
  const fb = initFirebase();
  const tbody = document.getElementById("products-table-body");
  if (!fb || !fb.db || !tbody) return;

  try {
    const snapshot = await fb.db.collection("productStatus").get();
    liveProductStatuses = {};
    snapshot.docs.forEach((doc) => { liveProductStatuses[doc.id] = doc.data().status; });
    renderProductsTable();
  } catch (err) {
    console.error("Failed to load product statuses:", err);
    tbody.innerHTML = `<tr><td colspan="5" class="dash-empty">Couldn't load product statuses. Check your Firestore Security Rules.</td></tr>`;
  }
}

function renderProductsTable() {
  const tbody = document.getElementById("products-table-body");
  if (!tbody) return;

  const products = getCatalogProducts();
  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="dash-empty">No products found — check js/products-data.js is loaded.</td></tr>`;
    return;
  }

  tbody.innerHTML = products.map((p) => {
    const liveStatus = liveProductStatuses[p.id] || p.tag || "AVAILABLE";
    return `
      <tr>
        <td>${escapeHTML(p.id)}</td>
        <td>${escapeHTML(p.name)}</td>
        <td>${escapeHTML(p.category || p.subcategory || "—")}</td>
        <td>${escapeHTML(p.tag || "—")}</td>
        <td>
          <select class="dash-status-select" data-product-id="${escapeHTML(p.id)}">
            ${["AVAILABLE", "SOLD"].map(s =>
              `<option value="${s}" ${liveStatus.toUpperCase() === s ? "selected" : ""}>${s}</option>`
            ).join("")}
          </select>
        </td>
      </tr>
    `;
  }).join("");

  tbody.querySelectorAll(".dash-status-select").forEach((select) => {
    select.addEventListener("change", () => updateProductStatus(select.dataset.productId, select.value));
  });
}

async function updateProductStatus(productId, status) {
  const fb = initFirebase();
  if (!fb || !fb.db) return;
  try {
    await fb.db.collection("productStatus").doc(productId).set({
      status,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    liveProductStatuses[productId] = status;
  } catch (err) {
    console.error("Failed to update product status:", err);
    alert("Couldn't update this product's status. Please try again.");
  }
}

/* ---------- Helpers ---------- */
function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso || "";
  }
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = String(str ?? "");
  return div.innerHTML;
}
