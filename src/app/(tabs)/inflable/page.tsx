"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSedeActual } from "@/lib/useSede";
import { nombreSede } from "@/lib/sede";
import { listarPreciosInflable, type PrecioInflable } from "@/lib/preciosInflable";
import {
  listarTiemposActivos,
  extenderTiempo,
  terminarTiempo,
  type Tiempo,
} from "@/lib/tiempos";
import { reproducirBeep, vibrar } from "@/lib/alarma";
import { useWakeLock } from "@/lib/useWakeLock";
import FormularioNino from "./FormularioNino";
import TarjetaTiempo from "./TarjetaTiempo";
import PantallaCobro from "@/components/PantallaCobro";

const POLL_MS = 12000;

export default function InflablePage() {
  const sede = useSedeActual();
  const [precios, setPrecios] = useState<PrecioInflable[]>([]);
  const [tiempos, setTiempos] = useState<Tiempo[]>([]);
  const [ahora, setAhora] = useState(() => Date.now());
  const [extendiendo, setExtendiendo] = useState<Tiempo | null>(null);
  const [toast, setToast] = useState("");

  const cargar = useCallback(() => {
    listarPreciosInflable()
      .then(setPrecios)
      .catch(() => {});
    listarTiemposActivos()
      .then(setTiempos)
      .catch(() => {});
  }, []);

  useEffect(() => {
    cargar();
    const id = setInterval(cargar, POLL_MS);
    return () => clearInterval(id);
  }, [cargar]);

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const misTiempos = tiempos
    .filter((t) => t.sede === sede)
    .sort(
      (a, b) =>
        new Date(a.inicio).getTime() +
        a.minutos * 60000 -
        (new Date(b.inicio).getTime() + b.minutos * 60000)
    );
  const otrosTiempos = tiempos.filter((t) => t.sede !== sede);

  const hayVencidosMiSede = misTiempos.some(
    (t) => new Date(t.inicio).getTime() + t.minutos * 60000 - ahora <= 0
  );

  const wakeLockEstado = useWakeLock(misTiempos.length > 0);

  const alarmaIntervalo = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (hayVencidosMiSede) {
      if (!alarmaIntervalo.current) {
        reproducirBeep();
        vibrar();
        alarmaIntervalo.current = setInterval(() => {
          reproducirBeep();
          vibrar();
        }, 3000);
      }
    } else if (alarmaIntervalo.current) {
      clearInterval(alarmaIntervalo.current);
      alarmaIntervalo.current = null;
    }
    return () => {
      if (alarmaIntervalo.current) {
        clearInterval(alarmaIntervalo.current);
        alarmaIntervalo.current = null;
      }
    };
  }, [hayVencidosMiSede]);

  const precio30 = precios.find((p) => p.minutos === 30);

  function pedirExtension(tiempo: Tiempo) {
    if (!precio30?.precio) {
      setToast("Falta poner el precio de 30 min en Ajustes.");
      return;
    }
    setExtendiendo(tiempo);
  }

  async function confirmarExtension(pagoCon: number) {
    if (!extendiendo || !precio30?.precio) return;
    await extenderTiempo({
      tiempo: extendiendo,
      minutosExtra: 30,
      precio: precio30.precio,
      pagoCon,
    });
    setToast("✓ Extensión guardada");
    setExtendiendo(null);
    cargar();
  }

  async function marcarSalida(id: number) {
    setTiempos((actual) => actual.filter((t) => t.id !== id));
    try {
      await terminarTiempo(id);
    } catch {
      setToast("Sin internet. Reintenta.");
      cargar();
    }
  }

  if (!sede) return null;

  return (
    <main className="flex flex-col gap-6 p-4 pb-8">
      <h1 className="text-xl font-bold">Inflable</h1>

      {wakeLockEstado === "rechazado" || wakeLockEstado === "no-soportado" ? (
        <p className="rounded-xl bg-yellow-100 text-yellow-800 p-3 text-sm font-semibold">
          Mantén la pantalla prendida para que suene la alarma.
        </p>
      ) : null}

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-green-600 text-white px-4 py-2 font-semibold shadow-lg">
          {toast}
        </div>
      )}

      <FormularioNino sede={sede} precios={precios} onRegistrado={cargar} />

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">Mi sede ({nombreSede(sede)})</h2>
        {misTiempos.length === 0 && (
          <p className="text-zinc-500 text-sm">Nadie está en el inflable ahorita.</p>
        )}
        {misTiempos.map((t) => (
          <TarjetaTiempo
            key={t.id}
            tiempo={t}
            ahora={ahora}
            esMiSede
            onExtender={() => pedirExtension(t)}
            onTerminar={() => marcarSalida(t.id)}
          />
        ))}
      </section>

      {otrosTiempos.length > 0 && (
        <section className="flex flex-col gap-3 opacity-70">
          <h2 className="font-semibold">Otra sede</h2>
          {otrosTiempos.map((t) => (
            <TarjetaTiempo key={t.id} tiempo={t} ahora={ahora} esMiSede={false} />
          ))}
        </section>
      )}

      {extendiendo && precio30?.precio && (
        <PantallaCobro
          total={precio30.precio}
          onCancelar={() => setExtendiendo(null)}
          onConfirmar={confirmarExtension}
        />
      )}
    </main>
  );
}
