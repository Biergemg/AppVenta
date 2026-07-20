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
    red: "border-red-600 bg-red-50",
    yellow: "border-yellow-500 bg-yellow-50",
    green: "border-green-600 bg-green-50",
  };
  const barraPorColor: Record<string, string> = {
    red: "bg-red-600",
    yellow: "bg-yellow-500",
    green: "bg-green-600",
  };

  return (
    <div
      className={`rounded-2xl border-2 p-3 flex flex-col gap-2 ${estilosPorColor[color]} ${
        vencido && esMiSede ? "animate-pulse" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-lg">{tiempo.nino}</span>
        <span
          className={`text-2xl font-extrabold tabular-nums ${
            vencido ? "text-red-700" : avisoAmarillo ? "text-yellow-700" : "text-green-700"
          }`}
        >
          {vencido ? "¡Se acabó!" : formatoMMSS(restanteSeg)}
        </span>
      </div>
      <p className="text-sm text-zinc-600">Responsable: {tiempo.responsable}</p>

      <div className="h-2 w-full rounded-full bg-zinc-200 overflow-hidden">
        <div
          className={`h-full ${barraPorColor[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {esMiSede && (
        <div className="flex gap-2 mt-1">
          <button
            onClick={onExtender}
            className="flex-1 min-h-14 rounded-xl border border-blue-600 text-blue-600 font-semibold"
          >
            +30 min
          </button>
          <button
            onClick={onTerminar}
            className="flex-1 min-h-14 rounded-xl bg-zinc-700 text-white font-semibold"
          >
            Ya salió
          </button>
        </div>
      )}
    </div>
  );
}
