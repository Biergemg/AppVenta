"use client";

import { useState } from "react";

export default function Corte({ teorico }: { teorico: number }) {
  const [contadoTexto, setContadoTexto] = useState("");

  const contado = Number(contadoTexto) || 0;
  const tieneContado = contadoTexto.trim() !== "";
  const diferencia = contado - teorico;

  return (
    <section className="rounded-2xl border p-4 flex flex-col gap-3">
      <h2 className="font-semibold">Corte de caja</h2>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-zinc-600">¿Cuánto contaste físicamente?</span>
        <input
          inputMode="decimal"
          value={contadoTexto}
          onChange={(e) => setContadoTexto(e.target.value)}
          placeholder="$0"
          className="min-h-14 rounded-xl border px-4 text-2xl tabular-nums text-center"
        />
      </label>

      {tieneContado && (
        <div className={`rounded-2xl p-4 text-center ${diferencia >= 0 ? "bg-green-50" : "bg-red-50"}`}>
          <p className="text-zinc-600">Diferencia</p>
          <p
            className={`text-3xl font-extrabold tabular-nums ${
              diferencia >= 0 ? "text-green-700" : "text-red-700"
            }`}
          >
            {diferencia >= 0 ? "+" : ""}
            ${diferencia.toFixed(2)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {diferencia === 0 ? "Cuadra exacto" : diferencia > 0 ? "Sobra dinero" : "Falta dinero"}
          </p>
        </div>
      )}
    </section>
  );
}
