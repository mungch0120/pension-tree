import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pension Tree 🌳",
  description: "개인 투자 포트폴리오 관리 & 분석",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${geist.className} antialiased bg-gray-50 min-h-screen`}>
        <div className="flex h-screen">
          {/* Desktop sidebar */}
          <Sidebar />
          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>
        </div>
        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50">
          <div className="flex justify-around py-2">
            <NavItem href="/" icon="📊" label="대시보드" />
            <NavItem href="/portfolio" icon="💼" label="포트폴리오" />
            <NavItem href="/performance" icon="📈" label="수익률" />
            <NavItem href="/transactions" icon="📋" label="매매내역" />
            <NavItem href="/settings" icon="⚙️" label="설정" />
          </div>
        </nav>
      </body>
    </html>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a
      href={href}
      className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-gray-900 transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-[10px]">{label}</span>
    </a>
  );
}
