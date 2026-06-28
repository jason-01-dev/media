import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // Removed unoptimized: true to enable Next.js image optimization for production
    // Strapi images are optimized via remote patterns + Next Image
    remotePatterns: [
      {
        // 🌐 AJOUT POUR LA PRODUCTION : Autoriser les images de ton Strapi sur Render
        protocol: 'https',
        hostname: 'strapi-fpkn.onrender.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '1337',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.128.1',
        port: '1337',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '172.20.10.4',
        port: '1337',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;