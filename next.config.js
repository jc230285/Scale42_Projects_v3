/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enable standalone output for Docker deployment
  output: 'standalone',
  // Note: Server Actions are enabled by default in Next.js 14
};

module.exports = nextConfig;