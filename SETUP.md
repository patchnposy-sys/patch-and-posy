# Patch & Posy — Cart, Checkout & Dashboard Setup

This site is still a plain static site (no server to maintain), but the
bag/checkout/dashboard now talk to two **free** cloud services:

- **Firebase** — stores every order securely, and powers the login on
  `dashboard.html` so only you can see orders and client details.
- **EmailJS** — sends the order-confirmation email to the customer and the
  new-order alert to `patchnposy@gmail.com`, straight from the browser.

Both have generous free tiers and need no coding beyond pasting a few keys
into two files. Budget about 20–25 minutes the first time.

Until you finish this guide, the shop and cart still work — orders are
just saved in the visitor's browser (visible under the "Unsynced local
orders" tab of the dashboard) and emails aren't sent yet.

---

## Part 1 — Firebase (orders + dashboard login)

### 1. Create the project
1. Go to <https://console.firebase.google.com> and sign in with a Google
   account (patchnposy@gmail.com works well).
2. Click **Add project** → name it e.g. `patch-and-posy` → you can turn
   off Google Analytics (not needed) → **Create project**.

### 2. Turn on Firestore (the order database)
1. In the left sidebar: **Build → Firestore Database → Create database**.
2. Choose **Start in production mode** → pick a location close to
   Pakistan (e.g. `asia-south1` or the default suggested one) → **Enable**.

### 3. Turn on Authentication (your dashboard login)
1. Left sidebar: **Build → Authentication → Get started**.
2. Under **Sign-in method**, enable **Email/Password** → Save.
3. Go to the **Users** tab → **Add user** → enter your own email and a
   strong password. This is the only login that will work on
   `dashboard.html` — there's no public sign-up.

### 4. Get your web config keys
1. Click the gear icon (top left) → **Project settings**.
2. Scroll to **Your apps** → click the **</>** (web) icon → give it a
   nickname like `patch-and-posy-web` → **Register app** (skip the
   hosting step).
3. You'll see a `firebaseConfig` object. Copy the values into
   `js/firebase-config.js`, replacing every `"PASTE_..."` placeholder.

### 5. Lock down the security rules
This is the important step — it's what actually keeps orders and client
details private, regardless of anything in the website's code.

1. **Firestore Database → Rules** tab.
2. Replace the contents with:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /orders/{orderId} {
         allow create: if true;                 // anyone can place an order
         allow read, update, delete: if request.auth != null;  // only signed-in admin
       }
     }
   }
   ```

3. Click **Publish**.

That's it for Firebase — checkout will now save every order, and
`dashboard.html` will show them once you sign in.

---

## Part 2 — EmailJS (order confirmation + admin alert emails)

### 1. Create an account
Go to <https://www.emailjs.com>, sign up for the free plan (200
emails/month, enough for most small shops starting out).

### 2. Connect Gmail
1. **Email Services → Add New Service → Gmail**.
2. Connect the `patchnposy@gmail.com` account (you'll get a Google
   sign-in popup — approve access).
3. Copy the **Service ID** shown (looks like `service_abc1234`).

### 3. Create two templates
Go to **Email Templates → Create New Template**, and make two:

**Template A — "Customer confirmation"**
- To email: `{{to_email}}`
- Subject: `Your Patch & Posy order {{order_id}} is confirmed`
- Body, for example:
  ```
  Hi {{customer_name}},

  Thank you for your order! Here's a summary:

  Order: {{order_id}}
  {{items_list}}

  Subtotal: {{subtotal}}
  Delivery: {{delivery_charge}}
  Total: {{total}}

  Please complete payment via Bank/Account Transfer:
  {{bank_name}} — {{account_title}}
  Account No: {{account_number}}
  IBAN: {{iban}}

  We'll be in touch once payment is confirmed.

  Warmly,
  Patch & Posy
  ```
- Copy this template's **Template ID**.

**Template B — "New order alert"**
- To email: `{{to_email}}` (this will be patchnposy@gmail.com — set
  automatically by the site, you don't need to hardcode it)
- Subject: `New order {{order_id}} — {{total}}`
- Body, for example:
  ```
  New order received!

  Order: {{order_id}}
  Customer: {{customer_name}} ({{customer_email}}, {{customer_phone}})
  Address: {{customer_address}}, {{customer_city}}

  {{items_list}}

  Subtotal: {{subtotal}}
  Delivery: {{delivery_charge}}
  Total: {{total}}
  ```
- Copy this template's **Template ID**.

### 4. Get your public key
**Account → General → Public Key** — copy it.

### 5. Paste everything into the site
Open `js/emailjs-config.js` and replace the four `"PASTE_..."`
placeholders with the Service ID, the two Template IDs, and the Public
Key.

---

## Editing bank details & delivery charges

Open `js/store-config.js` — everything is in one place:
- `bankDetails` — bank name, account title, account number, IBAN
- `delivery.karachi` / `delivery.otherCities` — flat delivery fees
- `delivery.freeAbove` — order subtotal that qualifies for free delivery
- `adminEmail` — where new-order alerts are sent

No other file needs to change when these update.

---

## Using the dashboard

Visit `yoursite.com/dashboard.html` and sign in with the email/password
you created in Firebase Authentication step 3 above. From there you can:

- **Orders tab** — see every order, filter by status, open one for full
  customer/address/item details, and update its status (new → confirmed
  → shipped → completed) with a dropdown — saved instantly.
- **Clients tab** — an automatic list of every customer who's ordered,
  with their contact details, order count, and total spend.
- **Unsynced local orders tab** — a safety net: if an order was placed
  while Firebase was unreachable, it's saved in that visitor's browser
  and shows here so you can manually sync it once things are back up.

`dashboard.html` isn't linked from the public site's navigation or
footer on purpose. That's not the real security layer (the Firestore
Rules from Part 1 are), but it does mean casual visitors won't stumble
onto the login screen.

## A note on security
- The Firebase config values in `js/firebase-config.js` are safe to be
  public — they only identify which project to talk to, similar to a
  shop's address. They are **not** secret keys.
- What actually protects order and client data is the **Firestore
  Security Rules** in Part 1, Step 5 — they run on Google's servers and
  can't be bypassed from the browser, so only someone signed in with your
  admin email/password can ever read the orders or client list.
- Never share your dashboard password, and use a strong, unique one.
