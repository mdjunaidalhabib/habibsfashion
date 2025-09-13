import ProductCard from "../../../../components/home/ProductCard";
import Link from "next/link";
import { notFound } from "next/navigation";

// 🔹 নির্দিষ্ট category ফেচ
async function getCategory(id) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("❌ Error fetching category:", err.message);
    return null;
  }
}

// 🔹 নির্দিষ্ট category এর products ফেচ
async function getCategoryProducts(id) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}/products`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    console.error("❌ Error fetching category products:", err.message);
    return [];
  }
}

// 🔹 Static params জেনারেট (slug id ফিল্ড দিয়ে)
export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/categories`
    );
    if (!res.ok) return [];
    const categories = await res.json();
    return categories.map((c) => ({ id: c.id })); // ✅ slug (id ফিল্ড) ব্যবহার
  } catch (err) {
    console.error("❌ Error generating static params:", err.message);
    return [];
  }
}

export default async function CategoryPage({ params }) {
  const { id } = await params;

  // ক্যাটাগরি + products ফেচ
  const [category, items] = await Promise.all([
    getCategory(id),
    getCategoryProducts(id),
  ]);

  if (!category) return notFound();

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{category.name}</span>
      </nav>

      {/* Heading */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl sm:text-3xl font-semibold">{category.name}</h1>
        <Link
          href="/products"
          className="text-blue-600 hover:underline text-sm sm:text-base"
        >
          All Products
        </Link>
      </div>

      {/* Products grid */}
      {items.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p>No products found in this category.</p>
        </div>
      )}
    </main>
  );
}
