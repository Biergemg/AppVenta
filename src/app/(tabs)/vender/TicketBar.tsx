"use client";

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
  if (items.length === 0) {
    return (
      <div className="sticky bottom-14 z-40 border-t bg-white p-3 text-center text-zinc-400">
        Toca un producto para empezar la venta
      </div>
    );
  }

  return (
    <div className="sticky bottom-14 z-40 border-t bg-white p-3 flex flex-col gap-2 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="max-h-40 overflow-y-auto flex flex-col gap-2">
        {items.map((l) => (
          <div key={l.producto.id} className="flex items-center justify-between gap-2">
            <span className="flex-1 font-semibold truncate">{l.producto.nombre}</span>
            <button
              onClick={() => onCambiarCantidad(l.producto.id, -1)}
              className="w-10 h-10 rounded-lg bg-zinc-100 text-xl font-bold"
            >
              −
            </button>
            <span className="w-6 text-center tabular-nums font-semibold">{l.cantidad}</span>
            <button
              onClick={() => onCambiarCantidad(l.producto.id, 1)}
              className="w-10 h-10 rounded-lg bg-zinc-100 text-xl font-bold"
            >
              +
            </button>
            <span className="w-16 text-right tabular-nums font-semibold">
              ${(l.producto.precio_venta * l.cantidad).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={onCobrar}
        className="min-h-14 rounded-2xl bg-blue-600 text-white text-lg font-bold flex items-center justify-center gap-2"
      >
        Cobrar · <span className="tabular-nums">${total.toFixed(2)}</span>
      </button>
    </div>
  );
}
