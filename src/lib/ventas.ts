import { supabase } from "@/lib/supabase";
import type { SedeId } from "@/lib/sede";
import type { Producto } from "@/lib/productos";
import { redondearDinero, sumarDinero } from "@/lib/dinero";

export type LineaTicket = {
  producto: Producto;
  cantidad: number;
};

export function totalTicket(items: LineaTicket[]): number {
  return sumarDinero(
    items.map((it) => redondearDinero(it.producto.precio_venta * it.cantidad))
  );
}

/** Guarda toda la venta (una fila por producto del ticket) en un solo INSERT atómico. */
export async function registrarVenta(input: {
  sede: SedeId;
  items: LineaTicket[];
  pagoCon: number;
}): Promise<{ total: number; cambio: number }> {
  const total = totalTicket(input.items);
  const pagoCon = redondearDinero(input.pagoCon);
  const cambio = redondearDinero(pagoCon - total);

  const filas = input.items.map((it) => ({
    sede: input.sede,
    tipo: "bebida" as const,
    producto_id: it.producto.id,
    cantidad: it.cantidad,
    precio_unit: it.producto.precio_venta,
    costo_unit: it.producto.costo_compra,
    total: redondearDinero(it.producto.precio_venta * it.cantidad),
    pago_con: pagoCon,
    cambio,
    metodo: "efectivo",
  }));

  const { error } = await supabase.from("ventas").insert(filas);
  if (error) throw error;

  return { total, cambio };
}
