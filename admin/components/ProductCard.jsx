export default function ProductCard({ product, onEdit, onDelete }) {
  return (
    <div className="border rounded-xl shadow-md p-4 flex flex-col bg-white hover:shadow-lg transition">
      {/* Product Image */}
      {product.image && (
        <div className="w-full h-32 overflow-hidden rounded-lg mb-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition"
          />
        </div>
      )}

      {/* Product Info */}
      <h2 className="font-semibold text-lg truncate">{product.name}</h2>
      <p className="text-gray-700 font-medium">
        ৳ {product.price}{" "}
        {product.oldPrice && (
          <span className="line-through text-sm text-gray-500 ml-1">
            ৳ {product.oldPrice}
          </span>
        )}
      </p>
      <p className="text-sm text-gray-500">Stock: {product.stock}</p>
      <p className="text-xs text-gray-400">{product.category?.name}</p>

      {/* Action Buttons */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded-lg text-sm font-medium transition"
        >
          ✏ Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg text-sm font-medium transition"
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );
}
