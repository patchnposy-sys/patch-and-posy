# Patch & Posy Online Store: Business Specification

Document version: 2.1.0
Status: Approved for the owner's review
Owner: Patch & Posy (Karachi, Pakistan)
Website: https://www.patchandposy.com.pk/

---

## 1. Purpose

Patch & Posy sells handmade patchwork and home textiles. This website lets customers browse the collection, place an order for payment after confirmation, and receive a confirmation email. The owner uses a private dashboard to manage orders, product status, prices and product details.

## 2. Scope

**In scope**
- Public storefront (browsing, bag, checkout, confirmation).
- Public information pages (story, about, journal sign-up).
- Admin dashboard (sign-in, orders, clients, products, prices, details, unsynced local orders).
- Security for checkout and data storage.

**Out of scope (this version)**
- Online payment (payment is taken after the team confirms the order).
- Customer accounts and order tracking.
- Shipping rates (discussed with the customer after confirmation).
- SMS or one-time-password verification.

## 3. Users

| User | Description | Main needs |
|---|---|---|
| Customer | Shopper in Pakistan, usually on a phone | Find pieces, see prices and sizes, place an order easily |
| Owner / admin | Patch & Posy owner and team | Confirm orders, update status, prices, details; contact customers |
| Visitor (bot or spammer) | Automated or malicious user | Must not be able to spam, inject content, or misuse the database |

## 4. Business rules

1. Only products tagged **AVAILABLE** can be bought. Any other tag (for example SOLD) is shown as a badge with no buy button.
2. Prices are in Pakistani rupees (PKR).
3. Payment is taken only after the team confirms the order by call or WhatsApp.
4. Delivery charges are discussed with the customer after confirmation.
5. Each tablecloth design is one of a kind; bread cloths can be bought up to 4 of each design; all other items are bought one at a time.
6. Customer phone numbers must be valid Pakistani mobile numbers (03xx followed by 7 digits, or +92 / 0092 prefixes).
7. Customer email addresses must be in a valid format.
8. Customers receive a confirmation email after an order is placed.
9. The owner receives an order notification email.

## 5. Modules

| ID | Module | Description |
|---|---|---|
| M1 | Header and navigation | Logo, menu links for Volume 2 (new) and Volume 1 (sold out), bag button, hamburger menu on phones and narrow screens |
| M2 | Notice bar | One-of-a-kind message above the banner |
| M3 | Hero slideshow | Rotating highlights of the new collection |
| M4 | Explore our collection | Tiles for Tablecloths, Bread cloths, Kids Dasterkhwan, Tea cozies, Pot holders, Patchwork Spreads |
| M5 | Tablecloths (Volume 2) | Style list, design list, design details with photos, dimensions, price, Add to bag |
| M6 | Bread cloths | Colour list, photos, Add to bag (quantity up to 4) |
| M7 | Tea cozies | Design list, photos, Add to bag |
| M8 | Pot holders | Design list, photos, Add to bag |
| M9 | Kids Dasterkhwan | Design list, photos, Add to bag |
| M10 | Patchwork Spreads (Volume 1, sold out) | Gallery of sold spreads and event photos |
| M11 | Our story and About us | Owner's story (justified text, photo) and business details |
| M12 | Bag (basket) | Drawer listing items, quantities, subtotal, Checkout button |
| M13 | Checkout | Customer details form with validation and spam trap; saves order; sends emails |
| M14 | Order confirmation | Shows the order number and next steps |
| M15 | Journal sign-up | Newsletter form |
| M16 | Footer | About links, contact, copyright, version number |
| M17 | Dashboard sign-in | Admin login with Firebase Authentication |
| M18 | Dashboard: Orders | List, filter and update order status; view details |
| M19 | Dashboard: Clients | Customer list built from orders |
| M20 | Dashboard: Products | Set each product to AVAILABLE or SOLD |
| M21 | Dashboard: Prices | Set prices per product |
| M22 | Dashboard: Details | Edit description, dimensions and care text shown on the website |
| M23 | Dashboard: Unsynced local orders | Orders stored in the browser that have not reached the database |
| M24 | Security | Database rules, input checks, spam trap, optional bot protection (see document 03) |

## 6. Non-functional requirements

- **Devices:** works on phones (Android and iPhone), tablets and desktop browsers.
- **Languages:** English.
- **Performance:** pages should load quickly on mobile data; images are compressed.
- **Availability:** hosted on Vercel; database and sign-in on Firebase.
- **Security:** client data is stored only in Firebase; only the admin can read orders; the database rules check every new order.
- **Privacy:** customer data is used only to process and confirm orders.
- **Maintainability:** the site is plain HTML, CSS and JavaScript, with no build step. Products are edited in one file (`js/products-data.js`).

## 7. External services

| Service | Use | Owner action |
|---|---|---|
| Firebase (Firestore, Authentication) | Orders, product status, prices, details, admin sign-in | Maintain rules and admin account |
| EmailJS | Confirmation and notification emails | Maintain templates, allowed domains and monthly limit |
| Google reCAPTCHA / Fraud Defense | Optional bot protection (not active) | None unless billing is added later |
| Vercel | Website hosting | Deploy after each approved change |
| GitHub | Source history | Push approved changes |

## 8. Acceptance criteria (summary)

- A customer can browse all Volume 2 products, add available items to the bag and place an order.
- An order with an invalid phone number or email is rejected, both on the form and in the database.
- Only the admin can open orders and change products and prices.
- The dashboard shows the logo, sign-out on the right, and loads the Details tab data.
- Every dialog has its close button at the top right.

The detailed checks for each acceptance criterion are in document 02 (Test Cases).

## 9. Approval

| Role | Name | Date | Signature |
|---|---|---|---|
| Owner | | | |
| Developer | | | |
