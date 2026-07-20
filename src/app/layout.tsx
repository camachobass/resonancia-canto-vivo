import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://resonancia-canto-vivo.vercel.app"),
  title: {
    default: "Resonance · The Living Song",
    template: "%s · Resonance",
  },
  description:
    "A bilingual musical adventure where listening, creating, and caring restore living worlds.",
  applicationName: "Resonance",
  manifest: "/manifest.webmanifest",
  keywords: [
    "music education",
    "ear training",
    "harmony game",
    "OpenAI Build Week",
    "educational game",
    "ecosophy",
  ],
  authors: [{ name: "Resonance Build Week Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "es_CO",
    url: "/",
    title: "Resonance · The Living Song",
    description: "Listen. Create. Compare. Restore the living song.",
    siteName: "Resonance",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resonance · The Living Song",
    description: "A musical adventure where listening changes the world.",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#081813",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
