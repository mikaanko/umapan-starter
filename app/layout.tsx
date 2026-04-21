import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "うまパン予約システム",
  description: "パン屋向け予約システムの雛形",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
