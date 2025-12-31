import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimisticClientCache: false,  // Link prefetch 비활성화 (_rsc 파라미터 제거)
  }
};

export default nextConfig;
