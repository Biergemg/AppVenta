"use client";

import { useState } from "react";
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
      <section className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-1">Productos</h2>
        <p className="text-zinc-500">Todavía no das de alta ningún producto.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border p-4 flex flex-col gap-3">
      <h2 className="font-semibold">Productos ({productos.length})</h2>
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

  async function guardarPrecios() {
    setGuardando(true);
    try {
      await actualizarProducto(producto.id, {
        costo_compra: Number(costo) || 0,
        precio_venta: Number(precio) || 0,
      });
      onCambio();
    } finally {
      setGuardando(false);
    }
  }

  async function toggleActivo() {
    await actualizarProducto(producto.id, { activo: !producto.activo });
    onCambio();
  }

  return (
    <div className={`rounded-xl border p-3 ${producto.activo ? "" : "opacity-50"}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-lg">{producto.nombre}</p>
        <button onClick={toggleActivo} className="text-sm underline text-zinc-600">
          {producto.activo ? "Desactivar" : "Activar"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">Costo</span>
          <input
            inputMode="decimal"
            value={costo}
            onChange={(e) => setCosto(e.target.value)}
            className="min-h-12 rounded-lg border px-3 tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">Precio</span>
          <input
            inputMode="decimal"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="min-h-12 rounded-lg border px-3 tabular-nums"
          />
        </label>
      </div>

      <div className="flex gap-2 mt-2">
        <button
          onClick={guardarPrecios}
          disabled={guardando}
          className="flex-1 min-h-12 rounded-xl border border-blue-600 text-blue-600 font-semibold disabled:opacity-50"
        >
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
        <button
          onClick={() => setMostrarEntrada((v) => !v)}
          className="flex-1 min-h-12 rounded-xl border border-zinc-300 font-semibold"
        >
          Entrada de mercancía
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
    <div className="mt-3 rounded-xl bg-zinc-50 p-3 flex flex-col gap-2">
      <div className="flex gap-2">
        {SEDES.map((s) => (
          <button
            key={s.id}
            onClick={() => setSede(s.id)}
            className={`flex-1 min-h-12 rounded-lg text-sm font-semibold border ${
              sede === s.id ? "bg-blue-600 text-white border-blue-600" : "border-zinc-300"
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
        className="min-h-12 rounded-lg border px-3 tabular-nums"
      />
      {error && <p className="text-red-700 text-sm">{error}</p>}
      <button
        onClick={guardar}
        disabled={guardando}
        className="min-h-12 rounded-xl bg-green-600 text-white font-semibold disabled:opacity-50"
      >
        {guardando ? "Guardando…" : "Registrar entrada"}
      </button>
    </div>
  );
}
