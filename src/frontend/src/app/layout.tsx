import type { Metadata } from "next";
import { Be_Vietnam_Pro, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/libs/redux/StoreProvider";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/shared/navbar";
import { CartSheet } from "@/components/shared/CartSheet";
import { CartSyncProvider } from "@/providers/CartSyncProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-main",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MultiAqua",
  description: "MultiAqua - The best place to buy and sell aquarium products",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* ${geistSans.variable} ${geistMono.variable} antialiased */}
      <body
        className={`${beVietnam.variable} font-sans`}
      >
        <StoreProvider>
          <CartSyncProvider>
            {children}
            <CartSheet />
          </CartSyncProvider>
        </StoreProvider>
        <Toaster />
      </body>
    </html>
  );
}
