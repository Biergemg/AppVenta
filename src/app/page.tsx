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
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--surface)] p-6">
      <div className="w-full max-w-sm">
        <div className="mb-7 text-center">
          <p className="mb-2 text-sm font-bold text-[var(--primary-strong)]">
            POS Evento
          </p>
          <h1 className="page-title text-3xl">¿En qué sede estás?</h1>
          <p className="mt-2 text-base font-medium text-[var(--muted)]">
            Elige una vez. La app lo recuerda en este celular.
          </p>
        </div>

        <div className="flex w-full flex-col gap-4">
          {SEDES.map((s) => (
            <button
              key={s.id}
              onClick={() => elegir(s.id)}
              className="primary-action min-h-20 rounded-3xl px-5 text-2xl font-black"
            >
              {s.nombre}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
