"use client";

import { useCallback, useEffect, useState } from "react";
import { nombreSede, SEDES } from "@/lib/sede";
import { calcularResumen, type ResumenData } from "@/lib/resumen";

const INTERVALO_MS = 12000;

export default function ResumenPage() {
  const [datos, setDatos] = useState<ResumenData | null>(null);
  const [error, setError] = useState("");

  const cargar = useCallback(() => {
    calcularResumen()
      .then((d) => {
        setDatos(d);
        setError("");
      })
      .catch(() => setError("Sin internet. Reintentando…"));
  }, []);

  useEffect(() => {
    cargar();
    const id = setInterval(cargar, INTERVALO_MS);
    return () => clearInterval(id);
  }, [cargar]);

  if (!datos) {
    return (
      <main className="p-4">
        <p className="text-zinc-500">{error || "Cargando resumen…"}</p>
      </main>
    );
  }

  const maxHora = Math.max(1, ...datos.ventasPorHora.map((h) => h.total));

  return (
    <main className="flex flex-col gap-6 p-4 pb-8">
      <h1 className="text-xl font-bold">Resumen</h1>
      {error && <p className="text-red-700 text-sm">{error}</p>}

      <section className="rounded-2xl border p-4 grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-sm text-zinc-500">Venta total</p>
          <p className="text-3xl font-extrabold tabular-nums text-green-700">
            ${datos.ventaTotal.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-sm text-zinc-500">Ganancia</p>
          <p className="text-3xl font-extrabold tabular-nums text-blue-700">
            ${datos.gananciaTotal.toFixed(2)}
          </p>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-2 text-sm text-zinc-600 tabular-nums">
          <p>
            {SEDES[0].nombre}: ${datos.porSede[1].venta.toFixed(2)}
          </p>
          <p>
            {SEDES[1].nombre}: ${datos.porSede[2].venta.toFixed(2)}
          </p>
          <p>Bebidas: ${datos.porTipo.bebida.toFixed(2)}</p>
          <p>Inflable: ${datos.porTipo.inflable.toFixed(2)}</p>
        </div>
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-2">Ranking de productos</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-zinc-500 mb-1">Todo el evento</p>
            <RankingLista items={datos.rankingTodo} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Última hora</p>
            <RankingLista items={datos.rankingUltimaHora} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-2">Inventario teórico</h2>
        <div className="flex flex-col gap-1">
          {datos.inventario.length === 0 && (
            <p className="text-zinc-500 text-sm">Sin productos todavía.</p>
          )}
          {datos.inventario.map((f) => {
            const pct = f.inicial > 0 ? f.stock / f.inicial : null;
            const color =
              f.stock <= 0
                ? "text-red-700 font-bold"
                : pct !== null && pct < 0.15
                  ? "text-yellow-700 font-bold"
                  : "text-zinc-800";
            return (
              <div key={`${f.producto_id}-${f.sede}`} className="flex justify-between text-sm">
                <span>
                  {f.nombre} — {nombreSede(f.sede)}
                </span>
                <span className={`tabular-nums ${color}`}>{f.stock}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-2">Ventas por hora</h2>
        {datos.ventasPorHora.length === 0 ? (
          <p className="text-zinc-500 text-sm">Todavía no hay ventas.</p>
        ) : (
          <div className="flex items-end gap-2 h-24">
            {datos.ventasPorHora.map((h) => (
              <div key={h.hora} className="flex-1 flex flex-col items-center justify-end gap-1">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${Math.max(4, (h.total / maxHora) * 80)}px` }}
                />
                <span className="text-[10px] text-zinc-500 tabular-nums">
                  {h.hora.slice(11, 13)}h
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-2">Inflable</h2>
        <p className="tabular-nums">
          Niños atendidos: <strong>{datos.inflable.ninosAtendidos}</strong>
        </p>
        <p className="tabular-nums">
          Ingreso total: <strong>${datos.inflable.ingresoTotal.toFixed(2)}</strong>
        </p>
        <p className="text-sm text-zinc-600 tabular-nums">
          {SEDES[0].nombre}: ${datos.inflable.porSede[1].toFixed(2)} · {SEDES[1].nombre}: $
          {datos.inflable.porSede[2].toFixed(2)}
        </p>
      </section>
    </main>
  );
}

function RankingLista({ items }: { items: { nombre: string; cantidad: number }[] }) {
  if (items.length === 0) {
    return <p className="text-zinc-400 text-sm">Sin ventas</p>;
  }
  return (
    <ol className="flex flex-col gap-1 text-sm">
      {items.slice(0, 5).map((it, i) => (
        <li key={it.nombre + i} className="flex justify-between gap-2">
          <span className="truncate">
            {i + 1}. {it.nombre}
          </span>
          <span className="tabular-nums font-semibold">{it.cantidad}</span>
        </li>
      ))}
    </ol>
  );
}
