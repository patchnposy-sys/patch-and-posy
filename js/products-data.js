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
    desc: "A cheerful blend of warm terracotta, soft yellow and muted green checks. The classic gingham pattern gives this patchwork a cosy, timeless charm, like a sunset settling over a garden.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_101840.jpg",
    swatch: ["#E0A83E", "#8FBF6E", "#1C8577"]
  },
  {
    id: "S-0002",
    name: "S-0002 Gulrang",
    desc: "A vibrant blend of traditional Ajrak-inspired prints and bold fuchsia, arranged in a checkerboard pattern. Earthy heritage motifs meet bright touches of colour, creating a spread that feels rooted in tradition yet fresh and contemporary.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_101952.jpg",
    swatch: ["#F3ECDD", "#E8879C", "#C0396B"]
  },
  {
    id: "S-0003",
    name: "S-0003 Lilac Bloom",
    desc: "A soft blend of lilac and white tones set in a classic Half-Square Triangle (HST) pattern, with interlocking diamond and pinwheel effects. Hand-quilted and reversible.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_101619.jpg",
    swatch: ["#3E6B8A", "#E0A83E", "#C0396B"]
  },
  {
    id: "S-0004",
    name: "S-0004 Hariyali",
    desc: "An earthy blend of sage green and vintage floral prints, arranged in a checkerboard pattern. Soft pink roses and delicate blue foliage bring a gentle cottage-garden charm, making the spread feel fresh, calm and welcoming.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_100209.jpg",
    swatch: ["#8A6B4D", "#1C8577", "#E0794F"]
  },
  {
    id: "S-0005",
    name: "S-0005 Winter Berry",
    desc: "A classic sashing design that pairs cherry-red checked blocks with delicate botanical prints on crisp white strips. The structured grid gives a polished, timeless look with the warmth of traditional patchwork.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_101318.jpg",
    swatch: ["#E8879C", "#F3ECDD", "#8FBF6E"]
  },
  {
    id: "S-0006",
    name: "S-0006 Bluebell",
    desc: "A calm checkerboard of soft periwinkle blue and crisp white floral blocks. The delicate blue blossoms and cool tones create an airy, refreshing feel, like a clear coastal morning brought indoors.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_101122.jpg",
    swatch: ["#C0396B", "#3E6B8A", "#E0A83E"]
  },
  {
    id: "S-0007",
    name: "S-0007 Marigold",
    desc: "Inspired by the warm glow of morning light, Marigold combines soft yellow, crisp white and delicate vintage floral prints in a geometric arrangement. Interlocking triangles form radiant, star-like patterns that give the spread a bright and cheerful charm.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_101453.jpg",
    swatch: ["#1C8577", "#F3ECDD", "#E0794F"]
  },
  {
    id: "S-0008",
    name: "S-0008 Cotton Candy",
    desc: "A playful mix of soft pink, cheerful marigold yellow and pale sky blue, set in a lively checkerboard. Sweet and full of colour, this patchwork brings a little joy to any room.",
    price: 8000,
    tag: "SOLD",
    image: "images/20260809_100948.jpg",
    swatch: ["#E0A83E", "#C0396B", "#3E6B8A"]
  },
  {
    id: "S-0009",
    name: "S-0009 Starlit",
    desc: "A charming monochrome design inspired by a starlit sky. Bold black stars scattered across a crisp white background give a playful yet modern look. Starlit is a lovely choice for a child's room or a cosy corner of the home.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_100819.jpg",
    swatch: ["#E0A83E", "#C0396B", "#3E6B8A"]
  },
  {
    id: "S-0010",
    name: "S-0010 Cherry Blossom Mist",
    desc: "This patchwork spread features a soft diagonal stripe layout that creates a continuous, flowing effect, like cherry blossoms in the wind. The combination feels calm, graceful and subtly romantic.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_100344.jpg",
    swatch: ["#E0A83E", "#C0396B", "#3E6B8A"]
  },
  {
    id: "S-0011",
    name: "S-0011 Tango",
    desc: "A lively combination of vibrant kiwi green and earthy botanical brown, set in a dynamic chevron pattern. Tango brings fresh colour and grounded warmth together in a bold design full of movement.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_100601.jpg",
    swatch: ["#E0A83E", "#C0396B", "#3E6B8A"]
  },
  {
    id: "S-0012",
    name: "S-0012 Daisy",
    desc: "A structured diamond sashing in a soft wheat tone frames luminous white blocks, accented with charming daisies. The delicate floral motifs and airy tones bring the quiet beauty of a sunlit meadow into the home.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_095709.jpg",
    swatch: ["#E0A83E", "#C0396B", "#3E6B8A"]
  },
  {
    id: "S-0013",
    name: "S-0013 Kashikari",
    desc: "Inspired by the timeless beauty of traditional Islamic tile art, Kashikari combines deep royal blue, crisp white and intricate botanical prints in a symmetrical geometric pattern. The repeating star-like forms suggest heritage, elegance and quiet grandeur.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_095318.jpg",
    swatch: ["#E0A83E", "#C0396B", "#3E6B8A"]
  },
  {
    id: "S-0014",
    name: "S-0014 Rangoli",
    desc: "Inspired by the vibrant tradition of Rangoli, this joyful patchwork combines geometric shapes in deep fuchsia, rose pink, mint, lavender, peach and warm ochre. The repeating star-like patterns create a lively burst of colour and festive charm.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_100038.jpg",
    swatch: ["#E0A83E", "#C0396B", "#3E6B8A"]
  },
  {
    id: "S-0015",
    name: "S-0015 Shinrin",
    desc: "Inspired by the calm of a deep green forest, Shinrin combines rich teal-green tones with tropical botanical prints in earthy terracotta, soft peach and leafy greens. The repeating equilateral triangles suggest stars and diamonds moving in a natural rhythm, like sunlight through a quiet forest canopy.",
    price: 8500,
    tag: "SOLD",
    image: "images/20260809_102150.jpg",
    swatch: ["#E0A83E", "#C0396B", "#3E6B8A"]
  }
];

/* ============================================================
   TABLECLOTHS — Volume 2 photos live in images/V2-Tablecloths/
   (style sub-folders; file names must match exactly, including
   capitals and the extension — the server is case-sensitive).
   ============================================================ */
const TABLECLOTH_FOLDER = "images/V2-Tablecloths/";
const TABLECLOTH_THUMBNAIL = TABLECLOTH_FOLDER + "Thumbnail.JPG";

/* ============================================================
   TABLECLOTH STYLES (Volume 2) — three style categories.
   Order here is the order shown: Patchwork, Lacework, Dailywares.
   folder    - sub-folder inside TABLECLOTH_FOLDER (spaces allowed)
   thumbnail - category card image inside TABLECLOTH_FOLDER
   price     - default price (PKR) for every design in the style
   codes     - design codes; each design has photos <code>a.jpg,
               <code>b.jpg, <code>c.jpg inside the style folder.
               The c photo is the design's card thumbnail.
   Each design's description is in TABLECLOTH_DESCRIPTIONS below.
   ============================================================ */
const TABLECLOTH_STYLES = [
  {
    id: "patchwork",
    name: "Patchwork",
    folder: "Patchwork Style",
    thumbnail: "Patchwork-thumbnail.jpg",
    price: 6000,
    description: "A runner pieced in patchwork, with a matching border. Elegant and traditional, with a modern feel. Double layered for a better fall and fit, in high quality cotton fabric.",
    codes: ["TC01", "TC02", "TC03"]
  },
  {
    id: "lacework",
    name: "Lacework",
    folder: "Lacework",
    thumbnail: "Lacework-thumbnail.jpg",
    price: 5000,
    description: "A runner with lace and a lace border, in English style. Each design is slightly different. Double layered for a better fall and fit, in high quality cotton fabric.",
    codes: ["TC04", "TC05", "TC06", "TC07", "TC08", "TC09", "TC10"]
  },
  {
    id: "dailywares",
    name: "Dailywares",
    folder: "Dailywares",
    thumbnail: "Dailywares-thumbnail.jpg",
    price: 4000,
    description: "Simple checked prints for a countryside feel and bright colour. Double layered for a better fall and fit, in high quality cotton fabric.",
    codes: ["TC11", "TC12", "TC13", "TC14"]
  }
];

/* Design descriptions, keyed by design code. Written for each photo. */
const TABLECLOTH_DESCRIPTIONS = {
  TC01: "A runner pieced in deep purple and light blue, with a matching border. Traditional, with a clean modern look. Double layered for a better fall and fit on the table.",
  TC02: "A runner of plum and olive triangles, with a matching border. A traditional pattern in a bold colour pairing. Double layered for a better fall and fit on the table.",
  TC03: "A runner of pink gingham and grey diamonds, with a matching border. Traditional patchwork with a fresh look. Double layered for a better fall and fit on the table.",
  TC04: "A runner with white lace stripes on mustard, a teal ribbon down the centre, and lace along the border. English style and simple. Double layered for a better fall and fit on the table.",
  TC05: "A runner in sage green with a small pink and brown flower print, edged with lace. Double layered for a better fall and fit on the table.",
  TC06: "A runner of cream panels with white lace and small embroidered flowers, framed with lace. Double layered for a better fall and fit on the table.",
  TC07: "A runner in navy and white check with small white daisies, edged with white lace. Classic English style. Double layered for a better fall and fit on the table.",
  TC08: "A runner printed with small holly sprigs and berries on white, edged with lace. A simple festive look. Double layered for a better fall and fit on the table.",
  TC09: "A runner with tiny purple and pink flowers on white, edged with lace. Soft and suited to everyday use. Double layered for a better fall and fit on the table.",
  TC10: "A runner with a black and white geometric print, edged with lace. Crisp and unfussy. Double layered for a better fall and fit on the table.",
  TC11: "Simple sage and white checks for a countryside feel. Double layered for a better fall and fit on the table.",
  TC12: "Bright mustard and white checks with a countryside feel. Double layered for a better fall and fit on the table.",
  TC13: "Soft taupe and white checks for a simple countryside look. Double layered for a better fall and fit on the table.",
  TC14: "Peach and white checks with a cheerful countryside feel. Double layered for a better fall and fit on the table."
};

/* Builds one entry per design code. Each design can still be changed
   by hand: set its own price, tag ("AVAILABLE" / "SOLD" / other),
   description, dimensions or care text in this array after it is built. */
const TABLECLOTH_DESIGNS = [];
TABLECLOTH_STYLES.forEach((style) => {
  style.codes.forEach((code) => {
    const photos = ["a", "b", "c"].map(s => TABLECLOTH_FOLDER + encodeURI(style.folder + "/" + code + s + ".jpg"));
    TABLECLOTH_DESIGNS.push({
      id: "DS-" + code,
      code: code,
      name: code,
      style: style.id,
      price: style.price,
      tag: code === "TC12" ? "SOLD" : "AVAILABLE",
      description: TABLECLOTH_DESCRIPTIONS[code] || "",
      dimensions: [
        { size: "Size", measure: "DUMMY 60 × 108 in" }
      ],
      careInstructions: "DUMMY: Hand wash in cold water with mild soap. Dry in shade and iron on low heat.",
      photos: photos,
      card: photos[2]
    });
  });
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
    desc: "A set of four hand-pieced coasters in high quality cotton fabrics — quilted, quick-drying, and generously sized for mugs and teapots alike.",
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
    desc: "A double-layered, heat-resistant pot holder in high quality cotton fabric — as sturdy as it is pretty.",
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
const BREAD_CLOTH_DESCRIPTION = "A simple, good quality cloth. Use it to keep rotis warm off the tawa, or to line your bread basket on the dining table.";

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
    name: "Bread Cloth: " + b.colour,
    category: "Bread Cloths",
    desc: "A simple, good quality cloth. Use it to keep rotis warm off the tawa, or to line your bread basket on the dining table.",
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
const TEA_COZY_DESCRIPTION = "A quilted tea cozy for every tea break. It keeps your tea warm and comes in pretty floral and printed fabrics.";

/* Price is a placeholder (same as the old A-005 tea cozy) — set yours. */
const TEA_COZIES = [
  { id: "A-005", design: "Design 1", photos: ["TC1a.JPG", "TC1b.JPG"] },
  { id: "A-024", design: "Design 2", photos: ["TC2a.JPG", "TC2b.JPG"] }
];

TEA_COZIES.forEach((t) => {
  const images = t.photos.map(file => TEA_COZY_FOLDER + encodeURI(file));
  ACCESSORIES.push({
    id: t.id,
    name: "Tea Cozy: " + t.design,
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
const POT_HOLDER_DESCRIPTION = "A double-layered, heat-resistant pinch pot holder in high quality cotton fabric. It is as sturdy as it is pretty.";

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
    name: "Pot Holder: " + h.design,
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

/* Shown on the collection card. */
const KIDS_DASTERKHWAN_DESCRIPTION = "Bright colours and fun prints for little ones eating together with friends and cousins, at home or on a picnic. Three designs in high quality cotton fabric.";
const KIDS_DASTERKHWANS = [
  { id: "KD-001", name: "Kids Dasterkhwan: Design 1", desc: "A white cotton dasterkhwan printed with bright tomatoes in red, orange, yellow and green, with a mustard border. Cheerful colours for little ones sharing a meal with friends and cousins, at home or on a picnic.", price: 4500, tag: "AVAILABLE", thumbnail: "D1b.JPG", photos: ["D1a.JPG", "D1b.JPG", "D1c.JPG"] },
  { id: "KD-002", name: "Kids Dasterkhwan: Design 2", desc: "A soft pink cotton dasterkhwan printed with fried eggs, with a white lace border. A playful print that makes breakfast and snack time fun for the kids.", price: 4500, tag: "AVAILABLE", thumbnail: "D2b.JPG", photos: ["D2a.JPG", "D2b.JPG", "D2c.JPG"] },
  { id: "KD-003", name: "Kids Dasterkhwan: Design 3", desc: "A white cotton dasterkhwan printed with cakes and tarts in pink, red, green and yellow, with a coral border. Sweet colours for afternoon snacks and picnics with the cousins.", price: 4500, tag: "AVAILABLE", thumbnail: "D3b.JPG", photos: ["D3a.JPG", "D3b.JPG", "D3c.JPG"] }
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