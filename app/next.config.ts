import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve modern formats first. AVIF is typically 25-50% smaller than the
    // WebP equivalent, which matters most on mobile data.
    formats: ['image/avif', 'image/webp'],
    // Trim the default width set to the breakpoints this design actually uses,
    // so the optimizer isn't generating variants nothing requests.
    deviceSizes: [400, 640, 828, 1080, 1200, 1920],
    imageSizes: [56, 96, 128, 256, 384],
    // Cache optimized derivatives for 30 days instead of the 60s default.
    minimumCacheTTL: 2_592_000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.magnific.com',
        port: '',
        pathname: '/**',
      },
      // Legacy pre-Cloudinary uploads, still resolvable via the API's
      // /uploads static route (see backend/src/app.js).
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      // Product/blog images and consultation uploads now go straight to
      // Cloudinary (see backend/src/middleware/upload.middleware.js).
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  experimental: {
    // antd and @ant-design/icons are barrel files that re-export hundreds of
    // modules. Without this, importing `{ Switch }` pulls a large chunk of the
    // library into the client bundle. `antd` is on Next's default list, but
    // naming them explicitly also covers the icon package and framer-motion.
    optimizePackageImports: ['antd', '@ant-design/icons', 'framer-motion', 'react-icons'],
  },

  // Drop console.* from production builds (keeps errors/warnings). Several
  // components log on submit, which is dead weight and noise in prod.
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
};

export default nextConfig;
