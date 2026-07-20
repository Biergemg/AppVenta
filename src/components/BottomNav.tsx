"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/vender", label: "Vender" },
  { href: "/inflable", label: "Inflable" },
  { href: "/resumen", label: "Resumen" },
  { href: "/caja", label: "Caja" },
  { href: "/ajustes", label: "Ajustes" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t bg-white">
      {TABS.map((tab) => {
        const activo = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center justify-center py-2 text-sm font-semibold ${
              activo ? "text-blue-600" : "text-zinc-500"
            }`}
            style={{ minHeight: 56 }}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
