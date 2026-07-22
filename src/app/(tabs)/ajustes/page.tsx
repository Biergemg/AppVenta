"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { borrarSede, nombreSede } from "@/lib/sede";
import { useSedeActual } from "@/lib/useSede";
import { listarProductos, type Producto } from "@/lib/productos";
import { listarPreciosInflable, type PrecioInflable } from "@/lib/preciosInflable";
import FormularioProducto from "./FormularioProducto";
import ListaProductos from "./ListaProductos";
import PreciosInflable from "./PreciosInflable";

type Estado = "probando" | "ok" | "error";

export default function AjustesPage() {
  const router = useRouter();
  const sede = useSedeActual();
  const [estado, setEstado] = useState<Estado>("probando");
  const [detalle, setDetalle] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [precios, setPrecios] = useState<PrecioInflable[]>([]);
  const [errorDatos, setErrorDatos] = useState("");

  const cargarDatos = useCallback(() => {
    Promise.allSettled([listarProductos(), listarPreciosInflable()]).then(
      ([productos, precios]) => {
        if (productos.status === "fulfilled") setProductos(productos.value);
        if (precios.status === "fulfilled") setPrecios(precios.value);
        setErrorDatos(
          productos.status === "rejected" || precios.status === "rejected"
            ? "No se pudo cargar productos o precios. Sin internet. Reintenta."
            : ""
        );
      }
    );
  }, []);

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

    cargarDatos();

    return () => {
      cancelado = true;
    };
  }, [cargarDatos]);

  function cambiarSede() {
    borrarSede();
    router.replace("/");
  }

  return (
    <main className="app-page flex flex-col gap-5 p-4 pb-8">
      <div className="pt-1">
        <h1 className="page-title">Ajustes</h1>
        <p className="mt-1 text-sm font-medium text-[var(--muted)]">
          Productos, inventario y precios del inflable.
        </p>
      </div>

      <section className="section-panel p-4">
        <h2 className="mb-2 text-lg font-black">Tu sede</h2>
        <p className="mb-3 text-lg font-bold">
          {sede ? nombreSede(sede) : "Sin elegir"}
        </p>
        <button
          onClick={cambiarSede}
          className="secondary-action min-h-14 w-full rounded-2xl text-lg font-black"
        >
          Cambiar de sede
        </button>
      </section>

      <section className="section-panel p-4">
        <h2 className="mb-2 text-lg font-black">Conexion</h2>
        {estado === "probando" && (
          <p className="font-bold text-[var(--muted)]">Probando conexion...</p>
        )}
        {estado === "ok" && (
          <p className="font-bold text-green-700">
            Conectado. La app lee y escribe correctamente.
          </p>
        )}
        {estado === "error" && (
          <div className="text-red-700">
            <p className="font-black">Sin conexion a Supabase.</p>
            <p className="text-sm">{detalle}</p>
            <p className="mt-2 text-sm">
              Revisa las variables de Supabase en Vercel y que el SQL ya este cargado.
            </p>
          </div>
        )}
      </section>

      {errorDatos && (
        <p className="rounded-xl bg-red-100 p-3 text-sm font-semibold text-red-800">
          {errorDatos}
        </p>
      )}

      <FormularioProducto onGuardado={cargarDatos} />
      <ListaProductos productos={productos} onCambio={cargarDatos} />
      <PreciosInflable precios={precios} onCambio={cargarDatos} />
    </main>
  );
}
