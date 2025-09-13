import ProductDetailsClient from "../../../../components/home/ProductDetailsClient";
import { notFound } from "next/navigation";

// ✅ সব প্রোডাক্ট আইডি static params বানানোর জন্য
export async function generateStaticParams() {
  const res = await fetch("http://localhost:4000/api/products");
  if (!res.ok) return [];
  const products = await res.json();

  return products.map((p) => ({ id: String(p._id) }));
}

// ✅ প্রোডাক্ট + ক্যাটাগরি + related products ফেচ
async function getProductPageData(id) {
  try {
    // ১. নির্দিষ্ট প্রোডাক্ট
    const productRes = await fetch(`http://localhost:4000/api/products/${id}`, {
      cache: "no-store",
    });
    if (!productRes.ok) return null;
    const product = await productRes.json();

    // ২. সব ক্যাটাগরি
    const categoryRes = await fetch("http://localhost:4000/api/categories", {
      cache: "no-store",
    });
    const categories = categoryRes.ok ? await categoryRes.json() : [];
    const category = categories.find((c) => c.id === product.category);

    // ৩. related products (same category, except self)
    const relatedRes = await fetch("http://localhost:4000/api/products", {
      cache: "no-store",
    });
    const allProducts = relatedRes.ok ? await relatedRes.json() : [];
    const related = allProducts
      .filter(
        (p) =>
          p.category === product.category &&
          String(p._id) !== String(product._id)
      )
      .slice(0, 8);

    return { product, category, related };
  } catch (err) {
    console.error("❌ Failed to fetch product page data", err);
    return null;
  }
}

// ✅ পেজ কম্পোনেন্ট
export default async function ProductPage({ params }) {
  const { id } = params; // ❌ এখানে কখনো await করবেন না

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
