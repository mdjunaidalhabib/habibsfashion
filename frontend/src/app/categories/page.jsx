import Link from "next/link";
import Image from "next/image";

// 🔹 সব ক্যাটাগরি ফেচ ফাংশন
async function getCategories() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/categories`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    // API সরাসরি array দিলে সেটা return হবে
    return Array.isArray(data) ? data : data.categories || [];
  } catch (err) {
    return [];
  }
}

export default async function ShopByCategoryPage() {
  const categories = await getCategories();

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Heading */}
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">
        Shop by Category
      </h1>

      {/* যদি কোন ক্যাটাগরি না থাকে */}
      {categories.length === 0 ? (
        <p className="text-center text-gray-500">No categories found</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/categories/${cat.id}`} // ✅ slug ফিল্ড দিয়ে route
              className="block bg-white shadow rounded-xl overflow-hidden hover:shadow-md transition"
            >
              {/* Category Image */}
              <div className="relative w-full h-32 sm:h-40 bg-gray-100">
                <Image
                  src={cat.image || "/photo/default-category.jpg"}
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Category Name */}
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
