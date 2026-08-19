import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16 serves /_next/* dev resources only to the origin the dev server
  // was addressed by, so opening the site as 127.0.0.1 instead of localhost
  // silently blocks every client chunk — the HTML renders but nothing
  // hydrates. Both spellings point at this machine, so both are allowed.
  // Dev-only setting; it has no effect on a production build.
  allowedDevOrigins: ["127.0.0.1", "localhost"],

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
