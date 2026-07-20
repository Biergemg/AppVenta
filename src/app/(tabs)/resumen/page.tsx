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
      .catch(() => setError("Sin internet. Reintentando..."));
  }, []);

  useEffect(() => {
    cargar();
    const id = setInterval(cargar, INTERVALO_MS);
    return () => clearInterval(id);
  }, [cargar]);

  if (!datos) {
    return (
      <main className="app-page p-4">
        <p className="section-panel p-4 font-bold text-[var(--muted)]">
          {error || "Cargando resumen..."}
        </p>
      </main>
    );
  }

  const maxHora = Math.max(1, ...datos.ventasPorHora.map((h) => h.total));

  return (
    <main className="app-page flex flex-col gap-5 p-4 pb-8">
      <div className="pt-1">
        <h1 className="page-title">Resumen</h1>
        <p className="mt-1 text-sm font-medium text-[var(--muted)]">
          Ventas, ganancia, stock e inflable.
        </p>
      </div>

      {error && (
        <p className="rounded-2xl bg-[var(--danger-soft)] p-3 text-sm font-bold text-red-800">
          {error}
        </p>
      )}

      <section className="section-panel grid grid-cols-2 gap-4 p-5 text-center">
        <div>
          <p className="mini-label">Venta total</p>
          <p className="text-4xl font-black tabular-nums text-[var(--primary-strong)]">
            ${datos.ventaTotal.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="mini-label">Ganancia</p>
          <p className="text-4xl font-black tabular-nums text-[var(--blue)]">
            ${datos.gananciaTotal.toFixed(2)}
          </p>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-2 text-sm font-semibold text-[var(--muted)] tabular-nums">
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

      <section className="section-panel p-4">
        <h2 className="mb-3 text-lg font-black">Ranking de productos</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mini-label mb-1 text-xs">Todo el evento</p>
            <RankingLista items={datos.rankingTodo} />
          </div>
          <div>
            <p className="mini-label mb-1 text-xs">Ultima hora</p>
            <RankingLista items={datos.rankingUltimaHora} />
          </div>
        </div>
      </section>

      <section className="section-panel p-4">
        <h2 className="mb-3 text-lg font-black">Inventario teorico</h2>
        <div className="flex flex-col gap-2">
          {datos.inventario.length === 0 && (
            <p className="text-sm font-bold text-[var(--muted)]">Sin productos todavia.</p>
          )}
          {datos.inventario.map((f) => {
            const pct = f.inicial > 0 ? f.stock / f.inicial : null;
            const color =
              f.stock <= 0
                ? "text-red-700 font-black"
                : pct !== null && pct < 0.15
                  ? "text-yellow-800 font-black"
                  : "text-zinc-800 font-bold";
            return (
              <div
                key={`${f.producto_id}-${f.sede}`}
                className="soft-panel flex justify-between gap-3 px-3 py-2 text-sm"
              >
                <span className="min-w-0 truncate">
                  {f.nombre} - {nombreSede(f.sede)}
                </span>
                <span className={`tabular-nums ${color}`}>{f.stock}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section-panel p-4">
        <h2 className="mb-3 text-lg font-black">Ventas por hora</h2>
        {datos.ventasPorHora.length === 0 ? (
          <p className="text-sm font-bold text-[var(--muted)]">Todavia no hay ventas.</p>
        ) : (
          <div className="flex h-24 items-end gap-2">
            {datos.ventasPorHora.map((h) => (
              <div key={h.hora} className="flex flex-1 flex-col items-center justify-end gap-1">
                <div
                  className="w-full rounded-t bg-[var(--blue)]"
                  style={{ height: `${Math.max(4, (h.total / maxHora) * 80)}px` }}
                />
                <span className="text-[10px] text-zinc-500 tabular-nums">{h.hora}h</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section-panel p-4">
        <h2 className="mb-3 text-lg font-black">Inflable</h2>
        <p className="tabular-nums">
          Niños atendidos: <strong>{datos.inflable.ninosAtendidos}</strong>
        </p>
        <p className="tabular-nums">
          Ingreso total: <strong>${datos.inflable.ingresoTotal.toFixed(2)}</strong>
        </p>
        <p className="text-sm font-semibold text-[var(--muted)] tabular-nums">
          {SEDES[0].nombre}: ${datos.inflable.porSede[1].toFixed(2)} ·{" "}
          {SEDES[1].nombre}: ${datos.inflable.porSede[2].toFixed(2)}
        </p>
      </section>
    </main>
  );
}

function RankingLista({ items }: { items: { nombre: string; cantidad: number }[] }) {
  if (items.length === 0) {
    return <p className="text-sm font-bold text-[var(--muted)]">Sin ventas</p>;
  }
  return (
    <ol className="flex flex-col gap-2 text-sm">
      {items.slice(0, 5).map((it, i) => (
        <li key={it.nombre + i} className="soft-panel flex justify-between gap-2 px-3 py-2">
          <span className="truncate">
            {i + 1}. {it.nombre}
          </span>
          <span className="tabular-nums font-black">{it.cantidad}</span>
        </li>
      ))}
    </ol>
  );
}
