import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
      },
    ],
    // Dev-only: category images are currently hosted by this app itself
    // (localhost), which Next 16's SSRF guard blocks by default since it
    // resolves to a private IP. Production will host images on a real CDN
    // (e.g. Cloudinary/S3), which won't need this flag at all.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
