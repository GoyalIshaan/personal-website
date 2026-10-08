import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const viewport: Viewport = { themeColor: "#101010" };
export const metadata: Metadata = {
 metadataBase: new URL("https://www.ishaangoyal.com/"),
 title: { default: "Ishaan Goyal", template: "%s — Ishaan Goyal" },
 description: "Computer science at UIUC. ML systems, compilers, GPU kernels, and developer tools.",
 openGraph: { title: "Ishaan Goyal", description: "ML systems, compilers, GPU kernels, and developer tools.", url: "https://www.ishaangoyal.com/", type: "website" },
 icons: { icon: "/favicon.svg" },
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
 return <html lang="en"><body><div className="code-background" aria-hidden="true" />{children}<Script src="/portfolio-rain.js" strategy="afterInteractive" /></body></html>;
}
