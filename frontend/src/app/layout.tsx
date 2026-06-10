import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mini Operations Wallet Portal — Badrgo",
  description: "Badrgo Financial Control & Admin Portal for wallet operations, transactions, and daily reconciliation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-[var(--background)] text-[var(--foreground)]`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Top accent line */}
            <div className="h-0.5 bg-gradient-to-r from-brand-600 via-purple-500 to-brand-500 shrink-0" />
            <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto animate-fade-in">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
