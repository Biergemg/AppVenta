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
  const [errorCarga, setErrorCarga] = useState("");

  const otraSede: SedeId | null = sede ? (sede === 1 ? 2 : 1) : null;

  const cargar = useCallback(() => {
    if (!sede || !otraSede) return;
    calcularEfectivoTeorico(sede)
      .then((t) => {
        setMiTeorico(t);
        setErrorCarga("");
      })
      .catch(() => setErrorCarga("Sin internet. Reintenta."));
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

  if (!sede || !otraSede) return null;

  if (!miTeorico) {
    return (
    <main className="app-page flex flex-col gap-4 p-4">
        <h1 className="page-title">Caja</h1>
        <p className={errorCarga ? "text-red-700 font-semibold" : "text-zinc-500"}>
          {errorCarga || "Cargando…"}
        </p>
      </main>
    );
  }

  return (
    <main className="app-page flex flex-col gap-5 p-4 pb-8">
      <div className="pt-1">
        <h1 className="page-title">Caja</h1>
        <p className="mt-1 text-sm font-medium text-[var(--muted)]">
          Lo que debe haber fisicamente en esta sede.
        </p>
      </div>

      {errorCarga && (
        <p className="rounded-2xl bg-[var(--danger-soft)] p-3 text-sm font-bold text-red-800">
          {errorCarga}
        </p>
      )}

      {toast && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-[var(--primary)] px-4 py-3 font-black text-white shadow-lg">
          {toast}
        </div>
      )}

      <section className="section-panel p-5 text-center">
        <p className="mini-label">Debes tener en la caja</p>
        <p
          className={`text-4xl font-extrabold tabular-nums ${
            miTeorico.total >= 0 ? "text-green-700" : "text-red-700"
          }`}
        >
          ${miTeorico.total.toFixed(2)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-semibold text-[var(--muted)] tabular-nums">
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
          className="primary-action min-h-16 rounded-3xl font-black"
        >
          Registrar fondo
        </button>
        <button
          onClick={() => setFormularioAbierto("retiro")}
          className="secondary-action min-h-16 rounded-3xl font-black"
        >
          Retiro
        </button>
      </div>

      {formularioAbierto && (
        <FormularioMovCaja
          sede={sede}
          tipo={formularioAbierto}
          maxRetiro={miTeorico.total}
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
