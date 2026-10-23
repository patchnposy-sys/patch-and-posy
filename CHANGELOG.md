# Patch & Posy Website: Change Log

Version numbers follow MAJOR.MINOR.PATCH.
- MAJOR: a new collection or a change that affects how customers order.
- MINOR: new features, security changes or new pages.
- PATCH: fixes and wording or design corrections.

The current version is in the `VERSION` file and in the storefront footer.

## 2.2.0: Stock, checkout dialogs and popup fixes (2026-10-23)

### Added
- Stock count for bread cloths and tea cozies, set per design in the dashboard Prices tab. Stock goes down automatically when an order is placed, and a design at 0 shows Sold out.
- Quantity controls for bread cloths (up to 4 per order) and tea cozies (up to 3 per order), limited by the stock left.
- "Placing your order" dialog while an order is saved.
- Version number shown in the dashboard.

### Changed
- Bread cloth and tea cozy popups use the same layout for every design. Quantity and Add to bag stay in the same place, and a sold-out design shows SOLD.
- Bread cloth and tea cozy tiles show SOLD when no stock is left.
- Checkout and order confirmation dialogs: close button in the top-right corner.
- Order emails: no bank transfer details; the customer and the admin get different wording. Photo links use the live website.
- Removed extra hint text from the product popups.

### Fixed
- SOLD badge being overwritten by AVAILABLE on bread cloth and tea cozy popups.
- Photos in bread cloth and tea cozy popups scrolling sideways.

## 2.1.0: Security, checkout and dashboard (2026-10-21)

### Added
- Pakistani mobile number check at checkout (03xx followed by 7 digits; +92 and 0092 accepted; saved as 03xxxxxxxxx).
- Stricter email check at checkout (format and 120-character limit).
- Length limits on checkout fields (name 80, address 200, city 60, notes 500).
- Hidden spam trap field at checkout.
- Firestore security rules file (`firestore.rules`), to be published in Firebase.
- Bot protection module (`js/app-check.js`), inactive until an App Check key is added.
- Project documents: business specification, test cases, features and security changes, how-to-use guide.
- Version number shown in the storefront footer.

### Changed
- Checkout clicks now close any open product or category dialog before the checkout form opens.
- Close button is in the same place (top right, round) in every dialog.
- Tablecloths tile in "Explore our collection" uses the new tablecloth thumbnail.
- Dashboard shows the round logo instead of text, with Log out on the right.
- Justified text for the story and About Us sections; the story photo shows its full shape.
- Pink buttons and green Available tags use slightly richer shades.
- Mobile header: hamburger on the left, bag on the right; links stay inline at laptop widths (1101 px and up).

## 2.0.0: Volume 2 launch and site rebuild

### Added
- Volume 2 collection: tablecloths (with TC codes and names), bread cloths, tea cozies, pot holders, Kids Dasterkhwan.
- Hero slideshow and Explore our collection tiles.
- Patchwork Spreads dialog (Volume 1, sold out).
- Dashboard: orders, clients, products, prices, details, unsynced local orders.
- Search engine files: `sitemap.xml`, `robots.txt`, structured data for the business.
- Live product status, prices and details from Firebase.

### Changed
- Header and banner redesigned with the logo and menu labels for Volume 2 (new) and Volume 1 (sold out).

## 1.0.0: First site
- Initial storefront, basket and checkout with Firebase and EmailJS.
