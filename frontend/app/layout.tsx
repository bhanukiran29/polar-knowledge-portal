import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import Header from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Polar Knowledge Portal",
  description:
    "Explore connected research, datasets, expeditions and scientific knowledge from the polar regions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-slate-900">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-center text-xs text-slate-500 sm:px-6">
            <p className="font-semibold text-slate-600">
              Polar Knowledge Portal — Phase 1 prototype
            </p>
            <p>
              Prototype demonstration data: records are illustrative samples
              created for development and do not represent official government
              data.
            </p>
            <p>SIH26063 · Integrated Polar Science Outreach &amp; Knowledge Repository</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
