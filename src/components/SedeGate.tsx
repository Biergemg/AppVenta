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
    <div className="flex min-h-screen flex-col pb-14">
      <header className="border-b bg-white px-4 py-2 text-sm font-semibold text-zinc-600">
        {nombreSede(sede)}
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
