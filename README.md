# Patch & Posy — Website

Handmade-goods storefront site for **www.patchandposy.com.pk**. Plain
HTML/CSS/JS — no build step, no framework. Open `index.html` in a browser
and it works; upload the folder to any web host and it works there too.

The site now includes a shopping bag, checkout with bank-transfer
payment and delivery charges, order-confirmation emails, and a private
dashboard for managing orders and clients. **Before those go live, do the
one-time setup in [`SETUP.md`](./SETUP.md)** (free Firebase + EmailJS
accounts, ~20 minutes). Everything else works immediately.

## Folder structure

```
patch-and-posy/
├── index.html              ← the storefront page
├── dashboard.html           ← private order/client management (see SETUP.md)
├── SETUP.md                 ← one-time setup for cart emails + dashboard login
├── css/
│   ├── style.css             ← storefront styling
│   └── dashboard.css         ← dashboard-only styling
├── js/
│   ├── products-data.js      ← SPREADS / TABLECLOTHS / ACCESSORIES catalogs
│   ├── store-config.js       ← bank details, delivery charges, admin email
│   ├── firebase-config.js    ← paste your Firebase project keys here
│   ├── emailjs-config.js     ← paste your EmailJS keys here
│   ├── cart.js               ← shopping bag logic
│   ├── checkout.js           ← checkout form, order saving, emails
│   ├── dashboard.js          ← dashboard login + order/client management
│   └── main.js                ← renders catalog grids, mobile menu, newsletter
├── images/
│   └── ...                   ← logo + product photos
└── README.md                 ← this file
```

## Making common changes

**Add / remove / reorder a product in any section**
Open `js/products-data.js`. There are three arrays — `SPREADS`,
`TABLECLOTHS`, and `ACCESSORIES` — each product is one `{ }` block. Copy,
edit, delete, or reorder blocks; the matching grid on the homepage
rebuilds itself automatically. Give every product a unique `id`.

**Mark an item as purchasable**
Set that product's `tag` field to exactly `"AVAILABLE"` — an "Add to
Bag" button appears automatically. Any other tag text (`"SOLD"`,
`"COMING SOON"`, etc.) shows as a badge but keeps the item view-only.

**Add a real product photo**
Put the image file in `images/`, then set that product's `image` field,
e.g. `image: "images/coaster-set.jpg"`. Until a photo is set, the card
shows a soft colour-gradient placeholder built from the `swatch` field.
Large photos are automatically shown at full card size — for best load
times, keep new photos under ~1600px on the longest side (most phone
cameras shoot much larger; resize before uploading).

**Tablecloths: Luxury vs Daily Wear**
Each item in `TABLECLOTHS` needs `subcategory: "luxury"` or
`subcategory: "daily"` — that's what sorts it into the right subsection.

**Change bank details or delivery charges**
Open `js/store-config.js` — bank name/account/IBAN, delivery fees by
city, and the free-delivery threshold are all in one place.

**Change site-wide colors, fonts, spacing**
Open `css/style.css` and edit the `:root { ... }` block near the top.

**Edit text in the hero, story, values, or footer sections**
These live directly in `index.html` as one-off editorial copy — find the
section (commented, in page order) and edit the text.

**Newsletter signup**
`js/main.js` validates the email format and shows a thank-you message,
but doesn't send anywhere yet. When you pick a mailing list provider
(Mailchimp, Klaviyo, Brevo, etc.), replace the `TODO` inside
`initNewsletterForm()` with that provider's submit call.

**Instagram / WhatsApp links**
Swap the placeholder `href="#"` links in the footer of `index.html`
("Get in touch") for your real profile/`wa.me` links.

## Cart, checkout & orders — one-time setup required

The bag and "Add to Bag" buttons work immediately. To make checkout save
orders permanently and send emails, follow **[`SETUP.md`](./SETUP.md)**
once — it walks through creating a free Firebase project (order storage
+ dashboard login) and a free EmailJS account (confirmation + alert
emails), then pasting a handful of keys into `js/firebase-config.js` and
`js/emailjs-config.js`.

## Managing orders & clients

Visit `dashboard.html` (e.g. `www.patchandposy.com.pk/dashboard.html`)
and sign in with the admin account created during setup. From there:
view and filter every order, open one for full customer/item details,
move it through statuses (new → confirmed → shipped → completed), and
see an automatically-built client list with contact info, order counts,
and total spend. Full details in `SETUP.md` → "Using the dashboard".

## Deploying to www.patchandposy.com.pk

Any static host works since there's no server-side code (Firebase and
EmailJS are called directly from the browser).

1. **Shared hosting / cPanel (typical for `.pk` domains):**
   Upload the entire contents of this folder (not the folder itself) into
   `public_html/` via FTP or the File Manager, so that `index.html` sits at
   the web root.

2. **Netlify / Vercel / GitHub Pages:**
   Drag-and-drop this folder (or connect the git repo) to deploy, then add
   `www.patchandposy.com.pk` as a custom domain in that host's dashboard.

Either way, no build or install step is required — it's ready to serve as-is.

## Browser support notes

The design uses modern CSS (`aspect-ratio`, `backdrop-filter`, CSS Grid) and
targets current versions of Chrome, Safari, Firefox, and Edge.
