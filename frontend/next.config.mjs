/** @type {import('next').NextConfig} */
import path from "path";
const __dirname = new URL(".", import.meta.url).pathname;
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "./src"),
    };
    return config;
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/v1/:path*",
  //       destination:
  //         process.env.NEXT_PUBLIC_BACKEND_URL || "http://fastapi:8080/api/v1/:path*",
  //     },
  //   ];
  // },
};

export default nextConfig;