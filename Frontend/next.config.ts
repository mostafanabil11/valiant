import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16 serves /_next/* dev resources only to the origin the dev server
  // was addressed by, so opening the site as 127.0.0.1 instead of localhost
  // silently blocks every client chunk — the HTML renders but nothing
  // hydrates. Both spellings point at this machine, so both are allowed.
  // Dev-only setting; it has no effect on a production build.
  allowedDevOrigins: ["127.0.0.1", "localhost"],

  // No remotePatterns and no dangerouslyAllowLocalIP: product and category
  // images are stored as root-relative paths and served by this app out of
  // public/, so the optimizer never makes an outbound request. Both settings
  // existed only to permit fetching from http://localhost:3001, which is what
  // the database used to store — and which resolved, in production, to the
  // visitor's own machine.
  //
  // Moving images to a real host later means adding that host here; it does
  // not mean bringing back the local-IP escape hatch.
};

export default nextConfig;
