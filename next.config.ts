import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  allowedDevOrigins: ['192.168.50.228'],
};

export default nextConfig;
