# How to Use This Project: Guide for the Owner

This guide explains how to open, check, change and publish the Patch & Posy website, and where to find each document.

---

## 1. What is in the project folder

| Item | What it is |
|---|---|
| `index.html` | Storefront (home page) |
| `dashboard.html` | Admin dashboard (sign-in required) |
| `css/style.css` | Storefront styles |
| `css/dashboard.css` | Dashboard styles |
| `js/products-data.js` | Product catalogue: names, prices, tags, dimensions |
| `js/main.js` | Shows the catalogue, dialogs, live status and prices |
| `js/cart.js` | Bag and bag drawer |
| `js/checkout.js` | Checkout form, validation and order saving |
| `js/dashboard.js` | Dashboard screens |
| `js/firebase-config.js` | Firebase settings (keep private values on your laptop only) |
| `js/emailjs-config.js` | EmailJS settings (keep private values on your laptop only) |
| `js/app-check.js` | Optional bot protection (inactive) |
| `firestore.rules` | Database security rules (publish in Firebase) |
| `images/` | Product and story photos (keep the file names) |
| `VERSION` | Current version number |
| `CHANGELOG.md` | History of changes |
| `docs/` | These documents |
| `README.md`, `SETUP.md` | Setup steps for Firebase and EmailJS |

---

## 2. Open the site on your laptop

1. Open the project folder `patch-and-posy` in VS Code.
2. Install the **Live Server** extension if you don't have it.
3. Right-click `index.html` and choose **Open with Live Server**.
4. The site opens at `http://127.0.0.1:5500`.
5. For the dashboard, open `dashboard.html` the same way.

Do not double-click the HTML files. Live Server is needed so the scripts load correctly.

---

## 3. Change a product

1. Open `js/products-data.js`.
2. Find the product by its ID (for example `TC01`).
3. Change the name, price, description, dimensions or tag.
4. The tag must be exactly `AVAILABLE` for the item to be buyable. Use `SOLD` for sold items.
5. Save the file, refresh the browser and check the product.

Do not type prices or status text into the HTML files.

---

## 4. Use the dashboard

1. Open `dashboard.html`.
2. Sign in with the admin email and password from Firebase Authentication.
3. Use the tabs:
   - **Orders:** view orders, change status.
   - **Clients:** customers from orders.
   - **Products:** AVAILABLE or SOLD.
   - **Prices:** change prices and save.
   - **Details:** change descriptions, dimensions and care text, then press **Save changes** at the bottom.
   - **Unsynced local orders:** orders saved in the browser that have not reached the database yet.
4. Press **Log out** when you finish.

---

## 5. Publish the website

The site is hosted on Vercel and the code is on GitHub.

1. Test the change in Live Server.
2. Ask for approval for the changed files (project rule: one approval covers all Patch & Posy work).
3. Commit and push to GitHub with a short message describing the change.
4. Vercel deploys the new version automatically. Wait until the deployment shows **Ready**.
5. Open https://www.patchandposy.com.pk/ and check the change.
6. Update `VERSION` and add an entry to `CHANGELOG.md` for each release.

---

## 6. Update the database rules

The security rules live in Firebase, not in the website code. When `firestore.rules` changes:

1. Open Firebase Console → **Firestore Database → Rules**.
2. Replace the text with the contents of `firestore.rules`.
3. Click **Publish**.
4. Place one test order to confirm the rules still allow valid orders.

---

## 7. Check the site after each release

Use the release checklist in `docs/02-Test-Cases.md` (section 12). The most important checks are:
- Place a test order with a valid number and check that the emails arrive.
- Sign in to the dashboard and open each tab.
- Check the header on your phone.

After testing, remove the test order from the Orders tab.

---

## 8. Set up the services (first time only)

Follow `SETUP.md` for:
- Firebase project, Firestore, Authentication and admin account.
- EmailJS service, template and allowed domains.

The steps for security (rules, bot protection, EmailJS limits) are in the previous section of this chat and in `SETUP.md`.

---

## 9. Where to find each document

| Document | Purpose |
|---|---|
| `docs/01-Business-Specification.md` | Business requirements, modules, rules and acceptance criteria |
| `docs/02-Test-Cases.md` | Test cases with IDs, ready for manual or automated testing |
| `docs/03-Features-and-Security-Changes.md` | Every feature and security change in this version |
| `docs/04-How-To-Use-Guide.md` | This guide |
| `CHANGELOG.md` | Version history |

---

## 10. Common problems

| Problem | What to check |
|---|---|
| Site shows old content | Hard refresh (Ctrl+F5); check Vercel deployment finished |
| Dashboard says it can't load data | Check `firestore.rules` is published; check the browser console (F12) |
| Order emails not arriving | Check EmailJS monthly limit and allowed domains |
| Checkout rejects a valid number | Check the number starts with 03 and has 11 digits |
| Button or menu looks wrong on a phone | Clear the browser cache; check the latest version is deployed |

---

## 11. Getting help

Describe the problem, the device and browser, and the steps you took. For dashboard errors, include the console message (F12 → Console).
