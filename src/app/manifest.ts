import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Resonance · The Living Song",
    short_name: "Resonance",
    description:
      "A bilingual musical adventure where listening, creating, and caring restore living worlds.",
    start_url: "/",
    display: "standalone",
    background_color: "#081813",
    theme_color: "#081813",
    orientation: "any",
    categories: ["education", "music", "games"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
