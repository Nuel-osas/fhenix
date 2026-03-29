import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        path: false,
      };

      // Force cofhejs to use browser build instead of node build
      config.resolve.alias = {
        ...config.resolve.alias,
        "cofhejs/node": path.resolve("node_modules/cofhejs/dist/web.mjs"),
        "node-tfhe": false,
      };
    }
    return config;
  },
};

export default nextConfig;
