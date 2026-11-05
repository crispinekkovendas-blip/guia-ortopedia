import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingRoot: path.join(process.cwd()),
  outputFileTracingIncludes: {
    // Os APKs do app Android que o site entrega (app-releases.ts).
    "/api/app/apk/[file]": ["./android-releases/**"],
    "/app": ["./android-releases/releases.json"],
  },
};

export default nextConfig;
