"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { LineaTicket } from "@/lib/ventas";

export default function TicketBar({
  items,
  total,
  onCambiarCantidad,
  onCobrar,
}: {
  items: LineaTicket[];
  total: number;
  onCambiarCantidad: (productoId: number, delta: number) => void;
  onCobrar: () => void;
}) {
  const [abierto, setAbierto] = useState(false);

  if (items.length === 0) {
    return (
      <div className="sticky bottom-20 z-40 border-t border-[var(--line)] bg-white/95 p-4 text-center text-sm font-bold text-[var(--muted)] shadow-[0_-10px_24px_oklch(0.18_0.025_245_/_0.06)] backdrop-blur">
        Toca un producto para empezar la venta
      </div>
    );
  }

  const piezas = items.reduce((n, l) => n + l.cantidad, 0);

  return (
    <div className="sticky bottom-20 z-40 border-t border-[var(--line)] bg-white/95 shadow-[0_-14px_30px_oklch(0.18_0.025_245_/_0.10)] backdrop-blur">
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-out ${
          abierto ? "max-h-72" : "max-h-0"
        }`}
      >
        <div className="flex max-h-72 flex-col gap-2 overflow-y-auto p-3 pb-1">
          {items.map((l) => (
            <div
              key={l.producto.id}
              className="soft-panel flex items-center justify-between gap-2 px-2 py-2"
            >
              <span className="min-w-0 flex-1 truncate font-bold">{l.producto.nombre}</span>
              <button
                onClick={() => onCambiarCantidad(l.producto.id, -1)}
                className="h-14 w-14 shrink-0 rounded-2xl bg-white text-xl font-black shadow-sm"
              >
                -
              </button>
              <span className="w-7 text-center tabular-nums text-lg font-black">
                {l.cantidad}
              </span>
              <button
                onClick={() => onCambiarCantidad(l.producto.id, 1)}
                className="h-14 w-14 shrink-0 rounded-2xl bg-white text-xl font-black shadow-sm"
              >
                +
              </button>
              <span className="w-20 text-right tabular-nums font-black text-[var(--primary-strong)]">
                ${(l.producto.precio_venta * l.cantidad).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 p-3">
        <button
          onClick={() => setAbierto((v) => !v)}
          className="soft-panel flex min-h-16 flex-1 items-center justify-between gap-2 px-4"
        >
          <span className="text-left font-bold leading-tight">
            {piezas} {piezas === 1 ? "producto" : "productos"}
            <br />
            <span className="text-sm text-[var(--muted)]">
              {abierto ? "Ocultar ticket" : "Ver y ajustar"}
            </span>
          </span>
          {abierto ? <ChevronDown size={22} /> : <ChevronUp size={22} />}
        </button>

        <button
          onClick={onCobrar}
          className="primary-action flex min-h-16 flex-1 items-center justify-center gap-2 rounded-3xl text-xl font-black"
        >
          Cobrar · <span className="tabular-nums">${total.toFixed(2)}</span>
        </button>
      </div>
    </div>
  );
}
