import { supabase } from "@/lib/supabase";
import type { SedeId } from "@/lib/sede";

export type Producto = {
  id: number;
  nombre: string;
  precio_venta: number;
  costo_compra: number;
  activo: boolean;
  creado: string;
};

export async function listarProductos(): Promise<Producto[]> {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .order("creado", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function crearProducto(input: {
  nombre: string;
  costo: number;
  precio: number;
  stockA: number;
  stockB: number;
}): Promise<Producto> {
  const { data: producto, error } = await supabase
    .from("productos")
    .insert({
      nombre: input.nombre,
      costo_compra: input.costo,
      precio_venta: input.precio,
    })
    .select()
    .single();
  if (error) throw error;

  const { error: errorMov } = await supabase.from("inventario_mov").insert([
    { producto_id: producto.id, sede: 1, tipo: "inicial", cantidad: input.stockA },
    { producto_id: producto.id, sede: 2, tipo: "inicial", cantidad: input.stockB },
  ]);
  if (errorMov) {
    await supabase.from("productos").delete().eq("id", producto.id);
    throw errorMov;
  }

  return producto as Producto;
}

export async function actualizarProducto(
  id: number,
  cambios: Partial<Pick<Producto, "precio_venta" | "costo_compra" | "activo">>
): Promise<void> {
  const { error } = await supabase.from("productos").update(cambios).eq("id", id);
  if (error) throw error;
}

export async function borrarProducto(id: number): Promise<void> {
  const { count, error: errorVentas } = await supabase
    .from("ventas")
    .select("id", { count: "exact", head: true })
    .eq("producto_id", id);
  if (errorVentas) throw errorVentas;
  if (count && count > 0) {
    throw new Error(
      "Este producto ya tiene ventas registradas y no se puede borrar. Desactívalo en su lugar."
    );
  }

  const { error: errorMov } = await supabase
    .from("inventario_mov")
    .delete()
    .eq("producto_id", id);
  if (errorMov) throw errorMov;

  const { error } = await supabase.from("productos").delete().eq("id", id);
  if (error) throw error;
}

export async function entradaMercancia(input: {
  producto_id: number;
  sede: SedeId;
  cantidad: number;
}): Promise<void> {
  const { error } = await supabase.from("inventario_mov").insert({
    producto_id: input.producto_id,
    sede: input.sede,
    tipo: "entrada",
    cantidad: input.cantidad,
  });
  if (error) throw error;
}
