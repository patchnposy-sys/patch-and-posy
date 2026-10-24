/**
 * PATCH & POSY — Dashboard
 * Gated by Firebase Authentication. Only a signed-in user can read,
 * list, or update orders — that's enforced server-side by the Firestore
 * Security Rules described in SETUP.md, not just by this file, so the
 * data stays private even if someone finds this page's URL.
 *
 * Changes on the Orders, Products and Prices tabs are STAGED. Nothing is
 * written until "Save changes" is pressed at the bottom of the page, and
 * "Cancel" throws the staged changes away. After a save the page reloads
 * so everything shown matches what is live on the website.
 */

let allOrders = [];

/* Shown before an order is deleted or cancelled: the item must be reopened first */
const RESTOCK_REMINDER = "Before you continue: have you already set the item back to AVAILABLE in the Products tab, or increased its stock in the Prices tab, and pressed Save changes?\n\nPress OK only if you have.";

/* Saved values from Firestore */
let liveProductStatuses = {};   // productId -> "AVAILABLE" | "SOLD"
let liveProductPrices = {};     // productId -> number (rupees)
let liveProductDetails = {};    // productId -> { description, dimensions, care } as saved

/* Staged (not yet saved) changes */
let pendingOrderStatus = {};    // orderId -> status
let pendingProductStatus = {};  // productId -> "AVAILABLE" | "SOLD"
let pendingPrices = {};         // productId -> number
let invalidPriceIds = new Set(); // red boxes: price ids, and "stock:<id>" for stock boxes
let pendingDetails = {};        // productId -> { description?, dimensions?, care? }
let pendingStock = {};          // bread cloth productId -> whole number of pieces
let liveProductStock = {};      // productStock/{id} -> saved number of pieces

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
  initSaveBar();
  renderLocalOrders();
  initSubscriberCopy();
  if (typeof initEmailJS === "function") initEmailJS();
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
  btn.addEventListener("click", () => {
    if (hasUnsavedChanges() && !window.confirm("You have unsaved changes. Log out and discard them?")) return;
    fb.auth.signOut();
  });
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
      if (tab.dataset.tab === "products" || tab.dataset.tab === "prices" || tab.dataset.tab === "details") loadProductStatuses();
      if (tab.dataset.tab === "local") renderLocalOrders();
      if (tab.dataset.tab === "subscribers") loadSubscribers();
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
    updateSaveBar();
  } catch (err) {
    console.error("Failed to load orders:", err);
    tbody.innerHTML = `<tr><td colspan="8" class="dash-empty">Couldn't load orders. Check your Firestore Security Rules (see SETUP.md).</td></tr>`;
  }
}

/* The status shown for an order: the staged one if there is one, otherwise the saved one */
function orderStatusOf(order) {
  return pendingOrderStatus[order.orderId] || order.status || "new";
}

function renderOrdersTable() {
  const tbody = document.getElementById("orders-table-body");
  const filter = document.getElementById("orders-status-filter").value;
  const filtered = filter ? allOrders.filter((o) => orderStatusOf(o) === filter) : allOrders;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="dash-empty">No orders yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((order) => {
    const current = orderStatusOf(order);
    const changed = pendingOrderStatus[order.orderId] !== undefined;
    return `
    <tr class="${changed ? "dash-row-changed" : ""}">
      <td>${escapeHTML(order.orderId)}</td>
      <td>${formatDate(order.createdAt)}</td>
      <td>${escapeHTML(order.customer?.name || "")}</td>
      <td>${escapeHTML(order.customer?.city || "")}</td>
      <td>${formatPKR(order.total)}</td>
      <td>${escapeHTML(order.paymentStatus || "pending")}</td>
      <td>
        <select class="dash-status-select" data-order-id="${escapeHTML(order.orderId)}">
          ${["new", "confirmed", "shipped", "completed", "cancelled"].map(s =>
            `<option value="${s}" ${current === s ? "selected" : ""}>${s}</option>`
          ).join("")}
        </select>
      </td>
      <td><button type="button" class="dash-view-btn" data-order-id="${escapeHTML(order.orderId)}">View</button><button type="button" class="dash-view-btn dash-delete-btn" data-delete-order="${escapeHTML(order.orderId)}">Delete</button></td>
    </tr>`;
  }).join("");

  tbody.querySelectorAll(".dash-status-select").forEach((select) => {
    select.addEventListener("change", () => setPendingOrderStatus(select.dataset.orderId, select.value));
  });
  tbody.querySelectorAll(".dash-view-btn[data-order-id]").forEach((btn) => {
    btn.addEventListener("click", () => openOrderDetail(btn.dataset.orderId));
  });
  tbody.querySelectorAll("[data-delete-order]").forEach((btn) => {
    btn.addEventListener("click", () => deleteOrder(btn.dataset.deleteOrder));
  });
}

/* Deletes orders from Firestore, then removes them from the page */
async function deleteOrders(orderIds) {
  const fb = initFirebase();
  if (!fb || !fb.db) {
    alert("Firebase is not connected, so nothing was deleted.");
    return;
  }
  try {
    for (let i = 0; i < orderIds.length; i += 400) {
      const batch = fb.db.batch();
      orderIds.slice(i, i + 400).forEach((id) => batch.delete(fb.db.collection("orders").doc(id)));
      await batch.commit();
    }
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Couldn't delete. Check your connection and try again.");
    return;
  }
  const gone = new Set(orderIds);
  allOrders = allOrders.filter((o) => !gone.has(o.orderId));
  orderIds.forEach((id) => { delete pendingOrderStatus[id]; });
  renderOrdersTable();
  renderClients();
  updateSaveBar();
}

async function deleteOrder(orderId) {
  const order = allOrders.find((o) => o.orderId === orderId);
  if (!order) return;
  if (!confirm(`Delete order ${orderId} (${order.customer?.name || "no name"})? This cannot be undone.\n\n${RESTOCK_REMINDER}`)) return;
  await deleteOrders([orderId]);
}

async function deleteClient(email) {
  const ids = allOrders.filter((o) => o.customer?.email === email).map((o) => o.orderId);
  if (ids.length === 0) return;
  if (!confirm(`Delete ${email} and all ${ids.length} of their order${ids.length === 1 ? "" : "s"}? This cannot be undone.\n\n${RESTOCK_REMINDER}`)) return;
  await deleteOrders(ids);
}

function setPendingOrderStatus(orderId, status) {
  const order = allOrders.find((o) => o.orderId === orderId);
  if (!order) return;
  if (status === (order.status || "new")) delete pendingOrderStatus[orderId];
  else pendingOrderStatus[orderId] = status;
  renderOrdersTable();
  updateSaveBar();
}

function initOrderFilters() {
  const filter = document.getElementById("orders-status-filter");
  if (filter) filter.addEventListener("change", renderOrdersTable);
  const refreshBtn = document.getElementById("orders-refresh-btn");
  if (refreshBtn) refreshBtn.addEventListener("click", () => {
    if (hasUnsavedChanges()) {
      alert("Save or cancel your unsaved changes first, then refresh.");
      return;
    }
    loadOrders();
  });
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
    tbody.innerHTML = `<tr><td colspan="7" class="dash-empty">No clients yet.</td></tr>`;
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
      <td><button type="button" class="dash-view-btn dash-delete-btn" data-delete-client="${escapeHTML(c.email)}">Delete</button></td>
    </tr>
  `).join("");

  tbody.querySelectorAll("[data-delete-client]").forEach((btn) => {
    btn.addEventListener("click", () => deleteClient(btn.dataset.deleteClient));
  });
}

/* ---------- Subscribers (newsletter emails from the website) ---------- */
let subscriberEmails = [];   // emails currently listed, used by "Copy all emails"

function initSubscriberCopy() {
  const btn = document.getElementById("subscribers-copy-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    if (subscriberEmails.length === 0) {
      showSaveResult("There are no subscribers to copy yet.", "warning");
      return;
    }
    try {
      // Comma-separated, so the list pastes straight into a mailing-list or BCC field
      await navigator.clipboard.writeText(subscriberEmails.join(", "));
      showSaveResult(`Copied ${subscriberEmails.length} email address${subscriberEmails.length === 1 ? "" : "es"}.`, "success");
    } catch (err) {
      console.error(err);
      showSaveResult("Couldn't copy automatically. Select the emails in the table and copy them.", "error");
    }
  });
}

async function loadSubscribers() {
  const fb = initFirebase();
  const tbody = document.getElementById("subscribers-table-body");
  if (!tbody) return;
  if (!fb || !fb.db) {
    tbody.innerHTML = `<tr><td colspan="3" class="dash-empty">Firebase isn't configured yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = `<tr><td colspan="3" class="dash-empty">Loading subscribers…</td></tr>`;
  try {
    const snapshot = await fb.db.collection("subscribers").orderBy("createdAt", "desc").get();
    const subscribers = snapshot.docs.map((doc) => doc.data());
    renderSubscribers(subscribers);
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="3" class="dash-empty">Couldn't load subscribers. Check your Firestore Security Rules (see SETUP.md).</td></tr>`;
  }
}

function renderSubscribers(subscribers) {
  const tbody = document.getElementById("subscribers-table-body");
  subscriberEmails = subscribers.map((s) => s.email);
  if (!tbody) return;

  if (subscribers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="dash-empty">No subscribers yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = subscribers.map((s) => `
    <tr>
      <td>${escapeHTML(s.email)}</td>
      <td>${escapeHTML(formatDate(s.createdAt))}</td>
      <td><button type="button" class="dash-view-btn dash-delete-btn" data-delete-subscriber="${escapeHTML(s.email)}">Delete</button></td>
    </tr>
  `).join("");

  tbody.querySelectorAll("[data-delete-subscriber]").forEach((btn) => {
    btn.addEventListener("click", () => deleteSubscriber(btn.dataset.deleteSubscriber));
  });
}

async function deleteSubscriber(email) {
  const fb = initFirebase();
  if (!fb || !fb.db) return;
  if (!window.confirm(`Remove ${email} from the subscribers list?`)) return;

  try {
    await fb.db.collection("subscribers").doc(email).delete();
    showSaveResult("Subscriber removed.", "success");
    loadSubscribers();
  } catch (err) {
    console.error(err);
    showSaveResult("Couldn't remove this subscriber. Please try again.", "error");
  }
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

/* ---------- Details tab: description, dimensions, care (live from Firestore) ---------- */
/* Products that have a Details box: tablecloth designs and the accessory kinds */
function getDetailProducts() {
  return [
    ...(typeof TABLECLOTH_DESIGNS !== "undefined" ? TABLECLOTH_DESIGNS : []),
    ...(typeof ACCESSORIES !== "undefined" ? ACCESSORIES : [])
  ];
}

/* What the website shows when nothing is saved for a product */
function defaultDetailsOf(p) {
  return {
    description: p.description || p.desc || "",
    dimensions: typeof p.dimensions === "string" ? p.dimensions : "",
    care: p.careInstructions || ""
  };
}

/* What the website shows now: the saved text if there is one, otherwise the default */
function currentDetailsOf(p) {
  const saved = liveProductDetails[p.id] || {};
  const def = defaultDetailsOf(p);
  const pick = (value, fallback) => (typeof value === "string" ? value : fallback);
  return {
    description: pick(saved.description, def.description),
    dimensions: pick(saved.dimensions, def.dimensions),
    care: pick(saved.care, def.care)
  };
}

async function loadProductDetails() {
  const fb = initFirebase();
  if (fb && fb.db) {
    try {
      const snap = await fb.db.collection("productDetails").get();
      liveProductDetails = {};
      snap.docs.forEach((doc) => { liveProductDetails[doc.id] = doc.data(); });
    } catch (err) {
      console.error("Failed to load product details:", err);
      document.getElementById("details-table-body").innerHTML = `<tr><td colspan="5" class="dash-empty">Couldn't load details. Check your Firestore Security Rules (see SETUP.md).</td></tr>`;
      return;
    }
  }
  renderDetailsTable();
}

function renderDetailsTable() {
  const tbody = document.getElementById("details-table-body");
  if (!tbody) return;

  const products = getDetailProducts();
  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="dash-empty">No products found — check js/products-data.js is loaded.</td></tr>`;
    return;
  }

  const groups = new Map();
  products.forEach((p) => {
    const key = productGroup(p);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  });

  let html = "";
  groups.forEach((items, name) => {
    html += `<tr class="dash-group-row"><th colspan="5">${escapeHTML(name)}</th></tr>`;
    html += items.map(detailRowHTML).join("");
  });
  tbody.innerHTML = html;

  tbody.querySelectorAll("[data-detail-id]").forEach((field) => {
    field.addEventListener("input", () => setPendingDetail(field));
  });
}

function detailRowHTML(p) {
  const pending = pendingDetails[p.id] || {};
  const shown = currentDetailsOf(p);
  const valueOf = (field) => (pending[field] !== undefined ? pending[field] : shown[field]);
  const changed = Object.keys(pending).length > 0;
  return `
    <tr class="${changed ? "dash-row-changed" : ""}">
      <td>${escapeHTML(p.id)}</td>
      <td>${escapeHTML(p.name)}</td>
      <td><textarea class="dash-detail-input" rows="3" data-detail-id="${escapeHTML(p.id)}" data-field="description">${escapeHTML(valueOf("description"))}</textarea></td>
      <td><input type="text" class="dash-detail-input" data-detail-id="${escapeHTML(p.id)}" data-field="dimensions" value="${escapeHTML(valueOf("dimensions"))}" placeholder="e.g. 60 × 108 in"></td>
      <td><textarea class="dash-detail-input" rows="3" data-detail-id="${escapeHTML(p.id)}" data-field="care">${escapeHTML(valueOf("care"))}</textarea></td>
    </tr>`;
}

/* Reads one Details box. Only text that differs from what the website shows is kept. */
function setPendingDetail(field) {
  const id = field.dataset.detailId;
  const name = field.dataset.field;
  const p = findProduct(id);
  if (!p) return;

  const value = field.value.trim();
  pendingDetails[id] = pendingDetails[id] || {};
  if (value === currentDetailsOf(p)[name]) {
    delete pendingDetails[id][name];
    if (Object.keys(pendingDetails[id]).length === 0) delete pendingDetails[id];
  } else {
    pendingDetails[id][name] = value;
  }

  field.closest("tr").classList.toggle("dash-row-changed", !!pendingDetails[id]);
  updateSaveBar();
}

/* ---------- Products + Prices (live from Firestore) ---------- */
function getCatalogProducts() {
  // Order: Tablecloths (Volume 2), Accessories (Volume 2), Spreads (Volume 1)
  return [
    ...(typeof TABLECLOTH_DESIGNS !== "undefined" ? TABLECLOTH_DESIGNS : []),
    ...(typeof ACCESSORIES !== "undefined" ? ACCESSORIES : []),
    ...(typeof SPREADS !== "undefined" ? SPREADS : [])
  ];
}

function findProduct(productId) {
  return getCatalogProducts().find((p) => p.id === productId);
}

/* Group heading each product is listed under in the Products and Prices tabs */
function productGroup(p) {
  if (p.style) {
    const style = (typeof TABLECLOTH_STYLES !== "undefined" ? TABLECLOTH_STYLES : []).find(s => s.id === p.style);
    return "Tablecloths — " + (style ? style.name : p.style);
  }
  if (p.category) return "Accessories — " + p.category;
  return "Volume 1 — Patchwork Spreads";
}

/* Saved status (what the website shows now) */
function liveStatusOf(p) {
  return String(liveProductStatuses[p.id] || p.tag || "").toUpperCase();
}

/* Saved price (what the website charges now) */
function livePriceOf(p) {
  return liveProductPrices[p.id] || p.price;
}

function groupedProducts() {
  const groups = new Map();
  getCatalogProducts().forEach((p) => {
    const key = productGroup(p);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  });
  return groups;
}

/* Loads the saved statuses and prices, then draws both tabs */
async function loadProductStatuses() {
  await loadProductDetails();
  const fb = initFirebase();
  if (fb && fb.db) {
    try {
      const [statusSnap, priceSnap, stockSnap] = await Promise.all([
        fb.db.collection("productStatus").get(),
        fb.db.collection("productPrices").get(),
        fb.db.collection("productStock").get()
      ]);
      liveProductStatuses = {};
      liveProductPrices = {};
      liveProductStock = {};
      stockSnap.docs.forEach((doc) => {
        const n = Number(doc.data().stock);
        if (Number.isInteger(n) && n >= 0) liveProductStock[doc.id] = n;
      });
      statusSnap.docs.forEach((doc) => {
        const status = doc.data().status;
        if (status) liveProductStatuses[doc.id] = String(status).toUpperCase();
      });
      priceSnap.docs.forEach((doc) => {
        const price = Number(doc.data().price);
        if (price > 0) liveProductPrices[doc.id] = price;
      });
    } catch (err) {
      console.error("Failed to load product data:", err);
      const message = `<tr><td colspan="5" class="dash-empty">Couldn't load live data. Check your Firestore Security Rules (see SETUP.md).</td></tr>`;
      document.getElementById("products-table-body").innerHTML = message;
      document.getElementById("prices-table-body").innerHTML = message;
      return;
    }
  }
  renderProductsTable();
  renderPricesTable();
  updateSaveBar();
}

function renderProductsTable() {
  const tbody = document.getElementById("products-table-body");
  if (!tbody) return;

  if (getCatalogProducts().length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="dash-empty">No products found — check js/products-data.js is loaded.</td></tr>`;
    return;
  }

  let html = "";
  groupedProducts().forEach((items, name) => {
    html += `
      <tr class="dash-group-row">
        <th colspan="5">${escapeHTML(name)}</th>
      </tr>`;
    html += items.map(productRowHTML).join("");
  });
  tbody.innerHTML = html;

  tbody.querySelectorAll(".dash-status-select").forEach((select) => {
    select.addEventListener("change", () => setPendingProductStatus(select.dataset.productId, select.value));
  });
}

function productRowHTML(p) {
  const saved = liveStatusOf(p);
  const chosen = pendingProductStatus[p.id] || saved;
  const changed = pendingProductStatus[p.id] !== undefined;
  const options = [...new Set(["AVAILABLE", "SOLD", chosen])];

  return `
    <tr class="${changed ? "dash-row-changed" : ""}">
      <td>${escapeHTML(p.id)}</td>
      <td>${escapeHTML(p.name)}</td>
      <td>${escapeHTML(productGroup(p))}</td>
      <td><span class="dash-live-badge${saved === "AVAILABLE" ? " is-available" : ""}">${escapeHTML(saved)}</span></td>
      <td>
        <select class="dash-status-select" data-product-id="${escapeHTML(p.id)}">
          ${options.map(s => `<option value="${escapeHTML(s)}" ${chosen === s ? "selected" : ""}>${escapeHTML(s)}</option>`).join("")}
        </select>
      </td>
    </tr>`;
}

function setPendingProductStatus(productId, status) {
  const p = findProduct(productId);
  if (!p) return;
  if (status === liveStatusOf(p)) delete pendingProductStatus[productId];
  else pendingProductStatus[productId] = status;
  renderProductsTable();
  updateSaveBar();
}

function renderPricesTable() {
  const tbody = document.getElementById("prices-table-body");
  if (!tbody) return;

  invalidPriceIds.clear();

  if (getCatalogProducts().length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="dash-empty">No products found — check js/products-data.js is loaded.</td></tr>`;
    return;
  }

  let html = "";
  groupedProducts().forEach((items, name) => {
    html += `
      <tr class="dash-group-row">
        <th colspan="5">${escapeHTML(name)}</th>
      </tr>`;
    html += items.map(priceRowHTML).join("");
  });
  tbody.innerHTML = html;

  tbody.querySelectorAll(".dash-price-input").forEach((input) => {
    input.addEventListener("input", () => setPendingPrice(input));
  });
  tbody.querySelectorAll(".dash-stock-input").forEach((input) => {
    input.addEventListener("input", () => setPendingStock(input));
  });
}

function priceRowHTML(p) {
  const pending = pendingPrices[p.id];
  return `
    <tr class="${pending !== undefined ? "dash-row-changed" : ""}">
      <td>${escapeHTML(p.id)}</td>
      <td>${escapeHTML(p.name)}</td>
      <td>${formatPKR(livePriceOf(p))}</td>
      <td>
        <input type="number" min="1" step="1" inputmode="numeric" class="dash-price-input"
          data-price-id="${escapeHTML(p.id)}" value="${pending !== undefined ? pending : ""}"
          placeholder="Leave blank to keep">
      </td>
      <td>${p.category === "Bread Cloths" || p.category === "Tea Cozies" ? stockCellHTML(p) : "—"}</td>
    </tr>`;
}

/* Stock cell for bread cloths: what is saved now, and a box for a new number */
function stockCellHTML(p) {
  const saved = liveProductStock[p.id];
  const pending = pendingStock[p.id];
  return `
    <div>Now: <strong>${saved !== undefined ? saved : "not set"}</strong></div>
    <input type="number" min="0" step="1" inputmode="numeric" class="dash-stock-input"
      data-stock-id="${escapeHTML(p.id)}" value="${pending !== undefined ? pending : ""}"
      placeholder="Leave blank to keep">`;
}

/* Reads a Stock box. Blank = no change. Must be a whole number, 0 or more. */
function setPendingStock(input) {
  const id = input.dataset.stockId;
  const raw = input.value.trim();
  const redKey = "stock:" + id;

  delete pendingStock[id];
  invalidPriceIds.delete(redKey);
  input.classList.remove("is-invalid");

  if (raw !== "") {
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 0) {
      invalidPriceIds.add(redKey);
      input.classList.add("is-invalid");
    } else if (n !== liveProductStock[id]) {
      pendingStock[id] = n;
    }
  }

  input.closest("tr").classList.toggle("dash-row-changed", pendingStock[id] !== undefined || pendingPrices[id] !== undefined);
  updateSaveBar();
}

/* Reads a New Price box. Blank = no change. Must be a whole number above 0. */
function setPendingPrice(input) {
  const id = input.dataset.priceId;
  const p = findProduct(id);
  const raw = input.value.trim();

  delete pendingPrices[id];
  invalidPriceIds.delete(id);
  input.classList.remove("is-invalid");

  if (raw !== "" && p) {
    const n = Number(raw);
    if (!Number.isInteger(n) || n <= 0) {
      invalidPriceIds.add(id);
      input.classList.add("is-invalid");
    } else if (n !== livePriceOf(p)) {
      pendingPrices[id] = n;
    }
  }

  input.closest("tr").classList.toggle("dash-row-changed", pendingPrices[id] !== undefined);
  updateSaveBar();
}

/* ---------- Staged changes: Save bar ---------- */
function initSaveBar() {
  document.getElementById("dash-save-btn")?.addEventListener("click", saveChanges);
  document.getElementById("dash-cancel-btn")?.addEventListener("click", cancelChanges);

  // Warn before closing or reloading the tab with unsaved changes
  window.addEventListener("beforeunload", (e) => {
    if (!hasUnsavedChanges()) return;
    e.preventDefault();
    e.returnValue = "";
  });
}

/* Only changes that differ from what is saved count */
function collectChanges() {
  const orders = Object.entries(pendingOrderStatus)
    .map(([orderId, status]) => ({ orderId, status, order: allOrders.find(o => o.orderId === orderId) }))
    .filter(c => c.order && (c.order.status || "new") !== c.status);

  const products = Object.entries(pendingProductStatus)
    .map(([id, status]) => ({ id, status, product: findProduct(id) }))
    .filter(c => c.product && liveStatusOf(c.product) !== c.status);

  const prices = Object.entries(pendingPrices)
    .map(([id, price]) => ({ id, price, product: findProduct(id) }))
    .filter(c => c.product && livePriceOf(c.product) !== c.price);

  const details = Object.entries(pendingDetails)
    .map(([id, fields]) => {
      const product = findProduct(id);
      if (!product) return null;
      const current = currentDetailsOf(product);
      const changedFields = Object.keys(fields).filter(f => fields[f] !== current[f]);
      if (changedFields.length === 0) return null;
      return { id, product, values: { ...current, ...fields } };
    })
    .filter(Boolean);

  const stock = Object.entries(pendingStock)
    .map(([id, n]) => ({ id, stock: n, product: findProduct(id) }))
    .filter(c => c.product && liveProductStock[c.id] !== c.stock);

  return { orders, products, prices, details, stock, invalid: invalidPriceIds.size };
}

function changeCount(changes) {
  return changes.orders.length + changes.products.length + changes.prices.length + changes.details.length + changes.stock.length;
}

function hasUnsavedChanges() {
  return changeCount(collectChanges()) > 0 || invalidPriceIds.size > 0;
}

function updateSaveBar() {
  const bar = document.getElementById("dash-savebar");
  if (!bar) return;
  const changes = collectChanges();
  const count = changeCount(changes);
  const countEl = document.getElementById("dash-savebar-count");

  if (invalidPriceIds.size > 0) {
    countEl.innerHTML = `<strong>Fix the red boxes</strong> (New Price: whole numbers above 0; Stock: whole numbers, 0 or more)`;
  } else {
    countEl.innerHTML = count === 0
      ? "No unsaved changes"
      : `<strong>${count} unsaved change${count === 1 ? "" : "s"}</strong>`;
  }

  document.getElementById("dash-save-btn").disabled = count === 0 || invalidPriceIds.size > 0;
  document.getElementById("dash-cancel-btn").disabled = count === 0 && invalidPriceIds.size === 0;
  bar.hidden = count === 0 && invalidPriceIds.size === 0;
}

function setSaving(on, text) {
  document.getElementById("dash-saving").hidden = !on;
  document.getElementById("dash-saving-text").textContent = text || "Saving…";
  document.getElementById("dash-save-btn").disabled = on;
  document.getElementById("dash-cancel-btn").disabled = on;
}

function cancelChanges() {
  if (!hasUnsavedChanges()) return;
  if (!window.confirm("Discard all unsaved changes?")) return;

  pendingOrderStatus = {};
  pendingProductStatus = {};
  pendingPrices = {};
  pendingDetails = {};
  pendingStock = {};
  invalidPriceIds.clear();

  renderOrdersTable();
  renderProductsTable();
  renderPricesTable();
  renderDetailsTable();
  updateSaveBar();
}

async function saveChanges() {
  const changes = collectChanges();
  const total = changeCount(changes);

  if (changes.invalid > 0) {
    alert("Fix the red boxes first. Prices must be whole numbers above 0. Stock must be whole numbers, 0 or more.");
    return;
  }
  if (total === 0) return;

  const parts = [];
  if (changes.orders.length) parts.push(`${changes.orders.length} order status change${changes.orders.length === 1 ? "" : "s"}`);
  if (changes.products.length) parts.push(`${changes.products.length} product status change${changes.products.length === 1 ? "" : "s"}`);
  if (changes.prices.length) parts.push(`${changes.prices.length} price change${changes.prices.length === 1 ? "" : "s"}`);
  if (changes.details.length) parts.push(`${changes.details.length} details change${changes.details.length === 1 ? "" : "s"}`);
  if (changes.stock.length) parts.push(`${changes.stock.length} stock change${changes.stock.length === 1 ? "" : "s"}`);

  const cancelling = changes.orders.filter((c) => c.status === "cancelled").length;
  if (cancelling > 0 && !window.confirm(`You are cancelling ${cancelling} order${cancelling === 1 ? "" : "s"}.\n\n${RESTOCK_REMINDER}`)) return;

  const willEmail = changes.orders.some((c) => typeof ORDER_STATUS_EMAILS !== "undefined" && ORDER_STATUS_EMAILS[c.status]);
  const emailNote = willEmail ? "\n\nClients will be emailed about confirmed, shipped, completed or cancelled orders." : "";
  if (!window.confirm(`Save ${parts.join(", ")}?${emailNote}\n\nThe website will show these changes after the page reloads.`)) return;

  const fb = initFirebase();
  if (!fb || !fb.db) {
    alert("Firebase isn't connected, so nothing was saved.");
    return;
  }

  setSaving(true, "Saving…");
  try {
    const now = new Date().toISOString();
    const batch = fb.db.batch();

    changes.orders.forEach((c) => {
      batch.update(fb.db.collection("orders").doc(c.orderId), { status: c.status, statusUpdatedAt: now });
    });
    changes.products.forEach((c) => {
      batch.set(fb.db.collection("productStatus").doc(c.id), { status: c.status, updatedAt: now }, { merge: true });
    });
    changes.prices.forEach((c) => {
      batch.set(fb.db.collection("productPrices").doc(c.id), { price: c.price, updatedAt: now }, { merge: true });
    });
    changes.details.forEach((c) => {
      batch.set(fb.db.collection("productDetails").doc(c.id), {
        description: c.values.description,
        dimensions: c.values.dimensions,
        care: c.values.care,
        updatedAt: now
      }, { merge: true });
    });
    changes.stock.forEach((c) => {
      batch.set(fb.db.collection("productStock").doc(c.id), { stock: c.stock, updatedAt: now }, { merge: true });
    });

    await batch.commit();
  } catch (err) {
    console.error("Save failed:", err);
    setSaving(false);
    updateSaveBar();
    alert("Couldn't save. Nothing was changed. Check your connection and try again.");
    return;
  }

  // The save has succeeded: clear the staged changes straight away
  pendingOrderStatus = {};
  pendingProductStatus = {};
  pendingPrices = {};
  pendingDetails = {};
  pendingStock = {};
  invalidPriceIds.clear();

  // Email clients whose order status changed (confirmed, shipped, completed, cancelled).
  // An email problem never undoes or blocks the save.
  const toEmail = changes.orders.filter((c) => typeof ORDER_STATUS_EMAILS !== "undefined" && ORDER_STATUS_EMAILS[c.status]);
  let failedEmails = 0;
  if (toEmail.length) {
    setSaving(true, "Saved. Emailing clients…");
    try {
      const results = await Promise.all(toEmail.map((c) => sendOrderStatusEmail(c.order, c.status).catch(() => false)));
      failedEmails = results.filter((ok) => !ok).length;
    } catch (err) {
      console.error("Email step failed:", err);
      failedEmails = toEmail.length;
    }
  }

  // Refresh what is shown, without reloading the page
  setSaving(true, "Saved. Updating the page…");
  try {
    await Promise.all([loadOrders(), loadProductStatuses()]);
  } catch (err) {
    console.error("Refresh after save failed:", err);
  }

  setSaving(false);
  updateSaveBar();
  showSaveResult(
    failedEmails
      ? `Saved. ${failedEmails} client email${failedEmails === 1 ? " was" : "s were"} not sent. Check the email settings in SETUP.md.`
      : "Saved. The website is up to date.",
    failedEmails ? "warning" : "success"
  );
}

/* Short message at the top of the page after a save */
function showSaveResult(text, state) {
  const el = document.getElementById("dash-toast");
  if (!el) return;
  el.textContent = text;
  el.dataset.state = state;
  el.hidden = false;
  clearTimeout(showSaveResult.timer);
  showSaveResult.timer = setTimeout(() => { el.hidden = true; }, 4500);
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
