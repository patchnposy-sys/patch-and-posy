/**
 * PATCH & POSY — EmailJS configuration
 *
 * EmailJS sends real emails straight from the browser — no backend server
 * needed. It sends FROM patchnposy@gmail.com to both the customer (order
 * confirmation) and to patchnposy@gmail.com itself (new-order alert).
 * The dashboard also uses it to email a customer when their order is
 * confirmed, shipped, completed or cancelled.
 *
 * SETUP.md has full click-by-click instructions. Short version:
 *   1. Go to https://www.emailjs.com → sign up free (200 emails/month).
 *   2. Email Services → Add new service → Gmail → connect patchnposy@gmail.com.
 *      Copy the "Service ID" it gives you.
 *   3. Email Templates → create three templates and copy each "Template ID":
 *        - "Customer confirmation" (sent on checkout)
 *        - "Admin new order"       (sent on checkout)
 *        - "Order status update"   (sent from the dashboard on Save)
 *      In each template, put {{{items_html}}} where the order items should
 *      appear (the three braces matter: they keep the photos and table).
 *      Use {{{first_image_url}}} for the first product photo if you want
 *      it shown on its own.
 *   4. Account → General → copy your "Public Key".
 *   5. Paste all five values below.
 */

const EMAILJS_CONFIG = {
  publicKey: "Lv8oFlb_LkY2ZJdUU",
  serviceId: "service_80onzwl",
  customerTemplateId: "template_agzmk8e",
  adminTemplateId: "template_bqn9b18",
  statusTemplateId: "PASTE_YOUR_STATUS_TEMPLATE_ID"
};

/* Photo file endings tried in this order, the same order the website uses,
   so the email shows the same photo the site shows. */
const EMAIL_IMAGE_EXTENSIONS = [".JPG", ".jpg", ".jpeg", ".JPEG", ".png", ".PNG", ".webp", ".WEBP"];

/* Client emails sent from the dashboard when a status is saved. "new" sends nothing. */
const ORDER_STATUS_EMAILS = {
  confirmed: {
    label: "Confirmed",
    message: "Good news! Your payment has been received and your order is confirmed. We'll let you know as soon as it ships."
  },
  shipped: {
    label: "Shipped",
    message: "Your order is on its way to you."
  },
  completed: {
    label: "Completed",
    message: "Your order is complete. Thank you for shopping with Patch & Posy."
  },
  cancelled: {
    label: "Cancelled",
    message: "Your order has been cancelled. If you have any questions, just reply to this email."
  }
};

function isEmailJSConfigured() {
  return typeof emailjs !== "undefined" &&
    !EMAILJS_CONFIG.publicKey.startsWith("PASTE_");
}

function initEmailJS() {
  if (isEmailJSConfigured()) {
    emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
  } else {
    console.warn("EmailJS is not configured yet — see js/emailjs-config.js and SETUP.md.");
  }
}

/* Finds a product in the catalogue by id, so its photo can be used in the email */
function findCatalogProduct(id) {
  const all = [
    ...(typeof TABLECLOTH_DESIGNS !== "undefined" ? TABLECLOTH_DESIGNS : []),
    ...(typeof ACCESSORIES !== "undefined" ? ACCESSORIES : []),
    ...(typeof SPREADS !== "undefined" ? SPREADS : [])
  ];
  return all.find((p) => p.id === id);
}

/* The first photo of an item: its image, or the first of its photos */
function itemPhotoSource(item) {
  const p = findCatalogProduct(item.id);
  return (p && (p.image || (p.photos || [])[0] || p.card)) || item.image || "";
}

/* Returns the full URL of a photo that really exists, or "" if none is found.
   Tries the same file endings the website tries. */
function resolveEmailImageUrl(src) {
  return new Promise((resolve) => {
    if (!src) { resolve(""); return; }

    const m = String(src).match(/\.[^./]+$/);
    const base = m ? src.slice(0, -m[0].length) : src;
    const candidates = [...EMAIL_IMAGE_EXTENSIONS.map((ext) => base + ext), src];
    // Always the live website, so email apps can load the photos (the dev preview is protected)
    const origin = "https://patchandposy.com.pk/";
    let i = 0;

    const tryNext = () => {
      if (i >= candidates.length) { resolve(""); return; }
      const url = new URL(candidates[i++], origin).href;
      const img = new Image();
      let done = false;
      let timer = null;
      const finish = (ok) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        if (ok) resolve(url); else tryNext();
      };
      timer = setTimeout(() => finish(false), 5000);
      img.onload = () => finish(true);
      img.onerror = () => finish(false);
      img.src = url;
    };

    tryNext();
  });
}

function emailEscape(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

/* Order items as an HTML table, one photo per item */
function buildItemsHTML(items, photoUrls) {
  const rows = items.map((item, i) => {
    const photo = photoUrls[i]
      ? `<img src="${emailEscape(photoUrls[i])}" alt="${emailEscape(item.name)}" width="90" style="display:block;width:90px;border-radius:6px;">`
      : "";
    return `<tr>
      <td style="padding:8px 12px 8px 0;width:100px;vertical-align:middle;">${photo}</td>
      <td style="padding:8px 0;vertical-align:middle;">${emailEscape(item.name)} × ${item.qty}</td>
      <td style="padding:8px 0;text-align:right;vertical-align:middle;white-space:nowrap;">${formatPKR(item.price * item.qty)}</td>
    </tr>`;
  });
  return `<table role="presentation" style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">${rows.join("")}</table>`;
}

/* Fields shared by every order email */
async function buildOrderParams(order) {
  const photoUrls = await Promise.all(
    order.items.map((item) => resolveEmailImageUrl(itemPhotoSource(item)))
  );

  const itemsList = order.items
    .map((i) => `${i.name} × ${i.qty} — ${formatPKR(i.price * i.qty)}`)
    .join("\n");

  return {
    order_id: order.orderId,
    customer_name: order.customer.name,
    customer_email: order.customer.email,
    customer_phone: order.customer.phone,
    customer_address: order.customer.address,
    customer_city: order.customer.city,
    items_list: itemsList,
    items_html: buildItemsHTML(order.items, photoUrls),
    first_image_url: photoUrls.find(Boolean) || "",
    subtotal: formatPKR(order.subtotal),
    delivery_charge: formatPKR(order.deliveryCharge),
    total: formatPKR(order.total),
    payment_method: "Shared on WhatsApp",
    whatsapp_note: "Our team will contact you on WhatsApp to share the payment details and shipment details.",
    bank_name: "",
    account_title: "",
    account_number: "",
    iban: ""
  };
}

/**
 * Sends both order emails at checkout. Fails silently (order is already saved
 * in Firestore either way) but logs a warning so it's easy to notice in
 * dev tools if email isn't configured yet.
 */
async function sendOrderEmails(order) {
  if (!isEmailJSConfigured()) {
    console.warn("Skipping order emails — EmailJS not configured.");
    return { customerSent: false, adminSent: false };
  }

  const params = await buildOrderParams(order);
  const results = { customerSent: false, adminSent: false };

  try {
    await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.customerTemplateId, {
      ...params,
      to_email: order.customer.email
    });
    results.customerSent = true;
  } catch (err) {
    console.error("Customer confirmation email failed:", err);
  }

  try {
    await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.adminTemplateId, {
      ...params,
      to_email: STORE_CONFIG.adminEmail
    });
    results.adminSent = true;
  } catch (err) {
    console.error("Admin notification email failed:", err);
  }

  return results;
}

/**
 * Emails the customer when the dashboard saves a new status.
 * Returns true if sent (or nothing needed sending), false if it failed.
 */
async function sendOrderStatusEmail(order, status) {
  const info = ORDER_STATUS_EMAILS[status];
  if (!info) return true;
  if (!isEmailJSConfigured()) return false;

  try {
    const params = await buildOrderParams(order);
    await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.statusTemplateId, {
      ...params,
      status_label: info.label,
      status_message: info.message,
      to_email: order.customer.email
    });
    return true;
  } catch (err) {
    console.error("Order status email failed:", err);
    return false;
  }
}
