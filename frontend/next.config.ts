import type { NextConfig } from "next";

const goApiOrigin = process.env.GO_API_ORIGIN || 'http://localhost:8080';

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${goApiOrigin}/api/:path*`
      }
    ];
  },
  async headers() {
    return [
      {
        // セキュリティヘッダーを追加
        source: '/api/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
