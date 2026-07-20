"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { guardarSede, SEDES, type SedeId } from "@/lib/sede";
import { useSedeActual } from "@/lib/useSede";

export default function SeleccionarSedePage() {
  const router = useRouter();
  const sede = useSedeActual();

  useEffect(() => {
    if (sede) router.replace("/vender");
  }, [sede, router]);

  function elegir(id: SedeId) {
    guardarSede(id);
    router.replace("/vender");
  }

  if (sede) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-bold text-center">¿En qué sede estás?</h1>
      <div className="flex w-full max-w-sm flex-col gap-4">
        {SEDES.map((s) => (
          <button
            key={s.id}
            onClick={() => elegir(s.id)}
            className="min-h-14 rounded-2xl bg-blue-600 text-white text-2xl font-bold shadow active:bg-blue-700"
          >
            {s.nombre}
          </button>
        ))}
      </div>
    </main>
  );
}
