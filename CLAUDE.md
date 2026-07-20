# Sistema POS de Evento — 2 Sedes (Bebidas + Inflable)

Eres el desarrollador de este proyecto. Construye TODO lo descrito aquí sin pedir confirmación por módulo; solo pregunta si falta un dato bloqueante (ej. llaves de Supabase). Sigue las fases en orden. Este documento es la única fuente de verdad.

## 1. Contexto

Negocio familiar: venta de refrescos y aguas en un evento deportivo con **2 sedes** (Frente A y Frente B) operadas por 2 personas (una por sede, cada una con su celular). Cada sede tiene además **1 inflable** que se cobra por tiempo (30/60 min). No hay empleados ni rol de administrador separado: **los operadores son los dueños**, todo vive en una sola app.

## 2. Stack obligatorio

- **Next.js** (App Router) + **Tailwind CSS**
- **Supabase** (Postgres) como única base de datos. Todas las escrituras de ventas/movimientos/tiempos son INSERT (nunca UPDATE de acumulados) para evitar conflictos entre los 2 celulares.
- Deploy en **Vercel**. Llaves de Supabase solo en variables de entorno (`.env.local` y panel de Vercel), jamás en el código.
- Sin login/contraseñas (lo protege la URL no pública). Al abrir, la app pide elegir sede y la recuerda en `localStorage`.
- "Tiempo real" = polling cada 10–15 s. NO usar websockets/Supabase Realtime (complejidad innecesaria).

## 3. Principios de UX — OBLIGATORIOS EN TODA PANTALLA

La app la usarán personas sin experiencia técnica, de pie, con sol, con fila de clientes. Cada decisión visual se evalúa contra: "¿mi mamá lo entendería sin que nadie le explique?"

1. **Todo en español mexicano coloquial.** "Cobrar", "Feria", "Se acabó el tiempo", "Caja". Cero jerga técnica (nada de "sync", "commit", "dashboard" → usar "Resumen").
2. **Botones grandes** (mínimo 56px de alto), texto grande, alto contraste. Optimizado para celular en vertical; una mano.
3. **Máximo 2 toques para las acciones frecuentes** (vender un producto = tocar producto + tocar Cobrar).
4. **Confirmación visual inmediata** de cada acción (toast verde "Venta guardada $60"). Si algo falla, mensaje claro de qué hacer ("Sin internet. Reintenta"), nunca errores técnicos crudos.
5. **Colores con significado fijo**: verde = dinero/ok, amarillo = advertencia (stock bajo, 5 min restantes), rojo = urgente (sin stock, tiempo vencido). Números siempre tabulares.
6. **Navegación por pestañas fijas abajo**: Vender · Inflable · Resumen · Caja · Ajustes. Siempre visibles.
7. Nada de menús ocultos, gestos raros, ni pantallas con más de una idea principal.

## 4. Modelo de datos (crear en Supabase; entrega el SQL en `supabase/schema.sql`)

```sql
productos(id, nombre, precio_venta numeric, costo_compra numeric, activo bool default true, creado timestamptz)
inventario_mov(id, producto_id, sede smallint, tipo text, -- 'inicial' | 'entrada' | 'ajuste'
              cantidad int, nota text, ts timestamptz)   -- cantidad puede ser negativa en ajuste
ventas(id, sede smallint, tipo text,                      -- 'bebida' | 'inflable'
       producto_id nullable, cantidad int, precio_unit numeric, costo_unit numeric,
       total numeric, pago_con numeric, cambio numeric, metodo text default 'efectivo',
       tiempo_id nullable, ts timestamptz)
caja_mov(id, sede smallint, tipo text,                    -- 'fondo' | 'retiro'
         monto numeric, nota text, ts timestamptz)
tiempos(id, sede smallint, nino text, responsable text,
        inicio timestamptz, minutos int, estado text,     -- 'activo' | 'terminado'
        ts timestamptz)
```

**Reglas de cálculo (siempre al vuelo, nunca almacenadas):**
- Stock teórico por producto y sede = Σ inventario_mov − Σ ventas de ese producto/sede.
- Ganancia bruta = Σ (precio_unit − costo_unit) × cantidad. El costo se **copia** a la venta al momento de vender (snapshot), para que cambiar el costo después no reescriba la historia.
- Efectivo teórico por sede = fondos + ventas en efectivo − retiros. **Una sola caja por sede**; el desglose bebidas vs inflable es solo informativo en el Resumen.

## 5. Módulos

### 5.1 Elegir sede (primera pantalla)
Dos botones gigantes: Frente A / Frente B. Se guarda en localStorage con opción de cambiar desde Ajustes.

### 5.2 Vender
- Cuadrícula de botones fijos por producto (nombre, precio, stock restante de MI sede). **Nunca reordenar por popularidad.** Sin stock → botón gris "Agotado".
- Tocar suma al ticket (barra inferior con +/− por renglón y total).
- **Cobrar** abre pantalla de pago: total gigante + botones "Exacto / $50 / $100 / $200 / $500" + campo libre. Muestra la **FERIA en número gigante**. Confirmar guarda la venta (con costo snapshot, pago_con, cambio) y descuenta el ticket completo en una sola transacción.

### 5.3 Inflable
- Botón "Registrar niño": nombre del niño, nombre/teléfono del responsable, botones "30 min $X" / "60 min $Y" → cobra en el acto (misma pantalla de feria) y arranca el timer. El precio del tiempo se define en Ajustes.
- Lista de tarjetas ordenadas por tiempo restante: nombre grande + cuenta regresiva + barra de color (verde → amarillo a 5 min → rojo vencido).
- Botones por tarjeta: "+30 min" (cobra extensión) y "Ya salió" (termina).
- **Alarmas SOLO de mi sede**: sonido (Web Audio, tono generado, sin archivos externos) + vibración + tarjeta roja parpadeando al llegar a 0, y aviso amarillo a los 5 min. Los tiempos de la otra sede se ven en una sección aparte "Otra sede" SIN alarma ni sonido.
- **Timers 100% locales** en el celular (basados en `inicio` + `minutos`); el polling solo refresca la lista. Deben sobrevivir a caídas de red.
- **Wake Lock**: mientras haya niños activos en mi sede, mantener la pantalla encendida (con manejo del caso en que el navegador lo niegue: mostrar aviso "Mantén la pantalla prendida para que suene la alarma").

### 5.4 Resumen (compartido, se actualiza solo cada 10–15 s)
- Arriba: **venta total $** y **ganancia $** del evento, con desglose A vs B y bebidas vs inflable.
- Ranking de productos: dos listas — "Todo el evento" y "Última hora" (la accionable).
- **Inventario teórico**: tabla producto × sede = "lo que DEBE haber físicamente ahorita". En amarillo si <15% del inicial, rojo si 0.
- Ventas por hora (barras simples).
- Inflable: niños atendidos, ingreso, por sede.

### 5.5 Caja
- Efectivo teórico de MI sede en grande ("Debes tener $X en la caja") + desglose informativo bebidas/inflable + el de la otra sede en chico.
- Botones: "Registrar fondo" (con cuánto arrancas) y "Retiro" (sacar efectivo a lugar seguro; baja caja, no altera ventas).
- **Corte**: capturo lo contado físicamente → la app muestra diferencia contra el teórico en verde/rojo.

### 5.6 Ajustes — INVENTARIO RÁPIDO (prioridad alta del dueño)
- **Alta de producto en una sola tarjeta**: nombre, **costo de compra**, **precio de venta** (la app muestra en vivo la ganancia por pieza y el % de margen al teclear), stock inicial Frente A y Frente B. Guardar = producto listo para vender. El flujo completo debe tomar <20 segundos por producto.
- "Entrada de mercancía": producto + cantidad + sede (para resurtidos a media jornada).
- Editar precio/costo (afecta solo ventas futuras), desactivar producto.
- Precios del inflable (30 min, 60 min, extensión) y nombres de las sedes.
- Botón "Borrar todo y empezar de cero" con doble confirmación.

## 6. Fases de construcción (ejecutar en este orden, commit por fase)

| Fase | Entregable | Criterio de aceptación |
|---|---|---|
| F1 | Proyecto Next.js + Tailwind + conexión Supabase + `schema.sql` + selector de sede | La app corre local y lee/escribe en Supabase |
| F2 | Ajustes: alta rápida de productos (costo/precio/margen en vivo) + entradas | Doy de alta 5 productos en <2 min desde el celular |
| F3 | Vender + pantalla de feria | Venta de 3 artículos en 2 toques + cobro; stock baja; feria correcta |
| F4 | Resumen compartido con polling | Vendo en un celular y en <15 s lo ve el otro; ranking y stock teórico correctos |
| F5 | Inflable con timers locales, alarmas por sede, wake lock | Alarma suena SOLO en la sede dueña; sobrevive 2 min sin red |
| F6 | Caja: fondo, retiros, corte con diferencia | Efectivo teórico cuadra con ventas de prueba |
| F7 | Pulido UX (revisión contra sección 3), estados vacíos, manejo de errores de red, deploy a Vercel | Una persona ajena completa venta + registro de inflable sin ayuda |

## 7. Pruebas mínimas antes de dar por terminado

1. Dos navegadores simultáneos (uno por sede) vendiendo a la vez: ninguna venta se pierde.
2. Modo avión 2 minutos con un timer activo: la alarma suena de todos modos al volver el tiempo a 0.
3. Venta con pago de $500 sobre total de $85: feria $415 exacta.
4. Corte de caja con datos de prueba cuadra al centavo.
5. Lighthouse móvil: usable, botones ≥48px, contraste AA.

## 8. Despliegue

1. Repo en GitHub → conectar en Vercel → variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en el panel de Vercel.
2. Entregar al final un `LEEME.md` en español simple: cómo abrir la app en cada celular, cómo agregarla a la pantalla de inicio (Android/iPhone), y qué hacer si no hay internet.
