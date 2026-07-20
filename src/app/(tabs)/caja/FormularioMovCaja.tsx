"use client";

import { useState } from "react";
import { registrarMovCaja } from "@/lib/caja";
import type { SedeId } from "@/lib/sede";

export default function FormularioMovCaja({
  sede,
  tipo,
  onCancelar,
  onGuardado,
  maxRetiro,
}: {
  sede: SedeId;
  tipo: "fondo" | "retiro";
  onCancelar: () => void;
  onGuardado: () => void;
  maxRetiro?: number;
}) {
  const [monto, setMonto] = useState("");
  const [nota, setNota] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function guardar() {
    const num = Number(monto);
    if (!num || num <= 0) {
      setError("Pon una cantidad mayor a 0.");
      return;
    }
    if (tipo === "retiro" && maxRetiro != null && num > maxRetiro) {
      setError("No puedes retirar mas de lo que debe haber en caja.");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      await registrarMovCaja({ sede, tipo, monto: num, nota: nota.trim() || undefined });
      onGuardado();
    } catch {
      setError("Sin internet. Reintenta.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="section-panel flex flex-col gap-3 p-4">
      <h2 className="text-lg font-black">{tipo === "fondo" ? "Registrar fondo" : "Retiro"}</h2>
      <input
        inputMode="decimal"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        placeholder="$0"
        className="min-h-16 rounded-2xl border px-4 text-center text-2xl tabular-nums"
      />
      <input
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        placeholder="Nota (opcional)"
        className="min-h-14 rounded-2xl border px-4 text-lg font-semibold"
      />
      {error && <p className="text-red-700 font-semibold">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={onCancelar}
          className="secondary-action min-h-14 flex-1 rounded-2xl font-black"
        >
          Cancelar
        </button>
        <button
          onClick={guardar}
          disabled={guardando}
          className="primary-action min-h-14 flex-1 rounded-2xl font-black disabled:opacity-50"
        >
          {guardando ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </section>
  );
}
