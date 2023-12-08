/** @type {import("next").NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  experimental: { runtime: 'edge' },
};

module.exports = nextConfig;