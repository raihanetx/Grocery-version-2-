import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Krishi Bitan - Unified Store & Admin",
  description: "Your one-stop shop for fresh organic produce and groceries. Quality products delivered to your doorstep.",
  keywords: ["Krishi Bitan", "Grocery", "Organic", "Fresh Produce", "E-commerce"],
  authors: [{ name: "Krishi Bitan Team" }],
  icons: {
    icon: "https://i.postimg.cc/4xZk3k2j/IMG-20260226-120143.png",
  },
  openGraph: {
    title: "Krishi Bitan - Unified Store & Admin",
    description: "Your one-stop shop for fresh organic produce and groceries",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Courier+Prime:wght@400;700&family=IBM+Plex+Sans:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* Remix Icons */}
        <link href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" rel="stylesheet" />
        {/* Phosphor Icons */}
        <script src="https://unpkg.com/@phosphor-icons/web" async></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
