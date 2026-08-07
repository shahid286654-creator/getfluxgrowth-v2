import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server output (server.js + only the deps it needs) --
  // required for the Docker-based Coolify deployment; keeps the
  // production image small and avoids depending on node_modules being
  // present in the runtime image.
  output: "standalone",
};

export default nextConfig;
