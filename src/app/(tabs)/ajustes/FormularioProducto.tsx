"use client";

import { useState } from "react";
import { SEDES } from "@/lib/sede";
import { crearProducto } from "@/lib/productos";

export default function FormularioProducto({
  onGuardado,
}: {
  onGuardado: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [costo, setCosto] = useState("");
  const [precio, setPrecio] = useState("");
  const [stockA, setStockA] = useState("");
  const [stockB, setStockB] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(
    null
  );

  const costoNum = Number(costo) || 0;
  const precioNum = Number(precio) || 0;
  const ganancia = precioNum - costoNum;
  const margen = precioNum > 0 ? (ganancia / precioNum) * 100 : 0;

  async function guardar() {
    if (!nombre.trim()) {
      setMensaje({ tipo: "error", texto: "Ponle un nombre al producto." });
      return;
    }
    if (precioNum <= 0) {
      setMensaje({ tipo: "error", texto: "El precio de venta debe ser mayor a 0." });
      return;
    }
    setGuardando(true);
    setMensaje(null);
    try {
      await crearProducto({
        nombre: nombre.trim(),
        costo: costoNum,
        precio: precioNum,
        stockA: Number(stockA) || 0,
        stockB: Number(stockB) || 0,
      });
      setMensaje({ tipo: "ok", texto: `✓ "${nombre.trim()}" guardado` });
      setNombre("");
      setCosto("");
      setPrecio("");
      setStockA("");
      setStockB("");
      onGuardado();
    } catch {
      setMensaje({ tipo: "error", texto: "Sin internet o error al guardar. Reintenta." });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="rounded-2xl border p-4 flex flex-col gap-3">
      <h2 className="font-semibold">Nuevo producto</h2>

      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre (ej. Coca-Cola 600ml)"
        className="min-h-14 rounded-xl border px-4 text-lg"
      />

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">Costo de compra</span>
          <input
            inputMode="decimal"
            value={costo}
            onChange={(e) => setCosto(e.target.value)}
            placeholder="$0"
            className="min-h-14 rounded-xl border px-4 text-lg tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">Precio de venta</span>
          <input
            inputMode="decimal"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="$0"
            className="min-h-14 rounded-xl border px-4 text-lg tabular-nums"
          />
        </label>
      </div>

      <div className="rounded-xl bg-zinc-50 p-3 text-center">
        <p className="text-sm text-zinc-600">Ganancia por pieza</p>
        <p
          className={`text-2xl font-bold tabular-nums ${
            ganancia > 0
              ? "text-green-700"
              : ganancia < 0
                ? "text-red-700"
                : "text-zinc-400"
          }`}
        >
          ${ganancia.toFixed(2)} ({margen.toFixed(0)}%)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">Stock inicial {SEDES[0].nombre}</span>
          <input
            inputMode="numeric"
            value={stockA}
            onChange={(e) => setStockA(e.target.value)}
            placeholder="0"
            className="min-h-14 rounded-xl border px-4 text-lg tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">Stock inicial {SEDES[1].nombre}</span>
          <input
            inputMode="numeric"
            value={stockB}
            onChange={(e) => setStockB(e.target.value)}
            placeholder="0"
            className="min-h-14 rounded-xl border px-4 text-lg tabular-nums"
          />
        </label>
      </div>

      {mensaje && (
        <p
          className={
            mensaje.tipo === "ok"
              ? "text-green-700 font-semibold"
              : "text-red-700 font-semibold"
          }
        >
          {mensaje.texto}
        </p>
      )}

      <button
        onClick={guardar}
        disabled={guardando}
        className="min-h-14 rounded-2xl bg-blue-600 text-white text-lg font-bold disabled:opacity-50"
      >
        {guardando ? "Guardando…" : "Guardar producto"}
      </button>
    </section>
  );
}
