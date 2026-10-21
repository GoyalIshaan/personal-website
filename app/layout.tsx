import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const viewport: Viewport = { themeColor: "#101010" };
export const metadata: Metadata = {
 metadataBase: new URL("https://www.ishaangoyal.com/"),
 title: { default: "Ishaan Goyal", template: "%s — Ishaan Goyal" },
 description: "Ishaan Goyal builds ML systems and developer tools: on-device inference, compiler research, GPU kernels, and coding-agent workflows. Computer science at UIUC.",
 openGraph: { title: "Ishaan Goyal", description: "ML systems and developer tools, from on-device audio inference to compiler research and coding-agent workflows.", url: "https://www.ishaangoyal.com/", type: "website" },
 icons: { icon: "/favicon.svg" },
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
 return <html lang="en"><body><div className="code-background" aria-hidden="true" />{children}<Script src="/portfolio-rain.js" strategy="afterInteractive" /></body></html>;
}
