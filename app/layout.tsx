import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
