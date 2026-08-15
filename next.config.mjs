/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cpus: 1,
    workerThreads: false,
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  eslint: {
    // Abaikan error eslint saat build agar lebih cepat dan hemat memori
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Abaikan error typescript saat build
    ignoreBuildErrors: true,
  },
  swcMinify: true,
};

export default nextConfig;
