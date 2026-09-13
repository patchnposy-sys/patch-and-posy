/**
 * PATCH & POSY — Site behaviour
 * Renders the three catalog grids (Spreads, Tablecloths, Accessories),
 * wires up the mobile menu, newsletter form, cart, and checkout.
 */

document.addEventListener("DOMContentLoaded", () => {
  renderGrid("spreads-grid", typeof SPREADS !== "undefined" ? SPREADS : []);
  renderGrid("tablecloths-luxury-grid", (typeof TABLECLOTHS !== "undefined" ? TABLECLOTHS : []).filter(p => p.subcategory === "luxury"));
  renderGrid("tablecloths-daily-grid", (typeof TABLECLOTHS !== "undefined" ? TABLECLOTHS : []).filter(p => p.subcategory === "daily"));
  renderAccessories(typeof ACCESSORIES !== "undefined" ? ACCESSORIES : []);
  renderEventGallery(typeof EVENT_GALLERY !== "undefined" ? EVENT_GALLERY : []);

  initMobileMenu();
  initNewsletterForm();
  initLightbox();

  if (typeof initFirebase === "function") initFirebase();
  if (typeof initEmailJS === "function") initEmailJS();
  if (typeof initCart === "function") initCart();
  if (typeof initCheckout === "function") initCheckout();

  attachAddToBagHandlers();
  attachWhatsAppHandlers();
  applyLiveProductStatuses();
});

/* ---------- Catalog grids ---------- */
function renderGrid(elementId, products) {
  const grid = document.getElementById(elementId);
  if (!grid) return;
  grid.innerHTML = products.map(productCardHTML).join("");
}

function productCardHTML(product) {
  const isAvailable = (product.tag || "").toUpperCase() === "AVAILABLE";

  const tagHTML = product.tag
    ? `<span class="patch-tag${isAvailable ? " patch-tag-available" : ""}" data-tag-for="${escapeHTML(product.id)}">${escapeHTML(product.tag)}</span>`
    : "";

  const photoStyle = product.image
    ? `background-image:url('${escapeHTML(product.image)}'); background-size:cover; background-position:center;`
    : `background: linear-gradient(135deg, ${(product.swatch || ["#E0A83E", "#C0396B"]).join(", ")});`;

  const actionHTML = isAvailable
    ? `<div class="patch-actions" data-actions-for="${escapeHTML(product.id)}">
         <button type="button" class="btn-add-bag" data-product-id="${escapeHTML(product.id)}">Add to Bag</button>
         <button type="button" class="btn-whatsapp" data-product-id="${escapeHTML(product.id)}">Order via WhatsApp</button>
       </div>`
    : `<span class="btn-add-bag btn-add-bag-disabled">Not available yet</span>`;

  const sizeHTML = product.size
    ? `<p class="size-line">${escapeHTML(product.size)}</p>`
    : "";

  return `
    <div class="patch" data-product-id="${escapeHTML(product.id)}">
      <div class="patch-photo" style="${photoStyle}">
        ${tagHTML}
        ${!product.image ? `<span class="patch-placeholder-label">Photo coming soon</span>` : ""}
      </div>
      <div class="patch-info">
        <h3>${escapeHTML(product.name)}</h3>
        ${sizeHTML}
        <p class="desc">${escapeHTML(product.desc)}</p>
        <p class="price">${formatPKR(product.price)}</p>
        ${actionHTML}
      </div>
    </div>`;
}

/* ---------- Accessories: grouped by category with filter chips ---------- */
function renderAccessories(products) {
  const filtersEl = document.getElementById("accessories-filters");
  const contentEl = document.getElementById("accessories-content");
  if (!filtersEl || !contentEl) return;

  const categories = [...new Set(products.map(p => p.category || "Other"))];

  filtersEl.innerHTML = [`<button type="button" class="chip is-active" data-filter="all">All</button>`]
    .concat(categories.map(cat => `<button type="button" class="chip" data-filter="${escapeHTML(cat)}">${escapeHTML(cat)}</button>`))
    .join("");

  function renderGroups(filter) {
    const groups = filter === "all"
      ? categories
      : [filter];

    contentEl.innerHTML = groups.map(cat => {
      const items = products.filter(p => (p.category || "Other") === cat);
      if (items.length === 0) return "";
      return `
        <h3 class="subsection-title">${escapeHTML(cat)}</h3>
        <div class="patch-grid">${items.map(productCardHTML).join("")}</div>
      `;
    }).join("");

    attachAddToBagHandlers();
    attachWhatsAppHandlers();
    applyLiveProductStatuses();
  }

  renderGroups("all");

  filtersEl.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      filtersEl.querySelectorAll(".chip").forEach(c => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      renderGroups(chip.dataset.filter);
    });
  });
}

/* ---------- Volume 1 event gallery + lightbox ---------- */
function renderEventGallery(photos) {
  const gallery = document.getElementById("event-gallery");
  if (!gallery) return;

  gallery.innerHTML = photos.map((photo) => `
    <button type="button" class="event-photo" data-image="${escapeHTML(photo.image)}" data-caption="${escapeHTML(photo.caption || "")}">
      <img src="${escapeHTML(photo.image)}" alt="${escapeHTML(photo.caption || "Event photo")}" loading="lazy">
    </button>
  `).join("");

  gallery.querySelectorAll(".event-photo").forEach((btn) => {
    btn.addEventListener("click", () => openLightbox(btn.dataset.image, btn.dataset.caption));
  });
}

function openLightbox(imageSrc, caption) {
  const overlay = document.getElementById("lightbox-overlay");
  const modal = document.getElementById("lightbox-modal");
  const img = document.getElementById("lightbox-image");
  const captionEl = document.getElementById("lightbox-caption");
  if (!overlay || !modal || !img) return;

  img.src = imageSrc;
  img.alt = caption || "Event photo";
  if (captionEl) captionEl.textContent = caption || "";

  overlay.classList.add("is-open");
  modal.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  const overlay = document.getElementById("lightbox-overlay");
  const modal = document.getElementById("lightbox-modal");
  if (!overlay || !modal) return;
  overlay.classList.remove("is-open");
  modal.classList.remove("is-open");
  document.body.style.overflow = "";
}

function initLightbox() {
  const closeBtn = document.getElementById("lightbox-close");
  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);

  const overlay = document.getElementById("lightbox-overlay");
  if (overlay) overlay.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}

function getAllProducts() {
  return [
    ...(typeof SPREADS !== "undefined" ? SPREADS : []),
    ...(typeof TABLECLOTHS !== "undefined" ? TABLECLOTHS : []),
    ...(typeof ACCESSORIES !== "undefined" ? ACCESSORIES : [])
  ];
}

function attachAddToBagHandlers() {
  const allProducts = getAllProducts();

  document.querySelectorAll(".btn-add-bag[data-product-id]").forEach((btn) => {
    if (btn.dataset.bound === "true") return; // avoid double-binding on re-render
    btn.dataset.bound = "true";
    btn.addEventListener("click", () => {
      const product = allProducts.find((p) => p.id === btn.dataset.productId);
      if (product && typeof addToCart === "function") {
        addToCart(product);
      }
    });
  });
}

/* ---------- "Order via WhatsApp" ---------- */
function attachWhatsAppHandlers() {
  const allProducts = getAllProducts();

  document.querySelectorAll(".btn-whatsapp[data-product-id]").forEach((btn) => {
    if (btn.dataset.bound === "true") return;
    btn.dataset.bound = "true";
    btn.addEventListener("click", () => {
      const product = allProducts.find((p) => p.id === btn.dataset.productId);
      if (!product) return;
      openWhatsAppOrder(product);
      markProductSold(product.id);
    });
  });
}

function openWhatsAppOrder(product) {
  const number = (typeof STORE_CONFIG !== "undefined" && STORE_CONFIG.whatsappNumber) || "";
  const imageUrl = product.image ? `${window.location.origin}/${product.image}` : "";

  const lines = [
    "Hi Patch & Posy! I want to place this order. I want to order this item.",
    "",
    product.name,
    imageUrl ? `Photo: ${imageUrl}` : ""
  ].filter(Boolean);

  const message = encodeURIComponent(lines.join("\n"));
  window.open(`https://wa.me/${number}?text=${message}`, "_blank");
}

/* ---------- Live product status (Firestore-backed) ----------
   Lets a product's AVAILABLE/SOLD status update in real time the moment
   an order is placed (via WhatsApp or the website checkout) and be
   managed from the dashboard — without needing a code change + redeploy
   every time a one-of-a-kind piece sells. */
const LOCAL_SOLD_KEY = "patchAndPosyLocallySold";

async function applyLiveProductStatuses() {
  const fb = typeof initFirebase === "function" ? initFirebase() : null;

  // Always apply anything sold locally first (works even if Firebase
  // isn't configured yet, or the write below hasn't reached the server).
  const localSold = JSON.parse(localStorage.getItem(LOCAL_SOLD_KEY) || "[]");
  localSold.forEach((id) => setCardStatus(id, "SOLD"));

  if (!fb || !fb.db) return;

  try {
    const snapshot = await fb.db.collection("productStatus").get();
    snapshot.docs.forEach((doc) => setCardStatus(doc.id, doc.data().status));
  } catch (err) {
    console.error("Couldn't load live product statuses:", err);
  }
}

function setCardStatus(productId, status) {
  if (!status) return;
  const card = document.querySelector(`.patch[data-product-id="${cssEscape(productId)}"]`);
  if (!card) return;

  const tagEl = card.querySelector(`[data-tag-for="${cssEscape(productId)}"]`);
  const actions = card.querySelector(`[data-actions-for="${cssEscape(productId)}"]`);

  if (status.toUpperCase() === "AVAILABLE") {
    if (tagEl) { tagEl.textContent = "AVAILABLE"; tagEl.classList.add("patch-tag-available"); }
    return;
  }

  // SOLD (or any other override) — show badge, hide buy actions.
  if (tagEl) {
    tagEl.textContent = status.toUpperCase();
    tagEl.classList.remove("patch-tag-available");
  }
  if (actions) {
    actions.outerHTML = `<span class="btn-add-bag btn-add-bag-disabled">Not available yet</span>`;
  }
}

function cssEscape(value) {
  return String(value).replace(/["\\]/g, "\\$&");
}

async function markProductSold(productId) {
  // Optimistic local update so it feels instant, and survives even if
  // Firebase isn't reachable.
  setCardStatus(productId, "SOLD");
  const localSold = JSON.parse(localStorage.getItem(LOCAL_SOLD_KEY) || "[]");
  if (!localSold.includes(productId)) {
    localSold.push(productId);
    localStorage.setItem(LOCAL_SOLD_KEY, JSON.stringify(localSold));
  }

  const fb = typeof initFirebase === "function" ? initFirebase() : null;
  if (!fb || !fb.db) return;

  try {
    await fb.db.collection("productStatus").doc(productId).set({
      status: "SOLD",
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error("Couldn't sync sold status to Firestore:", err);
  }
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = String(str ?? "");
  return div.innerHTML;
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => links.classList.remove("is-open"));
  });
}

/* ---------- Newsletter form ---------- */
function initNewsletterForm() {
  const form = document.querySelector(".newsletter-form");
  const note = document.getElementById("newsletter-note");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.querySelector("input[type='email']");
    const email = (input?.value || "").trim();

    if (!isValidEmail(email)) {
      showNote("Please enter a valid email address.", "error");
      return;
    }

    // TODO: connect this to your actual mailing-list provider
    // (Mailchimp, Klaviyo, a serverless function, etc). For now this
    // just confirms the input looks right and resets the field.
    showNote("Thank you — you're on the list!", "success");
    form.reset();
  });

  function showNote(message, state) {
    if (!note) return;
    note.textContent = message;
    note.dataset.state = state;
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
}
