/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Osobny katalog dla buildu audytowego (NEXT_DIST_DIR=.next-audit), żeby
  // `next build` nie nadpisywał .next działającego `next dev`.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'as-loveliness.eu',
      },
    ],
  },
};

export default nextConfig;
