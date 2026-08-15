/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cpus: 1,
    serverActions: {
      bodySizeLimit: '20mb',
    },
  }
};

export default nextConfig;
