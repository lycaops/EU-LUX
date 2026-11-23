import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "EU Luxury Tours & Travels | Premium Chauffeur Service Italy",
  description: "Exceptional chauffeur experiences in Mercedes-Benz V-Class V250. Noleggio con conducente (NCC) in Italy and Europe.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/web/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/web/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icons/web/icon-192.png",
    apple: "/icons/web/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500&family=Noto+Naskh+Arabic:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider>
          <Nav />
          <main>{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
