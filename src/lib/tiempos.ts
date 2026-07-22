import { supabase } from "@/lib/supabase";
import type { SedeId } from "@/lib/sede";
import { redondearDinero } from "@/lib/dinero";

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

  const precio = redondearDinero(input.precio);
  const pagoCon = redondearDinero(input.pagoCon);
  const { error: errorVenta } = await supabase.from("ventas").insert({
    sede: input.sede,
    tipo: "inflable",
    producto_id: null,
    cantidad: 1,
    precio_unit: precio,
    costo_unit: 0,
    total: precio,
    pago_con: pagoCon,
    cambio: redondearDinero(pagoCon - precio),
    metodo: "efectivo",
    tiempo_id: tiempo.id,
  });
  if (errorVenta) {
    await supabase.from("tiempos").delete().eq("id", tiempo.id);
    throw errorVenta;
  }

  return tiempo as Tiempo;
}

/** Extiende el timer ya activo y cobra la extensión. */
export async function extenderTiempo(input: {
  tiempo: Tiempo;
  minutosExtra: number;
  precio: number;
  pagoCon: number;
}): Promise<void> {
  const { data: actual, error: errorLectura } = await supabase
    .from("tiempos")
    .select("minutos, estado")
    .eq("id", input.tiempo.id)
    .single();
  if (errorLectura) throw errorLectura;
  if (actual.estado !== "activo") {
    throw new Error("Este niño ya salió. Actualiza la pantalla.");
  }

  const minutosNuevos = actual.minutos + input.minutosExtra;
  const { error: errorUpdate } = await supabase
    .from("tiempos")
    .update({ minutos: minutosNuevos })
    .eq("id", input.tiempo.id);
  if (errorUpdate) throw errorUpdate;

  const precio = redondearDinero(input.precio);
  const pagoCon = redondearDinero(input.pagoCon);
  const { error: errorVenta } = await supabase.from("ventas").insert({
    sede: input.tiempo.sede,
    tipo: "inflable",
    producto_id: null,
    cantidad: 1,
    precio_unit: precio,
    costo_unit: 0,
    total: precio,
    pago_con: pagoCon,
    cambio: redondearDinero(pagoCon - precio),
    metodo: "efectivo",
    tiempo_id: input.tiempo.id,
  });
  if (errorVenta) {
    await supabase
      .from("tiempos")
      .update({ minutos: actual.minutos })
      .eq("id", input.tiempo.id);
    throw errorVenta;
  }
}

export async function terminarTiempo(id: number): Promise<void> {
  const { error } = await supabase
    .from("tiempos")
    .update({ estado: "terminado" })
    .eq("id", id);
  if (error) throw error;
}
