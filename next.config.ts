import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  output: process.env.BUILD_STANDALONE ? "standalone" : undefined,
};

export default nextConfig;
