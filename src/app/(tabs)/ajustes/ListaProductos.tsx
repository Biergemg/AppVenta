"use client";

import { useEffect, useState } from "react";
import { SEDES, type SedeId } from "@/lib/sede";
import { actualizarProducto, entradaMercancia, type Producto } from "@/lib/productos";

export default function ListaProductos({
  productos,
  onCambio,
}: {
  productos: Producto[];
  onCambio: () => void;
}) {
  if (productos.length === 0) {
    return (
      <section className="section-panel p-4">
        <h2 className="mb-1 text-lg font-black">Productos</h2>
        <p className="font-bold text-[var(--muted)]">Todavia no das de alta ningun producto.</p>
      </section>
    );
  }

  return (
    <section className="section-panel flex flex-col gap-3 p-4">
      <h2 className="text-lg font-black">Productos ({productos.length})</h2>
      {productos.map((p) => (
        <FilaProducto key={p.id} producto={p} onCambio={onCambio} />
      ))}
    </section>
  );
}

function FilaProducto({
  producto,
  onCambio,
}: {
  producto: Producto;
  onCambio: () => void;
}) {
  const [costo, setCosto] = useState(String(producto.costo_compra));
  const [precio, setPrecio] = useState(String(producto.precio_venta));
  const [guardando, setGuardando] = useState(false);
  const [mostrarEntrada, setMostrarEntrada] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(
    null
  );

  useEffect(() => {
    if (!mensaje) return;
    const t = setTimeout(() => setMensaje(null), 2500);
    return () => clearTimeout(t);
  }, [mensaje]);

  async function guardarPrecios() {
    setGuardando(true);
    try {
      await actualizarProducto(producto.id, {
        costo_compra: Number(costo) || 0,
        precio_venta: Number(precio) || 0,
      });
      setMensaje({ tipo: "ok", texto: "Guardado" });
      onCambio();
    } catch {
      setMensaje({ tipo: "error", texto: "Sin internet. Reintenta." });
    } finally {
      setGuardando(false);
    }
  }

  async function toggleActivo() {
    try {
      await actualizarProducto(producto.id, { activo: !producto.activo });
      onCambio();
    } catch {
      setMensaje({ tipo: "error", texto: "Sin internet. Reintenta." });
    }
  }

  return (
    <div className={`soft-panel p-3 ${producto.activo ? "" : "opacity-60"}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 break-words text-lg font-black">{producto.nombre}</p>
        <button
          onClick={toggleActivo}
          className="min-h-14 rounded-2xl px-3 text-sm font-black text-[var(--muted)]"
        >
          {producto.activo ? "Desactivar" : "Activar"}
        </button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="mini-label text-xs">Costo</span>
          <input
            inputMode="decimal"
            value={costo}
            onChange={(e) => setCosto(e.target.value)}
            className="min-h-12 rounded-2xl border px-3 tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="mini-label text-xs">Precio</span>
          <input
            inputMode="decimal"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="min-h-12 rounded-2xl border px-3 tabular-nums"
          />
        </label>
      </div>

      {mensaje && (
        <p
          className={`mt-1 text-sm font-bold ${
            mensaje.tipo === "ok" ? "text-green-700" : "text-red-700"
          }`}
        >
          {mensaje.texto}
        </p>
      )}

      <div className="mt-2 flex gap-2">
        <button
          onClick={guardarPrecios}
          disabled={guardando}
          className="secondary-action min-h-14 flex-1 rounded-2xl font-black disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Guardar"}
        </button>
        <button
          onClick={() => setMostrarEntrada((v) => !v)}
          className="min-h-14 flex-1 rounded-2xl border border-zinc-300 bg-white font-black"
        >
          Entrada
        </button>
      </div>

      {mostrarEntrada && (
        <FormularioEntrada
          productoId={producto.id}
          onGuardado={() => {
            setMostrarEntrada(false);
            onCambio();
          }}
        />
      )}
    </div>
  );
}

function FormularioEntrada({
  productoId,
  onGuardado,
}: {
  productoId: number;
  onGuardado: () => void;
}) {
  const [sede, setSede] = useState<SedeId>(SEDES[0].id);
  const [cantidad, setCantidad] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function guardar() {
    const cant = Number(cantidad);
    if (!cant || cant <= 0) {
      setError("Pon una cantidad mayor a 0.");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      await entradaMercancia({ producto_id: productoId, sede, cantidad: cant });
      setCantidad("");
      onGuardado();
    } catch {
      setError("Sin internet. Reintenta.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="mt-3 flex flex-col gap-2 rounded-2xl bg-white p-3">
      <div className="flex gap-2">
        {SEDES.map((s) => (
          <button
            key={s.id}
            onClick={() => setSede(s.id)}
            className={`min-h-14 flex-1 rounded-2xl border text-sm font-black ${
              sede === s.id
                ? "border-[var(--blue)] bg-[var(--blue)] text-white"
                : "border-zinc-300"
            }`}
          >
            {s.nombre}
          </button>
        ))}
      </div>
      <input
        inputMode="numeric"
        value={cantidad}
        onChange={(e) => setCantidad(e.target.value)}
        placeholder="Cantidad que entra"
        className="min-h-12 rounded-2xl border px-3 tabular-nums"
      />
      {error && <p className="text-sm font-bold text-red-700">{error}</p>}
      <button
        onClick={guardar}
        disabled={guardando}
        className="primary-action min-h-14 rounded-2xl font-black disabled:opacity-50"
      >
        {guardando ? "Guardando..." : "Registrar entrada"}
      </button>
    </div>
  );
}
