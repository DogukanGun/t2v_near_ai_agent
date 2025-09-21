/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations for mobile
  experimental: {
  },
  // Code splitting and bundle optimization
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    // Optimize for mobile performance
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          maxSize: 244000, // 244KB chunks for better mobile loading
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          maxSize: 244000,
          enforce: true,
        },
      }
    }
    return config;
  },
  // Compress responses
  compress: true,
  // PWA optimization
  poweredByHeader: false,
  generateEtags: true,
  // Images optimization
  images: {
    domains: ["localhost", "images.unsplash.com"],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
}

module.exports = nextConfig