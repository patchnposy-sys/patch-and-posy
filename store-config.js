/**
 * PATCH & POSY — Store settings
 * Edit the values below to change bank details, delivery charges,
 * and where order notifications go. No other file needs to change.
 */

const STORE_CONFIG = {
  // Shown on checkout + in emails as the only payment option for now.
  bankDetails: {
    bankName: "Meezan Bank",
    accountTitle: "Patch & Posy",
    accountNumber: "0000-0000000-00",   // TODO: replace with real account number
    iban: "PK00MEZN0000000000000000"    // TODO: replace with real IBAN
  },

  // Flat delivery charges by city (PKR). Add more cities as needed —
  // any city not listed uses "otherCities".
  delivery: {
    karachi: 300,
    otherCities: 400,
    freeAbove: 15000   // orders with subtotal >= this get free delivery
  },

  // Where the "new order" notification email is sent.
  adminEmail: "patchnposy@gmail.com",

  // Currency prefix used everywhere a price is displayed.
  currencyPrefix: "Rs. "
};

function formatPKR(amount) {
  return STORE_CONFIG.currencyPrefix + Number(amount).toLocaleString("en-PK");
}

function getDeliveryCharge(city, subtotal) {
  if (subtotal >= STORE_CONFIG.delivery.freeAbove) return 0;
  const normalized = (city || "").trim().toLowerCase();
  if (normalized === "karachi") return STORE_CONFIG.delivery.karachi;
  return STORE_CONFIG.delivery.otherCities;
}
