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
    "Yesp Accounts is the secure identity and access management console by Yesp Corporation. Manage your profile, organizations, sessions, MFA, passkeys, and security settings across all Yesp products.",
  keywords: [
    "yesp accounts",
    "yesp corporation",
    "yesp console",
    "yesp studio",
    "yesp one",
    "srinithin somasundaram",
    "identity management",
    "access management",
    "IAM",
    "SSO",
    "MFA",
    "passkey",
    "two-factor authentication",
    "account security",
    "organization management",
    "session management",
    "enterprise software",
    "saas",
    "crm",
    "erp",
    "tech company",
    "secure account",
  ],
  authors: [{ name: "Srinithin Somasundaram", url: "https://yesp.space" }],
  creator: "Yesp Corporation",
  publisher: "Yesp Corporation",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["en_IN", "en_GB", "en_AU", "en_SG", "en_CA"],
    url: "https://accounts.yesp.space",
    siteName: "Yesp Accounts",
    title: "Yesp Accounts — One account. Every Yesp product.",
    description:
      "Manage your Yesp identity, organizations, sessions, and security from one secure console. Built by Yesp Corporation.",
    images: [
      {
        url: "https://accounts.yesp.space/og-image.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Yesp Accounts — Identity & Access Management Console",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yesp Accounts — One account. Every Yesp product.",
    description:
      "Manage your Yesp identity, organizations, sessions, and security from one secure console.",
    images: ["https://accounts.yesp.space/og-image.png"],
    creator: "@yespcorp",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png", sizes: "512x512" },
    ],
    apple: { url: "/logo.png", type: "image/png", sizes: "512x512" },
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://accounts.yesp.space",
    languages: {
      "en-US": "https://accounts.yesp.space",
      "en-IN": "https://accounts.yesp.space",
      "en-GB": "https://accounts.yesp.space",
      "en-AU": "https://accounts.yesp.space",
      "en-SG": "https://accounts.yesp.space",
      "en-CA": "https://accounts.yesp.space",
    },
  },
  category: "technology",
  classification: "Business/Technology",
  other: {
    // Geo
    "geo.region":    "IN",
    "geo.placename": "India",
    "geo.position":  "20.5937;78.9629",
    ICBM:            "20.5937, 78.9629",
    // Dublin Core
    "DC.title":       "Yesp Accounts",
    "DC.creator":     "Srinithin Somasundaram",
    "DC.publisher":   "Yesp Corporation",
    "DC.description": "Identity and Access Management console for the Yesp ecosystem",
    "DC.language":    "en",
    "DC.coverage":    "Worldwide",
    "DC.rights":      "Copyright Yesp Corporation",
    // App
    "application-name":       "Yesp Accounts",
    "msapplication-TileColor": "#1558d6",
    "msapplication-TileImage": "/logo.png",
    "theme-color":             "#1558d6",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://yesp.space/#organization",
      name: "Yesp Corporation",
      alternateName: ["Yesp", "Yesp Studio", "Yesp One"],
      url: "https://yesp.space",
      logo: {
        "@type": "ImageObject",
        url: "https://accounts.yesp.space/logo.png",
        width: 200,
        height: 200,
      },
      founder: {
        "@type": "Person",
        name: "Srinithin Somasundaram",
        url: "https://yesp.space",
      },
      foundingDate: "2023",
      description:
        "Yesp Corporation builds modern SaaS products including CRM, ERP, identity management, and productivity tools for businesses worldwide.",
      areaServed: [
        { "@type": "Country", name: "India" },
        { "@type": "Country", name: "United States" },
        { "@type": "Country", name: "United Kingdom" },
        { "@type": "Country", name: "Australia" },
        { "@type": "Country", name: "Singapore" },
        { "@type": "Country", name: "Canada" },
        { "@type": "Country", name: "United Arab Emirates" },
      ],
      knowsAbout: ["CRM", "ERP", "Identity Management", "SaaS", "Cloud Software"],
      sameAs: [
        "https://yesp.space",
        "https://app.yesp.space",
        "https://auth.yesp.space",
        "https://accounts.yesp.space",
      ],
    },
    {
      "@type": "WebApplication",
      "@id": "https://accounts.yesp.space/#webapp",
      name: "Yesp Accounts",
      url: "https://accounts.yesp.space",
      description:
        "Secure identity and access management console for all Yesp products. Manage profile, organizations, sessions, MFA, passkeys, and security settings.",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      creator: { "@id": "https://yesp.space/#organization" },
      featureList: [
        "Multi-factor authentication",
        "Passkey support",
        "Organization management",
        "Session management",
        "Enterprise SSO",
        "Account security audit",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://accounts.yesp.space/#website",
      url: "https://accounts.yesp.space",
      name: "Yesp Accounts",
      description: "Identity & Access Management Console by Yesp Corporation",
      publisher: { "@id": "https://yesp.space/#organization" },
      inLanguage: "en",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="geo.region"    content="IN" />
        <meta name="geo.placename" content="India" />
        <meta name="geo.position"  content="20.5937;78.9629" />
        <meta name="ICBM"          content="20.5937, 78.9629" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
