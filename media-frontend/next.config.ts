import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    unoptimized: true, // Allow unoptimized images for localhost development
    remotePatterns: [
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
