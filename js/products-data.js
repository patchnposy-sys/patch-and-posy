/**
 * PATCH & POSY — Product catalog
 *
 * This is the single source of truth for everything shown in the shop
 * sections of the homepage: Patchwork Spreads, Tablecloths, and
 * Accessories.
 *
 * To add a product: copy a block below and paste it into the right array.
 * To remove a product: delete its block.
 * To reorder: move the blocks up or down — order here is the order shown.
 *
 * Fields (all products):
 *   id       - unique short code, used by the cart — MUST be unique across
 *              every product in every array (required)
 *   name     - product title (required)
 *   desc     - one-line description (required)
 *   price    - a plain NUMBER in PKR, e.g. 8500 (required — no "Rs." text,
 *              that is added automatically wherever the price is shown)
 *   tag      - small badge text. Use exactly "AVAILABLE" to turn on the
 *              "Add to Bag" button. Anything else (e.g. "SOLD", "MADE TO
 *              ORDER", "COMING SOON") is shown as a badge but the item
 *              cannot be added to the bag.
 *   image    - path to a product photo, e.g. "images/20260809_101840.jpg"
 *              (optional — if left out, a placeholder colour swatch is
 *              shown instead, using the `swatch` colours below)
 *   swatch   - two or three hex colours used for the placeholder gradient
 *              when no photo is available yet (optional)
 *
 * Only items tagged "AVAILABLE" can be added to the bag — everything else
 * shows the badge but stays view-only, so you can showcase sold pieces or
 * "coming soon" items safely.
 */

/* ============================================================
   PATCHWORK SPREADS — Volume 1
   ============================================================ */
const SPREADS = [
  {
    id: "S-0001",
    name: "S-0001 Sunset Gingham",
    desc: "A cheerful blend of warm terracotta, soft yellow, and muted green checks. The classic gingham rhythm gives this patchwork a cosy, timeless charm—like the warmth of a sunset settling into a garden",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_101840.jpg",
    swatch: ["#E0A83E", "#8FBF6E", "#1C8577"]
  },
  {
    id: "S-0002",
    name: "S-0002 Gulrang",
    desc: "A vibrant blend of traditional Ajrak-inspired prints and bold fuchsia, arranged in a timeless checkerboard pattern. The earthy heritage motifs meet bright pops of colour, creating a spread that feels rooted in tradition yet fresh and contemporary.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_101952.jpg",
    swatch: ["#F3ECDD", "#E8879C", "#C0396B"]
  },
  {
    id: "S-0003",
    name: "S-0003 Lilac Bloom",
    desc: "A soft blend of lilac and white tones arranged in a classic Half-Square Triangle (HST) geometric pattern, creating interlocking diamond and pinwheel-like optical effects. Hand-quilted, reversible.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_101619.jpg",
    swatch: ["#3E6B8A", "#E0A83E", "#C0396B"]
  },
  {
    id: "S-0004",
    name: "S-0004 Hariyali",
    desc: "A soothing blend of earthy sage-green and vintage floral prints, arranged in a timeless checkerboard pattern. Soft pink roses and delicate blue foliage bring a gentle cottage-garden charm, creating a spread that feels fresh, tranquil and naturally inviting.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_100209.jpg",
    swatch: ["#8A6B4D", "#1C8577", "#E0794F"]
  },
  {
    id: "S-0005",
    name: "S-0005 Winter Berry",
    desc: "A classic sashing design that pairs vibrant cherry-red checkered blocks with delicate botanical prints on crisp white strips. The structured grid creates a polished, timeless look with the warmth and charm of traditional patchwork.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_101318.jpg",
    swatch: ["#E8879C", "#F3ECDD", "#8FBF6E"]
  },
  {
    id: "S-0006",
    name: "S-0006 Bluebell",
    desc: "A serene checkerboard of soft periwinkle blue and crisp white floral blocks. The delicate blue blossoms and cool tones create an airy, refreshing feel, bringing the calmness of a clear coastal morning into the home.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_101122.jpg",
    swatch: ["#C0396B", "#3E6B8A", "#E0A83E"]
  },
  {
    id: "S-0007",
    name: "S-0007 Marigold",
    desc: "Inspired by the warm glow of morning light, Marigold brings together soft yellow, crisp white and delicate vintage floral prints in an intricate geometric arrangement. Interlocking triangles create radiant star-like patterns, giving the spread a bright, cheerful and sun-kissed charm.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_101453.jpg",
    swatch: ["#1C8577", "#F3ECDD", "#E0794F"]
  },
  {
    id: "S-0008",
    name: "S-0008 Cotton Candy",
    desc: "A playful mix of soft pink, cheerful marigold yellow and pale sky blue, arranged in a vibrant checkerboard rhythm. Sweet, nostalgic and full of colour, this cheerful patchwork brings a little candy-like joy to any room.",
    price: 8000,
    tag: "AVAILABLE",
    image: "images/20260809_100948.jpg",
    swatch: ["#E0A83E", "#C0396B", "#3E6B8A"]
  },
  {
    id: "S-0009",
    name: "S-0009 Starlit",
    desc: "A charming monochromatic design inspired by a starlit night sky. Bold black stars scattered across a crisp white background create a playful yet modern look, making Starlit a lovely choice for a children's room or a cosy little corner at home.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_100819.jpg",
    swatch: ["#E0A83E", "#C0396B", "#3E6B8A"]
  },
  {
    id: "S-0010",
    name: "S-0010 Cherry Blossom Mist",
    desc: "This lovely patchwork spread features a soft diagonal stripe layout that creates a continuous, flowing optical effect like cherry blossoms. The combination feels calm, graceful and subtly romantic, with a timeless charm.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_100344.jpg",
    swatch: ["#E0A83E", "#C0396B", "#3E6B8A"]
  },
  {
    id: "S-0011",
    name: "S-0011 Tango",
    desc: "A lively play of vibrant kiwi green and earthy botanical brown, arranged in a dynamic chevron rhythm. Tango brings together fresh colour and grounded warmth in a bold, energetic pattern full of movement.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_100601.jpg",
    swatch: ["#E0A83E", "#C0396B", "#3E6B8A"]
  },
  {
    id: "S-0012",
    name: "S-0012 Daisy",
    desc: "Featuring a structured diamond sashing in a soft wheatish blend, this spread glows in luminous white accented by charming daisies. Its delicate floral motifs and luminous, airy tones bring the quiet, natural beauty of a sunlit meadow into the home.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_095709.jpg",
    swatch: ["#E0A83E", "#C0396B", "#3E6B8A"]
  },
  {
    id: "S-0013",
    name: "S-0013 Kashikari",
    desc: "Inspired by the timeless beauty of traditional Islamic tile art, Kashikari brings together deep royal blue, crisp white and intricate botanical prints in a symmetrical geometric arrangement. The repeating star-like forms and mosaic-inspired pattern create a sense of heritage, elegance and quiet grandeur.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_095318.jpg",
    swatch: ["#E0A83E", "#C0396B", "#3E6B8A"]
  },
  {
    id: "S-0014",
    name: "S-0014 Rangoli",
    desc: "Inspired by the vibrant beauty of traditional Rangoli, this joyful patchwork brings together radiant geometric shapes in deep fuchsia, rose pink, mint, lavender, peach and warm ochre. The repeating star-like patterns create a lively burst of colour and festive charm.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_100038.jpg",
    swatch: ["#E0A83E", "#C0396B", "#3E6B8A"]
  },
  {
    id: "S-0015",
    name: "S-0015 Shinrin",
    desc: "Inspired by the tranquil feeling of a deep green forest, Shinrin brings together rich teal-green tones with tropical botanical prints in earthy terracotta, soft peach and leafy greens. The repeating equilateral triangles create a sense of stars and diamonds dancing in a natural rhythm, like sunlight filtering through a quiet forest canopy.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_102150.jpg",
    swatch: ["#E0A83E", "#C0396B", "#3E6B8A"]
  }
];

/* ============================================================
   TABLECLOTHS — new collection (Volume 2)
   Folder: images/V2-Tablecloths/ (file names must match exactly,
   including capitals and the extension). Thumbnail is the banner and
   the card in the popup. TC01a/b/c are the three photos shown when
   the customer opens the product.
   ============================================================ */
const TABLECLOTH_FOLDER = "images/V2-Tablecloths/";
const TABLECLOTH_THUMBNAIL = TABLECLOTH_FOLDER + "Thumbnail.JPG";

/* Tablecloth 01 is the real product: card photo = TC01c, detail = all three photos.
   02–04 are placeholders for upcoming designs (no photos, "COMING SOON").
   Price and description are placeholders — set your own. */
const TABLECLOTHS = [
  {
    id: "T-001",
    name: "Tablecloth 01",
    desc: "A hand-pieced tablecloth from our new collection, stitched patch by patch and finished for everyday meals and festive dinners alike.",
    price: 12500,
    tag: "AVAILABLE",
    card: "TC01c.JPG",
    photos: ["TC01a.JPG", "TC01b.JPG", "TC01c.JPG"]
  },
  { id: "T-002", name: "Tablecloth 02", desc: "A new design from our Volume 2 collection — coming soon.", price: 0, tag: "COMING SOON", card: "", photos: [] },
  { id: "T-003", name: "Tablecloth 03", desc: "A new design from our Volume 2 collection — coming soon.", price: 0, tag: "COMING SOON", card: "", photos: [] },
  { id: "T-004", name: "Tablecloth 04", desc: "A new design from our Volume 2 collection — coming soon.", price: 0, tag: "COMING SOON", card: "", photos: [] }
];

TABLECLOTHS.forEach((t) => {
  const images = t.photos.map(file => TABLECLOTH_FOLDER + encodeURI(file));
  t.image = t.card ? TABLECLOTH_FOLDER + encodeURI(t.card) : "";
  t.gallery = images;
});

/* ============================================================
   ACCESSORIES
   Sample placeholders — swap in real photos & details any time.
   category — groups items under filter chips on the site.
   Currently shown: "Tea Cozies", "Pot Holders", "Bread Cloths".
   Other categories are commented out in the array below.
   ============================================================ */
const ACCESSORIES = [
  /* --- Hidden for now (kept here so they can be switched back on) ---
  {
    id: "A-001",
    name: "A-001 Patchwork Coaster Set (4)",
    category: "Coasters",
    desc: "A set of four hand-pieced coasters in mixed scrap fabrics — quilted, quick-drying, and generously sized for mugs and teapots alike.",
    price: 2200,
    tag: "COMING SOON",
    image: "",
    swatch: ["#E0A83E", "#1C8577", "#C0396B"]
  },
  {
    id: "A-002",
    name: "A-002 Little Pouch",
    category: "Pouches",
    desc: "A zippered patchwork pouch, lined in soft cotton — handy for makeup, stationery, or keeping small treasures together.",
    price: 1800,
    tag: "COMING SOON",
    image: "",
    swatch: ["#3E6B8A", "#E0A83E", "#F3ECDD"]
  },
  {
    id: "A-003",
    name: "A-003 Hoop Art — Floral",
    category: "Hoop Art",
    desc: "A hand-embroidered floral hoop, finished and ready to hang - a small, framed piece of the same patience that goes into every spread.",
    price: 3200,
    tag: "COMING SOON",
    image: "",
    swatch: ["#C0396B", "#8FBF6E", "#F3ECDD"]
  },
  --- */

  /* --- Tea cozy placeholder (replaced by TEA_COZIES below) ---
  {
    id: "A-005",
    name: "A-005 Cosy Tea Cozy",
    category: "Tea Cozies",
    desc: "A quilted cozy tea cozy for every tea break - keeps your tea warm, in pretty floral and printed fabrics.",
    price: 500,
    tag: "COMING SOON",
    image: "",
    swatch: ["#1C8577", "#E0794F", "#F3ECDD"]
  },
  --- */

  /* --- Hidden for now ---
  {
    id: "A-006",
    name: "A-006 Patchwork Pot Holder",
    category: "Pot Holders",
    desc: "A double-layered, heat-resistant pot holder pieced from mixed scraps — as sturdy as it is pretty.",
    price: 1200,
    tag: "COMING SOON",
    image: "",
    swatch: ["#C0396B", "#E0A83E", "#8A6B4D"]
  },
  {
    id: "A-007",
    name: "A-007 Kitchen Apron",
    category: "Aprons",
    desc: "A full-length patchwork apron with a deep front pocket — made for real cooking, not just for show.",
    price: 3500,
    tag: "COMING SOON",
    image: "",
    swatch: ["#8FBF6E", "#F3ECDD", "#3E6B8A"]
  },
  {
    id: "A-008",
    name: "A-008 Everyday Patchwork Bag",
    category: "Bags",
    desc: "A sturdy, roomy patchwork tote for market runs and everyday errands — lined, with reinforced handles.",
    price: 4200,
    tag: "COMING SOON",
    image: "",
    swatch: ["#E8879C", "#3E6B8A", "#F3ECDD"]
  }
  --- */
];

/* ============================================================
   BREAD CLOTHS — 4 colours, 2 photos each
   Folder: images/V2-BreadCloths/ (no spaces; file names must match
   exactly, including capitals — the server is case-sensitive).
   Mix.JPG is the thumbnail shown on the site, not a product.
   ============================================================ */
const BREAD_CLOTH_FOLDER = "images/V2-BreadCloths/";
const BREAD_CLOTH_THUMBNAIL = BREAD_CLOTH_FOLDER + "Mix.JPG";

/* One description shared by all bread cloths (they are all the same
   construction; only the print differs). Shown once, in the popup. */
const BREAD_CLOTH_DESCRIPTION = "A simple, good quality sewn cloth. Use it to keep rotis warm off the tawa, or line your bread basket on the dining table.";

const BREAD_CLOTHS = [
  { id: "A-009", colour: "Blue",  swatch: ["#1C3A5E", "#3E6B8A", "#F3ECDD"], photos: ["Blue1.JPG", "Blue2.JPG"] },
  { id: "A-010", colour: "Grey",  swatch: ["#8A8F99", "#D9DCE1", "#F3ECDD"], photos: ["Grey1.JPG", "Grey2.JPG"] },
  { id: "A-011", colour: "Red",   swatch: ["#C0396B", "#E8879C", "#F3ECDD"], photos: ["Red1.JPG", "Red2.JPG"] },
  { id: "A-012", colour: "White", swatch: ["#F3ECDD", "#FBF7EE", "#C0396B"], photos: ["White1.JPG", "White2.JPG"] }
];

BREAD_CLOTHS.forEach((b) => {
  const images = b.photos.map(file => BREAD_CLOTH_FOLDER + encodeURI(file));
  ACCESSORIES.push({
    id: b.id,
    name: "Bread Cloth — " + b.colour,
    category: "Bread Cloths",
    desc: "A simple, good quality sewn cloth. Use it to keep rotis warm off the tawa, or line your bread basket on the dining table.",
    price: 250,
    tag: "AVAILABLE",
    image: images[0],
    gallery: images,
    swatch: b.swatch
  });
});

/* ============================================================
   TEA COZIES — 2 designs, 2 photos each
   Folder: images/V2-TeaCozies/ (no spaces; file names must match
   exactly, including capitals and the extension). Thumbnail.JPG is
   the card shown on the site, not a product.
   ============================================================ */
const TEA_COZY_FOLDER = "images/V2-TeaCozies/";
const TEA_COZY_THUMBNAIL = TEA_COZY_FOLDER + "Thumbnail.JPG";

/* One description shared by all tea cozies. Shown once, in the popup. */
const TEA_COZY_DESCRIPTION = "A quilted cozy for every tea break — keeps your tea warm, in pretty floral and printed fabrics.";

/* Price is a placeholder (same as the old A-005 tea cozy) — set yours. */
const TEA_COZIES = [
  { id: "A-005", design: "Design 1", photos: ["TC1a.JPG", "TC1b.JPG"] },
  { id: "A-024", design: "Design 2", photos: ["TC2a.JPG", "TC2b.JPG"] }
];

TEA_COZIES.forEach((t) => {
  const images = t.photos.map(file => TEA_COZY_FOLDER + encodeURI(file));
  ACCESSORIES.push({
    id: t.id,
    name: "Tea Cozy — " + t.design,
    category: "Tea Cozies",
    desc: TEA_COZY_DESCRIPTION,
    price: 500,
    tag: "AVAILABLE",
    image: images[0],
    gallery: images
  });
});

/* ============================================================
   POT HOLDERS (pinch pot holders) — 11 designs, one photo each
   Folder: images/V2-PotHolders/ (no spaces; file names must match
   exactly, including capitals and the extension — the server is
   case-sensitive). Thumbnail.JPG is the card shown on the site,
   not a product.
   ============================================================ */
const POT_HOLDER_FOLDER = "images/V2-PotHolders/";
const POT_HOLDER_THUMBNAIL = POT_HOLDER_FOLDER + "Thumbnail.JPG";

/* One description shared by all pot holders (same construction;
   only the fabric differs). Shown once, in the popup. */
const POT_HOLDER_DESCRIPTION = "A double-layered, heat-resistant pinch pot holder pieced from mixed scraps — as sturdy as it is pretty.";

/* Edit the design names if you want to label them differently.
   Price is a placeholder (same as the old A-006 pot holder) — set yours. */
const POT_HOLDERS = [
  { id: "A-013", design: "Design 1",  photos: ["IMG_1391.JPG"] },
  { id: "A-014", design: "Design 2",  photos: ["IMG_1392.JPG"] },
  { id: "A-015", design: "Design 3",  photos: ["IMG_1393.JPG"] },
  { id: "A-016", design: "Design 4",  photos: ["IMG_1394.JPG"] },
  { id: "A-017", design: "Design 5",  photos: ["IMG_1395.JPG"] },
  { id: "A-018", design: "Design 6",  photos: ["IMG_1396.JPG"] },
  { id: "A-019", design: "Design 7",  photos: ["IMG_1397.JPG"] },
  { id: "A-020", design: "Design 8",  photos: ["IMG_1398.JPG"] },
  { id: "A-021", design: "Design 9",  photos: ["IMG_1399.JPG"] },
  { id: "A-022", design: "Design 10", photos: ["IMG_1400.JPG"] },
  { id: "A-023", design: "Design 11", photos: ["IMG_1401.JPG"] }
];

POT_HOLDERS.forEach((h) => {
  const images = h.photos.map(file => POT_HOLDER_FOLDER + encodeURI(file));
  ACCESSORIES.push({
    id: h.id,
    name: "Pot Holder — " + h.design,
    category: "Pot Holders",
    desc: POT_HOLDER_DESCRIPTION,
    price: 1200,
    tag: "AVAILABLE",
    image: images[0],
    gallery: images
  });
});

/* ============================================================
   VOLUME 1 EVENT GALLERY — HabittCity Popup, August 2026
   Add your event photos here. Save the actual photo files into
   images/event/ and reference them below. caption is optional.
   ============================================================ */
const EVENT_GALLERY = [
  {
    image: "images/event/habittcity-01.jpg",
    caption: "Our stall at HabittCity Popup"
  },
  {
    image: "images/event/habittcity-02.jpg",
    caption: "Patchwork Spreads on display"
  },
  {
    image: "images/event/habittcity-03.jpg",
    caption: "Meeting customers on launch day"
  }
];



/* Kept for backward compatibility with any code that still expects a
   single flat product list (spreads only). New code should use SPREADS,
   TABLECLOTHS and ACCESSORIES directly. */
/* ============================================================
   KIDS DASTERKHWAN — new collection (Volume 2)
   Folder: images/V2-KidsDasterkhwan/ (file names must match exactly,
   including capitals and the extension). Each design has three photos
   (A, B, C) shown inside the popup. Each design's tile uses its B photo
   (D1B, D2B, D3B). The large card picture is Thumbnail.JPG in the same folder.
   Name, price and description are placeholders — set your own.
   ============================================================ */
const KIDS_DASTERKHWAN_FOLDER = "images/V2-KidsDasterkhwan/";
const KIDS_DASTERKHWAN_THUMBNAIL = KIDS_DASTERKHWAN_FOLDER + "Thumbnail.JPG";
const KIDS_DASTERKHWANS = [
  { id: "KD-001", name: "Kids Dasterkhwan — Design 1", desc: "A hand-pieced dasterkhwan for little ones, stitched patch by patch for everyday meals and snack time.", price: 4500, tag: "AVAILABLE", thumbnail: "D1B.JPG", photos: ["D1A.JPG", "D1B.JPG", "D1C.JPG"] },
  { id: "KD-002", name: "Kids Dasterkhwan — Design 2", desc: "A hand-pieced dasterkhwan for little ones, stitched patch by patch for everyday meals and snack time.", price: 4500, tag: "AVAILABLE", thumbnail: "D2B.JPG", photos: ["D2A.JPG", "D2B.JPG", "D2C.JPG"] },
  { id: "KD-003", name: "Kids Dasterkhwan — Design 3", desc: "A hand-pieced dasterkhwan for little ones, stitched patch by patch for everyday meals and snack time.", price: 4500, tag: "AVAILABLE", thumbnail: "D3B.JPG", photos: ["D3A.JPG", "D3B.JPG", "D3C.JPG"] }
];

KIDS_DASTERKHWANS.forEach((k) => {
  k.image = KIDS_DASTERKHWAN_FOLDER + encodeURI(k.thumbnail);
  k.gallery = k.photos.map(file => KIDS_DASTERKHWAN_FOLDER + encodeURI(file));
  ACCESSORIES.push({
    id: k.id,
    name: k.name,
    category: "Kids Dasterkhwan",
    desc: k.desc,
    price: k.price,
    tag: k.tag,
    image: k.image,
    gallery: k.gallery
  });
});

/* Kept for backward compatibility with any code that still expects a
   single flat product list (spreads only). New code should use SPREADS,
   TABLECLOTHS and ACCESSORIES directly. */
const PRODUCTS = SPREADS;

/* Spread photos live in images/V1-BedSpreads/ (same file names).
   CHECK: this must match the folder name exactly, including capitals. */
const V1_SPREADS_FOLDER = "images/V1-BedSpreads/";
SPREADS.forEach(p => {
  p.image = V1_SPREADS_FOLDER + p.image.split("/").pop();
});