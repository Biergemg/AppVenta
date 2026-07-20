"use client";

import { useState } from "react";

export default function Corte({ teorico }: { teorico: number }) {
  const [contadoTexto, setContadoTexto] = useState("");

  const contado = Number(contadoTexto) || 0;
  const tieneContado = contadoTexto.trim() !== "";
  const diferencia = contado - teorico;

  return (
    <section className="section-panel flex flex-col gap-3 p-4">
      <h2 className="text-lg font-black">Corte de caja</h2>
      <label className="flex flex-col gap-1">
        <span className="mini-label">¿Cuánto contaste físicamente?</span>
        <input
          inputMode="decimal"
          value={contadoTexto}
          onChange={(e) => setContadoTexto(e.target.value)}
          placeholder="$0"
          className="min-h-16 rounded-2xl border px-4 text-center text-2xl tabular-nums"
        />
      </label>

      {tieneContado && (
        <div
          className={`rounded-3xl p-4 text-center ${
            diferencia >= 0 ? "bg-[var(--success-soft)]" : "bg-[var(--danger-soft)]"
          }`}
        >
          <p className="mini-label">Diferencia</p>
          <p
            className={`text-3xl font-black tabular-nums ${
              diferencia >= 0 ? "text-green-700" : "text-red-700"
            }`}
          >
            {diferencia >= 0 ? "+" : ""}
            ${diferencia.toFixed(2)}
          </p>
          <p className="mt-1 text-xs font-bold text-[var(--muted)]">
            {diferencia === 0 ? "Cuadra exacto" : diferencia > 0 ? "Sobra dinero" : "Falta dinero"}
          </p>
        </div>
      )}
    </section>
  );
}
