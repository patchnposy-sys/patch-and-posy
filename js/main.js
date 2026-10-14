/**
 * PATCH & POSY — Site behaviour
 * Renders the three catalog grids (Spreads, Tablecloths, Accessories),
 * wires up the mobile menu, newsletter form, cart, and checkout.
 */

document.addEventListener("DOMContentLoaded", () => {
  renderGrid("spreads-grid", typeof SPREADS !== "undefined" ? SPREADS : []);
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

  const ACCESSORY_ORDER = ["Tea Cozies", "Pot Holders", "Bread Cloths"];
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
          <span>${escapeHTML(p.name.replace("Bread Cloth — ", ""))}</span>
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
    <p class="price">${formatPKR(p.price)}</p>
    <div class="bread-buy" data-product-id="${escapeHTML(p.id)}">
      <div class="patch-actions" data-actions-for="${escapeHTML(p.id)}">
        <button type="button" class="btn-add-bag" data-product-id="${escapeHTML(p.id)}">Add to basket</button>
        <button type="button" class="btn-whatsapp" data-product-id="${escapeHTML(p.id)}">Order via WhatsApp</button>
      </div>
    </div>`;

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
  const card = document.querySelector(`[data-product-id="${cssEscape(productId)}"]`);
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
          <span>${escapeHTML(p.name.replace("Pot Holder — ", ""))}</span>
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
    <p class="price">${formatPKR(p.price)}</p>
    <div class="bread-buy" data-product-id="${escapeHTML(p.id)}">
      <div class="patch-actions" data-actions-for="${escapeHTML(p.id)}">
        <button type="button" class="btn-add-bag" data-product-id="${escapeHTML(p.id)}">Add to basket</button>
        <button type="button" class="btn-whatsapp" data-product-id="${escapeHTML(p.id)}">Order via WhatsApp</button>
      </div>
    </div>`;

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
          <span>${escapeHTML(p.name.replace("Tea Cozy — ", ""))}</span>
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
    <p class="price">${formatPKR(p.price)}</p>
    <div class="bread-buy" data-product-id="${escapeHTML(p.id)}">
      <div class="patch-actions" data-actions-for="${escapeHTML(p.id)}">
        <button type="button" class="btn-add-bag" data-product-id="${escapeHTML(p.id)}">Add to basket</button>
        <button type="button" class="btn-whatsapp" data-product-id="${escapeHTML(p.id)}">Order via WhatsApp</button>
      </div>
    </div>`;

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
  const m = String(src).match(/\.[^./]+$/);
  const base = m ? src.slice(0, -m[0].length) : src;
  const first = m ? m[0] : IMG_EXT_FALLBACKS[0];
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


/* ---------- Tablecloths (new collection): banner → Tablecloth 01 card → photos + order ---------- */
function tableclothProducts() {
  return typeof TABLECLOTHS !== "undefined" ? TABLECLOTHS : [];
}

function openTableclothModal() {
  const overlay = document.getElementById("tablecloth-overlay");
  const modal = document.getElementById("tablecloth-modal");
  if (!overlay || !modal) return;
  showTableclothCard();
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

function showTableclothCard() {
  const body = document.getElementById("tablecloth-body");
  if (!body) return;
  const items = tableclothProducts();
  body.innerHTML = `
    <h3 class="bread-title">New collection · Volume 2</h3>
    <p class="bread-hint">Choose a tablecloth to see it up close.</p>
    <div class="tablecloth-grid">
      ${items.map(p => {
        const available = p.tag === "AVAILABLE" && p.image;
        return `
        <button type="button" class="tablecloth-tile" data-tc-id="${escapeHTML(p.id)}" ${available ? "" : "disabled"}>
          <span class="tablecloth-tile-photo">${p.image ? imgTag(p.image, p.name, "fill") : `<span class="tablecloth-tile-blank">Coming soon</span>`}</span>
          <span class="tablecloth-tile-name">${escapeHTML(p.name)}</span>
          <span class="tablecloth-tile-desc">${escapeHTML(p.desc)}</span>
        </button>`;
      }).join("")}
    </div>`;

  body.querySelectorAll("[data-tc-id]:not([disabled])").forEach((btn) => {
    btn.addEventListener("click", () => showTableclothDetail(btn.dataset.tcId));
  });
}

function showTableclothDetail(id) {
  const body = document.getElementById("tablecloth-body");
  const p = tableclothProducts().find(x => x.id === id);
  if (!body || !p) return;

  const photos = p.gallery && p.gallery.length ? p.gallery : [p.image];

  body.innerHTML = `
    <button type="button" class="bread-back" id="tablecloth-back">← Back</button>
    <h3 class="bread-title">${escapeHTML(p.name)}</h3>
    <div class="bread-photos">
      ${photos.map(src => imgTag(src, p.name)).join("")}
    </div>
    <p class="price">${formatPKR(p.price)}</p>
    <div class="bread-buy" data-product-id="${escapeHTML(p.id)}">
      <div class="patch-actions" data-actions-for="${escapeHTML(p.id)}">
        <button type="button" class="btn-add-bag" data-product-id="${escapeHTML(p.id)}">Add to basket</button>
        <button type="button" class="btn-whatsapp" data-product-id="${escapeHTML(p.id)}">Order via WhatsApp</button>
      </div>
    </div>`;

  document.getElementById("tablecloth-back").addEventListener("click", showTableclothCard);
  attachAddToBagHandlers();
  attachWhatsAppHandlers();
  applyLiveProductStatuses();
}

function initTableclothModal() {
  // Delegated: the banner and its button both carry .tablecloth-open.
  document.addEventListener("click", (e) => {
    if (e.target.closest(".tablecloth-open")) openTableclothModal();
  });
  document.getElementById("tablecloth-close")?.addEventListener("click", closeTableclothModal);
  document.getElementById("tablecloth-overlay")?.addEventListener("click", closeTableclothModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeTableclothModal();
  });
}


/* Banner photo is added by the script (not static HTML) so the extension fallback always works. */
function initTableclothBanner() {
  document.querySelectorAll(".collection-banner").forEach((banner) => {
    if (banner.querySelector("img")) return;
    banner.insertAdjacentHTML("afterbegin", imgTag(TABLECLOTH_THUMBNAIL, "Tablecloths — new collection", "fill"));
  });
}
