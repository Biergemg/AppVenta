"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ReceiptText, Settings, Timer, WalletCards } from "lucide-react";

const TABS = [
  { href: "/vender", label: "Vender", Icon: ReceiptText },
  { href: "/inflable", label: "Inflable", Icon: Timer },
  { href: "/resumen", label: "Resumen", Icon: BarChart3 },
  { href: "/caja", label: "Caja", Icon: WalletCards },
  { href: "/ajustes", label: "Ajustes", Icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--line)] bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_24px_oklch(0.18_0.025_245_/_0.08)] backdrop-blur">
      <div className="mx-auto flex max-w-[760px]">
      {TABS.map((tab) => {
        const activo = pathname === tab.href;
        const Icon = tab.Icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-xs font-bold ${
              activo
                ? "bg-[var(--blue-soft)] text-[var(--blue)]"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
            style={{ minHeight: 56 }}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                activo ? "bg-[var(--blue)] text-white" : "bg-zinc-100 text-zinc-500"
              }`}
            >
              <Icon size={15} strokeWidth={2.8} />
            </span>
            {tab.label}
          </Link>
        );
      })}
      </div>
    </nav>
  );
}
