/**
 * PATCH & POSY — Site behaviour
 * Renders the three catalog grids (Spreads, Tablecloths, Accessories),
 * wires up the mobile menu, newsletter form, cart, and checkout.
 */

/* Photo file extensions can be .jpg or .JPG (servers are case-sensitive).
   If a photo fails to load, try the other spelling once. */
document.addEventListener("error", (e) => {
  const img = e.target;
  if (!(img instanceof HTMLImageElement) || img.dataset.extTried) return;
  const src = img.getAttribute("src") || "";
  let alt = null;
  if (src.endsWith(".jpg")) alt = src.slice(0, -4) + ".JPG";
  else if (src.endsWith(".JPG")) alt = src.slice(0, -4) + ".jpg";
  if (!alt) return;
  img.dataset.extTried = "1";
  img.src = alt;
}, true);

document.addEventListener("DOMContentLoaded", () => {
  // Spreads now live in the Patchwork Spreads popup (see initSpreadsModal).
  // Daily Wear is hidden for now.
  renderHeroSlideshow();
  renderCollectionTiles();
  renderAccessories(typeof ACCESSORIES !== "undefined" ? ACCESSORIES : []);
  renderKidsSection();
  renderSpreadGrid();
  renderEventGallery(typeof EVENT_GALLERY !== "undefined" ? EVENT_GALLERY : []);

  initMobileMenu();
  initNewsletterForm();
  initLightbox();
  initBreadModal();
  initPotModal();
  initTeaModal();
  initTableclothModal();
  initTableclothBanner();
  initSpreadsModal();
  initKidsModal();

  if (typeof initFirebase === "function") initFirebase();
  if (typeof initEmailJS === "function") initEmailJS();
  if (typeof initCart === "function") initCart();
  if (typeof initCheckout === "function") initCheckout();

  attachAddToBagHandlers();
  applyLiveProductStatuses();
});

/* ---------- Catalog grids ---------- */
function renderGrid(elementId, products) {
  const grid = document.getElementById(elementId);
  if (!grid) return;
  grid.innerHTML = products.map(productCardHTML).join("");
}

/* Shared helpers for AVAILABLE / SOLD display.
   Buy buttons are rendered for available items; otherwise a placeholder is rendered
   that setCardStatus() swaps for the buttons if the item becomes available live. */
function isLiveAvailable(p) {
  return (p.tag || "").toUpperCase() === "AVAILABLE";
}

function buyActionsHTML(id, available, addLabel) {
  const safeId = escapeHTML(id);
  const label = escapeHTML(addLabel || "Add to bag");
  if (available) {
    return `<div class="patch-actions" data-actions-for="${safeId}">
         <button type="button" class="btn-add-bag" data-product-id="${safeId}">${label}</button>
       </div>`;
  }
  return `<span class="btn-add-bag btn-add-bag-disabled" data-unavail-for="${safeId}" data-add-label="${label}">Not available yet</span>`;
}

/* Design tile: price with AVAILABLE / SOLD tag (used in popup lists) */
function tileRowHTML(p) {
  const available = isLiveAvailable(p);
  return `<span class="tc-tile-row"><span class="tc-tile-price" data-price-for="${escapeHTML(p.id)}">${formatPKR(p.price)}</span><span class="tc-tag${available ? " tc-tag-available" : ""}" data-tag-for="${escapeHTML(p.id)}">${escapeHTML(p.tag || "")}</span></span>`;
}

/* AVAILABLE / SOLD badge for a single item (used inside popups and detail pages) */
function tileStatusHTML(p) {
  const available = isLiveAvailable(p);
  return `<span class="tc-tag${available ? " tc-tag-available" : ""}" data-tag-for="${escapeHTML(p.id)}">${escapeHTML(p.tag || "")}</span>`;
}


function productCardHTML(product) {
  const isAvailable = isLiveAvailable(product);

  const tagHTML = product.tag
    ? `<span class="patch-tag${isAvailable ? " patch-tag-available" : ""}" data-tag-for="${escapeHTML(product.id)}">${escapeHTML(product.tag)}</span>`
    : "";

  const photoStyle = product.image
    ? `background-image:url('${escapeHTML(smallPath(product.image))}'); background-size:cover; background-position:center;`
    : `background: linear-gradient(135deg, ${(product.swatch || ["#E0A83E", "#C0396B"]).join(", ")});`;

  const actionHTML = buyActionsHTML(product.id, isAvailable, "Add to bag");

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
        <p class="price" data-price-for="${escapeHTML(product.id)}">${formatPKR(product.price)}</p>
        ${actionHTML}
      </div>
    </div>`;
}

/* ---------- Accessories: grouped by category with filter chips ---------- */
function renderAccessories(products) {
  const filtersEl = document.getElementById("accessories-filters");
  const contentEl = document.getElementById("accessories-content");
  if (!filtersEl || !contentEl) return;

  const ACCESSORY_ORDER = ["Tea Cozies", "Pot Holders", "Bread Cloths", "Kids Dasterkhwan"];
  const rank = (c) => { const i = ACCESSORY_ORDER.indexOf(c); return i === -1 ? 99 : i; };
  // Kids Dasterkhwan has its own section, so it is not part of the accessories grid.
  const categories = [...new Set(products.map(p => p.category || "Other"))]
    .filter(cat => cat !== "Kids Dasterkhwan")
    .sort((a, b) => rank(a) - rank(b));

  filtersEl.innerHTML = [`<button type="button" class="chip is-active" data-filter="all">All</button>`]
    .concat(categories.map(cat => `<button type="button" class="chip" data-filter="${escapeHTML(cat)}">${escapeHTML(cat)}</button>`))
    .join("");

  function renderGroups(filter) {
    const groups = filter === "all"
      ? categories
      : [filter];

    const cards = groups.map(cat => {
      if (cat === "Tea Cozies") return teaThumbnailHTML();
      if (cat === "Pot Holders") return potThumbnailHTML();
      if (cat === "Bread Cloths") return breadThumbnailHTML();
      if (cat === "Kids Dasterkhwan") return kidsThumbnailHTML();
      const items = products.filter(p => (p.category || "Other") === cat);
      return items.map(productCardHTML).join("");
    }).join("");

    // One grid for every accessory, so the cards sit in a single row.
    contentEl.innerHTML = `<div class="patch-grid">${cards}</div>`;

    attachAddToBagHandlers();
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
    <figure class="event-card">
      <button type="button" class="event-photo" data-image="${escapeHTML(photo.image)}" data-caption="${escapeHTML(photo.caption || "")}">
        <img src="${escapeHTML(smallPath(photo.image))}" alt="${escapeHTML(photo.caption || "Event photo")}" loading="lazy">
      </button>
      <figcaption class="event-caption">${escapeHTML(photo.caption || "")}</figcaption>
    </figure>
  `).join("");

  gallery.querySelectorAll(".event-photo").forEach((btn) => {
    btn.addEventListener("click", () => openLightbox(btn.dataset.image, btn.dataset.caption));
  });
}

let lightboxToken = 0;
function openLightbox(imageSrc, caption) {
  const overlay = document.getElementById("lightbox-overlay");
  const modal = document.getElementById("lightbox-modal");
  const img = document.getElementById("lightbox-image");
  const captionEl = document.getElementById("lightbox-caption");
  if (!overlay || !modal || !img) return;

  const token = ++lightboxToken;
  const smallSrc = String(imageSrc).replace(/(^|\/)images\/(?!small\/)/, "$1images/small/");
  let fullReady = false;
  img.removeAttribute("src");
  img.style.visibility = "hidden";
  img.alt = caption || "Event photo";
  if (captionEl) captionEl.textContent = caption || "";

  if (smallSrc !== imageSrc) {
    const small = new Image();
    small.onload = () => {
      if (token === lightboxToken && !fullReady) { img.src = smallSrc; img.style.visibility = ""; }
    };
    small.src = smallSrc;
  }
  const full = new Image();
  full.onload = () => {
    if (token !== lightboxToken) return;
    fullReady = true;
    img.src = imageSrc;
    img.style.visibility = "";
  };
  full.src = imageSrc;

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

/* ---------- Bread cloths: thumbnail → colour list → both photos + buy buttons ---------- */
function breadProducts() {
  return (typeof ACCESSORIES !== "undefined" ? ACCESSORIES : [])
    .filter(p => p.category === "Bread Cloths");
}

/* Category photo: the thumbnail, with a second design that fades in on hover while the picture drifts */
function thumbPhotoHTML(primary, secondary, alt) {
  const a = imgTag(primary, alt || "", "fill").replace("<img ", '<img class="fm-a" ');
  const b = secondary ? imgTag(secondary, alt || "", "fill").replace("<img ", '<img class="fm-b" ') : "";
  return a + b;
}

function breadThumbnailHTML() {
  return `
    <div class="patch bread-thumb">
      <div class="patch-photo">${thumbPhotoHTML(BREAD_CLOTH_THUMBNAIL, breadProducts()[1]?.image, "Bread cloths")}</div>
      <div class="patch-info">
        <h3>Bread Cloths</h3>
        <p class="desc">Four colours. Tap to view the designs and add them to your bag.</p>
        <button type="button" class="btn-add-bag bread-open">View colours</button>
      </div>
    </div>`;
}

function openBreadModal() {
  const overlay = document.getElementById("bread-overlay");
  const modal = document.getElementById("bread-modal");
  if (!overlay || !modal) return;
  showBreadColours();
  overlay.classList.add("is-open");
  modal.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function closeBreadModal() {
  const overlay = document.getElementById("bread-overlay");
  const modal = document.getElementById("bread-modal");
  if (!overlay || !modal) return;
  overlay.classList.remove("is-open");
  modal.classList.remove("is-open");
  document.body.style.overflow = "";
}

/* A bread cloth or tea cozy design with no stock left shows SOLD on its grid tile */
function markSoldOutTiles(root) {
  root.querySelectorAll("[data-colour-id], [data-tea-id]").forEach((btn) => {
    const id = btn.dataset.colourId || btn.dataset.teaId;
    const tagEl = btn.querySelector(`[data-tag-for="${id}"]`);
    if (!tagEl || breadStockOf({ id }) > 0) return;
    tagEl.textContent = "SOLD";
    tagEl.classList.remove("patch-tag-available", "tc-tag-available");
  });
}

async function showBreadColours() {
  const body = document.getElementById("bread-body");
  if (!body) return;

  body.innerHTML = `
    <h3 class="bread-title">Bread Cloths</h3>
    <p class="bread-description">${escapeHTML(BREAD_CLOTH_DESCRIPTION)}</p>
    <div class="bread-colour-grid">
      ${breadProducts().map(p => `
        <button type="button" class="bread-colour" data-colour-id="${escapeHTML(p.id)}">
          <img src="${escapeHTML(smallPath(p.image))}" alt="${escapeHTML(p.name)}" loading="lazy">
          <span>${escapeHTML(p.name.replace("Bread Cloth: ", ""))}</span>${tileRowHTML(p)}
        </button>`).join("")}
    </div>`;

  body.querySelectorAll("[data-colour-id]").forEach((btn) => {
    btn.addEventListener("click", () => showBreadDetail(btn.dataset.colourId));
  });

  await loadLiveData();
  await refreshLiveStock();
  markSoldOutTiles(body);
}

async function showBreadDetail(id) {
  const body = document.getElementById("bread-body");
  const p = breadProducts().find(x => x.id === id);
  if (!body || !p) return;

  await loadLiveData();
  await refreshLiveStock();

  const photos = p.gallery && p.gallery.length ? p.gallery : [p.image];
  const stock = breadStockOf(p);
  const max = maxQtyFor(p);
  const available = isLiveAvailable(p) && stock > 0;
  const stockHTML = stock > 0
    ? `<p class="bread-stock">In stock: <strong>${stock}</strong></p>`
    : `<p class="bread-stock bread-stock-out"><strong>Sold out</strong></p>`;
  const qtyHTML = available ? `
    <div class="cart-qty bread-qty">
      <span>Quantity</span>
      <button type="button" class="qty-btn" data-qty-action="dec">−</button>
      <span data-qty-value>1</span>
      <button type="button" class="qty-btn" data-qty-action="inc">+</button>
    </div>
    <p class="bread-hint">Up to ${max} for each design.</p>` : "";

  body.innerHTML = `
    <button type="button" class="bread-back" id="bread-back">← All colours</button>
    <h3 class="bread-title">${escapeHTML(p.name)}</h3>
    <div class="bread-photos tc-zoom">
      ${photos.map(src => imgTag(src, p.name)).join("")}
    </div>
    <p class="price" data-price-for="${escapeHTML(p.id)}">${formatPKR(p.price)}</p>
    ${stockHTML}
    ${tileStatusHTML(p)}
    ${detailBlocksHTML(p)}
    <div class="bread-buy" data-product-id="${escapeHTML(p.id)}">${qtyHTML}${buyActionsHTML(p.id, available, "Add to bag")}</div>`;

  document.getElementById("bread-back").addEventListener("click", showBreadColours);
  setupBreadQuantity(body, max);
  attachAddToBagHandlers();
  applyLiveProductStatuses();
  // A bread cloth with no stock left shows SOLD, even if its product tag says AVAILABLE
  if (stock < 1) {
    body.querySelectorAll(`[data-tag-for="${p.id}"]`).forEach((tagEl) => {
      tagEl.textContent = "SOLD";
      tagEl.classList.remove("patch-tag-available", "tc-tag-available");
    });
  }
}

/* Quantity box for bread cloths: 1 up to the lower of BREAD_MAX_QTY and the stock left */
function setupBreadQuantity(body, max = BREAD_MAX_QTY) {
  const value = body.querySelector("[data-qty-value]");
  if (!value) return;
  const incBtn = body.querySelector('[data-qty-action="inc"]');
  const decBtn = body.querySelector('[data-qty-action="dec"]');
  const update = (next) => {
    const n = Math.min(Math.max(next, 1), max);
    value.textContent = n;
    incBtn.disabled = n >= max;
    decBtn.disabled = n <= 1;
  };
  incBtn.addEventListener("click", () => update(Number(value.textContent) + 1));
  decBtn.addEventListener("click", () => update(Number(value.textContent) - 1));
  update(1);
}

function initBreadModal() {
  // Delegated, so it keeps working when the accessories grid re-renders on filter change.
  document.addEventListener("click", (e) => {
    if (e.target.closest(".bread-open, .bread-thumb")) openBreadModal();
  });

  document.getElementById("bread-close")?.addEventListener("click", closeBreadModal);
  document.getElementById("bread-overlay")?.addEventListener("click", closeBreadModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeBreadModal();
  });
}

function getAllProducts() {
  return [
    ...(typeof SPREADS !== "undefined" ? SPREADS : []),
    ...(typeof TABLECLOTH_DESIGNS !== "undefined" ? TABLECLOTH_DESIGNS : []),
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
      // Bread cloths have a quantity box in their popup; everything else adds 1.
      const qtyEl = btn.closest(".bread-buy")?.querySelector("[data-qty-value]");
      const quantity = qtyEl ? Number(qtyEl.textContent) || 1 : 1;
      if (product && typeof addToCart === "function") {
        addToCart(product, quantity);
      }
    });
  });
}

/* ---------- Live product status (Firestore-backed) ----------
   Lets a product's AVAILABLE/SOLD status update in real time the moment
   an order is placed (via the website checkout) and be
   managed from the dashboard — without needing a code change + redeploy
   every time a one-of-a-kind piece sells. */
const LOCAL_SOLD_KEY = "patchAndPosyLocallySold";

/* ---------- Live catalogue data (Firestore-backed) ----------
   Set from the dashboard, so no code change or redeploy is needed:
     productStatus/{id}  -> { status: "AVAILABLE" | "SOLD" }
     productPrices/{id}  -> { price: 5500 }
   Loaded once per page view and cached. Products are updated in memory,
   so buy buttons and cart prices use the live values. */
let liveStatusById = {};
let livePriceById = {};
let liveDetailsById = {};   // productDetails/{id} -> { description, dimensions, care }
let liveStockById = {};     // productStock/{id} -> { stock: 4 } (bread cloths only)
let liveLoadPromise = null;

/* Pieces left for a bread cloth design. Not set yet in the dashboard = 0 (not sold until stock is entered). */
function breadStockOf(p) {
  const n = liveStockById[p.id];
  return Number.isInteger(n) ? n : 0;
}

/* Re-reads the stock counts, so a design shows the latest number when it is opened */
async function refreshLiveStock() {
  const fb = typeof initFirebase === "function" ? initFirebase() : null;
  if (!fb || !fb.db) return;
  try {
    const snap = await fb.db.collection("productStock").get();
    const fresh = {};
    snap.docs.forEach((doc) => {
      const n = Number(doc.data().stock);
      if (Number.isInteger(n) && n >= 0) fresh[doc.id] = n;
    });
    liveStockById = fresh;
  } catch (err) {
    console.error("Couldn't refresh bread cloth stock:", err);
  }
}

function loadLiveData() {
  if (!liveLoadPromise) {
    liveLoadPromise = (async () => {
      // Items sold from this browser show straight away, before Firebase answers.
      JSON.parse(localStorage.getItem(LOCAL_SOLD_KEY) || "[]")
        .forEach((id) => { liveStatusById[id] = "SOLD"; });

      const fb = typeof initFirebase === "function" ? initFirebase() : null;
      if (fb && fb.db) {
        try {
          const [statusSnap, priceSnap] = await Promise.all([
            fb.db.collection("productStatus").get(),
            fb.db.collection("productPrices").get()
          ]);
          statusSnap.docs.forEach((doc) => {
            const status = doc.data().status;
            if (status) liveStatusById[doc.id] = String(status).toUpperCase();
          });
          priceSnap.docs.forEach((doc) => {
            const price = Number(doc.data().price);
            if (price > 0) livePriceById[doc.id] = price;
          });
        } catch (err) {
          console.error("Couldn't load live product data:", err);
        }

        // Descriptions, dimensions and care text: kept apart so that a problem here
        // never stops the saved statuses and prices from loading.
        try {
          const detailSnap = await fb.db.collection("productDetails").get();
          detailSnap.docs.forEach((doc) => { liveDetailsById[doc.id] = doc.data(); });
        } catch (err) {
          console.error("Couldn't load product details:", err);
        }
      }

      // Bread cloth stock: kept apart so a problem here never stops statuses and prices from loading.
      if (fb && fb.db) {
        try {
          const stockSnap = await fb.db.collection("productStock").get();
          stockSnap.docs.forEach((doc) => {
            const n = Number(doc.data().stock);
            if (Number.isInteger(n) && n >= 0) liveStockById[doc.id] = n;
          });
        } catch (err) {
          console.error("Couldn't load bread cloth stock:", err);
        }
      }

      getAllProducts().forEach((p) => {
        if (liveStatusById[p.id]) p.tag = liveStatusById[p.id];
        if (livePriceById[p.id]) p.price = livePriceById[p.id];
      });
    })();
  }
  return liveLoadPromise;
}

async function applyLiveProductStatuses() {
  await loadLiveData();
  getAllProducts().forEach((p) => {
    setCardStatus(p.id, p.tag);
    setPriceFor(p.id, p.price);
  });
}

function setCardStatus(productId, status) {
  if (!status) return;
  const id = cssEscape(productId);
  const upper = String(status).toUpperCase();
  const available = upper === "AVAILABLE";

  // Badges (cards, popup tiles and detail pages)
  document.querySelectorAll(`[data-tag-for="${id}"]`).forEach((tagEl) => {
    tagEl.textContent = upper;
    tagEl.classList.toggle("patch-tag-available", available);
    tagEl.classList.toggle("tc-tag-available", available);
  });

  if (available) {
    // Bring the buy buttons back if they were hidden while the item was sold.
    document.querySelectorAll(`[data-unavail-for="${id}"]`).forEach((el) => {
      el.outerHTML = buyActionsHTML(productId, true, el.dataset.addLabel);
    });
    attachAddToBagHandlers();
    return;
  }

  // SOLD (or any other non-available status): hide the buy buttons.
  document.querySelectorAll(`[data-actions-for="${id}"]`).forEach((el) => {
    const label = el.querySelector(".btn-add-bag")?.textContent || "Add to bag";
    el.outerHTML = buyActionsHTML(productId, false, label);
  });
}

function setPriceFor(productId, price) {
  document.querySelectorAll(`[data-price-for="${cssEscape(productId)}"]`).forEach((el) => {
    el.textContent = formatPKR(price);
  });
}


/* ---------- Product details: description, dimensions, care ----------
   Edited in the dashboard's Details tab (productDetails/{id}). A saved text
   replaces the default from products-data.js, even when it is left empty. */
function detailsOf(p) {
  const saved = liveDetailsById[p.id] || {};
  const pick = (value, fallback) => (typeof value === "string" ? value : fallback);
  return {
    description: pick(saved.description, p.description || p.desc || ""),
    dimensions: pick(saved.dimensions, typeof p.dimensions === "string" ? p.dimensions : ""),
    care: pick(saved.care, p.careInstructions || "")
  };
}

/* Details screen blocks. An empty section is left out of the page. */
function detailBlocksHTML(p) {
  const d = detailsOf(p);
  const sections = [];
  if (d.description.trim()) {
    sections.push(`<section class="tc-section"><h4>Description</h4><p>${escapeHTML(d.description)}</p></section>`);
  }
  if (d.dimensions.trim()) {
    sections.push(`<section class="tc-section"><h4>Dimensions</h4><p class="detail-lines">${escapeHTML(d.dimensions)}</p></section>`);
  }
  if (d.care.trim()) {
    sections.push(`<section class="tc-section"><h4>Care instructions</h4><p>${escapeHTML(d.care)}</p></section>`);
  }
  return sections.length ? `<div class="tc-detail">${sections.join("")}</div>` : "";
}

function cssEscape(value) {
  return String(value).replace(/["\\]/g, "\\$&");
}

async function markProductSold(productId) {
  // Optimistic local update so it feels instant, and survives even if
  // Firebase isn't reachable.
  liveStatusById[productId] = "SOLD";
  getAllProducts().forEach((p) => { if (p.id === productId) p.tag = "SOLD"; });
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
  const nav = document.querySelector(".nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
    });
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
    showNote("Thank you. You are now subscribed.", "success");
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


/* ---------- Pot holders: thumbnail → design list → photo + buy buttons ---------- */
function potProducts() {
  return (typeof ACCESSORIES !== "undefined" ? ACCESSORIES : [])
    .filter(p => p.category === "Pot Holders");
}

function potThumbnailHTML() {
  return `
    <div class="patch pot-thumb">
      <div class="patch-photo">${thumbPhotoHTML(POT_HOLDER_THUMBNAIL, potProducts()[1]?.image, "Pot holders")}</div>
      <div class="patch-info">
        <h3>Pot Holders</h3>
        <p class="desc">Eleven designs. Tap to view them and add them to your bag.</p>
        <button type="button" class="btn-add-bag pot-open">View designs</button>
      </div>
    </div>`;
}

function openPotModal() {
  const overlay = document.getElementById("pot-overlay");
  const modal = document.getElementById("pot-modal");
  if (!overlay || !modal) return;
  showPotDesigns();
  overlay.classList.add("is-open");
  modal.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function closePotModal() {
  const overlay = document.getElementById("pot-overlay");
  const modal = document.getElementById("pot-modal");
  if (!overlay || !modal) return;
  overlay.classList.remove("is-open");
  modal.classList.remove("is-open");
  document.body.style.overflow = "";
}

function showPotDesigns() {
  const body = document.getElementById("pot-body");
  if (!body) return;

  body.innerHTML = `
    <h3 class="bread-title">Pot Holders</h3>
    <p class="bread-description">${escapeHTML(POT_HOLDER_DESCRIPTION)}</p>
    <div class="bread-colour-grid">
      ${potProducts().map(p => `
        <button type="button" class="bread-colour" data-pot-id="${escapeHTML(p.id)}">
          <img src="${escapeHTML(smallPath(p.image))}" alt="${escapeHTML(p.name)}" loading="lazy">
          <span>${escapeHTML(p.name.replace("Pot Holder: ", ""))}</span>${tileRowHTML(p)}
        </button>`).join("")}
    </div>`;

  body.querySelectorAll("[data-pot-id]").forEach((btn) => {
    btn.addEventListener("click", () => showPotDetail(btn.dataset.potId));
  });
}

function showPotDetail(id) {
  const body = document.getElementById("pot-body");
  const p = potProducts().find(x => x.id === id);
  if (!body || !p) return;

  const photos = p.gallery && p.gallery.length ? p.gallery : [p.image];

  body.innerHTML = `
    <button type="button" class="bread-back" id="pot-back">← All designs</button>
    <h3 class="bread-title">${escapeHTML(p.name)}</h3>
    <div class="bread-photos tc-zoom">
      ${photos.map(src => imgTag(src, p.name)).join("")}
    </div>
    <p class="price" data-price-for="${escapeHTML(p.id)}">${formatPKR(p.price)}</p>
    ${tileStatusHTML(p)}
    ${detailBlocksHTML(p)}
    <div class="bread-buy" data-product-id="${escapeHTML(p.id)}">${buyActionsHTML(p.id, isLiveAvailable(p), "Add to bag")}</div>`;

  document.getElementById("pot-back").addEventListener("click", showPotDesigns);
  attachAddToBagHandlers();
  applyLiveProductStatuses();
}

function initPotModal() {
  // Delegated, so it keeps working when the accessories grid re-renders on filter change.
  document.addEventListener("click", (e) => {
    if (e.target.closest(".pot-open, .pot-thumb")) openPotModal();
  });
  document.getElementById("pot-close")?.addEventListener("click", closePotModal);
  document.getElementById("pot-overlay")?.addEventListener("click", closePotModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePotModal();
  });
}


/* ---------- Tea cozies: thumbnail → design list → photos + buy buttons ---------- */
function teaProducts() {
  return (typeof ACCESSORIES !== "undefined" ? ACCESSORIES : [])
    .filter(p => p.category === "Tea Cozies");
}

function teaThumbnailHTML() {
  return `
    <div class="patch tea-thumb">
      <div class="patch-photo">${thumbPhotoHTML(TEA_COZY_THUMBNAIL, teaProducts()[1]?.image, "Tea cozies")}</div>
      <div class="patch-info">
        <h3>Tea Cozies</h3>
        <p class="desc">Two designs. Tap to view them and add them to your bag.</p>
        <button type="button" class="btn-add-bag tea-open">View designs</button>
      </div>
    </div>`;
}

function openTeaModal() {
  const overlay = document.getElementById("tea-overlay");
  const modal = document.getElementById("tea-modal");
  if (!overlay || !modal) return;
  showTeaDesigns();
  overlay.classList.add("is-open");
  modal.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function closeTeaModal() {
  const overlay = document.getElementById("tea-overlay");
  const modal = document.getElementById("tea-modal");
  if (!overlay || !modal) return;
  overlay.classList.remove("is-open");
  modal.classList.remove("is-open");
  document.body.style.overflow = "";
}

async function showTeaDesigns() {
  const body = document.getElementById("tea-body");
  if (!body) return;

  body.innerHTML = `
    <h3 class="bread-title">Tea Cozies</h3>
    <p class="bread-description">${escapeHTML(TEA_COZY_DESCRIPTION)}</p>
    <div class="bread-colour-grid">
      ${teaProducts().map(p => `
        <button type="button" class="bread-colour" data-tea-id="${escapeHTML(p.id)}">
          ${imgTag(p.image, p.name)}
          <span>${escapeHTML(p.name.replace("Tea Cozy: ", ""))}</span>${tileRowHTML(p)}
        </button>`).join("")}
    </div>`;

  body.querySelectorAll("[data-tea-id]").forEach((btn) => {
    btn.addEventListener("click", () => showTeaDetail(btn.dataset.teaId));
  });

  await loadLiveData();
  await refreshLiveStock();
  markSoldOutTiles(body);
}

async function showTeaDetail(id) {
  const body = document.getElementById("tea-body");
  const p = teaProducts().find(x => x.id === id);
  if (!body || !p) return;

  await loadLiveData();
  await refreshLiveStock();

  const photos = p.gallery && p.gallery.length ? p.gallery : [p.image];
  const stock = breadStockOf(p);
  const max = maxQtyFor(p);
  const available = isLiveAvailable(p) && stock > 0;
  const stockHTML = stock > 0
    ? `<p class="bread-stock">In stock: <strong>${stock}</strong></p>`
    : `<p class="bread-stock bread-stock-out"><strong>Sold out</strong></p>`;
  const qtyHTML = available ? `
    <div class="cart-qty bread-qty">
      <span>Quantity</span>
      <button type="button" class="qty-btn" data-qty-action="dec">−</button>
      <span data-qty-value>1</span>
      <button type="button" class="qty-btn" data-qty-action="inc">+</button>
    </div>
    <p class="bread-hint">Up to ${max} for each design.</p>` : "";

  body.innerHTML = `
    <button type="button" class="bread-back" id="tea-back">← All designs</button>
    <h3 class="bread-title">${escapeHTML(p.name)}</h3>
    <div class="bread-photos tc-zoom">
      ${photos.map(src => imgTag(src, p.name)).join("")}
    </div>
    <p class="price" data-price-for="${escapeHTML(p.id)}">${formatPKR(p.price)}</p>
    ${stockHTML}
    ${tileStatusHTML(p)}
    ${detailBlocksHTML(p)}
    <div class="bread-buy" data-product-id="${escapeHTML(p.id)}">${qtyHTML}${buyActionsHTML(p.id, available, "Add to bag")}</div>`;

  document.getElementById("tea-back").addEventListener("click", showTeaDesigns);
  setupBreadQuantity(body, max);
  attachAddToBagHandlers();
  applyLiveProductStatuses();
  // A tea cozy with no stock left shows SOLD, even if its product tag says AVAILABLE
  if (stock < 1) {
    body.querySelectorAll(`[data-tag-for="${p.id}"]`).forEach((tagEl) => {
      tagEl.textContent = "SOLD";
      tagEl.classList.remove("patch-tag-available", "tc-tag-available");
    });
  }
}

function initTeaModal() {
  // Delegated, so it keeps working when the accessories row re-renders on filter change.
  document.addEventListener("click", (e) => {
    if (e.target.closest(".tea-open, .tea-thumb")) openTeaModal();
  });
  document.getElementById("tea-close")?.addEventListener("click", closeTeaModal);
  document.getElementById("tea-overlay")?.addEventListener("click", closeTeaModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeTeaModal();
  });
}


/* ---------- Image loader: tries common file extensions if the given one 404s ----------
   Lets a folder's photos work whether the files are .JPG, .jpg, .jpeg or .png. */
const IMG_EXT_FALLBACKS = [".JPG", ".jpg", ".jpeg", ".JPEG", ".png", ".PNG", ".webp", ".WEBP", ".gif"];

/* Web-size photos live in images/small/ (same folders and file names as images/).
   Cards, grids and banners load those; the zoom (lightbox) still opens the full-size original. */
const SMALL_PHOTO_FOLDER = "images/small/";
function smallPath(src) {
  const s = String(src || "");
  return s.startsWith("images/") ? SMALL_PHOTO_FOLDER + s.slice("images/".length) : s;
}
function fullSizePath(src) {
  return String(src || "").replace(/(^|\/)images\/small\//, "$1images/");
}

function imgTag(src, alt, mode) {
  src = smallPath(src);
  // Always start with IMG_EXT_FALLBACKS[0] (".JPG") and strip any extension written in the data,
  // so uppercase .JPG files load and the retry list is tried in order from the start.
  const m = String(src).match(/\.[^./]+$/);
  const base = m ? src.slice(0, -m[0].length) : src;
  const first = IMG_EXT_FALLBACKS[0];
  const style = mode === "fill"
    ? ' style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block"'
    : "";
  return `<img src="${escapeHTML(base + first)}" alt="${escapeHTML(alt || "")}" data-base="${escapeHTML(base)}" data-ext-index="0" loading="lazy" onerror="retryImage(this)"${style}>`;
}

function retryImage(img) {
  const next = Number(img.dataset.extIndex) + 1;
  if (next >= IMG_EXT_FALLBACKS.length) { img.onerror = null; return; }
  img.dataset.extIndex = String(next);
  img.src = img.dataset.base + IMG_EXT_FALLBACKS[next];
}


/* ---------- Tablecloths (Volume 2): banner → 3 styles → designs → design detail ---------- */
function tableclothStyles() {
  return typeof TABLECLOTH_STYLES !== "undefined" ? TABLECLOTH_STYLES : [];
}

function tableclothDesignsAll() {
  return typeof TABLECLOTH_DESIGNS !== "undefined" ? TABLECLOTH_DESIGNS : [];
}

function tableclothDesigns(styleId) {
  return tableclothDesignsAll().filter(d => d.style === styleId);
}

function isTableclothAvailable(d) {
  return (d.tag || "").toUpperCase() === "AVAILABLE";
}

function openTableclothModal() {
  const overlay = document.getElementById("tablecloth-overlay");
  const modal = document.getElementById("tablecloth-modal");
  if (!overlay || !modal) return;
  showTableclothStyles();
  overlay.classList.add("is-open");
  modal.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function closeTableclothModal() {
  const overlay = document.getElementById("tablecloth-overlay");
  const modal = document.getElementById("tablecloth-modal");
  if (!overlay || !modal) return;
  overlay.classList.remove("is-open");
  modal.classList.remove("is-open");
  document.body.style.overflow = "";
}

/* "From" price on a style card = the lowest price of its designs, so it always matches the design list */
function styleLowestPrice(style) {
  const prices = tableclothDesigns(style.id).map(d => d.price).filter(p => p > 0);
  return prices.length ? Math.min(...prices) : style.price;
}

/* One list for all three styles: style name, its general description, then the design thumbnails */
function showTableclothStyles() {
  const body = document.getElementById("tablecloth-body");
  if (!body) return;
  body.innerHTML = `
    <h3 class="bread-title">Tablecloths · Volume 2</h3>
    ${tableclothStyles().map(s => `
      <section class="tc-style-section">
        <h4 class="tc-style-title">${escapeHTML(s.name)}</h4>
        <p class="tc-style-desc">${escapeHTML(s.description)}</p>
        <div class="tablecloth-grid">
          ${tableclothDesigns(s.id).map(d => `
            <button type="button" class="tablecloth-tile" data-tc-id="${escapeHTML(d.id)}">
              <span class="tablecloth-tile-photo">${imgTag(d.card, d.name, "fill")}</span>
              <span class="tablecloth-tile-name">${escapeHTML(d.name)}</span>
              <span class="tc-tile-row">
                <span class="tc-tile-price" data-price-for="${escapeHTML(d.id)}">${formatPKR(d.price)}</span>
                <span class="tc-tag${isTableclothAvailable(d) ? " tc-tag-available" : ""}" data-tag-for="${escapeHTML(d.id)}">${escapeHTML(d.tag)}</span>
              </span>
            </button>`).join("")}
        </div>
      </section>`).join("")}`;

  body.querySelectorAll("[data-tc-id]").forEach((btn) => {
    btn.addEventListener("click", () => showTableclothDetail(btn.dataset.tcId));
  });
  applyLiveProductStatuses();
}

/* One design: all three photos, price, then the design's own description, dimensions and care */
function showTableclothDetail(id) {
  const body = document.getElementById("tablecloth-body");
  const d = tableclothDesignsAll().find(x => x.id === id);
  if (!body || !d) return;
  const style = tableclothStyles().find(s => s.id === d.style);
  const available = isTableclothAvailable(d);

  body.innerHTML = `
    <button type="button" class="bread-back" id="tc-back-designs">← Back to ${escapeHTML(style ? style.name : "tablecloths")}</button>
    <h3 class="bread-title">${escapeHTML(d.name)}</h3>
    <div class="bread-photos tc-zoom">
      ${d.photos.map(src => imgTag(src, d.name)).join("")}
    </div>
    <div class="tc-price-row">
      <p class="tc-price" data-price-for="${escapeHTML(d.id)}">${formatPKR(d.price)}</p>
      <span class="tc-tag${available ? " tc-tag-available" : ""}" data-tag-for="${escapeHTML(d.id)}">${escapeHTML(d.tag)}</span>
    </div>
    ${detailBlocksHTML(d)}
    <div class="bread-buy" data-product-id="${escapeHTML(d.id)}">${buyActionsHTML(d.id, available, "Add to bag")}</div>`;

  document.getElementById("tc-back-designs").addEventListener("click", showTableclothStyles);
  attachAddToBagHandlers();
  applyLiveProductStatuses();
}

function initTableclothModal() {
  // Delegated: the banner and its button both carry .tablecloth-open.
  document.addEventListener("click", (e) => {
    if (e.target.closest(".tablecloth-open")) openTableclothModal();
  });
  // Photos open full size in the lightbox when clicked.
  document.addEventListener("click", (e) => {
    const img = e.target.closest(".tc-zoom img");
    if (img) openLightbox(fullSizePath(img.currentSrc || img.src), img.alt);
  });
  document.getElementById("tablecloth-close")?.addEventListener("click", closeTableclothModal);
  document.getElementById("tablecloth-overlay")?.addEventListener("click", closeTableclothModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeTableclothModal();
  });
}


/* Banner photo is added by the script (not static HTML) so the extension fallback always works.
   A banner can set its own photo with data-banner; otherwise it uses the tablecloth thumbnail. */
function initTableclothBanner() {
  document.querySelectorAll(".collection-banner").forEach((banner) => {
    if (banner.querySelector("img")) return;
    const src = banner.dataset.banner || TABLECLOTH_THUMBNAIL;
    banner.insertAdjacentHTML("afterbegin", imgTag(src, banner.getAttribute("aria-label") || "", "fill"));
  });
}

/* ---------- Patchwork Spreads (Volume 1, all sold): grid on the page, details in the popup ---------- */
function spreadsList() {
  return typeof SPREADS !== "undefined" ? SPREADS : [];
}

function renderSpreadGrid() {
  const grid = document.getElementById("spread-grid");
  if (!grid) return;
  grid.innerHTML = spreadsList().map(spreadCardHTML).join("");
  applyLiveProductStatuses();
}

function spreadCardHTML(p) {
  return `
    <button type="button" class="spread-card" data-spread-id="${escapeHTML(p.id)}">
      <div class="spread-photo">${imgTag(p.image, p.name, "fill")}</div>
      <div class="spread-info">
        <h3>${escapeHTML(p.name)}</h3>
        <p class="price" data-price-for="${escapeHTML(p.id)}">${formatPKR(p.price)}</p>
        <span class="tc-tag" data-tag-for="${escapeHTML(p.id)}">${escapeHTML(p.tag)}</span>
      </div>
    </button>`;
}

/* One spread: photo (tap to enlarge), price, tag and its description */
function openSpreadDetail(id) {
  const overlay = document.getElementById("spreads-overlay");
  const modal = document.getElementById("spreads-modal");
  const body = document.getElementById("spreads-body");
  const p = spreadsList().find(x => x.id === id);
  if (!overlay || !modal || !body || !p) return;

  body.innerHTML = `
    <h3 class="bread-title">${escapeHTML(p.name)}</h3>
    <div class="bread-photos tc-zoom">
      ${imgTag(p.image, p.name)}
    </div>
    <div class="tc-price-row">
      <p class="tc-price" data-price-for="${escapeHTML(p.id)}">${formatPKR(p.price)}</p>
      <span class="tc-tag" data-tag-for="${escapeHTML(p.id)}">${escapeHTML(p.tag)}</span>
    </div>
    <div class="tc-detail">
      <section class="tc-section">
        <h4>Description</h4>
        <p>${escapeHTML(p.desc)}</p>
      </section>
    </div>`;

  overlay.classList.add("is-open");
  modal.classList.add("is-open");
  document.body.style.overflow = "hidden";
  applyLiveProductStatuses();
}

function closeSpreadsModal() {
  const overlay = document.getElementById("spreads-overlay");
  const modal = document.getElementById("spreads-modal");
  if (!overlay || !modal) return;
  overlay.classList.remove("is-open");
  modal.classList.remove("is-open");
  document.body.style.overflow = "";
}

function openSpreadsList() {
  const overlay = document.getElementById("spreads-list-overlay");
  const modal = document.getElementById("spreads-list-modal");
  if (!overlay || !modal) return;
  overlay.classList.add("is-open");
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeSpreadsList() {
  const overlay = document.getElementById("spreads-list-overlay");
  const modal = document.getElementById("spreads-list-modal");
  if (!overlay || !modal) return;
  overlay.classList.remove("is-open");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function initSpreadsModal() {
  // Patchwork Spreads opens in its own dialog from the banner menu and the Explore tile.
  document.addEventListener("click", (e) => {
    if (e.target.closest(".spreads-open")) openSpreadsList();
  });
  document.getElementById("spreads-list-close")?.addEventListener("click", closeSpreadsList);
  document.getElementById("spreads-list-overlay")?.addEventListener("click", closeSpreadsList);
  document.addEventListener("click", (e) => {
    const card = e.target.closest("[data-spread-id]");
    if (card) openSpreadDetail(card.dataset.spreadId);
  });
  document.getElementById("spreads-close")?.addEventListener("click", closeSpreadsModal);
  document.getElementById("spreads-overlay")?.addEventListener("click", closeSpreadsModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSpreadsModal();
  });
}


/* ---------- Kids Dasterkhwan: collage thumbnail → design list → photos + buy buttons ---------- */
function kidsProducts() {
  return (typeof ACCESSORIES !== "undefined" ? ACCESSORIES : [])
    .filter(p => p.category === "Kids Dasterkhwan");
}

function kidsThumbnailHTML() {
  return `
    <div class="patch kd-thumb">
      <div class="patch-photo">${thumbPhotoHTML(KIDS_DASTERKHWAN_THUMBNAIL, kidsProducts()[1]?.image, "Kids Dasterkhwan")}</div>
      <div class="patch-info">
        <h3>Kids Dasterkhwan</h3>
        <button type="button" class="btn-add-bag kd-open">View designs</button>
      </div>
    </div>`;
}

function openKidsModal() {
  const overlay = document.getElementById("kd-overlay");
  const modal = document.getElementById("kd-modal");
  if (!overlay || !modal) return;
  showKidsDesigns();
  overlay.classList.add("is-open");
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeKidsModal() {
  const overlay = document.getElementById("kd-overlay");
  const modal = document.getElementById("kd-modal");
  if (!overlay || !modal) return;
  overlay.classList.remove("is-open");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function showKidsDesigns() {
  const body = document.getElementById("kd-body");
  if (!body) return;

  body.innerHTML = `
    <h3 class="bread-title">Kids Dasterkhwan</h3>
    <p class="bread-description">${escapeHTML(KIDS_DASTERKHWAN_DESCRIPTION)}</p>
    <div class="bread-colour-grid">
      ${kidsProducts().map(p => `
        <button type="button" class="bread-colour" data-kd-id="${escapeHTML(p.id)}">
          ${imgTag(p.image, p.name)}
          <span>${escapeHTML(p.name.replace("Kids Dasterkhwan: ", ""))}</span>${tileRowHTML(p)}
        </button>`).join("")}
    </div>`;

  body.querySelectorAll("[data-kd-id]").forEach((btn) => {
    btn.addEventListener("click", () => showKidsDetail(btn.dataset.kdId));
  });
}

function showKidsDetail(id) {
  const body = document.getElementById("kd-body");
  const p = kidsProducts().find(x => x.id === id);
  if (!body || !p) return;

  const photos = p.gallery && p.gallery.length ? p.gallery : [p.image];

  body.innerHTML = `
    <button type="button" class="bread-back" id="kd-back">← All designs</button>
    <h3 class="bread-title">${escapeHTML(p.name)}</h3>
    <div class="bread-photos tc-zoom">
      ${photos.map(src => imgTag(src, p.name)).join("")}
    </div>
    <p class="price" data-price-for="${escapeHTML(p.id)}">${formatPKR(p.price)}</p>
    ${tileStatusHTML(p)}
    ${detailBlocksHTML(p)}
    <div class="bread-buy" data-product-id="${escapeHTML(p.id)}">${buyActionsHTML(p.id, isLiveAvailable(p), "Add to bag")}</div>`;

  document.getElementById("kd-back").addEventListener("click", showKidsDesigns);
  attachAddToBagHandlers();
  applyLiveProductStatuses();
}

function initKidsModal() {
  // Delegated, so it keeps working when the accessories grid re-renders on filter change.
  document.addEventListener("click", (e) => {
    if (e.target.closest(".kd-open, .kd-thumb")) openKidsModal();
  });
  document.getElementById("kd-close")?.addEventListener("click", closeKidsModal);
  document.getElementById("kd-overlay")?.addEventListener("click", closeKidsModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeKidsModal();
  });
}


/* ---------- Home slideshow: the category thumbnails fade in and drift ---------- */
/* Category thumbnails for the hero slideshow and Explore our collection (images/Thumbnails/) */
const THUMBNAIL_FOLDER = "images/Thumbnails/";
const HERO_SLIDES = [
  { file: "Thumbnail.jpg", eyebrow: "Just dropped · Volume 2", title: "Fresh tablecloths are here, and they are going fast", text: "New tablecloths in patchwork, lacework and everyday prints, each one stitched by hand." },
  { file: "Patchwork-thumbnail.jpg", eyebrow: "Tablecloths", title: "Patchwork", text: "Unique patchwork tablecloth for all occasions." },
  { file: "Lacework-thumbnail.jpg", eyebrow: "Tablecloths", title: "Lacework", text: "Cotton tablecloths finished with a soft lace border for festive tables." },
  { file: "Dailywares-thumbnail.jpg", eyebrow: "Tablecloths", title: "Dailywares", text: "Everyday tablecloths in bright prints, made for breakfast and family meals." },
  { file: "Dasterkhwan_Thumbnail.jpg", eyebrow: "Kids Dasterkhwan", title: "Kids Dasterkhwan", text: "Cheerful dasterkhwans for little ones to share a meal, at home or on a picnic." },
  { file: "Teacozy_Thumbnail.jpg", eyebrow: "Accessories", title: "Tea cozies", text: "Quilted tea cozies that keep the pot warm and add colour to the table." },
  { file: "Breadcloth_Thumbnail.JPG", eyebrow: "Accessories", title: "Bread cloths", text: "Soft cotton cloths that keep bread warm, in patchwork and print." },
  { file: "Potholder_Thumbnail.JPG", eyebrow: "Accessories", title: "Pot holders", text: "Quilted pot holders that protect your hands and add a little colour to the kitchen." }
];

/* Thumbnails load by their exact file name (no .JPG-first guessing), so the first slide shows at once */
function thumbImg(src, alt, eager) {
  const loading = eager ? "eager" : "lazy";
  return `<img src="${escapeHTML(smallPath(src))}" alt="${escapeHTML(alt || "")}" loading="${loading}" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;display:block">`;
}

function renderHeroSlideshow() {
  const box = document.getElementById("hero-slideshow");
  if (!box) return;

  const slides = HERO_SLIDES.map(s => ({ ...s, src: THUMBNAIL_FOLDER + s.file }));

  box.innerHTML = `
    ${slides.map((s, i) => `<div class="hs-slide">${thumbImg(s.src, s.title, i === 0)}</div>`).join("")}
    <div class="hs-copy">
      ${slides.map((s, i) => `<div class="hs-copy-item"><p class="collection-eyebrow">${escapeHTML(s.eyebrow)}</p><h1>${escapeHTML(s.title)}</h1><p class="hs-text">${escapeHTML(s.text)}</p></div>`).join("")}
    </div>
    <div class="hs-dots">${slides.map((s, i) => `<button type="button" data-hs="${i}" aria-label="Show ${escapeHTML(s.title)}"${i === 0 ? ' class="is-on"' : ""}></button>`).join("")}</div>`;

  const slideEls = Array.from(box.querySelectorAll(".hs-slide"));
  const copyEls = Array.from(box.querySelectorAll(".hs-copy-item"));
  const dotEls = Array.from(box.querySelectorAll(".hs-dots button"));
  const HOLD_MS = 7000;      // each slide after the first stays for 7 seconds
  const FIRST_HOLD_MS = 5000; // the first slide stays for 5 seconds
  let index = 0;
  let timer = null;

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => show(index + 1), index === 0 ? FIRST_HOLD_MS : HOLD_MS);
  }

  function show(i) {
    index = (i + slideEls.length) % slideEls.length;
    slideEls.forEach((el, n) => el.classList.toggle("is-on", n === index));
    copyEls.forEach((el, n) => el.classList.toggle("is-on", n === index));
    dotEls.forEach((el, n) => el.classList.toggle("is-on", n === index));
    schedule();
  }

  // The first slide starts from the same state as the others and animates in once its photo is on screen
  function activateFirst() {
    slideEls[0].classList.add("is-on");
    copyEls[0].classList.add("is-on");
    dotEls[0].classList.add("is-on");
    schedule();
  }
  const go = () => requestAnimationFrame(() => requestAnimationFrame(activateFirst));
  const firstImg = slideEls[0] && slideEls[0].querySelector("img");
  if (firstImg && !firstImg.complete) {
    firstImg.addEventListener("load", go, { once: true });
    firstImg.addEventListener("error", go, { once: true });
  } else {
    go();
  }

  box.querySelector(".hs-dots").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-hs]");
    if (!b) return;
    show(Number(b.dataset.hs));
  });

  // Load the other slides one at a time after the page has loaded, so the first slide is not held back
  const queue = slides.slice(1).map(s => smallPath(s.src));
  function loadNext() {
    const src = queue.shift();
    if (!src) return;
    const pre = new Image();
    pre.onload = pre.onerror = loadNext;
    pre.src = src;
  }
  if (document.readyState === "complete") loadNext();
  else window.addEventListener("load", loadNext);
}

/* ---------- Explore Our Collections: one large thumbnail per category ---------- */
function renderCollectionTiles() {
  const box = document.getElementById("collect-grid");
  if (!box) return;
  const tiles = [
    { label: "Tablecloths", src: "images/V2-Tablecloths/Thumbnail.jpg", cls: "tablecloth-open" },
    { label: "Bread cloths", src: THUMBNAIL_FOLDER + "Breadcloth_Thumbnail.JPG", cls: "bread-open" },
    { label: "Kids Dasterkhwan", src: THUMBNAIL_FOLDER + "Dasterkhwan_Thumbnail.jpg", cls: "kd-open" },
    { label: "Tea cozies", src: THUMBNAIL_FOLDER + "Teacozy_Thumbnail.jpg", cls: "tea-open" },
    { label: "Pot holders", src: THUMBNAIL_FOLDER + "Potholder_Thumbnail.JPG", cls: "pot-open" },
    { label: "Patchwork Spreads", src: THUMBNAIL_FOLDER + "Spread_Thumbnail.jpg", cls: "spreads-open" }
  ];
  box.innerHTML = tiles.map(t => {
    const inner = `<span class="collect-photo">${thumbImg(t.src, t.label)}</span><span class="collect-label">${escapeHTML(t.label)}</span>`;
    return t.href
      ? `<a class="collect-tile" href="${t.href}">${inner}</a>`
      : `<button type="button" class="collect-tile ${t.cls}">${inner}</button>`;
  }).join("");
}

/* ---------- Kids Dasterkhwan section: generic description and the thumbnail card ---------- */
function renderKidsSection() {
  const desc = document.getElementById("kids-desc");
  const card = document.getElementById("kids-card");
  if (desc) desc.textContent = KIDS_DASTERKHWAN_DESCRIPTION;
  if (card) card.innerHTML = kidsThumbnailHTML();
}
