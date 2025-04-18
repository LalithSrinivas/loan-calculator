/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static exports
  basePath: '/loan-calculator', // Match your repository name
  assetPrefix: '/loan-calculator/',
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true, // Recommended for GitHub Pages
};

module.exports = nextConfig; 