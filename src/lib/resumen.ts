import { supabase } from "@/lib/supabase";
import { SEDES, type SedeId } from "@/lib/sede";
import { redondearDinero } from "@/lib/dinero";
import { seleccionarTodo } from "@/lib/seleccionarTodo";

type ProductoRanking = { producto_id: number; nombre: string; cantidad: number };
type FilaInventario = {
  producto_id: number;
  nombre: string;
  sede: SedeId;
  stock: number;
  inicial: number;
};
type BarraHora = { hora: string; total: number };

export type ResumenData = {
  ventaTotal: number;
  gananciaTotal: number;
  porSede: Record<SedeId, { venta: number; ganancia: number }>;
  porTipo: { bebida: number; inflable: number };
  rankingTodo: ProductoRanking[];
  rankingUltimaHora: ProductoRanking[];
  inventario: FilaInventario[];
  ventasPorHora: BarraHora[];
  inflable: {
    ninosAtendidos: number;
    ingresoTotal: number;
    porSede: Record<SedeId, number>;
  };
};

/** Todo se calcula al vuelo a partir de las tablas crudas — nunca se guardan totales. */
export async function calcularResumen(): Promise<ResumenData> {
  const [v, prods, movimientos, tiemposRows] = await Promise.all([
    seleccionarTodo<{
      sede: SedeId;
      tipo: string;
      producto_id: number | null;
      cantidad: number;
      precio_unit: number;
      costo_unit: number;
      total: number;
      ts: string;
    }>((desde, hasta) =>
      supabase
        .from("ventas")
        .select("sede, tipo, producto_id, cantidad, precio_unit, costo_unit, total, ts")
        .range(desde, hasta)
    ),
    seleccionarTodo<{ id: number; nombre: string; activo: boolean }>((desde, hasta) =>
      supabase.from("productos").select("id, nombre, activo").range(desde, hasta)
    ),
    seleccionarTodo<{
      producto_id: number;
      sede: SedeId;
      tipo: string;
      cantidad: number;
    }>((desde, hasta) =>
      supabase
        .from("inventario_mov")
        .select("producto_id, sede, tipo, cantidad")
        .range(desde, hasta)
    ),
    seleccionarTodo<{ sede: SedeId }>((desde, hasta) =>
      supabase.from("tiempos").select("sede").range(desde, hasta)
    ),
  ]);

  const nombrePorId = new Map(prods.map((p) => [p.id, p.nombre]));

  let ventaTotal = 0;
  let gananciaTotal = 0;
  const porSede: Record<number, { venta: number; ganancia: number }> = {
    1: { venta: 0, ganancia: 0 },
    2: { venta: 0, ganancia: 0 },
  };
  const porTipo = { bebida: 0, inflable: 0 };
  const cantidadPorProducto = new Map<number, number>();
  const cantidadPorProductoUltimaHora = new Map<number, number>();
  const ventasPorHoraMap = new Map<string, number>();
  const ingresoInflablePorSede: Record<number, number> = { 1: 0, 2: 0 };

  const haceUnaHora = Date.now() - 60 * 60 * 1000;

  for (const row of v) {
    const totalFila = redondearDinero(row.total);
    const ganancia = redondearDinero((row.precio_unit - row.costo_unit) * row.cantidad);
    ventaTotal = redondearDinero(ventaTotal + totalFila);
    gananciaTotal = redondearDinero(gananciaTotal + ganancia);
    porSede[row.sede].venta = redondearDinero(porSede[row.sede].venta + totalFila);
    porSede[row.sede].ganancia = redondearDinero(
      porSede[row.sede].ganancia + ganancia
    );
    porTipo[row.tipo as "bebida" | "inflable"] = redondearDinero(
      porTipo[row.tipo as "bebida" | "inflable"] + totalFila
    );

    if (row.tipo === "bebida" && row.producto_id != null) {
      cantidadPorProducto.set(
        row.producto_id,
        (cantidadPorProducto.get(row.producto_id) ?? 0) + row.cantidad
      );
      if (new Date(row.ts).getTime() >= haceUnaHora) {
        cantidadPorProductoUltimaHora.set(
          row.producto_id,
          (cantidadPorProductoUltimaHora.get(row.producto_id) ?? 0) + row.cantidad
        );
      }
    }

    if (row.tipo === "inflable") {
      ingresoInflablePorSede[row.sede] = redondearDinero(
        (ingresoInflablePorSede[row.sede] ?? 0) + totalFila
      );
    }

    const clave = formatearHoraLocal(row.ts);
    ventasPorHoraMap.set(
      clave,
      redondearDinero((ventasPorHoraMap.get(clave) ?? 0) + totalFila)
    );
  }

  const aRanking = (mapa: Map<number, number>): ProductoRanking[] =>
    [...mapa.entries()]
      .map(([producto_id, cantidad]) => ({
        producto_id,
        nombre: nombrePorId.get(producto_id) ?? "?",
        cantidad,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);

  const stockMap = new Map<string, number>();
  const inicialMap = new Map<string, number>();
  for (const m of movimientos) {
    const key = `${m.producto_id}-${m.sede}`;
    stockMap.set(key, (stockMap.get(key) ?? 0) + m.cantidad);
    if (m.tipo === "inicial") {
      inicialMap.set(key, (inicialMap.get(key) ?? 0) + m.cantidad);
    }
  }
  for (const row of v) {
    if (row.tipo !== "bebida" || row.producto_id == null) continue;
    const key = `${row.producto_id}-${row.sede}`;
    stockMap.set(key, (stockMap.get(key) ?? 0) - row.cantidad);
  }

  const inventario: FilaInventario[] = [];
  for (const p of prods) {
    for (const s of SEDES) {
      const key = `${p.id}-${s.id}`;
      inventario.push({
        producto_id: p.id,
        nombre: p.nombre,
        sede: s.id,
        stock: stockMap.get(key) ?? 0,
        inicial: inicialMap.get(key) ?? 0,
      });
    }
  }

  const ventasPorHora = [...ventasPorHoraMap.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-12)
    .map(([hora, total]) => ({ hora, total }));

  return {
    ventaTotal,
    gananciaTotal,
    porSede: porSede as Record<SedeId, { venta: number; ganancia: number }>,
    porTipo,
    rankingTodo: aRanking(cantidadPorProducto),
    rankingUltimaHora: aRanking(cantidadPorProductoUltimaHora),
    inventario,
    ventasPorHora,
    inflable: {
      ninosAtendidos: tiemposRows.length,
      ingresoTotal: porTipo.inflable,
      porSede: ingresoInflablePorSede as Record<SedeId, number>,
    },
  };
}

function formatearHoraLocal(ts: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    hour: "2-digit",
    hour12: false,
  }).format(new Date(ts));
}
