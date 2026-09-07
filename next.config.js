/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['ws', '@neondatabase/serverless'],
  },
};

module.exports = nextConfig;
