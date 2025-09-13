import ProductCard from "../../../components/home/ProductCard";
import Link from "next/link";

async function getProducts() {
  const res = await fetch("http://localhost:4000/api/products", {
    cache: "no-store", // fresh data every time
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
}

export default async function AllProductsPage() {
  const products = await getProducts();

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">All Products</span>
      </nav>

      {/* Heading */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl sm:text-3xl font-semibold">All Products</h1>
      </div>

      {/* Products Grid */}
      {products.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p>No products available.</p>
        </div>
      )}
    </main>
  );
}
