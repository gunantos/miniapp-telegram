import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import PWARegister from "@/components/pwa-register";
import ToastProvider from "@/components/toast-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StreamApp - Video Streaming Platform",
  description: "Modern video streaming platform with Telegram integration. Watch drama, films, serials, and cartoons.",
  keywords: ["StreamApp", "video streaming", "Telegram", "drama", "film", "serial", "cartoon", "Next.js"],
  authors: [{ name: "StreamApp Team" }],
  icons: {
    icon: "🎬",
    apple: "🎬",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "StreamApp",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "StreamApp - Video Streaming Platform",
    description: "Modern video streaming platform with Telegram integration",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StreamApp - Video Streaming Platform",
    description: "Modern video streaming platform with Telegram integration",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "StreamApp",
    "application-name": "StreamApp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <PWARegister />
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
