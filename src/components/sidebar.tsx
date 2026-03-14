"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "📊", label: "대시보드" },
  { href: "/portfolio", icon: "💼", label: "포트폴리오" },
  { href: "/performance", icon: "📈", label: "수익률" },
  { href: "/transactions", icon: "📋", label: "매매내역" },
  { href: "/settings", icon: "⚙️", label: "설정" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-56 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900">
          🌳 Pension Tree
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">포트폴리오 관리</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="text-xs text-gray-400">
          한국투자증권 OpenAPI
        </div>
      </div>
    </aside>
  );
}
