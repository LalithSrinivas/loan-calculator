/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: "/loan-calculator",
  assetPrefix: "/loan-calculator/",
  images: {
    unoptimized: true
  },
};

module.exports = nextConfig;
