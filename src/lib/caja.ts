import { supabase } from "@/lib/supabase";
import type { SedeId } from "@/lib/sede";
import { redondearDinero } from "@/lib/dinero";
import { seleccionarTodo } from "@/lib/seleccionarTodo";

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
  const [movs, ventas] = await Promise.all([
    seleccionarTodo<{ tipo: string; monto: number }>((desde, hasta) =>
      supabase.from("caja_mov").select("tipo, monto").eq("sede", sede).range(desde, hasta)
    ),
    seleccionarTodo<{ tipo: string; total: number }>((desde, hasta) =>
      supabase
        .from("ventas")
        .select("tipo, total")
        .eq("sede", sede)
        .eq("metodo", "efectivo")
        .range(desde, hasta)
    ),
  ]);

  let fondos = 0;
  let retiros = 0;
  for (const m of movs) {
    if (m.tipo === "fondo") fondos = redondearDinero(fondos + m.monto);
    else retiros = redondearDinero(retiros + m.monto);
  }

  let ventasBebida = 0;
  let ventasInflable = 0;
  for (const v of ventas) {
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
