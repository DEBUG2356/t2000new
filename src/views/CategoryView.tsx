import Image from "next/image";
import { WhyChooseUs } from "@/components/Blocks";
import DropTitle from "@/components/DropTitle";
import ProductCard from "@/components/ProductCard";
import type { Catalog, Category } from "@/lib/catalog";
import type { Lang } from "@/lib/site";

export default function CategoryView({ category, lang, catalog }: { category: Category; lang: Lang; catalog: Catalog }) {
  const products = catalog.inCategory(category);
  return (
    <>
      <div className="relative h-[220px] overflow-hidden sm:h-[300px]">
        <Image src={category.image} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/35" />
        <div className="container-site relative flex h-full items-center">
          <div className="max-w-2xl font-display text-[2.2rem] leading-tight font-semibold text-white drop-shadow sm:text-[3rem]">
            <DropTitle text={category.headerTitle[lang]} />
          </div>
        </div>
      </div>
      <div className="container-site py-10">
        <h1 className="mb-8 font-display text-[2rem] font-semibold">{category.title[lang]}</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} lang={lang} category={category} />
          ))}
        </div>
      </div>
      <WhyChooseUs lang={lang} />
    </>
  );
}
