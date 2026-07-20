import { supabase } from "@/lib/supabase";
import type { SedeId } from "@/lib/sede";
import { redondearDinero } from "@/lib/dinero";

export type EfectivoTeorico = {
  fondos: number;
  ventasEfectivo: number;
  ventasBebida: number;
  ventasInflable: number;
  retiros: number;
  total: number;
};

export async function registrarMovCaja(input: {
  sede: SedeId;
  tipo: "fondo" | "retiro";
  monto: number;
  nota?: string;
}): Promise<void> {
  const { error } = await supabase.from("caja_mov").insert({
    sede: input.sede,
    tipo: input.tipo,
    monto: redondearDinero(input.monto),
    nota: input.nota ?? null,
  });
  if (error) throw error;
}

/** Efectivo teórico = fondos + ventas en efectivo − retiros. Siempre al vuelo. */
export async function calcularEfectivoTeorico(sede: SedeId): Promise<EfectivoTeorico> {
  const [{ data: movs, error: e1 }, { data: ventas, error: e2 }] = await Promise.all([
    supabase.from("caja_mov").select("tipo, monto").eq("sede", sede),
    supabase
      .from("ventas")
      .select("tipo, total")
      .eq("sede", sede)
      .eq("metodo", "efectivo"),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;

  let fondos = 0;
  let retiros = 0;
  for (const m of movs ?? []) {
    if (m.tipo === "fondo") fondos = redondearDinero(fondos + m.monto);
    else retiros = redondearDinero(retiros + m.monto);
  }

  let ventasBebida = 0;
  let ventasInflable = 0;
  for (const v of ventas ?? []) {
    if (v.tipo === "bebida") ventasBebida = redondearDinero(ventasBebida + v.total);
    else ventasInflable = redondearDinero(ventasInflable + v.total);
  }
  const ventasEfectivo = redondearDinero(ventasBebida + ventasInflable);

  return {
    fondos,
    ventasEfectivo,
    ventasBebida,
    ventasInflable,
    retiros,
    total: redondearDinero(fondos + ventasEfectivo - retiros),
  };
}
