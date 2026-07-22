import { supabase } from "@/lib/supabase";
import type { SedeId } from "@/lib/sede";
import { seleccionarTodo } from "@/lib/seleccionarTodo";

/** Stock teórico por producto para una sede: Σ inventario_mov − Σ ventas. Nunca se guarda, siempre al vuelo. */
export async function calcularStockSede(
  sede: SedeId
): Promise<Record<number, number>> {
  const [movs, ventas] = await Promise.all([
    seleccionarTodo<{ producto_id: number; cantidad: number }>((desde, hasta) =>
      supabase
        .from("inventario_mov")
        .select("producto_id, cantidad")
        .eq("sede", sede)
        .range(desde, hasta)
    ),
    seleccionarTodo<{ producto_id: number | null; cantidad: number }>((desde, hasta) =>
      supabase
        .from("ventas")
        .select("producto_id, cantidad")
        .eq("sede", sede)
        .eq("tipo", "bebida")
        .range(desde, hasta)
    ),
  ]);

  const stock: Record<number, number> = {};
  for (const m of movs) {
    stock[m.producto_id] = (stock[m.producto_id] ?? 0) + m.cantidad;
  }
  for (const v of ventas) {
    if (v.producto_id == null) continue;
    stock[v.producto_id] = (stock[v.producto_id] ?? 0) - v.cantidad;
  }
  return stock;
}

/**
 * Productos que alguna vez recibieron inventario en esta sede (inicial, entrada
 * o ajuste), sin restar ventas. Sirve para saber qué productos "son de aquí",
 * distinto del stock actual que puede llegar a 0 por ventas normales.
 */
export async function productosAsignadosSede(sede: SedeId): Promise<Set<number>> {
  const data = await seleccionarTodo<{ producto_id: number; cantidad: number }>(
    (desde, hasta) =>
      supabase
        .from("inventario_mov")
        .select("producto_id, cantidad")
        .eq("sede", sede)
        .range(desde, hasta)
  );

  const asignado: Record<number, number> = {};
  for (const m of data) {
    asignado[m.producto_id] = (asignado[m.producto_id] ?? 0) + m.cantidad;
  }
  return new Set(
    Object.entries(asignado)
      .filter(([, total]) => total > 0)
      .map(([id]) => Number(id))
  );
}
