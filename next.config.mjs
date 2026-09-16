/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    cpus: 1,
    serverActions: {
      bodySizeLimit: '20mb',
    },
  }
};

export default nextConfig;
