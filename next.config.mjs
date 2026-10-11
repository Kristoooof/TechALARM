/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Fotófeltöltés (max 5 MB) + űrlapmezők
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
