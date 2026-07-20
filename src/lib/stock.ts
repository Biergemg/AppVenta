import { supabase } from "@/lib/supabase";
import type { SedeId } from "@/lib/sede";

/** Stock teórico por producto para una sede: Σ inventario_mov − Σ ventas. Nunca se guarda, siempre al vuelo. */
export async function calcularStockSede(
  sede: SedeId
): Promise<Record<number, number>> {
  const [{ data: movs, error: errorMovs }, { data: ventas, error: errorVentas }] =
    await Promise.all([
      supabase.from("inventario_mov").select("producto_id, cantidad").eq("sede", sede),
      supabase
        .from("ventas")
        .select("producto_id, cantidad")
        .eq("sede", sede)
        .eq("tipo", "bebida"),
    ]);
  if (errorMovs) throw errorMovs;
  if (errorVentas) throw errorVentas;

  const stock: Record<number, number> = {};
  for (const m of movs ?? []) {
    stock[m.producto_id] = (stock[m.producto_id] ?? 0) + m.cantidad;
  }
  for (const v of ventas ?? []) {
    if (v.producto_id == null) continue;
    stock[v.producto_id] = (stock[v.producto_id] ?? 0) - v.cantidad;
  }
  return stock;
}
