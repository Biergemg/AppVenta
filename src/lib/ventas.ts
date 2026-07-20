import { supabase } from "@/lib/supabase";
import type { SedeId } from "@/lib/sede";
import type { Producto } from "@/lib/productos";

export type LineaTicket = {
  producto: Producto;
  cantidad: number;
};

export function totalTicket(items: LineaTicket[]): number {
  return items.reduce((acc, it) => acc + it.producto.precio_venta * it.cantidad, 0);
}

/** Guarda toda la venta (una fila por producto del ticket) en un solo INSERT atómico. */
export async function registrarVenta(input: {
  sede: SedeId;
  items: LineaTicket[];
  pagoCon: number;
}): Promise<{ total: number; cambio: number }> {
  const total = totalTicket(input.items);
  const cambio = input.pagoCon - total;

  const filas = input.items.map((it) => ({
    sede: input.sede,
    tipo: "bebida" as const,
    producto_id: it.producto.id,
    cantidad: it.cantidad,
    precio_unit: it.producto.precio_venta,
    costo_unit: it.producto.costo_compra,
    total: it.producto.precio_venta * it.cantidad,
    pago_con: input.pagoCon,
    cambio,
    metodo: "efectivo",
  }));

  const { error } = await supabase.from("ventas").insert(filas);
  if (error) throw error;

  return { total, cambio };
}
