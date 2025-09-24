/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_GOOGLE_IMAGE_HOST, // ✅ Google Avatar host
      },
      {
        protocol: process.env.NEXT_PUBLIC_API_URL.split("://")[0], // http or https
        hostname: process.env.NEXT_PUBLIC_API_URL.split("://")[1].split(":")[0], // host
        port: process.env.NEXT_PUBLIC_API_URL.includes(":")
          ? process.env.NEXT_PUBLIC_API_URL.split(":")[2]
          : undefined, // port থাকলে নেবে
        pathname: "/uploads/**", // ✅ শুধু uploads ফোল্ডার allow
      },
    ],
  },
};

export default nextConfig;
