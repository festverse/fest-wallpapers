import type { MetadataRoute } from "next";

export const runtime = "edge";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MURAL - Free Wallpapers",
    short_name: "MURAL",
    description: "Free wallpapers from Wallhaven, Pexels, Pixabay and Unsplash in one filterable wall.",
    start_url: "/",
    display: "standalone",
    background_color: "#08090c",
    theme_color: "#08090c",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ]
  };
}
