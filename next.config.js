/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  basePath: "/loan-calculator",
  assetPrefix: "/loan-calculator/"
};

module.exports = nextConfig;
