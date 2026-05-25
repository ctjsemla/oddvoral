import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { BulletinProvider } from "@/providers/BulletinProvider";
import { t } from "@/lib/i18n/en-IN";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDescription,
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo.svg", type: "image/svg+xml", sizes: "48x48" },
    ],
    apple: [{ url: "/logo.svg", type: "image/svg+xml", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <BulletinProvider>{children}</BulletinProvider>
      </body>
    </html>
  );
}
