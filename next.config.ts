// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // output: 'export',   // ← 使わない（API使うので外す）
  // images: { unoptimized: true }, // 'export'用なら一旦外す
  typescript: {
    // もし元から入っていたなら残してOK（任意）
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
