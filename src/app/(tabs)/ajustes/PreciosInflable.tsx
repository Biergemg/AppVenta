"use client";

import { useState } from "react";
import {
  actualizarActivoPrecioInflable,
  actualizarPrecioInflable,
  type PrecioInflable,
} from "@/lib/preciosInflable";

export default function PreciosInflable({
  precios,
  onCambio,
}: {
  precios: PrecioInflable[];
  onCambio: () => void;
}) {
  return (
    <section className="rounded-2xl border p-4 flex flex-col gap-3">
      <h2 className="font-semibold">Precios del inflable</h2>
      {precios.map((p) => (
        <FilaPrecio key={p.id} precio={p} onCambio={onCambio} />
      ))}
    </section>
  );
}

function FilaPrecio({
  precio,
  onCambio,
}: {
  precio: PrecioInflable;
  onCambio: () => void;
}) {
  const [valor, setValor] = useState(precio.precio != null ? String(precio.precio) : "");
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    const num = Number(valor);
    if (!num || num <= 0) return;
    setGuardando(true);
    try {
      await actualizarPrecioInflable(precio.id, num);
      onCambio();
    } finally {
      setGuardando(false);
    }
  }

  async function toggleActivo() {
    await actualizarActivoPrecioInflable(precio.id, !precio.activo);
    onCambio();
  }

  return (
    <div className={`flex items-center gap-3 ${precio.activo ? "" : "opacity-50"}`}>
      <span className="w-16 font-semibold">{precio.minutos} min</span>
      <input
        inputMode="decimal"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder="Sin definir"
        className="flex-1 min-h-12 rounded-lg border px-3 tabular-nums"
      />
      <button
        onClick={guardar}
        disabled={guardando}
        className="min-h-12 px-4 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50"
      >
        Guardar
      </button>
      <button
        onClick={toggleActivo}
        className="min-h-12 px-3 rounded-lg border border-zinc-300 text-sm font-semibold whitespace-nowrap"
      >
        {precio.activo ? "Desactivar" : "Activar"}
      </button>
    </div>
  );
}
