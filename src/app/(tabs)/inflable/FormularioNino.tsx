"use client";

import { useState } from "react";
import type { SedeId } from "@/lib/sede";
import type { PrecioInflable } from "@/lib/preciosInflable";
import { registrarNino } from "@/lib/tiempos";
import PantallaCobro from "@/components/PantallaCobro";

export default function FormularioNino({
  sede,
  precios,
  onRegistrado,
}: {
  sede: SedeId;
  precios: PrecioInflable[];
  onRegistrado: () => void;
}) {
  const [nino, setNino] = useState("");
  const [responsable, setResponsable] = useState("");
  const [duracion, setDuracion] = useState<PrecioInflable | null>(null);
  const [error, setError] = useState("");

  function elegirDuracion(p: PrecioInflable) {
    if (!p.precio) return;
    if (!nino.trim() || !responsable.trim()) {
      setError("Pon el nombre del niño y del responsable primero.");
      return;
    }
    setError("");
    setDuracion(p);
  }

  async function confirmarCobro(pagoCon: number) {
    if (!duracion || !duracion.precio) return;
    await registrarNino({
      sede,
      nino: nino.trim(),
      responsable: responsable.trim(),
      minutos: duracion.minutos,
      precio: duracion.precio,
      pagoCon,
    });
    setNino("");
    setResponsable("");
    setDuracion(null);
    onRegistrado();
  }

  return (
    <section className="section-panel flex flex-col gap-3 p-4">
      <h2 className="text-lg font-black">Registrar niño</h2>

      <input
        value={nino}
        onChange={(e) => setNino(e.target.value)}
        placeholder="Nombre del niño"
        className="min-h-14 rounded-2xl border px-4 text-lg font-semibold"
      />
      <input
        value={responsable}
        onChange={(e) => setResponsable(e.target.value)}
        placeholder="Responsable o telefono"
        className="min-h-14 rounded-2xl border px-4 text-lg font-semibold"
      />

      <div className="grid grid-cols-2 gap-2">
        {precios
          .filter((p) => p.activo)
          .map((p) => (
            <button
              key={p.id}
              onClick={() => elegirDuracion(p)}
              disabled={!p.precio}
              className={`flex min-h-20 flex-col items-center justify-center rounded-3xl text-lg font-black ${
                p.precio ? "primary-action" : "bg-zinc-200 text-zinc-400"
              }`}
            >
              <span>{p.minutos} min</span>
              <span className="text-sm tabular-nums">
                {p.precio ? `$${p.precio.toFixed(2)}` : "Falta precio"}
              </span>
            </button>
          ))}
      </div>

      {error && <p className="font-bold text-red-700">{error}</p>}

      {duracion && duracion.precio && (
        <PantallaCobro
          total={duracion.precio}
          onCancelar={() => setDuracion(null)}
          onConfirmar={confirmarCobro}
        />
      )}
    </section>
  );
}
