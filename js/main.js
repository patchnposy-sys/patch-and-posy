/**
 * PATCH & POSY — Site behaviour
 * Renders the three catalog grids (Spreads, Tablecloths, Accessories),
 * wires up the mobile menu, newsletter form, cart, and checkout.
 */

document.addEventListener("DOMContentLoaded", () => {
  renderGrid("spreads-grid", typeof SPREADS !== "undefined" ? SPREADS : []);
  renderGrid("tablecloths-luxury-grid", (typeof TABLECLOTHS !== "undefined" ? TABLECLOTHS : []).filter(p => p.subcategory === "luxury"));
  renderGrid("tablecloths-daily-grid", (typeof TABLECLOTHS !== "undefined" ? TABLECLOTHS : []).filter(p => p.subcategory === "daily"));
  renderGrid("accessories-grid", typeof ACCESSORIES !== "undefined" ? ACCESSORIES : []);

  initMobileMenu();
  initNewsletterForm();

  if (typeof initFirebase === "function") initFirebase();
  if (typeof initEmailJS === "function") initEmailJS();
  if (typeof initCart === "function") initCart();
  if (typeof initCheckout === "function") initCheckout();

  attachAddToBagHandlers();
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
    ? `<span class="patch-tag${isAvailable ? " patch-tag-available" : ""}">${escapeHTML(product.tag)}</span>`
    : "";

  const photoStyle = product.image
    ? `background-image:url('${escapeHTML(product.image)}'); background-size:cover; background-position:center;`
    : `background: linear-gradient(135deg, ${(product.swatch || ["#E0A83E", "#C0396B"]).join(", ")});`;

  const actionHTML = isAvailable
    ? `<button type="button" class="btn-add-bag" data-product-id="${escapeHTML(product.id)}">Add to Bag</button>`
    : `<span class="btn-add-bag btn-add-bag-disabled">Not available yet</span>`;

  return `
    <div class="patch">
      <div class="patch-photo" style="${photoStyle}">
        ${tagHTML}
        ${!product.image ? `<span class="patch-placeholder-label">Photo coming soon</span>` : ""}
      </div>
      <div class="patch-info">
        <h3>${escapeHTML(product.name)}</h3>
        <p class="desc">${escapeHTML(product.desc)}</p>
        <p class="price">${formatPKR(product.price)}</p>
        ${actionHTML}
      </div>
    </div>`;
}

function attachAddToBagHandlers() {
  const allProducts = [
    ...(typeof SPREADS !== "undefined" ? SPREADS : []),
    ...(typeof TABLECLOTHS !== "undefined" ? TABLECLOTHS : []),
    ...(typeof ACCESSORIES !== "undefined" ? ACCESSORIES : [])
  ];

  document.querySelectorAll(".btn-add-bag[data-product-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const product = allProducts.find((p) => p.id === btn.dataset.productId);
      if (product && typeof addToCart === "function") {
        addToCart(product);
      }
    });
  });
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
