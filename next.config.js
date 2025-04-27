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
        dns: false,
        child_process: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        crypto: require.resolve('crypto-browserify'),
        os: false,
        buffer: require.resolve('buffer'),
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
  // Add environment variables if needed
  env: {
    // Remove NODE_ENV as it's not allowed
  },
}

module.exports = nextConfig 