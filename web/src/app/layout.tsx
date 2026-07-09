import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "拟市 ClonePM · 娱乐版预测市场",
  description:
    "用虚拟积分跟随真实预测市场行情下注的娱乐模拟盘。非真实交易，与 Polymarket 无关联。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg pb-14 sm:pb-0">
        <TopBar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border bg-surface">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-ink-muted">
            <p>
              <span className="font-medium text-ink-secondary">拟市 ClonePM</span> ·
              娱乐性质模拟盘，所有积分均为虚拟，<strong className="text-ink-secondary">非真实交易</strong>。
            </p>
            <p>行情数据仅作展示用途，与 Polymarket 官方无任何关联，不构成任何投资建议。</p>
          </div>
        </footer>
        <BottomNav />
      </body>
    </html>
  );
}
