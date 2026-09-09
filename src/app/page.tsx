import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield, Users, Grid, Zap, ArrowRight, ChevronRight,
  Headphones, Ticket, Linkedin, Twitter, Youtube, Instagram
} from "lucide-react";

const AUTH_URL    = (process.env.NEXT_PUBLIC_AUTH_URL    ?? "https://auth.yesp.space").replace(/\/$/, "");
const CONSOLE_URL = (process.env.NEXT_PUBLIC_CONSOLE_URL ?? "https://accounts.yesp.space").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Yesp Accounts — One account. Many possibilities.",
  description:
    "Your central identity for everything Yesp. Sign in once and access DeskPort, urpass, Yesp One, and Yesp Flow — manage your organisations and stay in control.",
  keywords: [
    "Yesp Accounts", "Yesp", "DeskPort", "urpass", "Yesp One", "Yesp Flow",
    "Single Sign-On", "Enterprise IAM", "Identity Provider", "Passkeys", "Organization Management"
  ],
  authors: [{ name: "Yesp Corporation" }],
  openGraph: {
    title: "Yesp Accounts — One account. Many possibilities.",
    description:
      "Your central identity for everything Yesp. Sign in once and access all your products, manage your organisations, and stay in control.",
    url: "https://accounts.yesp.space",
    siteName: "Yesp Accounts",
    images: [
      {
        url: "https://accounts.yesp.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "Yesp Accounts Identity Hub",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yesp Accounts — One account. Many possibilities.",
    description:
      "Your central identity for everything Yesp. Sign in once and access all your products.",
    images: ["https://accounts.yesp.space/og-image.png"],
  },
  other: {
    "geo.region": "IN-TN",
    "geo.placename": "Chennai, Tamil Nadu, India",
    "geo.position": "13.0827;80.2707",
    ICBM: "13.0827, 80.2707",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Yesp Accounts",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://accounts.yesp.space",
  description:
    "Centralized identity platform for Yesp products including DeskPort, urpass, Yesp One, and Yesp Flow.",
  author: {
    "@type": "Organization",
    name: "Yesp Corporation",
    url: "https://yespstudio.com",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group">
            <span className="text-lg sm:text-2xl font-black text-blue-600 tracking-tight">yesp.</span>
            <span className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">Accounts</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-xs sm:text-sm font-medium text-slate-600">
            <a href="#products" className="hover:text-blue-600 transition-colors">Products</a>
            <a href="#solutions" className="hover:text-blue-600 transition-colors">Solutions</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href={`${AUTH_URL}/auth/login`}
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors px-2 py-1"
            >
              Sign in
            </Link>
            <Link
              href={`${AUTH_URL}/auth/register`}
              className="px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:scale-[1.02]"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ─── Hero Section ────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-28 bg-gradient-to-b from-blue-50/60 via-blue-50/30 to-white">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

              {/* Left Column: Hero Text */}
              <div className="lg:col-span-5 text-left space-y-3.5 sm:space-y-6">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-600 animate-fade-slide-up anim-d1">
                  YESP ACCOUNTS
                </span>

                <h1 className="text-2xl sm:text-4xl lg:text-[56px] font-black text-slate-900 tracking-tight leading-snug sm:leading-[1.1] animate-fade-slide-up anim-d2">
                  One account. <br className="hidden sm:inline" />
                  <span className="text-blue-600">Many possibilities.</span>
                </h1>

                <p className="text-xs sm:text-base lg:text-lg text-slate-600 leading-normal sm:leading-relaxed font-normal max-w-lg animate-fade-slide-up anim-d3">
                  Your central identity for everything Yesp. Sign in once and access all your products, manage your organisations, and stay in control — all in one place.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4 animate-fade-slide-up anim-d4">
                  <Link
                    href={`${AUTH_URL}/auth/register`}
                    className="px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group hover:scale-[1.02]"
                  >
                    Create your Yesp account
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link
                    href={`${AUTH_URL}/auth/login`}
                    className="px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 hover:border-blue-300 shadow-sm transition-all text-center"
                  >
                    Sign in
                  </Link>
                </div>
              </div>

              {/* Right Column: Floating Interactive Mock UI Preview */}
              <div className="lg:col-span-7 relative animate-fade-slide-up anim-d5">
                {/* Decorative background glow */}
                <div className="absolute -top-10 -right-10 w-64 h-64 sm:w-96 sm:h-96 bg-blue-400/20 blur-[80px] sm:blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 sm:w-80 sm:h-80 bg-indigo-400/15 blur-[60px] sm:blur-[90px] rounded-full pointer-events-none" />

                {/* Console Preview Card */}
                <div className="relative rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xl sm:shadow-2xl shadow-blue-500/10 overflow-hidden transform lg:rotate-1 hover:rotate-0 transition-transform duration-500">
                  {/* Top App Header inside card */}
                  <div className="px-3.5 py-2.5 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base sm:text-lg font-black text-blue-600">yesp.</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] sm:text-xs font-semibold text-slate-700">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-600 text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center">
                        AS
                      </div>
                      <span>Alex Smith</span>
                      <ChevronRight size={11} className="rotate-90 text-slate-400" />
                    </div>
                  </div>

                  {/* Body inside Card */}
                  <div className="grid grid-cols-12 min-h-[260px] sm:min-h-[380px]">
                    {/* Inner Sidebar */}
                    <div className="col-span-3 border-r border-slate-100 p-2 sm:p-3 space-y-1 bg-slate-50/30 text-[11px] sm:text-xs font-medium text-slate-600 hidden sm:block">
                      <div className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-blue-50 text-blue-600 font-semibold flex items-center gap-2">
                        <Grid size={13} /> Home
                      </div>
                      <div className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg hover:bg-slate-100/70 flex items-center gap-2">
                        <Users size={13} /> Organizations
                      </div>
                      <div className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg hover:bg-slate-100/70 flex items-center gap-2">
                        <Grid size={13} /> Products
                      </div>
                      <div className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg hover:bg-slate-100/70 flex items-center gap-2">
                        <Shield size={13} /> Security
                      </div>
                    </div>

                    {/* Inner Content Area */}
                    <div className="col-span-12 sm:col-span-9 p-3.5 sm:p-6 space-y-3.5 sm:space-y-5 bg-white">
                      <div>
                        <h3 className="text-sm sm:text-lg font-bold text-slate-900">Welcome back, Alex</h3>
                        <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Manage your organizations and access your Yesp products.</p>
                      </div>

                      {/* Your Organizations */}
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between text-[11px] sm:text-xs">
                          <span className="font-semibold text-slate-700">Your organizations</span>
                          <span className="text-blue-600 font-medium cursor-pointer">View all</span>
                        </div>

                        {/* Org 1 */}
                        <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl border border-slate-100 hover:border-slate-200 flex items-center justify-between bg-slate-50/30">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-blue-900 text-white font-bold text-[10px] sm:text-xs flex items-center justify-center">
                              Y
                            </div>
                            <div>
                              <p className="text-[11px] sm:text-xs font-semibold text-slate-900">Yesp Technologies</p>
                              <p className="text-[9px] sm:text-[10px] text-slate-400">24 members • Organization</p>
                            </div>
                          </div>
                          <ChevronRight size={12} className="text-slate-400" />
                        </div>
                      </div>

                      {/* Your Products Grid */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] sm:text-xs font-semibold text-slate-700 block">Your products</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {/* DeskPort */}
                          <div className="p-2 rounded-lg sm:rounded-xl border border-slate-100 bg-slate-50/50 flex sm:block items-center justify-between sm:space-y-1.5">
                            <div className="flex items-center gap-2 sm:block">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                <Headphones size={11} />
                              </div>
                              <div>
                                <p className="text-[10px] sm:text-[11px] font-bold text-slate-900 leading-tight">DeskPort</p>
                                <p className="text-[9px] text-slate-400 leading-tight hidden sm:block mt-0.5">Support & Engagement</p>
                              </div>
                            </div>
                            <span className="text-[8px] sm:text-[9px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Coming Soon</span>
                          </div>

                          {/* urpass */}
                          <div className="p-2 rounded-lg sm:rounded-xl border border-slate-100 bg-slate-50/50 flex sm:block items-center justify-between sm:space-y-1.5">
                            <div className="flex items-center gap-2 sm:block">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                <Ticket size={11} />
                              </div>
                              <div>
                                <p className="text-[10px] sm:text-[11px] font-bold text-slate-900 leading-tight">urpass</p>
                                <p className="text-[9px] text-slate-400 leading-tight hidden sm:block mt-0.5">Passes & Ticketing</p>
                              </div>
                            </div>
                            <span className="text-[8px] sm:text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Live</span>
                          </div>

                          {/* Yesp One */}
                          <div className="p-2 rounded-lg sm:rounded-xl border border-slate-100 bg-slate-50/50 flex sm:block items-center justify-between sm:space-y-1.5">
                            <div className="flex items-center gap-2 sm:block">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
                                <Grid size={11} />
                              </div>
                              <div>
                                <p className="text-[10px] sm:text-[11px] font-bold text-slate-900 leading-tight">Yesp One</p>
                                <p className="text-[9px] text-slate-400 leading-tight hidden sm:block mt-0.5">Digital Workspace</p>
                              </div>
                            </div>
                            <span className="text-[8px] sm:text-[9px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Coming Soon</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─── Why Yesp Accounts Section ────────────────────────────────────── */}
        <section id="solutions" className="py-10 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-600">
              WHY YESP ACCOUNTS
            </span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 mb-8 sm:mb-16">
              Built for you. Designed for scale.
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {/* Feature 1 */}
              <div className="text-left space-y-2.5 sm:space-y-4 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-blue-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 animate-fade-slide-up anim-d1">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center">
                  <Shield size={20} className="sm:hidden" />
                  <Shield size={24} className="hidden sm:block" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Secure & Trusted</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-normal sm:leading-relaxed">
                  Enterprise-grade security to keep your data and identity safe with WebAuthn Passkeys and zero-trust verification.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-left space-y-2.5 sm:space-y-4 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-blue-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 animate-fade-slide-up anim-d2">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center">
                  <Users size={20} className="sm:hidden" />
                  <Users size={24} className="hidden sm:block" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Manage Organisations</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-normal sm:leading-relaxed">
                  Switch between your organisations or create new ones with ease. Manage team roles and member permissions.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-left space-y-2.5 sm:space-y-4 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-blue-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 animate-fade-slide-up anim-d3">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center">
                  <Grid size={20} className="sm:hidden" />
                  <Grid size={24} className="hidden sm:block" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Access All Products</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-normal sm:leading-relaxed">
                  One account. All Yesp products including DeskPort, urpass, Yesp One, and Yesp Flow. No more multiple logins.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="text-left space-y-2.5 sm:space-y-4 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-blue-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 animate-fade-slide-up anim-d4">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center">
                  <Zap size={20} className="sm:hidden" />
                  <Zap size={24} className="hidden sm:block" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Simple & Seamless</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-normal sm:leading-relaxed">
                  Get started in minutes and focus on what matters with frictionless cross-domain single sign-on.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Products Detail Section ─────────────────────────────────────── */}
        <section id="products" className="py-10 sm:py-20 bg-slate-50/50 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-600">
                OUR PRODUCT ECOSYSTEM
              </span>
              <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Designed for Enterprise Growth
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
              {/* Product Card 1 */}
              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 animate-fade-slide-up anim-d1">
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <Ticket size={18} />
                  </div>
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    LIVE
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-base sm:text-lg">urpass</h4>
                <p className="text-xs text-slate-500 mt-1 leading-normal sm:leading-relaxed">
                  Event Passes & Digital Ticketing Platform for modern experiences.
                </p>
              </div>

              {/* Product Card 2 */}
              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 animate-fade-slide-up anim-d2">
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <Headphones size={18} />
                  </div>
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-100 text-amber-700">
                    COMING SOON
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-base sm:text-lg">DeskPort</h4>
                <p className="text-xs text-slate-500 mt-1 leading-normal sm:leading-relaxed">
                  Support & Customer Engagement virtual desktop platform.
                </p>
              </div>

              {/* Product Card 3 */}
              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 animate-fade-slide-up anim-d3">
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    <Grid size={18} />
                  </div>
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-100 text-amber-700">
                    COMING SOON
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-base sm:text-lg">Yesp One</h4>
                <p className="text-xs text-slate-500 mt-1 leading-normal sm:leading-relaxed">
                  Unified India & UK Digital Workspace for enterprise collaboration.
                </p>
              </div>

              {/* Product Card 4 */}
              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 animate-fade-slide-up anim-d4">
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                    <Zap size={18} />
                  </div>
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-blue-100 text-blue-700">
                    CONNECTING SOON
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-base sm:text-lg">Yesp Flow</h4>
                <p className="text-xs text-slate-500 mt-1 leading-normal sm:leading-relaxed">
                  Automated workflows, integrations, and business process orchestration.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CTA Banner ─────────────────────────────────────────────────── */}
        <section className="py-10 sm:py-16 bg-blue-600 text-white">
          <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 text-center space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Ready to get started with Yesp Accounts?
            </h2>
            <p className="text-blue-100 text-xs sm:text-base max-w-xl mx-auto">
              Create your account in seconds and gain instant access to all Yesp enterprise products.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-2.5 sm:gap-4 pt-2">
              <Link
                href={`${AUTH_URL}/auth/register`}
                className="px-5 py-2.5 sm:px-8 sm:py-3.5 rounded-lg sm:rounded-xl font-semibold bg-white text-blue-600 hover:bg-blue-50 transition-all shadow-md text-xs sm:text-sm"
              >
                Create your Yesp account →
              </Link>
              <Link
                href={`${CONSOLE_URL}/console`}
                className="px-5 py-2.5 sm:px-8 sm:py-3.5 rounded-lg sm:rounded-xl font-semibold bg-blue-700 hover:bg-blue-800 text-white transition-all text-xs sm:text-sm"
              >
                Launch Console
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-100 py-6 sm:py-10 text-slate-500 text-[11px] sm:text-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-black text-blue-600">yesp.</span>
            <span className="text-slate-400 font-medium text-[11px] sm:text-xs">Make Better Happen.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-slate-600">
            <Link href="/help" className="hover:text-blue-600 transition-colors">Help Center</Link>
            <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
            <div className="flex items-center gap-3 text-slate-400 sm:pl-4 sm:border-l sm:border-slate-200">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                <Linkedin size={14} />
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                <Twitter size={14} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                <Youtube size={14} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                <Instagram size={14} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
