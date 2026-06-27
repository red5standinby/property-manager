import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/property-manager",
  assetPrefix: "/property-manager/",
};

export default nextConfig;
