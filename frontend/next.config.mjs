/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Produção containerizada amigável
  output: 'standalone',

  // Otimizações de bundle
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  images: { unoptimized: true },
};

export default nextConfig;

