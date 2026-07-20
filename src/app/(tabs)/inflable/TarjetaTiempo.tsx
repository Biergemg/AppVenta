"use client";

import type { Tiempo } from "@/lib/tiempos";

function formatoMMSS(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function TarjetaTiempo({
  tiempo,
  ahora,
  esMiSede,
  onExtender,
  onTerminar,
}: {
  tiempo: Tiempo;
  ahora: number;
  esMiSede: boolean;
  onExtender?: () => void;
  onTerminar?: () => void;
}) {
  const finMs = new Date(tiempo.inicio).getTime() + tiempo.minutos * 60000;
  const restanteMs = finMs - ahora;
  const vencido = restanteMs <= 0;
  const avisoAmarillo = !vencido && restanteMs <= 5 * 60000;
  const restanteSeg = Math.max(0, Math.ceil(restanteMs / 1000));
  const totalSeg = tiempo.minutos * 60;
  const pct = Math.max(0, Math.min(100, (restanteMs / (totalSeg * 1000)) * 100));

  const color = vencido ? "red" : avisoAmarillo ? "yellow" : "green";
  const estilosPorColor: Record<string, string> = {
    red: "border-red-500 bg-[var(--danger-soft)]",
    yellow: "border-yellow-500 bg-[var(--warning-soft)]",
    green: "border-[var(--line)] bg-white",
  };
  const barraPorColor: Record<string, string> = {
    red: "bg-red-600",
    yellow: "bg-yellow-500",
    green: "bg-[var(--primary)]",
  };

  return (
    <div
      className={`flex flex-col gap-3 rounded-3xl border-2 p-4 shadow-sm ${estilosPorColor[color]} ${
        vencido && esMiSede ? "animate-pulse" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0 break-words text-xl font-black">{tiempo.nino}</span>
        <span
          className={`shrink-0 text-2xl font-black tabular-nums ${
            vencido ? "text-red-700" : avisoAmarillo ? "text-yellow-800" : "text-green-700"
          }`}
        >
          {vencido ? "¡Se acabó!" : formatoMMSS(restanteSeg)}
        </span>
      </div>
      <p className="text-sm font-semibold text-[var(--muted)]">
        Responsable: {tiempo.responsable}
      </p>

      <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-200">
        <div className={`h-full ${barraPorColor[color]}`} style={{ width: `${pct}%` }} />
      </div>

      {esMiSede && (
        <div className="mt-1 flex gap-2">
          <button
            onClick={onExtender}
            className="secondary-action min-h-14 flex-1 rounded-2xl font-black"
          >
            +30 min
          </button>
          <button
            onClick={onTerminar}
            className="min-h-14 flex-1 rounded-2xl bg-zinc-800 font-black text-white"
          >
            Ya salió
          </button>
        </div>
      )}
    </div>
  );
}
