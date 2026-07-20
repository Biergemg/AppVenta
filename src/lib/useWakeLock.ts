import { useEffect, useRef, useState } from "react";

type EstadoWakeLock = "inactivo" | "activo" | "rechazado" | "no-soportado";

/** Mantiene la pantalla encendida mientras `activo` sea true. */
export function useWakeLock(activo: boolean): EstadoWakeLock {
  const [estado, setEstado] = useState<EstadoWakeLock>("inactivo");
  const lockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!activo) {
      lockRef.current?.release().catch(() => {});
      lockRef.current = null;
      Promise.resolve().then(() => setEstado("inactivo"));
      return;
    }

    if (!("wakeLock" in navigator)) {
      Promise.resolve().then(() => setEstado("no-soportado"));
      return;
    }

    let cancelado = false;

    navigator.wakeLock
      .request("screen")
      .then((sentinel) => {
        if (cancelado) {
          sentinel.release().catch(() => {});
          return;
        }
        lockRef.current = sentinel;
        setEstado("activo");
      })
      .catch(() => {
        if (!cancelado) setEstado("rechazado");
      });

    return () => {
      cancelado = true;
      lockRef.current?.release().catch(() => {});
      lockRef.current = null;
    };
  }, [activo]);

  // Reintentar si el navegador liberó el lock solo (ej. cambio de pestaña).
  useEffect(() => {
    function reintentar() {
      if (
        activo &&
        document.visibilityState === "visible" &&
        "wakeLock" in navigator &&
        !lockRef.current
      ) {
        navigator.wakeLock
          .request("screen")
          .then((sentinel) => {
            lockRef.current = sentinel;
            setEstado("activo");
          })
          .catch(() => setEstado("rechazado"));
      }
    }
    document.addEventListener("visibilitychange", reintentar);
    return () => document.removeEventListener("visibilitychange", reintentar);
  }, [activo]);

  return estado;
}
