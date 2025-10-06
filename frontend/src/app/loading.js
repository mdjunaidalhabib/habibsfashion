export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-4 border-gray-200"></div>
      </div>

      {/* Text */}
      <p className="mt-6 text-gray-700 font-medium text-lg animate-pulse">
        Loading, please wait...
      </p>

      {/* Subtle tagline */}
      <p className="mt-2 text-gray-400 text-sm">
        Bringing you the best products 🚀
      </p>
    </div>
  );
}