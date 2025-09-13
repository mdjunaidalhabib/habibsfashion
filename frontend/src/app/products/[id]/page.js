import ProductDetailsClient from "../../../../components/home/ProductDetailsClient";
import { notFound } from "next/navigation";
import { apiFetch } from "../../../../utils/api";


// ✅ সব প্রোডাক্ট আইডি static params বানানোর জন্য
export async function getProductPageData(id) {
  try {
    // ১. নির্দিষ্ট প্রোডাক্ট
    const product = await apiFetch(`/api/products/${id}`, {
      cache: "no-store",
    });
    if (!product) return null;

    // ২. সব ক্যাটাগরি
    const categories = await apiFetch("/api/categories", {
      cache: "no-store",
    });
    const category =
      Array.isArray(categories) &&
      categories.find((c) => c.id === product.category);

    // ৩. related products (same category, except self)
    const allProducts = await apiFetch("/api/products", {
      cache: "no-store",
    });

    const related = Array.isArray(allProducts)
      ? allProducts
          .filter(
            (p) =>
              p.category === product.category &&
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

// ✅ পেজ কম্পোনেন্ট
export default async function ProductPage({ params }) {
  // params asynchronous হতে পারে, তাই আগে await করুন
  const resolvedParams = await params;
  const { id } = resolvedParams;

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
