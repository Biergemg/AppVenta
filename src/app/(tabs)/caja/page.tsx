"use client";

import { useCallback, useEffect, useState } from "react";
import { useSedeActual } from "@/lib/useSede";
import { nombreSede, type SedeId } from "@/lib/sede";
import { calcularEfectivoTeorico, type EfectivoTeorico } from "@/lib/caja";
import FormularioMovCaja from "./FormularioMovCaja";
import Corte from "./Corte";

const POLL_MS = 15000;

export default function CajaPage() {
  const sede = useSedeActual();
  const [miTeorico, setMiTeorico] = useState<EfectivoTeorico | null>(null);
  const [otroTeorico, setOtroTeorico] = useState<EfectivoTeorico | null>(null);
  const [formularioAbierto, setFormularioAbierto] = useState<"fondo" | "retiro" | null>(
    null
  );
  const [toast, setToast] = useState("");

  const otraSede: SedeId | null = sede ? (sede === 1 ? 2 : 1) : null;

  const cargar = useCallback(() => {
    if (!sede || !otraSede) return;
    calcularEfectivoTeorico(sede)
      .then(setMiTeorico)
      .catch(() => {});
    calcularEfectivoTeorico(otraSede)
      .then(setOtroTeorico)
      .catch(() => {});
  }, [sede, otraSede]);

  useEffect(() => {
    cargar();
    const id = setInterval(cargar, POLL_MS);
    return () => clearInterval(id);
  }, [cargar]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  if (!sede || !otraSede || !miTeorico) return null;

  return (
    <main className="flex flex-col gap-6 p-4 pb-8">
      <h1 className="text-xl font-bold">Caja</h1>

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-green-600 text-white px-4 py-2 font-semibold shadow-lg">
          {toast}
        </div>
      )}

      <section className="rounded-2xl border p-4 text-center">
        <p className="text-zinc-500">Debes tener en la caja</p>
        <p className="text-4xl font-extrabold tabular-nums text-green-700">
          ${miTeorico.total.toFixed(2)}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-zinc-600 tabular-nums">
          <p>Fondo: ${miTeorico.fondos.toFixed(2)}</p>
          <p>Retiros: −${miTeorico.retiros.toFixed(2)}</p>
          <p>Bebidas: ${miTeorico.ventasBebida.toFixed(2)}</p>
          <p>Inflable: ${miTeorico.ventasInflable.toFixed(2)}</p>
        </div>
      </section>

      {otroTeorico && (
        <p className="text-sm text-zinc-500 text-center">
          {nombreSede(otraSede)}: ${otroTeorico.total.toFixed(2)}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setFormularioAbierto("fondo")}
          className="min-h-14 rounded-2xl bg-blue-600 text-white font-bold"
        >
          Registrar fondo
        </button>
        <button
          onClick={() => setFormularioAbierto("retiro")}
          className="min-h-14 rounded-2xl border border-zinc-300 font-bold"
        >
          Retiro
        </button>
      </div>

      {formularioAbierto && (
        <FormularioMovCaja
          sede={sede}
          tipo={formularioAbierto}
          onCancelar={() => setFormularioAbierto(null)}
          onGuardado={() => {
            const tipo = formularioAbierto;
            setFormularioAbierto(null);
            setToast(tipo === "fondo" ? "✓ Fondo registrado" : "✓ Retiro registrado");
            cargar();
          }}
        />
      )}

      <Corte teorico={miTeorico.total} />
    </main>
  );
}
