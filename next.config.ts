import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.microlink.io', // Microlink Image Preview
      },
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org', // Open Library book covers
      },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com', // GoodReads covers
      },
      {
        protocol: 'https',
        hostname: 'books.google.com', // Google Books covers
      },
      {
        protocol: 'https',
        hostname: 'books.googleusercontent.com', // Google Books CDN
      },
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai', // AI image generation
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', // Placeholder service
      },
    ],
  },
};

export default nextConfig;
