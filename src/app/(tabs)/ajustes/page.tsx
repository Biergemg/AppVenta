"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { borrarSede } from "@/lib/sede";

type Estado = "probando" | "ok" | "error";

export default function AjustesPage() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("probando");
  const [detalle, setDetalle] = useState("");

  useEffect(() => {
    let cancelado = false;

    supabase
      .from("productos")
      .select("id", { count: "exact", head: true })
      .then(({ error }) => {
        if (cancelado) return;
        if (error) {
          setEstado("error");
          setDetalle(error.message);
        } else {
          setEstado("ok");
        }
      });

    return () => {
      cancelado = true;
    };
  }, []);

  function cambiarSede() {
    borrarSede();
    router.replace("/");
  }

  return (
    <main className="flex flex-col gap-6 p-4">
      <h1 className="text-xl font-bold">Ajustes</h1>

      <section className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-2">Conexión con Supabase</h2>
        {estado === "probando" && (
          <p className="text-zinc-500">Probando conexión…</p>
        )}
        {estado === "ok" && (
          <p className="text-green-700 font-semibold">
            ✓ Conectado. La app lee y escribe en Supabase correctamente.
          </p>
        )}
        {estado === "error" && (
          <div className="text-red-700">
            <p className="font-semibold">Sin conexión a Supabase.</p>
            <p className="text-sm">{detalle}</p>
            <p className="text-sm mt-2">
              Revisa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en
              .env.local, y que hayas corrido supabase/schema.sql en tu
              proyecto.
            </p>
          </div>
        )}
      </section>

      <button
        onClick={cambiarSede}
        className="min-h-14 rounded-2xl border border-zinc-300 text-lg font-semibold"
      >
        Cambiar de sede
      </button>
    </main>
  );
}
