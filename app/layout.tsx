import type { Metadata } from "next";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ishaangoyal.com/"),
  title: { default: "Ishaan Goyal", template: "%s — Ishaan Goyal" },
  description:
    "Ishaan Goyal builds ML systems and developer tools: on-device inference, compiler research, GPU kernels, and coding-agent workflows. Computer science at UIUC.",
  openGraph: {
    title: "Ishaan Goyal",
    description:
      "ML systems and developer tools, from on-device audio inference to compiler research and coding-agent workflows.",
    url: "https://www.ishaangoyal.com/",
    type: "website",
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light">
          <div className="site-theme-control">
            <ModeToggle />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
