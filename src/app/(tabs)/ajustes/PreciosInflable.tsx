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
    <section className="section-panel flex flex-col gap-3 p-4">
      <h2 className="text-lg font-black">Precios del inflable</h2>
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
      setMensaje({ tipo: "ok", texto: "Guardado" });
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
    <div className={`soft-panel p-3 ${precio.activo ? "" : "opacity-60"}`}>
      <p className="mb-2 font-black">{precio.minutos} min</p>
      <div className="flex gap-2">
        <input
          inputMode="decimal"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Sin definir"
          className="min-h-14 flex-1 rounded-2xl border px-3 tabular-nums"
        />
        <button
          onClick={guardar}
          disabled={guardando}
          className="primary-action min-h-14 rounded-2xl px-4 font-black disabled:opacity-50"
        >
          Guardar
        </button>
      </div>
      {mensaje && (
        <p
          className={`mt-1 text-sm font-bold ${
            mensaje.tipo === "ok" ? "text-green-700" : "text-red-700"
          }`}
        >
          {mensaje.texto}
        </p>
      )}
      <button
        onClick={toggleActivo}
        className="mt-2 min-h-14 w-full rounded-2xl border border-zinc-300 bg-white text-sm font-black"
      >
        {precio.activo ? "Desactivar" : "Activar"}
      </button>
    </div>
  );
}
