import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Autoriser l'accès depuis Tailscale
  allowedDevOrigins: ['100.84.94.118', 'localhost', '100.84.94.118:3005'],
};

export default nextConfig;
