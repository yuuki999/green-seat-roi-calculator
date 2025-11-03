import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://green-seat-roi-calculator.vercel.app"),
  title: "グリーン車通勤損益計算アプリ",
  description:
    "通勤時間を価値に変えて、グリーン車利用を賢く判断。時給・通勤時間・出社頻度から損益を可視化します。",
  openGraph: {
    title: "グリーン車通勤損益計算アプリ",
    description:
      "通勤時間を価値に変えて、グリーン車利用を賢く判断。副業時給3000円なら年間26万円得する計算🚄",
    url: "https://green-seat-roi-calculator.vercel.app",
    siteName: "グリーン車通勤損益計算アプリ",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "グリーン車通勤損益計算アプリ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "グリーン車通勤損益計算アプリ",
    description:
      "副業時給3000円なら年間26万円得する計算🚄 通勤時間を価値に変えて賢く判断",
    images: ["/opengraph-image"],
    creator: "@haru_tech9999",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-emerald-50/40 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
