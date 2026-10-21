# Patch & Posy Online Store: Test Cases

Document version: 2.1.0

## How to read this document

- **ID:** unique test ID. Use it in automation names, for example `TC-CHK-003`.
- **Priority:** P1 (must pass before release), P2 (should pass), P3 (nice to have).
- **Type:** Functional, Security, UI, Responsive, Regression.
- **Automation:** Yes means the case can be scripted (for example with Playwright). Manual means a person checks it.
- Each case lists its preconditions, steps, and the expected result.

Test environments:
- **Local:** Live Server at `http://127.0.0.1:5500`.
- **Live:** https://www.patchandposy.com.pk/

Devices to check: Android phone (about 390 px wide), iPhone (375 to 430 px wide), tablet (768 to 1024 px), laptop (1280 to 1600 px), desktop (1920 px).

---

## 1. Storefront: header and navigation

| ID | Priority | Type | Automation | Preconditions | Steps | Expected result |
|---|---|---|---|---|---|---|
| TC-NAV-001 | P1 | Responsive | Yes | Desktop, 1340 px | Open the home page | Menu links are shown inline; no hamburger button |
| TC-NAV-002 | P1 | Responsive | Yes | Desktop, 1600 px and above | Open the home page | Menu links inline; labels "Volume 2 · New" on the left and "Volume 1 · Sold out" on the right |
| TC-NAV-003 | P1 | Responsive | Yes | Phone, 390 px | Open the home page | Hamburger on the left; logo centred; bag button on the right |
| TC-NAV-004 | P1 | Responsive | Yes | Phone, 375 px | Tap the hamburger | Menu opens with readable dark links on a cream panel; Volume labels visible |
| TC-NAV-005 | P1 | Responsive | Yes | Phone, 360 px | Check for horizontal scroll | No horizontal scrolling; logo not cut |
| TC-NAV-006 | P2 | Functional | Yes | Any width | Click "Our Story" | Page scrolls to the story section |
| TC-NAV-007 | P2 | Functional | Yes | Any width | Click "Patchwork Spreads" | Spreads dialog opens |

## 2. Storefront: notice bar, banner and hero

| ID | Priority | Type | Automation | Preconditions | Steps | Expected result |
|---|---|---|---|---|---|---|
| TC-HOME-001 | P2 | UI | Yes | Any | Open the home page | Notice bar above the banner reads "Every tablecloth is one of a kind, and only one piece is available for each design. If you love it, make it yours before it's gone." |
| TC-HOME-002 | P2 | UI | Yes | Any | Wait on the hero | Slides change; first slide holds about 5 seconds, then about 7 seconds per slide |
| TC-HOME-003 | P2 | UI | Yes | Any | Look at the Explore our collection tiles | Six tiles; the Tablecloths tile shows the new tablecloth thumbnail; labels are readable |
| TC-HOME-004 | P2 | Functional | Yes | Any | Click each Explore tile | Matching dialog opens (tablecloths, bread cloths, kids, tea cozies, pot holders, spreads) |

## 3. Storefront: products and dialogs

| ID | Priority | Type | Automation | Preconditions | Steps | Expected result |
|---|---|---|---|---|---|---|
| TC-PRD-001 | P1 | Functional | Yes | Product TC01 is AVAILABLE | Open Tablecloths, then the TC01 design | Name shows as "TC01 · Violet Patchwork"; price and dimensions "70 x 100 inches" shown |
| TC-PRD-002 | P1 | Functional | Yes | A product is tagged SOLD | Open that product | Badge shows the tag; no Add to bag button |
| TC-PRD-003 | P1 | Functional | Yes | A product is AVAILABLE | Click Add to bag | Bag count increases by 1; drawer shows the item |
| TC-PRD-004 | P2 | Functional | Yes | Bread cloth design | Set quantity to 4, then try to add more | Quantity stops at 4 |
| TC-PRD-005 | P2 | UI | Yes | Any product photo | Click the photo | Lightbox opens (tc-zoom); close button works |
| TC-PRD-006 | P2 | UI | Yes | Kids Dasterkhwan dialog | Open the dialog | Text "Made for little foodies" shown; names Tomato Tales, Sunny Side Up, Little Cake Club |
| TC-PRD-007 | P2 | UI | Yes | Pot holder list | Open pot holders | Designs carry names, not file names |

## 4. Storefront: dialogs and close buttons

| ID | Priority | Type | Automation | Preconditions | Steps | Expected result |
|---|---|---|---|---|---|---|
| TC-DLG-001 | P1 | UI | Yes | Any dialog open | Check the close button | Round close button, 12 px from the top and right edges, in all of: checkout, order confirmation, kids, tablecloths, bread cloths, tea cozies, pot holders, spreads, spreads list |
| TC-DLG-002 | P1 | UI | Yes | Any dialog open | Click the close button | Dialog closes; page underneath is usable |
| TC-DLG-003 | P2 | Functional | Yes | Dialog open | Press Escape or click the overlay | Dialog closes |
| TC-DLG-004 | P1 | Regression | Yes | Bag drawer open | Check z-order | Bag drawer appears above all dialogs (z-index 130 and 131) |

## 5. Storefront: bag and checkout

| ID | Priority | Type | Automation | Preconditions | Steps | Expected result |
|---|---|---|---|---|---|---|
| TC-BAG-001 | P1 | Functional | Yes | Bag has one item | Open the bag, click Checkout | Bag drawer closes; checkout form opens |
| TC-BAG-002 | P1 | Functional | Yes | A product dialog (for example kids) is open with a bag item | Click Checkout | All other dialogs close first; only the checkout form is open |
| TC-BAG-003 | P2 | Functional | Yes | Bag has an item | Click the remove icon | Item removed; subtotal updates |
| TC-BAG-004 | P2 | Functional | Yes | Empty bag | Open the bag | "Your bag is empty" message shown; no Checkout button |
| TC-CHK-001 | P1 | Security | Yes | Checkout open | Enter phone 0212345678 (landline) and submit | Form is blocked; phone field shows the pattern message; no order saved |
| TC-CHK-002 | P1 | Security | Yes | Checkout open | Enter phone 0300-1234567 and submit | Accepted; saved as 03001234567 |
| TC-CHK-003 | P1 | Security | Yes | Checkout open | Enter +923001234567 | Accepted; saved as 03001234567 |
| TC-CHK-004 | P1 | Security | Yes | Checkout open | Enter 0092 300 1234567 | Accepted; saved as 03001234567 |
| TC-CHK-005 | P1 | Security | Yes | Checkout open | Enter email "bad@" | Rejected with "Please enter a valid email address" |
| TC-CHK-006 | P1 | Security | Yes | Checkout open | Enter name "<script>x</script>" | Angle brackets removed before saving |
| TC-CHK-007 | P1 | Security | Yes | Checkout open | Fill the hidden "Leave this empty" field (via script), then submit | Order refused with "Sorry, we could not place your order"; no order saved |
| TC-CHK-008 | P2 | Functional | Yes | Checkout open | Leave Name empty and submit | Form shows required-field message; no order saved |
| TC-CHK-009 | P2 | Functional | Yes | Name longer than 80 characters | Type into the field | Input stops at 80 characters |
| TC-CHK-010 | P1 | Functional | Yes | Valid form, bag has items | Submit (live site with Firebase configured) | Order number shown on confirmation; order document exists in Firestore; confirmation email received |
| TC-CHK-011 | P1 | Functional | Manual | Valid order | Check the email inbox | Customer confirmation email received at the entered address |
| TC-CHK-012 | P1 | Functional | Manual | Valid order | Check the owner's inbox | Owner notification email received |
| TC-CHK-013 | P2 | Functional | Yes | Confirmation dialog open | Click close | Dialog closes; bag is empty after a successful order |

## 6. Storefront: About and footer

| ID | Priority | Type | Automation | Preconditions | Steps | Expected result |
|---|---|---|---|---|---|---|
| TC-STY-001 | P2 | UI | Yes | Desktop | Read the story text | Paragraphs are fully justified (text aligned to both edges); no first-line indent |
| TC-STY-002 | P2 | UI | Yes | Desktop, 1340 px | View the story photo | Whole photo visible; not cut off at the edges |
| TC-STY-003 | P2 | UI | Yes | Phone | View the story section | Photo and text stack in one column |
| TC-ABT-001 | P2 | UI | Yes | Any | Open About Us | Text justified; no sections cut off |
| TC-FTR-001 | P2 | UI | Yes | Any | Scroll to footer | Shop section is removed; footer shows "Version 2.1.0" |
| TC-FTR-002 | P3 | UI | Yes | Any | Check the footer logo | Round logo visible |

## 7. Dashboard: sign-in and layout

| ID | Priority | Type | Automation | Preconditions | Steps | Expected result |
|---|---|---|---|---|---|---|
| TC-DSH-001 | P1 | Security | Yes | Not signed in | Open dashboard.html | Login form shown; no order data visible |
| TC-DSH-002 | P1 | Security | Yes | Not signed in | Try to read orders directly from the database | Access denied (database rules) |
| TC-DSH-003 | P1 | Functional | Yes | Admin account | Sign in with correct details | Dashboard opens; admin email shown in header |
| TC-DSH-004 | P1 | Functional | Yes | Admin account | Sign in with wrong password | Error message shown; no dashboard |
| TC-DSH-005 | P1 | UI | Yes | Signed in | Look at the header | Round logo on the left; Log out button on the right |
| TC-DSH-006 | P1 | Functional | Yes | Signed in | Click Log out | Login form returns |
| TC-DSH-007 | P2 | UI | Yes | Login page | Look at the login card | Round logo shown above "Dashboard login" |

## 8. Dashboard: data tabs

| ID | Priority | Type | Automation | Preconditions | Steps | Expected result |
|---|---|---|---|---|---|---|
| TC-DBD-001 | P1 | Functional | Yes | Signed in | Open Orders | Orders list loads; no error |
| TC-DBD-002 | P1 | Functional | Yes | Signed in | Change an order status and save | Status updated in the database |
| TC-DBD-003 | P1 | Functional | Yes | Signed in | Open Products | Each product shows its tag; AVAILABLE or SOLD can be changed |
| TC-DBD-004 | P1 | Functional | Yes | Signed in | Open Prices and change a price | Price saved; storefront shows the new price after reload |
| TC-DBD-005 | P1 | Functional | Yes | Signed in | Open Details | Table loads all products (no "Couldn't load details" message) |
| TC-DBD-006 | P1 | Functional | Yes | Details loaded | Edit a description and save | Saved; storefront shows the new text after reload |
| TC-DBD-007 | P2 | Functional | Yes | Signed in | Open Clients | Clients listed from orders |
| TC-DBD-008 | P2 | Functional | Yes | Signed in | Open Unsynced local orders | Local orders listed; sync action works |

## 9. Security: database rules and input

| ID | Priority | Type | Automation | Preconditions | Steps | Expected result |
|---|---|---|---|---|---|---|
| TC-SEC-001 | P1 | Security | Yes | Rules published | Write an order with an invalid phone directly to the database (no sign-in) | Write refused |
| TC-SEC-002 | P1 | Security | Yes | Rules published | Write an order with an extra field (for example "isAdmin": true) | Write refused |
| TC-SEC-003 | P1 | Security | Yes | Rules published | Write an order with status "paid" | Write refused (status must be "new") |
| TC-SEC-004 | P1 | Security | Yes | Rules published | Read the orders collection without signing in | Access denied |
| TC-SEC-005 | P1 | Security | Yes | Rules published | Change a product status without signing in | Write refused |
| TC-SEC-006 | P1 | Security | Yes | Rules published | Read productStatus, productPrices, productDetails without signing in | Read allowed |
| TC-SEC-007 | P1 | Security | Yes | Rules published | Write an order with a 3000-character name | Write refused |
| TC-SEC-008 | P2 | Security | Yes | Rules published | Write a valid order directly to the database | Write accepted |
| TC-SEC-009 | P2 | Security | Manual | Any | Try to inject HTML into a checkout note and view it in the dashboard | Shown as plain text; no script runs |

## 10. Bot protection (only when App Check is active)

| ID | Priority | Type | Automation | Preconditions | Steps | Expected result |
|---|---|---|---|---|---|---|
| TC-BOT-001 | P3 | Security | Manual | App Check not active (current state) | Load the site | No errors; site works as normal |
| TC-BOT-002 | P2 | Security | Manual | App Check enforced (future) | Place an order from the site | Accepted |
| TC-BOT-003 | P2 | Security | Yes | App Check enforced (future) | Send a request with no App Check token | Request refused |

## 11. Responsive and browser checks

| ID | Priority | Type | Automation | Preconditions | Steps | Expected result |
|---|---|---|---|---|---|---|
| TC-RSP-001 | P1 | Responsive | Yes | iPhone Safari (375 px) | Full checkout path | Works; no layout breaks |
| TC-RSP-002 | P1 | Responsive | Yes | Android Chrome (390 px) | Full checkout path | Works; no layout breaks |
| TC-RSP-003 | P2 | Responsive | Yes | Tablet (768 px) | Browse and open a product | Layout correct; dialogs usable |
| TC-RSP-004 | P2 | Compatibility | Manual | Chrome, Edge, Firefox, Safari (latest) | Load the home page | No console errors |

## 12. Release checklist

Run these before each release:
1. All P1 cases pass.
2. No console errors on the home page or dashboard.
3. Footer version matches `VERSION`.
4. `CHANGELOG.md` has a new entry.
5. Firestore rules match `firestore.rules`.
6. Test order placed on the live site and removed from the database after testing.
