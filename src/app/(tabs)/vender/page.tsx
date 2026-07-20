"use client";

import { useCallback, useEffect, useState } from "react";
import { useSedeActual } from "@/lib/useSede";
import { listarProductos, type Producto } from "@/lib/productos";
import { calcularStockSede } from "@/lib/stock";
import { registrarVenta, totalTicket, type LineaTicket } from "@/lib/ventas";
import TicketBar from "./TicketBar";
import PantallaCobro from "@/components/PantallaCobro";

export default function VenderPage() {
  const sede = useSedeActual();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [stock, setStock] = useState<Record<number, number>>({});
  const [ticket, setTicket] = useState<LineaTicket[]>([]);
  const [cobroAbierto, setCobroAbierto] = useState(false);
  const [toast, setToast] = useState("");
  const [errorCarga, setErrorCarga] = useState("");
  const [cargado, setCargado] = useState(false);

  const cargar = useCallback(() => {
    if (!sede) return;
    listarProductos()
      .then((todos) => {
        setProductos(todos.filter((p) => p.activo).sort((a, b) => a.id - b.id));
        setErrorCarga("");
        setCargado(true);
      })
      .catch(() => setErrorCarga("Sin internet. Reintenta."));
    calcularStockSede(sede)
      .then(setStock)
      .catch(() => setErrorCarga("Sin internet. Reintenta."));
  }, [sede]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  function stockDisponible(producto: Producto): number {
    const enTicket = ticket.find((l) => l.producto.id === producto.id)?.cantidad ?? 0;
    return (stock[producto.id] ?? 0) - enTicket;
  }

  function agregar(producto: Producto) {
    if (stockDisponible(producto) <= 0) return;
    setTicket((actual) => {
      const existe = actual.find((l) => l.producto.id === producto.id);
      if (existe) {
        return actual.map((l) =>
          l.producto.id === producto.id ? { ...l, cantidad: l.cantidad + 1 } : l
        );
      }
      return [...actual, { producto, cantidad: 1 }];
    });
  }

  function cambiarCantidad(productoId: number, delta: number) {
    setTicket((actual) =>
      actual
        .map((l) => {
          if (l.producto.id !== productoId) return l;
          const nuevaCantidad = l.cantidad + delta;
          if (delta > 0 && nuevaCantidad > (stock[productoId] ?? 0)) return l;
          return { ...l, cantidad: nuevaCantidad };
        })
        .filter((l) => l.cantidad > 0)
    );
  }

  async function confirmarCobro(pagoCon: number) {
    if (!sede) return;
    const { total } = await registrarVenta({ sede, items: ticket, pagoCon });
    setToast(`✓ Venta guardada $${total.toFixed(2)}`);
    setTicket([]);
    setCobroAbierto(false);
    cargar();
  }

  if (!sede) return null;

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2 gap-3 p-4">
        {errorCarga && (
          <p className="col-span-2 text-red-700 font-semibold text-center py-8">
            {errorCarga}
          </p>
        )}
        {!errorCarga && cargado && productos.length === 0 && (
          <p className="col-span-2 text-zinc-500 text-center py-8">
            Todavía no hay productos. Dalos de alta en Ajustes.
          </p>
        )}
        {productos.map((p) => {
          const disponible = stockDisponible(p);
          const agotado = disponible <= 0;
          return (
            <button
              key={p.id}
              onClick={() => agregar(p)}
              disabled={agotado}
              className={`min-h-24 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 text-center ${
                agotado
                  ? "bg-zinc-200 text-zinc-400"
                  : "bg-blue-50 text-blue-900 active:bg-blue-100"
              }`}
            >
              <span className="font-bold text-lg leading-tight">{p.nombre}</span>
              <span className="text-xl font-extrabold tabular-nums">
                ${p.precio_venta.toFixed(2)}
              </span>
              <span className="text-xs tabular-nums">
                {agotado ? "Agotado" : `Quedan ${disponible}`}
              </span>
            </button>
          );
        })}
      </div>

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-green-600 text-white px-4 py-2 font-semibold shadow-lg">
          {toast}
        </div>
      )}

      <TicketBar
        items={ticket}
        total={totalTicket(ticket)}
        onCambiarCantidad={cambiarCantidad}
        onCobrar={() => setCobroAbierto(true)}
      />

      {cobroAbierto && (
        <PantallaCobro
          total={totalTicket(ticket)}
          onCancelar={() => setCobroAbierto(false)}
          onConfirmar={confirmarCobro}
        />
      )}
    </div>
  );
}
