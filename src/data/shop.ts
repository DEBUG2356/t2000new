import type { Lang } from "@/lib/site";

// ---------------------------------------------------------------------------
// SEED ONLY – the live prices are edited in the admin panel (Supabase "products").
// Prices are the "from" prices shown on the archived tickets2000.com product cards.
// `price: null` = no price was archived -> no ticket type, online booking off.
// ---------------------------------------------------------------------------
export type Pricing = {
  price: number | null; // EUR per ticket
  oldPrice?: number | null; // crossed-out "Price: from" when there is a "Now only" price
  minQty?: number;
  closedWeekdays?: number[]; // 0 = Sunday … 6 = Saturday
  closedDates?: string[]; // "MM-DD", every year
  months?: number[]; // bookable months (1-12); all when omitted
};

const PARIS_CLOSED = ["01-01", "05-01", "12-25"];
const LOUVRE = { closedWeekdays: [2], closedDates: PARIS_CLOSED };

export const SEED_PRICING: Record<number, Pricing> = {
  1: { price: null },
  7: { price: null },
  12: { price: 18.0, closedDates: PARIS_CLOSED },
  14: { price: null, closedDates: PARIS_CLOSED },
  27: { price: 14.9, oldPrice: 16.5, closedDates: PARIS_CLOSED },
  28: { price: 29.9, closedDates: PARIS_CLOSED },
  29: { price: 18.0, closedDates: PARIS_CLOSED },
  30: { price: 17.0, closedDates: PARIS_CLOSED },
  35: { price: null, ...LOUVRE },
  36: { price: null },
  47: { price: null, closedDates: PARIS_CLOSED },
  48: { price: null, closedDates: PARIS_CLOSED },
  50: { price: null },
  75: { price: null },
  76: { price: null },
  77: { price: 70.0 },
  87: { price: null },
  88: { price: null },
  89: { price: null },
  100: { price: 34.9, oldPrice: 39.9, ...LOUVRE },
  135: { price: 39.9, oldPrice: 49.9, ...LOUVRE },
  136: { price: 24.9 },
  137: { price: 17.0 },
  138: { price: 79.9, oldPrice: 89.9, ...LOUVRE },
  139: { price: null, ...LOUVRE },
  140: { price: 37.0 },
  141: { price: 69.9, ...LOUVRE },
  142: { price: 69.9, oldPrice: 74.9, ...LOUVRE },
  145: { price: 110.0, minQty: 2 },
  146: { price: 150.0, minQty: 2, months: [12, 1, 2, 3] },
  147: { price: 150.0, minQty: 2, months: [4, 5, 6, 7, 8, 9, 10] },
  148: { price: null, closedWeekdays: [2] },
  149: { price: null },
  150: { price: null },
};

// ---------------------------------------------------------------------------
// Categories. Slugs are the original URLs of tickets2000.com in every language.
// `nav` = shown in the header menu (Barcelona, Tenerife, Paris, Slovakia, Madrid).
// ---------------------------------------------------------------------------
export type Category = {
  id: string;
  nav: boolean;
  slugs: Record<Lang, string>;
  title: Record<Lang, string>;
  headerTitle: Record<Lang, string>;
  subtitle?: Record<Lang, string>;
  image: string;
  /** initial product order of the category (seed only, live membership is products.categories) */
  seed: number[];
};

const same = (s: string): Record<Lang, string> => ({ en: s, fr: s, es: s, de: s, sk: s, it: s });

export const CATEGORIES: Category[] = [
  {
    id: "barcelona",
    nav: true,
    slugs: { en: "barcelona", fr: "barcelone", es: "barcelona", de: "barcelona", sk: "barcelona", it: "barcellona" },
    title: { en: "Barcelona", fr: "Barcelone", es: "Barcelona", de: "Barcelona", sk: "Barcelona", it: "Barcellona" },
    headerTitle: { en: "Barcelona Attractions", fr: "Attractions à Barcelone", es: "Atracciones de Barcelona", de: "Barcelona Sehenswürdigkeiten", sk: "Atrakcie v Barcelone", it: "Attrazioni di Barcellona" },
    image: "/media/p88-4.webp",
    seed: [87, 88, 89],
  },
  {
    id: "tenerifa",
    nav: true,
    slugs: { en: "tenerifa", fr: "teneriffe", es: "tenerife", de: "teneriffa", sk: "tenerifa", it: "tenerifa" },
    title: { en: "Tenerife", fr: "Ténériffe", es: "Tenerife", de: "Teneriffa", sk: "Tenerifa", it: "Tenerifa" },
    headerTitle: {
      en: "Tenerife Attractions - Choose your experience",
      fr: "Attractions de Ténériffe - Choisissez votre expérience",
      es: "🌴 Atracciones de Tenerife - Selecciona tu experiencia ⬇️",
      de: "Teneriffa Attraktionen - Wählen Sie Ihr Erlebnis",
      sk: "Atrakcie na Tenerife - Vyberte si zážitok",
      it: "Attrazioni di Tenerife - Scegli la tua esperienza",
    },
    image: "/media/cat-tenerifa-1.webp",
    seed: [77, 76, 75],
  },
  {
    id: "paris",
    nav: true,
    slugs: { en: "paris", fr: "paris", es: "paris", de: "paris", sk: "pariz", it: "parigi" },
    title: { en: "Paris", fr: "Paris", es: "París", de: "Paris", sk: "Paríž", it: "Parigi" },
    headerTitle: {
      en: "Choose your experience in Paris!",
      fr: "Choisissez votre expérience à Paris !",
      es: "¡Elija su experiencia en París!",
      de: "Wählen Sie Ihr Erlebnis in Paris!",
      sk: "Vyberte si svoj zážitok v Paríži!",
      it: "Scegli la tua esperienza a Parigi!",
    },
    image: "/media/cat-paris-1.webp",
    seed: [135, 139, 142, 141, 138, 12, 27, 28, 29, 136, 137, 140],
  },
  {
    id: "slovakia",
    nav: true,
    slugs: same("slovakia"),
    title: { en: "Slovakia", fr: "Slovaquie", es: "Eslovaquia", de: "Slowakei", sk: "Slovensko", it: "Slovacchia" },
    headerTitle: { en: "Slovakia", fr: "Slovaquie", es: "Eslovaquia", de: "Slowakei", sk: "Slovensko", it: "Slovacchia" },
    image: "/media/cat-slovakia-1.webp",
    seed: [147, 145, 146],
  },
  {
    id: "madrid",
    nav: true,
    slugs: same("madrid"),
    title: same("Madrid"),
    headerTitle: { en: "Madrid Attractions", fr: "Attractions à Madrid", es: "Atracciones de Madrid", de: "Madrid Sehenswürdigkeiten", sk: "Atrakcie v Madride", it: "Attrazioni di Madrid" },
    image: "/media/p150-3.webp",
    seed: [148, 149, 150],
  },
  {
    id: "top-offers",
    nav: false,
    slugs: { en: "top-offers", fr: "nos-meilleures-offres", es: "ofertas", de: "top-angebote", sk: "top-offers", it: "offerte-top" },
    title: { en: "Top Offers", fr: "Nos meilleures offres", es: "Ofertas destacadas", de: "Top-Angebote", sk: "Najlepšie ponuky", it: "Offerte top" },
    headerTitle: {
      en: "The best and most memorable adventures in Paris.",
      fr: "Les aventures les plus belles et les plus mémorables à Paris.",
      es: "Las mejores y más inolvidables experiencias en París.",
      de: "Die besten und unvergesslichsten Abenteuer in Paris.",
      sk: "Najlepšie a najpamätnejšie dobrodružstvá v Paríži.",
      it: "Le avventure migliori e più memorabili a Parigi.",
    },
    image: "/media/cat-top-offers-1.webp",
    seed: [135, 138, 142, 12, 27, 28, 29, 47, 48],
  },
  {
    id: "boat-tours",
    nav: false,
    slugs: { en: "boat-tours", fr: "excursions-en-bateau", es: "paseos-en-barco", de: "bootstouren", sk: "boat-tours", it: "tour-in-barca" },
    title: {
      en: "Paris: Boat Tours & Dinner Cruises",
      fr: "Excursions en bateau",
      es: "Recorridos en barco",
      de: "Paris: Bootstouren & Dinner-Kreuzfahrten",
      sk: "Paríž: Výlety loďou a plavby na večeru",
      it: "Parigi: tour in barca e crociere con cena",
    },
    headerTitle: {
      en: "Select the Best Cruise for you!",
      fr: "Sélectionnez la meilleure croisière pour vous !",
      es: "¡Seleccione el mejor crucero para usted!",
      de: "Wählen Sie die beste Kreuzfahrt für Sie!",
      sk: "Vyberte si najlepšiu plavbu pre vás!",
      it: "Scegli la crociera migliore per te!",
    },
    image: "/media/cat-boat-tours-1.webp",
    seed: [137, 140, 1, 7, 50],
  },
  {
    id: "near-to-paris",
    nav: false,
    slugs: { en: "near-to-paris", fr: "pres-de-paris", es: "near-to-paris", de: "in-der-nahe-von-paris", sk: "near-to-paris", it: "vicino-a-parigi" },
    title: { en: "Near to Paris", fr: "Près de Paris", es: "Cercanias de París", de: "In der Nähe von Paris", sk: "Blízko Paríža", it: "Vicino a Parigi" },
    headerTitle: {
      en: "Collect experiences every day of the week!",
      fr: "Des expériences pour chaque jour de la semaine !",
      es: "¡Acumule experiencias todos los días de la semana!",
      de: "Sammeln Sie Erlebnisse an jedem Tag der Woche!",
      sk: "Zbierajte zážitky každý deň v týždni!",
      it: "Colleziona esperienze ogni giorno della settimana!",
    },
    image: "/storage/3-4.webp",
    seed: [14, 30],
  },
  {
    id: "eiffel-tower",
    nav: false,
    slugs: { en: "eiffel-tower", fr: "tour-eiffel", es: "torre-eiffel", de: "eiffelturm", sk: "eiffel-tower", it: "torre-eiffel" },
    title: { en: "Eiffel Tower", fr: "Tour Eiffel", es: "Torre Eiffel", de: "Eiffelturm", sk: "Eiffelova veža", it: "Torre Eiffel" },
    headerTitle: {
      en: "Select the Best Eiffel Tower tour for you!",
      fr: "Sélectionnez la meilleure visite de la tour Eiffel pour vous !",
      es: "¡Seleccione el mejor tour de la Torre Eiffel para usted!",
      de: "Wählen Sie die beste Eiffelturm-Tour für Sie!",
      sk: "Vyberte si najlepšiu prehliadku Eiffelovej veže!",
      it: "Scegli il miglior tour della Torre Eiffel per te!",
    },
    image: "/media/cat-eiffel-tower-1.webp",
    seed: [136, 140, 141, 138, 36, 50, 1, 7],
  },
  {
    id: "louvre",
    nav: false,
    slugs: same("louvre"),
    title: { en: "Louvre", fr: "Louvre", es: "Louvre", de: "Louvre", sk: "Louvre", it: "Louvre" },
    headerTitle: {
      en: "Visit the Louvre Museum",
      fr: "Visitez le musée du Louvre",
      es: "Visite el Museo del Louvre",
      de: "Besuchen Sie das Louvre-Museum",
      sk: "Navštívte múzeum Louvre",
      it: "Visita il Museo del Louvre",
    },
    image: "/media/cat-louvre-1.webp",
    seed: [135, 139, 100, 35, 138, 141, 142],
  },
];

// Home page sliders (newest archived home page): first N products of a category
export const HOME_SECTIONS: { key: "topOffers" | "boatTours" | "nearParis"; category: string; limit: number }[] = [
  { key: "topOffers", category: "top-offers", limit: 3 },
  { key: "boatTours", category: "boat-tours", limit: 2 },
  { key: "nearParis", category: "near-to-paris", limit: 6 },
];

export const PARTNERS = [
  { src: "/storage/gallery_album_images/logo-bloc-pcv-cmjn-en.webp", alt: "Paris Museum Pass" },
  { src: "/storage/gallery_album_images/logo-bateaux-parisiens.webp", alt: "Bateaux Parisiens" },
  { src: "/storage/gallery_album_images/bateaux-mouches-logo-bm.webp", alt: "Bateaux Mouches" },
  { src: "/storage/gallery_album_images/parc-asterix-logo-2021.webp", alt: "Parc Astérix" },
];
