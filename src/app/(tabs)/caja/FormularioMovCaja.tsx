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
    <section className="rounded-2xl border p-4 flex flex-col gap-3">
      <h2 className="font-semibold">{tipo === "fondo" ? "Registrar fondo" : "Retiro"}</h2>
      <input
        inputMode="decimal"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        placeholder="$0"
        className="min-h-14 rounded-xl border px-4 text-2xl tabular-nums text-center"
      />
      <input
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        placeholder="Nota (opcional)"
        className="min-h-14 rounded-xl border px-4 text-lg"
      />
      {error && <p className="text-red-700 font-semibold">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={onCancelar}
          className="flex-1 min-h-14 rounded-2xl border border-zinc-300 font-semibold"
        >
          Cancelar
        </button>
        <button
          onClick={guardar}
          disabled={guardando}
          className="flex-1 min-h-14 rounded-2xl bg-blue-600 text-white font-bold disabled:opacity-50"
        >
          {guardando ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </section>
  );
}
