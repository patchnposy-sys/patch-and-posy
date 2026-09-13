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
   TABLECLOTHS — Luxury & Daily Wear
   Sample placeholders — swap in real photos & details any time.
   subcategory must be exactly "luxury" or "daily".
   size (optional) — a short display string, e.g.
     "4-Seater Square · 54×54 in" or "6-Seater Rectangle · 60×90 in"
   ============================================================ */
const TABLECLOTHS = [
  {
    id: "T-L001",
    name: "T-L001 Heirloom Damask",
    subcategory: "luxury",
    size: "4-Seater Square · 54×54 in",
    desc: "A statement-worthy tablecloth in rich jacquard-style patchwork with a hand-finished scalloped edge — made for festive dinners and guests who notice details.",
    price: 12500,
    tag: "COMING SOON",
    image: "",
    swatch: ["#5C3A22", "#E0A83E", "#C0396B"]
  },
  {
    id: "T-L002",
    name: "T-L002 Royal Ajrak Runner Set",
    subcategory: "luxury",
    size: "6-Seater Rectangle · 60×90 in",
    desc: "Deep indigo Ajrak-inspired patchwork paired with raw silk trim — a tablecloth and matching runner set for special occasions.",
    price: 15000,
    tag: "COMING SOON",
    image: "",
    swatch: ["#1C3A5E", "#3E6B8A", "#F3ECDD"]
  },
  {
    id: "T-D001",
    name: "T-D001 Everyday Gingham",
    subcategory: "daily",
    size: "4-Seater Square · 54×54 in",
    desc: "A durable, easy-wash cotton patchwork cloth in a cheerful gingham mix — built for everyday family meals, not just special occasions.",
    price: 4500,
    tag: "COMING SOON",
    image: "",
    swatch: ["#8FBF6E", "#F3ECDD", "#E0794F"]
  },
  {
    id: "T-D002",
    name: "T-D002 Kitchen Table Patch",
    subcategory: "daily",
    size: "6-Seater Rectangle · 54×80 in",
    desc: "A relaxed, low-maintenance patchwork tablecloth in soft pastel scraps — sized for smaller breakfast and kitchen tables.",
    price: 3800,
    tag: "COMING SOON",
    image: "",
    swatch: ["#E8879C", "#F3ECDD", "#8FBF6E"]
  }
];

/* ============================================================
   ACCESSORIES
   Sample placeholders — swap in real photos & details any time.
   category — groups items under filter chips on the site, e.g.
     "Coasters", "Pouches", "Hoop Art", "Bread Cloths",
     "Tea Cozies", "Pot Holders", "Aprons", "Bags"
   ============================================================ */
const ACCESSORIES = [
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
    desc: "A hand-embroidered floral hoop, finished and ready to hang — a small, framed piece of the same patience that goes into every spread.",
    price: 3200,
    tag: "COMING SOON",
    image: "",
    swatch: ["#C0396B", "#8FBF6E", "#F3ECDD"]
  },
  {
    id: "A-004",
    name: "A-004 Kitchen Bread Cloth",
    category: "Bread Cloths",
    desc: "A soft patchwork cloth for lining bread baskets or covering dough while it proves — simple, homely, and practical.",
    price: 1500,
    tag: "COMING SOON",
    image: "",
    swatch: ["#E0A83E", "#F3ECDD", "#8A6B4D"]
  },
  {
    id: "A-005",
    name: "A-005 Cosy Tea Cozy",
    category: "Tea Cozies",
    desc: "A quilted, insulated tea cozy in mixed patchwork scraps — keeps the pot warm for a second (or third) cup.",
    price: 2000,
    tag: "COMING SOON",
    image: "",
    swatch: ["#1C8577", "#E0794F", "#F3ECDD"]
  },
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
];

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
const PRODUCTS = SPREADS;
