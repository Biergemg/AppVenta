"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { nombreSede } from "@/lib/sede";
import { useSedeActual } from "@/lib/useSede";

export default function SedeGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const sede = useSedeActual();

  useEffect(() => {
    if (sede === null) router.replace("/");
  }, [sede, router]);

  if (!sede) return null;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface)] pb-20">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-white/95 px-4 py-3 backdrop-blur">
        <div className="app-page flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase text-[var(--muted)]">Mi sede</p>
            <p className="text-base font-black text-[var(--foreground)]">{nombreSede(sede)}</p>
          </div>
          <div className="rounded-full bg-[var(--success-soft)] px-3 py-1 text-xs font-black text-[var(--primary-strong)]">
            Sede activa
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
