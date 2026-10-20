import { notFound } from "next/navigation";
import ProductEditor from "@/components/admin/ProductEditor";
import { CATEGORIES } from "@/data/shop";
import { fetchProductFresh, fetchProductSummaries } from "@/lib/server/db";
import type { Product } from "@/lib/types";

export const metadata = { title: "Termék szerkesztése" };

const blank = (): Product => ({
  id: 0,
  active: false,
  sort: 999,
  categories: [],
  primaryCategory: null,
  image: null,
  gallery: [],
  rating: null,
  reviewCount: null,
  bars: null,
  lat: null,
  lng: null,
  props: [{ key: "instant" }, { key: "mobile" }, { key: "flexible" }],
  i18n: { en: { title: "", slug: "", location: "", labels: [] } },
  legacyUrls: {},
  reviews: [],
  tickets: [{ type: "adult", price: 0, oldPrice: null }],
  minQty: 1,
  closedWeekdays: [],
  closedDates: [],
  months: [],
  timeSlots: [],
  slotFrom: null,
  slotTo: null,
  slotStep: null,
  components: [],
});

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  // the product and the light list (titles only, for choosing combo base tickets) load at the same time
  const [found, list] = await Promise.all([id === "new" ? Promise.resolve(blank()) : fetchProductFresh(Number(id) || 0), fetchProductSummaries()]);
  const product: Product | undefined = found ?? undefined;
  if (!product) notFound();
  return (
    <ProductEditor
      initial={product}
      categories={CATEGORIES.map((c) => ({ id: c.id, title: c.title.en }))}
      products={list.map((x) => ({ id: x.id, title: x.title, isCombo: x.components.length > 0 }))}
    />
  );
}
