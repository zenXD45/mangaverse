import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'media.kitsu.io', 
      'static.kitsu.io',
      'uploads.mangadex.org'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.mangadex.org',
        port: '',
        pathname: '/**',
      }
    ],
    unoptimized: true
  },
};

export default nextConfig;
