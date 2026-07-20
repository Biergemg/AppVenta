import { supabase } from "@/lib/supabase";

export type PrecioInflable = {
  id: number;
  minutos: number;
  precio: number | null;
  activo: boolean;
};

export async function listarPreciosInflable(): Promise<PrecioInflable[]> {
  const { data, error } = await supabase
    .from("precios_inflable")
    .select("*")
    .order("minutos", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function actualizarPrecioInflable(
  id: number,
  precio: number
): Promise<void> {
  const { error } = await supabase
    .from("precios_inflable")
    .update({ precio })
    .eq("id", id);
  if (error) throw error;
}

export async function actualizarActivoPrecioInflable(
  id: number,
  activo: boolean
): Promise<void> {
  const { error } = await supabase
    .from("precios_inflable")
    .update({ activo })
    .eq("id", id);
  if (error) throw error;
}
