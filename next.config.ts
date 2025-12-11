import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

   // Environment variables
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    IPINFO_TOKEN: process.env.IPINFO_TOKEN,
  },
images: {
  remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.google.com',
        pathname: '/s2/favicons/**',
      },
      {
        protocol: 'https',
        hostname: 'icons.duckduckgo.com',
        pathname: '/ip3/**',
      }
]}
};
 


export default nextConfig;


