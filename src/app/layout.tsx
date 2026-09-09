import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://accounts.yesp.space"),
  title: {
    default: "Yesp Accounts — Identity & Access Management",
    template: "%s | Yesp Accounts",
  },
  description:
    "Manage your Yesp account, organizations, sessions, and security settings.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png", sizes: "512x512" },
    ],
    apple: { url: "/logo.png", type: "image/png", sizes: "512x512" },
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className="bg-white text-slate-900 antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: "inherit", fontSize: "0.875rem" },
          }}
        />
      </body>
    </html>
  );
}
