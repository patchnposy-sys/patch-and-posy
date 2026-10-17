/**
 * PATCH & POSY — Site behaviour
 * Renders the three catalog grids (Spreads, Tablecloths, Accessories),
 * wires up the mobile menu, newsletter form, cart, and checkout.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Spreads now live in the Patchwork Spreads popup (see initSpreadsModal).
  // Daily Wear is hidden for now.
  renderAccessories(typeof ACCESSORIES !== "undefined" ? ACCESSORIES : []);
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
  attachWhatsAppHandlers();
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
  const label = escapeHTML(addLabel || "Add to basket");
  if (available) {
    return `<div class="patch-actions" data-actions-for="${safeId}">
         <button type="button" class="btn-add-bag" data-product-id="${safeId}">${label}</button>
         <button type="button" class="btn-whatsapp" data-product-id="${safeId}">Order via WhatsApp</button>
       </div>`;
  }
  return `<span class="btn-add-bag btn-add-bag-disabled" data-unavail-for="${safeId}" data-add-label="${label}">Not available yet</span>`;
}

/* AVAILABLE / SOLD badge for a single item (used inside popups and detail pages) */
function tileStatusHTML(p) {
  const available = isLiveAvailable(p);
  return `<span class="tc-tag${available ? " tc-tag-available" : ""}" data-tag-for="${escapeHTML(p.id)}">${escapeHTML(p.tag || "")}</span>`;
}

/* "2 of 4 available" for a category (key = category name) or a tablecloth style (key = "style:<id>") */
function countTextFor(key) {
  const items = key.startsWith("style:")
    ? tableclothDesigns(key.slice("style:".length))
    : getAllProducts().filter((p) => p.category === key);
  const available = items.filter(isLiveAvailable).length;
  return `${available} of ${items.length} available`;
}

function productCardHTML(product) {
  const isAvailable = isLiveAvailable(product);

  const tagHTML = product.tag
    ? `<span class="patch-tag${isAvailable ? " patch-tag-available" : ""}" data-tag-for="${escapeHTML(product.id)}">${escapeHTML(product.tag)}</span>`
    : "";

  const photoStyle = product.image
    ? `background-image:url('${escapeHTML(product.image)}'); background-size:cover; background-position:center;`
    : `background: linear-gradient(135deg, ${(product.swatch || ["#E0A83E", "#C0396B"]).join(", ")});`;

  const actionHTML = buyActionsHTML(product.id, isAvailable, "Add to Bag");

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
  const categories = [...new Set(products.map(p => p.category || "Other"))]
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

/* ---------- Bread cloths: thumbnail → colour list → both photos + buy buttons ---------- */
function breadProducts() {
  return (typeof ACCESSORIES !== "undefined" ? ACCESSORIES : [])
    .filter(p => p.category === "Bread Cloths");
}

function breadThumbnailHTML() {
  return `
    <div class="patch bread-thumb">
      <div class="patch-photo" style="background-image:url('${escapeHTML(BREAD_CLOTH_THUMBNAIL)}'); background-size:cover; background-position:center;"></div>
      <div class="patch-info">
        <h3>Bread Cloths</h3>
        <p class="size-line tc-count" data-count-for="Bread Cloths">${countTextFor("Bread Cloths")}</p>
        <p class="desc">Four colours. Tap to see the designs and add to basket.</p>
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

function showBreadColours() {
  const body = document.getElementById("bread-body");
  if (!body) return;

  body.innerHTML = `
    <h3 class="bread-title">Bread Cloths</h3>
    <p class="bread-description">${escapeHTML(BREAD_CLOTH_DESCRIPTION)}</p>
    <p class="bread-hint">Choose a colour to see the designs.</p>
    <div class="bread-colour-grid">
      ${breadProducts().map(p => `
        <button type="button" class="bread-colour" data-colour-id="${escapeHTML(p.id)}">
          <img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" loading="lazy">
          <span>${escapeHTML(p.name.replace("Bread Cloth — ", ""))}</span>${tileStatusHTML(p)}
        </button>`).join("")}
    </div>`;

  body.querySelectorAll("[data-colour-id]").forEach((btn) => {
    btn.addEventListener("click", () => showBreadDetail(btn.dataset.colourId));
  });
}

function showBreadDetail(id) {
  const body = document.getElementById("bread-body");
  const p = breadProducts().find(x => x.id === id);
  if (!body || !p) return;

  const photos = p.gallery && p.gallery.length ? p.gallery : [p.image];

  body.innerHTML = `
    <button type="button" class="bread-back" id="bread-back">← All colours</button>
    <h3 class="bread-title">${escapeHTML(p.name)}</h3>
    <div class="bread-photos">
      ${photos.map(src => `<img src="${escapeHTML(src)}" alt="${escapeHTML(p.name)}" loading="lazy">`).join("")}
    </div>
    <p class="price" data-price-for="${escapeHTML(p.id)}">${formatPKR(p.price)}</p>
    ${tileStatusHTML(p)}
    <div class="bread-buy" data-product-id="${escapeHTML(p.id)}">${buyActionsHTML(p.id, isLiveAvailable(p), "Add to basket")}</div>`;

  document.getElementById("bread-back").addEventListener("click", showBreadColours);
  attachAddToBagHandlers();
  attachWhatsAppHandlers();
  applyLiveProductStatuses();
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

/* ---------- Live catalogue data (Firestore-backed) ----------
   Set from the dashboard, so no code change or redeploy is needed:
     productStatus/{id}  -> { status: "AVAILABLE" | "SOLD" }
     productPrices/{id}  -> { price: 5500 }
   Loaded once per page view and cached. Products are updated in memory,
   so buy buttons and cart prices use the live values. */
let liveStatusById = {};
let livePriceById = {};
let liveLoadPromise = null;

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
  updateCountsFor();
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
    attachWhatsAppHandlers();
    return;
  }

  // SOLD (or any other non-available status): hide the buy buttons.
  document.querySelectorAll(`[data-actions-for="${id}"]`).forEach((el) => {
    const label = el.querySelector(".btn-add-bag")?.textContent || "Add to basket";
    el.outerHTML = buyActionsHTML(productId, false, label);
  });
}

function setPriceFor(productId, price) {
  document.querySelectorAll(`[data-price-for="${cssEscape(productId)}"]`).forEach((el) => {
    el.textContent = formatPKR(price);
  });
}

function updateCountsFor() {
  document.querySelectorAll("[data-count-for]").forEach((el) => {
    el.textContent = countTextFor(el.dataset.countFor);
  });
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
  updateCountsFor();

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


/* ---------- Pot holders: thumbnail → design list → photo + buy buttons ---------- */
function potProducts() {
  return (typeof ACCESSORIES !== "undefined" ? ACCESSORIES : [])
    .filter(p => p.category === "Pot Holders");
}

function potThumbnailHTML() {
  return `
    <div class="patch pot-thumb">
      <div class="patch-photo" style="background-image:url('${escapeHTML(POT_HOLDER_THUMBNAIL)}'); background-size:cover; background-position:center;"></div>
      <div class="patch-info">
        <h3>Pot Holders</h3>
        <p class="size-line tc-count" data-count-for="Pot Holders">${countTextFor("Pot Holders")}</p>
        <p class="desc">Eleven designs. Tap to see them and add to basket.</p>
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
    <p class="bread-hint">Choose a design to see it up close.</p>
    <div class="bread-colour-grid">
      ${potProducts().map(p => `
        <button type="button" class="bread-colour" data-pot-id="${escapeHTML(p.id)}">
          <img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" loading="lazy">
          <span>${escapeHTML(p.name.replace("Pot Holder — ", ""))}</span>${tileStatusHTML(p)}
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
    <div class="bread-photos">
      ${photos.map(src => `<img src="${escapeHTML(src)}" alt="${escapeHTML(p.name)}" loading="lazy">`).join("")}
    </div>
    <p class="price" data-price-for="${escapeHTML(p.id)}">${formatPKR(p.price)}</p>
    ${tileStatusHTML(p)}
    <div class="bread-buy" data-product-id="${escapeHTML(p.id)}">${buyActionsHTML(p.id, isLiveAvailable(p), "Add to basket")}</div>`;

  document.getElementById("pot-back").addEventListener("click", showPotDesigns);
  attachAddToBagHandlers();
  attachWhatsAppHandlers();
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
      <div class="patch-photo">${imgTag(TEA_COZY_THUMBNAIL, "Tea cozies", "fill")}</div>
      <div class="patch-info">
        <h3>Tea Cozies</h3>
        <p class="size-line tc-count" data-count-for="Tea Cozies">${countTextFor("Tea Cozies")}</p>
        <p class="desc">Two designs. Tap to see them and add to basket.</p>
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

function showTeaDesigns() {
  const body = document.getElementById("tea-body");
  if (!body) return;

  body.innerHTML = `
    <h3 class="bread-title">Tea Cozies</h3>
    <p class="bread-description">${escapeHTML(TEA_COZY_DESCRIPTION)}</p>
    <p class="bread-hint">Choose a design to see it up close.</p>
    <div class="bread-colour-grid">
      ${teaProducts().map(p => `
        <button type="button" class="bread-colour" data-tea-id="${escapeHTML(p.id)}">
          ${imgTag(p.image, p.name)}
          <span>${escapeHTML(p.name.replace("Tea Cozy — ", ""))}</span>${tileStatusHTML(p)}
        </button>`).join("")}
    </div>`;

  body.querySelectorAll("[data-tea-id]").forEach((btn) => {
    btn.addEventListener("click", () => showTeaDetail(btn.dataset.teaId));
  });
}

function showTeaDetail(id) {
  const body = document.getElementById("tea-body");
  const p = teaProducts().find(x => x.id === id);
  if (!body || !p) return;

  const photos = p.gallery && p.gallery.length ? p.gallery : [p.image];

  body.innerHTML = `
    <button type="button" class="bread-back" id="tea-back">← All designs</button>
    <h3 class="bread-title">${escapeHTML(p.name)}</h3>
    <div class="bread-photos">
      ${photos.map(src => imgTag(src, p.name)).join("")}
    </div>
    <p class="price" data-price-for="${escapeHTML(p.id)}">${formatPKR(p.price)}</p>
    ${tileStatusHTML(p)}
    <div class="bread-buy" data-product-id="${escapeHTML(p.id)}">${buyActionsHTML(p.id, isLiveAvailable(p), "Add to basket")}</div>`;

  document.getElementById("tea-back").addEventListener("click", showTeaDesigns);
  attachAddToBagHandlers();
  attachWhatsAppHandlers();
  applyLiveProductStatuses();
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

function imgTag(src, alt, mode) {
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

/* Step 1: the three style cards (Patchwork, Lacework, Dailywares) */
function showTableclothStyles() {
  const body = document.getElementById("tablecloth-body");
  if (!body) return;
  body.innerHTML = `
    <h3 class="bread-title">Tablecloths · Volume 2</h3>
    <p class="bread-hint">Choose a style to see its designs.</p>
    <div class="tc-style-grid">
      ${tableclothStyles().map(s => `
        <button type="button" class="tc-style-card" data-tc-style="${escapeHTML(s.id)}">
          <span class="tc-style-photo">${imgTag(TABLECLOTH_FOLDER + encodeURI(s.thumbnail), s.name, "fill")}</span>
          <span class="tc-style-name">${escapeHTML(s.name)}</span>
          <span class="tc-style-desc">${escapeHTML(s.description)}</span>
          <span class="tc-style-meta"><span data-count-for="style:${escapeHTML(s.id)}">${countTextFor("style:" + s.id)}</span> · from ${formatPKR(s.price)}</span>
        </button>`).join("")}
    </div>`;

  body.querySelectorAll("[data-tc-style]").forEach((btn) => {
    btn.addEventListener("click", () => showTableclothDesigns(btn.dataset.tcStyle));
  });
}

/* Step 2: the designs in one style, each with its c photo, price and availability */
function showTableclothDesigns(styleId) {
  const body = document.getElementById("tablecloth-body");
  const style = tableclothStyles().find(s => s.id === styleId);
  if (!body || !style) return;

  body.innerHTML = `
    <button type="button" class="bread-back" id="tc-back-styles">← All styles</button>
    <h3 class="bread-title">${escapeHTML(style.name)}</h3>
    <p class="bread-hint">${escapeHTML(style.description)}</p>
    <div class="tablecloth-grid">
      ${tableclothDesigns(styleId).map(d => `
        <button type="button" class="tablecloth-tile" data-tc-id="${escapeHTML(d.id)}">
          <span class="tablecloth-tile-photo">${imgTag(d.card, d.name, "fill")}</span>
          <span class="tablecloth-tile-name">${escapeHTML(d.name)}</span>
          <span class="tc-tile-row">
            <span class="tc-tile-price" data-price-for="${escapeHTML(d.id)}">${formatPKR(d.price)}</span>
            <span class="tc-tag${isTableclothAvailable(d) ? " tc-tag-available" : ""}" data-tag-for="${escapeHTML(d.id)}">${escapeHTML(d.tag)}</span>
          </span>
        </button>`).join("")}
    </div>`;

  document.getElementById("tc-back-styles").addEventListener("click", showTableclothStyles);
  body.querySelectorAll("[data-tc-id]").forEach((btn) => {
    btn.addEventListener("click", () => showTableclothDetail(btn.dataset.tcId));
  });
}

/* Step 3: one design — all three photos, then description, price, dimensions, care, and the buy buttons */
function showTableclothDetail(id) {
  const body = document.getElementById("tablecloth-body");
  const d = tableclothDesignsAll().find(x => x.id === id);
  if (!body || !d) return;
  const style = tableclothStyles().find(s => s.id === d.style);
  const available = isTableclothAvailable(d);

  const dimsHTML = (d.dimensions || []).map(x => `
    <li><span>${escapeHTML(x.size)}</span><span>${escapeHTML(x.measure)}</span></li>`).join("");

  const buyHTML = `<div class="bread-buy" data-product-id="${escapeHTML(d.id)}">${buyActionsHTML(d.id, available, "Add to basket")}</div>`;

  body.innerHTML = `
    <button type="button" class="bread-back" id="tc-back-designs">← Back to ${escapeHTML(style ? style.name : "designs")}</button>
    <h3 class="bread-title">${escapeHTML(d.name)}</h3>
    <div class="bread-photos tc-zoom">
      ${d.photos.map(src => imgTag(src, d.name)).join("")}
    </div>
    <div class="tc-detail">
      <section class="tc-section">
        <h4>Description</h4>
        <p>${escapeHTML(d.description)}</p>
      </section>
      <section class="tc-section tc-price-row">
        <h4>Price</h4>
        <p class="tc-price" data-price-for="${escapeHTML(d.id)}">${formatPKR(d.price)}</p>
        <span class="tc-tag${available ? " tc-tag-available" : ""}" data-tag-for="${escapeHTML(d.id)}">${escapeHTML(d.tag)}</span>
      </section>
      <section class="tc-section">
        <h4>Dimensions</h4>
        <ul class="tc-dims">${dimsHTML}</ul>
      </section>
      <section class="tc-section">
        <h4>Care Instructions</h4>
        <p>${escapeHTML(d.careInstructions)}</p>
      </section>
    </div>
    ${buyHTML}`;

  document.getElementById("tc-back-designs").addEventListener("click", () => showTableclothDesigns(d.style));
  attachAddToBagHandlers();
  attachWhatsAppHandlers();
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
    if (img) openLightbox(img.currentSrc || img.src, img.alt);
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

/* ---------- Patchwork Spreads (Volume 1, all sold): thumbnail → popup with every spread, photo full size ---------- */
function openSpreadsModal() {
  const overlay = document.getElementById("spreads-overlay");
  const modal = document.getElementById("spreads-modal");
  if (!overlay || !modal) return;
  showSpreads();
  overlay.classList.add("is-open");
  modal.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function closeSpreadsModal() {
  const overlay = document.getElementById("spreads-overlay");
  const modal = document.getElementById("spreads-modal");
  if (!overlay || !modal) return;
  overlay.classList.remove("is-open");
  modal.classList.remove("is-open");
  document.body.style.overflow = "";
}

function spreadCardHTML(p) {
  return `
    <div class="spread-card">
      <div class="spread-photo tc-zoom">${imgTag(p.image, p.name, "fill")}</div>
      <div class="spread-info">
        <h3>${escapeHTML(p.name)}</h3>
        <p class="desc">${escapeHTML(p.desc)}</p>
        <p class="price" data-price-for="${escapeHTML(p.id)}">${formatPKR(p.price)}</p>
        <span class="tc-tag" data-tag-for="${escapeHTML(p.id)}">${escapeHTML(p.tag)}</span>
      </div>
    </div>`;
}

function showSpreads() {
  const body = document.getElementById("spreads-body");
  if (!body) return;
  const items = typeof SPREADS !== "undefined" ? SPREADS : [];
  body.innerHTML = `
    <h3 class="bread-title">Patchwork Spreads · Volume 1</h3>
    <p class="bread-hint">All fifteen spreads are sold. Tap a photo to see it full size.</p>
    <div class="spread-grid">${items.map(spreadCardHTML).join("")}</div>`;
  applyLiveProductStatuses();
}

function initSpreadsModal() {
  document.addEventListener("click", (e) => {
    if (e.target.closest(".spreads-open")) openSpreadsModal();
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
      <div class="patch-photo">${imgTag(KIDS_DASTERKHWAN_THUMBNAIL, "Kids Dasterkhwan", "fill")}</div>
      <div class="patch-info">
        <h3>Kids Dasterkhwan</h3>
        <p class="size-line tc-count" data-count-for="Kids Dasterkhwan">${countTextFor("Kids Dasterkhwan")}</p>
        <p class="desc">Three designs. Tap to see them and add to basket.</p>
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
    <p class="bread-hint">Choose a design to see all of its photos.</p>
    <div class="bread-colour-grid">
      ${kidsProducts().map(p => `
        <button type="button" class="bread-colour" data-kd-id="${escapeHTML(p.id)}">
          ${imgTag(p.image, p.name)}
          <span>${escapeHTML(p.name.replace("Kids Dasterkhwan — ", ""))}</span>${tileStatusHTML(p)}
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
    <div class="bread-photos">
      ${photos.map(src => imgTag(src, p.name)).join("")}
    </div>
    <p class="bread-description">${escapeHTML(p.desc)}</p>
    <p class="price" data-price-for="${escapeHTML(p.id)}">${formatPKR(p.price)}</p>
    ${tileStatusHTML(p)}
    <div class="bread-buy" data-product-id="${escapeHTML(p.id)}">${buyActionsHTML(p.id, isLiveAvailable(p), "Add to basket")}</div>`;

  document.getElementById("kd-back").addEventListener("click", showKidsDesigns);
  attachAddToBagHandlers();
  attachWhatsAppHandlers();
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
