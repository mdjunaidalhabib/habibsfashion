import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "../../../utils/api";

// ✅ ক্যাটাগরি ডেটা ফেচ
async function getCategories() {
  try {
    const data = await apiFetch("/api/Categories", {
      cache: "no-store",
    });

    // যদি API `{ categories: [...] }` ফরম্যাটে দেয়
    return Array.isArray(data) ? data : data.categories || [];
  } catch (err) {
    console.error("Category fetch failed:", err.message);
    return []; // error হলে empty array fallback
  }
}

export default async function ShopByCategoryPage() {
  const categories = await getCategories();

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Shop by Category</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">
        Shop by Category
      </h1>

      {categories.length === 0 ? (
        <p className="text-center text-gray-500">No categories found</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat._id || cat.id}
              href={`/categories/${cat._id || cat.id}`}
              className="group block bg-white shadow rounded-xl overflow-hidden hover:shadow-md transition"
            >
              <div className="relative w-full h-32 sm:h-40 bg-gray-100">
                <Image
                  src={cat.image || "/photo/default-category.jpg"}
                  alt={cat.name || "Category"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-3 text-center">
                <h3 className="text-base sm:text-lg font-medium group-hover:text-blue-600">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
