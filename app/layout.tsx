import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
import { cookies } from "next/headers";
import AccessibilityShell from "@/components/AccessibilityShell";
import { isLocale } from "@/frontend/i18n";
import { LOCALE_COOKIE } from "@/frontend/i18n/constants";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Proxima Gov — Digital Governance Initiative",
  description:
    "A citizen-first digital governance platform by the Government of India for Lok Sabha constituencies. " +
    "Submit issues, track MPLADS projects, and engage with your Member of Parliament.",
  keywords: [
    "Lok Sabha",
    "MPLADS",
    "digital governance",
    "citizen portal",
    "MP dashboard",
    "grievance redressal",
    "constituency development",
    "Proxima Gov",
  ],
  openGraph: {
    title: "Proxima Gov — Citizen & MP Digital Governance",
    description:
      "Bridging citizens and Lok Sabha MPs through transparent issue tracking, AI triage, and accountability.",
    type: "website",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#1e3a5f",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const lang = cookieLocale && isLocale(cookieLocale) ? cookieLocale : "en";

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} ${notoDevanagari.variable}`}
    >
      <body>
        <AccessibilityShell initialLocale={lang}>
          <main id="main-content">{children}</main>
        </AccessibilityShell>
      </body>
    </html>
  );
}
