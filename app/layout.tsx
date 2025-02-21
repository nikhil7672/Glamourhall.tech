import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Suspense } from "react";
import Script from "next/script";
import MobileNavBar from "@/components/MobileNavBar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Glamourhall | AI-Powered Fashion Advice, Just for You",
  description:
    "Receive personalized fashion recommendations, outfit ideas, and style tips with Glamourhall. Your AI-powered fashion assistant helps you discover the latest trends and perfect your unique look.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-8DCQ8QXDG3"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-8DCQ8QXDG3');
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 h-full`}
      >
        <Providers>
          <div className="flex flex-col h-full">
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-18 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              }
            >
              {children}
            </Suspense>
            <MobileNavBar />
          </div>
        </Providers>
      </body>
    </html>
  );
}
