const apiOrigin = normalizeApiOrigin(
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3001" : ""),
);

function normalizeApiOrigin(value) {
  return value.trim().replace(/\/+$/, "").replace(/\/api$/, "");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (!apiOrigin) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
