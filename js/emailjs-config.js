/**
 * PATCH & POSY — EmailJS configuration
 *
 * EmailJS sends real emails straight from the browser — no backend server
 * needed. It sends FROM patchnposy@gmail.com to both the customer (order
 * confirmation) and to patchnposy@gmail.com itself (new-order alert).
 *
 * SETUP.md has full click-by-click instructions. Short version:
 *   1. Go to https://www.emailjs.com → sign up free (200 emails/month).
 *   2. Email Services → Add new service → Gmail → connect patchnposy@gmail.com.
 *      Copy the "Service ID" it gives you.
 *   3. Email Templates → create a "Customer confirmation" template and an
 *      "Admin new order" template (sample text is in SETUP.md). Copy each
 *      "Template ID".
 *   4. Account → General → copy your "Public Key".
 *   5. Paste all four values below.
 */

const EMAILJS_CONFIG = {
  publicKey: "PASTE_YOUR_EMAILJS_PUBLIC_KEY",
  serviceId: "PASTE_YOUR_EMAILJS_SERVICE_ID",
  customerTemplateId: "PASTE_YOUR_CUSTOMER_TEMPLATE_ID",
  adminTemplateId: "PASTE_YOUR_ADMIN_TEMPLATE_ID"
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

/**
 * Sends both order emails. Fails silently (order is already saved in
 * Firestore either way) but logs a warning so it's easy to notice in
 * dev tools if email isn't configured yet.
 */
async function sendOrderEmails(order) {
  if (!isEmailJSConfigured()) {
    console.warn("Skipping order emails — EmailJS not configured.");
    return { customerSent: false, adminSent: false };
  }

  const itemsList = order.items
    .map((i) => `${i.name} × ${i.qty} — ${formatPKR(i.price * i.qty)}`)
    .join("\n");

  const commonParams = {
    order_id: order.orderId,
    customer_name: order.customer.name,
    customer_email: order.customer.email,
    customer_phone: order.customer.phone,
    customer_address: order.customer.address,
    customer_city: order.customer.city,
    items_list: itemsList,
    subtotal: formatPKR(order.subtotal),
    delivery_charge: formatPKR(order.deliveryCharge),
    total: formatPKR(order.total),
    payment_method: "Bank / Account Transfer",
    bank_name: STORE_CONFIG.bankDetails.bankName,
    account_title: STORE_CONFIG.bankDetails.accountTitle,
    account_number: STORE_CONFIG.bankDetails.accountNumber,
    iban: STORE_CONFIG.bankDetails.iban
  };

  const results = { customerSent: false, adminSent: false };

  try {
    await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.customerTemplateId, {
      ...commonParams,
      to_email: order.customer.email
    });
    results.customerSent = true;
  } catch (err) {
    console.error("Customer confirmation email failed:", err);
  }

  try {
    await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.adminTemplateId, {
      ...commonParams,
      to_email: STORE_CONFIG.adminEmail
    });
    results.adminSent = true;
  } catch (err) {
    console.error("Admin notification email failed:", err);
  }

  return results;
}
