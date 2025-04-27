/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // Add fallbacks for client-side dependencies
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        worker_threads: false,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Handle Web Workers
    config.module.rules.push({
      test: /\.worker\.js$/,
      loader: 'worker-loader',
      options: {
        inline: 'no-fallback',
      },
    });

    return config;
  },
}

module.exports = nextConfig 