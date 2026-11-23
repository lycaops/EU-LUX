export default function manifest() {
  return {
    name: "EU Luxury Tours & Travels",
    short_name: "EU Luxury",
    description: "Premium chauffeur service in Italy and Europe.",
    start_url: "/",
    display: "standalone",
    background_color: "#080808",
    theme_color: "#080808",
    icons: [
      { src: "/icons/web/icon-192.png", type: "image/png", sizes: "192x192" },
      { src: "/icons/web/icon-512.png", type: "image/png", sizes: "512x512" },
      { src: "/icons/web/icon-192-maskable.png", type: "image/png", sizes: "192x192", purpose: "maskable" },
      { src: "/icons/web/icon-512-maskable.png", type: "image/png", sizes: "512x512", purpose: "maskable" },
    ],
  };
}
