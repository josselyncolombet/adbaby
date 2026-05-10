import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://activedirectorybaby.xyz"),
  title: {
    default: "Ad baby",
    template: "%s · Ad baby",
  },
  description:
    "Cours et exercices Active Directory + PowerShell calibrés sur l'épreuve E7 du BTS SIO SISR. AD simulé dans le navigateur, validation instantanée.",
  applicationName: "Ad baby",
  openGraph: {
    type: "website",
    title: "Ad baby — Active Directory pour BTS SIO SISR",
    description:
      "Active Directory + PowerShell. AD simulé dans le navigateur, validation instantanée.",
    siteName: "Ad baby",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ad baby — Active Directory pour BTS SIO SISR",
    description:
      "Active Directory + PowerShell. AD simulé dans le navigateur, validation instantanée.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${mono.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
