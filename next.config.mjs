const nextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.wallhaven.cc" },
      { protocol: "https", hostname: "**.alphacoders.com" },
      { protocol: "https", hostname: "i.redd.it" },
      { protocol: "https", hostname: "preview.redd.it" },
      { protocol: "https", hostname: "**.imgur.com" }
    ]
  },
  experimental: {
    optimizePackageImports: ["lucide-react"]
  }
};

export default nextConfig;
