import { supabase } from "@/lib/supabase";
import type { SedeId } from "@/lib/sede";

export type Tiempo = {
  id: number;
  sede: SedeId;
  nino: string;
  responsable: string;
  inicio: string;
  minutos: number;
  estado: "activo" | "terminado";
  ts: string;
};

export async function listarTiemposActivos(): Promise<Tiempo[]> {
  const { data, error } = await supabase
    .from("tiempos")
    .select("*")
    .eq("estado", "activo");
  if (error) throw error;
  return (data ?? []) as Tiempo[];
}

/** Crea el timer y, aparte, registra el cobro (dos pasos: el timer arranca
 * aunque el registro del cobro falle por red — no debe impedir que el niño
 * empiece a jugar). */
export async function registrarNino(input: {
  sede: SedeId;
  nino: string;
  responsable: string;
  minutos: number;
  precio: number;
  pagoCon: number;
}): Promise<Tiempo> {
  const { data: tiempo, error } = await supabase
    .from("tiempos")
    .insert({
      sede: input.sede,
      nino: input.nino,
      responsable: input.responsable,
      inicio: new Date().toISOString(),
      minutos: input.minutos,
      estado: "activo",
    })
    .select()
    .single();
  if (error) throw error;

  const { error: errorVenta } = await supabase.from("ventas").insert({
    sede: input.sede,
    tipo: "inflable",
    producto_id: null,
    cantidad: 1,
    precio_unit: input.precio,
    costo_unit: 0,
    total: input.precio,
    pago_con: input.pagoCon,
    cambio: input.pagoCon - input.precio,
    metodo: "efectivo",
    tiempo_id: tiempo.id,
  });
  if (errorVenta) throw errorVenta;

  return tiempo as Tiempo;
}

/** Extiende el timer ya activo y cobra la extensión. */
export async function extenderTiempo(input: {
  tiempo: Tiempo;
  minutosExtra: number;
  precio: number;
  pagoCon: number;
}): Promise<void> {
  const { error: errorUpdate } = await supabase
    .from("tiempos")
    .update({ minutos: input.tiempo.minutos + input.minutosExtra })
    .eq("id", input.tiempo.id);
  if (errorUpdate) throw errorUpdate;

  const { error: errorVenta } = await supabase.from("ventas").insert({
    sede: input.tiempo.sede,
    tipo: "inflable",
    producto_id: null,
    cantidad: 1,
    precio_unit: input.precio,
    costo_unit: 0,
    total: input.precio,
    pago_con: input.pagoCon,
    cambio: input.pagoCon - input.precio,
    metodo: "efectivo",
    tiempo_id: input.tiempo.id,
  });
  if (errorVenta) throw errorVenta;
}

export async function terminarTiempo(id: number): Promise<void> {
  const { error } = await supabase
    .from("tiempos")
    .update({ estado: "terminado" })
    .eq("id", id);
  if (error) throw error;
}
