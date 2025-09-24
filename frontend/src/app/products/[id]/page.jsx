import ProductDetailsClient from "../../../../components/home/ProductDetailsClient";
import { apiFetch } from "../../../../utils/api";

async function getProduct(id) {
  return await apiFetch(`/api/products/${id}`, { cache: "no-store" });
}

async function getCategory(categoryId) {
  if (!categoryId) return null;
  return await apiFetch(`/api/categories/${categoryId}`, { cache: "no-store" });
}

async function getRelated(categoryId, productId) {
  if (!categoryId) return [];
  const products = await apiFetch(`/api/products/category/${categoryId}`, {
    cache: "no-store",
  });
  return products.filter((p) => p._id !== productId);
}

export default async function ProductDetailsPage({ params }) {
  const product = await getProduct(params.id);

  if (!product?._id) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p>❌ Product not found.</p>
        </div>
      </main>
    );
  }

  // ✅ এখানে categoryId বের করছি
  const categoryId =
    typeof product.category === "object" ? product.category._id : product.category;

  const category = await getCategory(categoryId);
  const related = await getRelated(categoryId, product._id);

  return (
    <ProductDetailsClient
      product={product}
      category={category}
      related={related}
    />
  );
}
