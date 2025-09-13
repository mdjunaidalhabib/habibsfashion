import ProductCard from "../../../../components/home/ProductCard";
import Link from "next/link";
import { notFound } from "next/navigation";

// ✅ নির্দিষ্ট ক্যাটাগরি ফেচ
async function getCategory(id) {
  const res = await fetch(`http://localhost:4000/api/categories/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

// ✅ নির্দিষ্ট ক্যাটাগরির products ফেচ
async function getCategoryProducts(id) {
  const res = await fetch(
    `http://localhost:4000/api/categories/${id}/products`,
    {
      cache: "no-store",
    }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function generateStaticParams() {
  const res = await fetch("http://localhost:4000/api/categories");
  if (!res.ok) return [];
  const categories = await res.json();
  return categories.map((c) => ({ id: String(c.id) }));
}

export default async function CategoryPage({ params }) {
  const { id } = params;

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
            <ProductCard key={p._id || p.id} product={p} />
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
