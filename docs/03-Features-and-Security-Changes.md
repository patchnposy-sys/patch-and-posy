# Patch & Posy: Features and Security Changes (Version 2.1.0)

This document lists every feature and security change made in the current version, what it does, and which files it touches. Use it as the record of what was built.

Current version: **2.1.0** (see `VERSION` and `CHANGELOG.md`)

---

## Part A: Security changes

| # | Change | What it does | Where it is | Status |
|---|---|---|---|---|
| S1 | Pakistani mobile number check | Accepts only 03xx followed by 7 digits. Also accepts +92 and 0092. Saves in one format (03xxxxxxxxx). | `js/checkout.js`, `index.html` (pattern), `firestore.rules` | Done. Published rules needed in Firebase. |
| S2 | Email format check | Valid email pattern, maximum 120 characters. | `js/checkout.js`, `firestore.rules` | Done. |
| S3 | Input length limits | Name 80, address 200, city 60, notes 500, phone 20, email 120. | `index.html` (maxlength), `js/checkout.js` | Done. |
| S4 | Markup removal | Angle brackets `<` and `>` are removed from checkout text before saving. | `js/checkout.js` (cleanText) | Done. |
| S5 | Spam trap | Hidden field "Leave this empty". Orders with a filled field are refused. | `index.html`, `js/checkout.js` | Done. |
| S6 | Database rules: orders | Anyone can create an order only if every field, type, value and length matches. Only the admin can read, change or delete orders. | `firestore.rules` | Written. Must be published in Firebase Console. |
| S7 | Database rules: products | Anyone can read product status, prices and details. Only the admin can change them. | `firestore.rules` | Written. Must be published. |
| S8 | Database rules: everything else | All other collections are closed. | `firestore.rules` | Written. |
| S9 | Admin-only dashboard data | Dashboard data is available only after admin sign-in. | `dashboard.js`, Firebase Authentication | Existing; verified in test cases. |
| S10 | Bot protection (App Check) | Blocks scripted requests to the database. Works only after a key is added and enforcement is turned on. | `js/app-check.js`, `index.html`, `dashboard.html` | Code ready. Not active (no billing; key not added). |
| S11 | Escaping in dashboard | Customer text shown in the dashboard is displayed as plain text. | `js/dashboard.js` (escapeHTML) | Existing. |
| S12 | Sign-in persistence | Admin stays signed in on the same browser only. | `js/firebase-config.js` | Existing. |

### Security status summary

- **Active now:** S1 to S5, S9, S11, S12.
- **Active after publishing rules in Firebase:** S6 to S8.
- **Not active (by choice):** S10. Requires Firebase billing on the Blaze plan.

### Known limits

- A person who writes a script can still send valid-looking orders. Mitigate with the EmailJS monthly limit, regular order review, and optional App Check later.
- Client-side checks can be bypassed. The database rules (S6) are the real protection.
- Email addresses are checked for format only. Ownership is not verified (no code is sent to the address).

---

## Part B: Features

### B1. Storefront

| # | Feature | Description | Files |
|---|---|---|---|
| F1 | Header and menu | Logo centred; Volume 2 links on the left; Volume 1 links on the right; bag button; hamburger on screens 1100 px and below. | `index.html`, `css/style.css` |
| F2 | Mobile menu | Hamburger on the left; bag on the right; cream menu panel with readable links. | `css/style.css` |
| F3 | Notice bar | "Every tablecloth is one of a kind..." message above the banner. | `index.html`, `css/style.css` |
| F4 | Hero slideshow | Rotating highlight slides with timing (first slide 5 s, then 7 s). | `js/main.js`, `css/style.css` |
| F5 | Explore our collection | Six tiles, one per category; Tablecloths tile uses `images/V2-Tablecloths/Thumbnail.jpg`. | `js/main.js` |
| F6 | Tablecloths (Volume 2) | Style list, designs with names (TC01 to TC14), photos, dimensions "70 x 100 inches". | `js/products-data.js`, `js/main.js` |
| F7 | Bread cloths | Colour list, photos, quantity up to 4 per design. | `js/products-data.js`, `js/main.js`, `js/cart.js` |
| F8 | Tea cozies | Design list, photos, Add to bag. | `js/products-data.js`, `js/main.js` |
| F9 | Pot holders | Design list named from photos, Add to bag. | `js/products-data.js`, `js/main.js` |
| F10 | Kids Dasterkhwan | Dialog text "Made for little foodies"; designs Tomato Tales, Sunny Side Up, Little Cake Club. | `js/products-data.js`, `js/main.js` |
| F11 | Patchwork Spreads | Volume 1 gallery (sold out) in a dialog. | `index.html`, `js/main.js` |
| F12 | Product tags | Only AVAILABLE items can be bought. Other tags show as a badge. | `js/main.js`, `css/style.css` |
| F13 | Bag drawer | Items, quantities, remove, subtotal, Checkout. | `js/cart.js`, `css/style.css` |
| F14 | Checkout | Customer form, validation, order saved, emails sent. | `js/checkout.js`, `index.html` |
| F15 | Checkout clears other dialogs | Opening checkout closes product dialogs first. | `js/cart.js` |
| F16 | Order confirmation | Order number and next steps. | `js/checkout.js` |
| F17 | Close buttons | Round close button at the top right in every dialog. | `css/style.css` |
| F18 | Story and About Us | Fully justified text; story photo shows its full shape. | `css/style.css`, `index.html` |
| F19 | Footer | About links, contact, copyright, version number, no Shop section. | `index.html` |
| F20 | Search engine files | Sitemap, robots file, business information for search results. | `sitemap.xml`, `robots.txt`, `index.html` |
| F21 | Version number | Shown in the footer and stored in `VERSION`. | `index.html`, `VERSION` |

### B2. Dashboard

| # | Feature | Description | Files |
|---|---|---|---|
| D1 | Login | Admin sign-in with email and password. Logo on the login card. | `dashboard.html`, `css/dashboard.css` |
| D2 | Header | Logo on the left; email and Log out on the right. | `dashboard.html`, `css/dashboard.css` |
| D3 | Orders | Order list, status update, order details. | `js/dashboard.js` |
| D4 | Clients | Customer list from orders. | `js/dashboard.js` |
| D5 | Products | Set AVAILABLE or SOLD per product. | `js/dashboard.js` |
| D6 | Prices | Price per product, saved to the database. | `js/dashboard.js` |
| D7 | Details | Description, dimensions and care text for each product, saved to the database. | `js/dashboard.js` |
| D8 | Unsynced local orders | Orders stored in the browser that still need sync. | `js/dashboard.js` |

### B3. Services

| Service | Use |
|---|---|
| Firebase Firestore | Orders, product status, prices, details |
| Firebase Authentication | Admin sign-in |
| EmailJS | Confirmation and owner notification emails |
| Vercel | Hosting |
| GitHub | Source history |

---

## Part C: Open items

| # | Item | Owner action |
|---|---|---|
| O1 | Publish `firestore.rules` in Firebase Console | Paste the file and click Publish |
| O2 | Details tab shows "Couldn't load details" | Send the browser console error (F12 → Console) |
| O3 | Confirm the test order and both emails | Place a test order on the live site |
| O4 | Optional: App Check (bot protection) | Only if billing is added later |
| O5 | Confirm the close button, header and checkout layout on a real iPhone | Test on device |
