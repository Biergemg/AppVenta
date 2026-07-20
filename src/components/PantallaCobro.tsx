"use client";

import { useState } from "react";
import { redondearDinero } from "@/lib/dinero";

const MONTOS_RAPIDOS = [50, 100, 200, 500];

export default function PantallaCobro({
  total,
  onCancelar,
  onConfirmar,
}: {
  total: number;
  onCancelar: () => void;
  onConfirmar: (pagoCon: number) => Promise<void>;
}) {
  const [pagoTexto, setPagoTexto] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState("");

  const totalRedondeado = redondearDinero(total);
  const pagoCon = redondearDinero(Number(pagoTexto) || 0);
  const feria = redondearDinero(pagoCon - totalRedondeado);
  const tieneMasDeDosDecimales = (pagoTexto.split(".")[1]?.length ?? 0) > 2;
  const puedeConfirmar =
    pagoCon >= totalRedondeado && pagoCon > 0 && !tieneMasDeDosDecimales;

  function cambiarPago(valor: string) {
    setPagoTexto(valor);
    const decimales = valor.split(".")[1]?.length ?? 0;
    if (decimales > 2) {
      setError("Usa maximo 2 decimales.");
      return;
    }
    if (Number(valor) < 0) {
      setError("El pago no puede ser negativo.");
      return;
    }
    setError("");
  }

  async function confirmar() {
    if (!puedeConfirmar) {
      setError("El pago debe ser mayor o igual al total.");
      return;
    }
    setConfirmando(true);
    setError("");
    try {
      await onConfirmar(redondearDinero(pagoCon));
    } catch {
      setError("Sin internet. Reintenta.");
    } finally {
      setConfirmando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col p-4 gap-4 overflow-y-auto">
      <button
        onClick={onCancelar}
        disabled={confirmando}
        className="self-start text-zinc-600 font-semibold disabled:opacity-50"
      >
        ← Cancelar
      </button>

      <div className="text-center">
        <p className="text-zinc-500">Total</p>
        <p className="text-4xl font-bold tabular-nums">${totalRedondeado.toFixed(2)}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => cambiarPago(totalRedondeado.toFixed(2))}
          disabled={confirmando}
          className="min-h-14 rounded-xl bg-zinc-100 font-semibold text-lg disabled:opacity-50"
        >
          Exacto
        </button>
        {MONTOS_RAPIDOS.map((m) => (
          <button
            key={m}
            onClick={() => cambiarPago(String(m))}
            disabled={confirmando}
            className="min-h-14 rounded-xl bg-zinc-100 font-semibold text-lg tabular-nums disabled:opacity-50"
          >
            ${m}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-zinc-600">O pon la cantidad exacta con la que paga</span>
        <input
          inputMode="decimal"
          value={pagoTexto}
          onChange={(e) => cambiarPago(e.target.value)}
          placeholder="$0"
          disabled={confirmando}
          className="min-h-14 rounded-xl border px-4 text-2xl tabular-nums text-center"
        />
      </label>

      <div className="rounded-2xl bg-green-50 p-4 text-center">
        <p className="text-zinc-600">Feria</p>
        <p
          className={`text-5xl font-extrabold tabular-nums ${
            feria >= 0 ? "text-green-700" : "text-red-700"
          }`}
        >
          ${feria.toFixed(2)}
        </p>
      </div>

      {error && <p className="text-red-700 font-semibold text-center">{error}</p>}

      <button
        onClick={confirmar}
        disabled={!puedeConfirmar || confirmando}
        className="min-h-16 rounded-2xl bg-green-600 text-white text-xl font-bold disabled:opacity-50"
      >
        {confirmando ? "Guardando…" : "Confirmar cobro"}
      </button>
    </div>
  );
}
