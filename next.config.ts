import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Zenovay first-party proxy — forwards /api/_z/* to the tracking API
      {
        source: '/api/_z/:path*',
        destination: 'https://api.zenovay.com/fp/:path*',
      },
    ];
  },
  /* config options here */
};

export default nextConfig;
