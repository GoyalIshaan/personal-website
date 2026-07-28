import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(DATA.url),
  title: {
    default: DATA.name,
    template: `%s | ${DATA.name}`,
  },
  description:
    "ML systems engineer focused on inference, GPU kernels, and compilers.",
  openGraph: {
    title: `${DATA.name}`,
    description:
      "ML systems engineer focused on inference, GPU kernels, and compilers.",
    url: DATA.url,
    siteName: `${DATA.name}`,
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: `${DATA.name}`,
    description:
      "ML systems engineer focused on inference, GPU kernels, and compilers.",
    card: "summary_large_image",
  },
  verification: {
    google: "",
    yandex: "",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="mx-auto min-h-screen max-w-2xl overflow-x-clip bg-background px-4 pb-24 pt-8 font-sans antialiased sm:px-6 sm:pb-28 sm:pt-20"
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          <TooltipProvider delayDuration={0}>
            <Navbar />
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
