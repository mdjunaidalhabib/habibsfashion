import ProductDetailsClient from "../../../../components/home/ProductDetailsClient";
import { notFound } from "next/navigation";
import { apiFetch } from "../../../../utils/api";

export async function getProductPageData(id) {
  try {
    // ১. প্রোডাক্ট
    const product = await apiFetch(`/api/products/${id}`, {
      cache: "no-store",
    });
    if (!product) return null;

    // ২. ক্যাটাগরি
    const categories = await apiFetch("/api/categories", {
      cache: "no-store",
    });

    const category =
      Array.isArray(categories) &&
      categories.find(
        (c) =>
          String(c._id) === String(product.category?._id || product.category)
      );

    // ৩. related products
    const allProducts = await apiFetch("/api/products", {
      cache: "no-store",
    });

    const related = Array.isArray(allProducts)
      ? allProducts
          .filter(
            (p) =>
              String(p.category?._id || p.category) ===
                String(product.category?._id || product.category) &&
              String(p._id) !== String(product._id)
          )
          .slice(0, 8)
      : [];

    return { product, category, related };
  } catch (err) {
    console.error("❌ Failed to fetch product page data:", err.message);
    return null;
  }
}

export default async function ProductPage({ params }) {
  const { id } = params;
  const data = await getProductPageData(id);

  if (!data || !data.product) return notFound();

  return (
    <ProductDetailsClient
      product={data.product}
      category={data.category}
      related={data.related}
    />
  );
}
