"use client";

import { useEffect, useState } from "react";
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
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(
    null
  );

  useEffect(() => {
    if (!mensaje) return;
    const t = setTimeout(() => setMensaje(null), 2500);
    return () => clearTimeout(t);
  }, [mensaje]);

  async function guardar() {
    const num = Number(valor);
    if (!num || num <= 0) {
      setMensaje({ tipo: "error", texto: "Pon un precio mayor a 0." });
      return;
    }
    setGuardando(true);
    try {
      await actualizarPrecioInflable(precio.id, num);
      setMensaje({ tipo: "ok", texto: "✓ Guardado" });
      onCambio();
    } catch {
      setMensaje({ tipo: "error", texto: "Sin internet. Reintenta." });
    } finally {
      setGuardando(false);
    }
  }

  async function toggleActivo() {
    try {
      await actualizarActivoPrecioInflable(precio.id, !precio.activo);
      onCambio();
    } catch {
      setMensaje({ tipo: "error", texto: "Sin internet. Reintenta." });
    }
  }

  return (
    <div className={`rounded-xl border p-3 ${precio.activo ? "" : "opacity-50"}`}>
      <p className="font-semibold mb-2">{precio.minutos} min</p>
      <div className="flex gap-2">
        <input
          inputMode="decimal"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Sin definir"
          className="flex-1 min-h-14 rounded-lg border px-3 tabular-nums"
        />
        <button
          onClick={guardar}
          disabled={guardando}
          className="min-h-14 px-4 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50"
        >
          Guardar
        </button>
      </div>
      {mensaje && (
        <p
          className={`text-sm font-semibold mt-1 ${
            mensaje.tipo === "ok" ? "text-green-700" : "text-red-700"
          }`}
        >
          {mensaje.texto}
        </p>
      )}
      <button
        onClick={toggleActivo}
        className="mt-2 w-full min-h-14 rounded-lg border border-zinc-300 text-sm font-semibold"
      >
        {precio.activo ? "Desactivar" : "Activar"}
      </button>
    </div>
  );
}
