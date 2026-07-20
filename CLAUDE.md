---
contract_version: 1
last_updated: 2026-07-20
changed_by: initialization
---

# Sistema POS de Evento — 2 Sedes (Bebidas + Inflable)

Eres el desarrollador de este proyecto. Construye TODO lo descrito aquí sin pedir confirmación por módulo; solo pregunta si falta un dato bloqueante (ej. llaves de Supabase). Sigue las fases en orden. Este documento es la única fuente de verdad.

> **Nota de trazabilidad (advanced-ai-dev-skill):** las secciones de contrato técnico
> (Stack, Comandos, Reglas, Baseline, etc.) están al final de este archivo, después
> de la sección 8, para no romper la numeración del spec original de negocio. Léelas
> también — son parte del mismo contrato.

## 1. Contexto

Negocio familiar: venta de refrescos y aguas en un evento deportivo con **2 sedes** operadas por 2 personas (una por sede, cada una con su celular). Cada sede tiene además **1 inflable** que se cobra por tiempo (30/60 min). No hay empleados ni rol de administrador separado: **los operadores son los dueños**, todo vive en una sola app.

**Evento real:** Festival Nacional Minibasket 2026 MX — Tampico, Tamaulipas — **22 al 26 de julio de 2026**.

**Sedes reales:**
- **Sede A — UNIDEP Tampico**
- **Sede B — Parque Méndez**

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
precios_inflable(id, minutos int unique, precio numeric nullable, -- NULL = sin definir todavía
                  activo bool default true, creado timestamptz)   -- seed: 15/30/45/60 min
```

**Reglas de cálculo (siempre al vuelo, nunca almacenadas):**
- Stock teórico por producto y sede = Σ inventario_mov − Σ ventas de ese producto/sede.
- Ganancia bruta = Σ (precio_unit − costo_unit) × cantidad. El costo se **copia** a la venta al momento de vender (snapshot), para que cambiar el costo después no reescriba la historia.
- Efectivo teórico por sede = fondos + ventas en efectivo − retiros. **Una sola caja por sede**; el desglose bebidas vs inflable es solo informativo en el Resumen.

## 5. Módulos

### 5.1 Elegir sede (primera pantalla)
Dos botones gigantes: UNIDEP Tampico / Parque Méndez. Se guarda en localStorage con opción de cambiar desde Ajustes.

### 5.2 Vender
- Cuadrícula de botones fijos por producto (nombre, precio, stock restante de MI sede). **Nunca reordenar por popularidad.** Sin stock → botón gris "Agotado".
- Tocar suma al ticket (barra inferior con +/− por renglón y total).
- **Cobrar** abre pantalla de pago: total gigante + botones "Exacto / $50 / $100 / $200 / $500" + campo libre. Muestra la **FERIA en número gigante**. Confirmar guarda la venta (con costo snapshot, pago_con, cambio) y descuenta el ticket completo en una sola transacción.

### 5.3 Inflable
- Botón "Registrar niño": nombre del niño, nombre/teléfono del responsable, botón de duración **30 min** (único, confirmado por el dueño en $30) → cobra en el acto (misma pantalla de feria) y arranca el timer. Las duraciones de 15/45/60 min existen en la tabla `precios_inflable` pero están **desactivadas** (`activo=false`) porque el negocio solo ofrece 30 min + extensión — si algún día se necesitan, se reactivan desde Ajustes sin tocar código.
- "+30 min" (extensión) usa el mismo precio de 30 min; si por algún motivo ese precio no está definido, el botón se muestra gris/deshabilitado con texto "Falta precio" en vez de bloquear toda la pantalla.
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
- **Alta de producto en una sola tarjeta**: nombre, **costo de compra**, **precio de venta** (la app muestra en vivo la ganancia por pieza y el % de margen al teclear), stock inicial en UNIDEP Tampico y en Parque Méndez. Guardar = producto listo para vender. El flujo completo debe tomar <20 segundos por producto.
- "Entrada de mercancía": producto + cantidad + sede (para resurtidos a media jornada).
- Editar precio/costo (afecta solo ventas futuras), desactivar producto.
- Precios del inflable: tabla `precios_inflable` con las 4 duraciones (15/30/45/60 min), editable igual que un producto (precio libre, sin costo/margen porque no hay costo de compra) y con botón Activar/Desactivar por duración. Solo 30 min está activa hoy ($30 confirmado); "+30 min" reutiliza ese mismo precio. Nombres de las sedes ya fijos (UNIDEP Tampico / Parque Méndez, sección 1) — no requieren edición salvo que el usuario pida cambiarlos.
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

---

# Contrato técnico (advanced-ai-dev-skill)

> Agregado tras F1, cuando el stack real ya existía para poder leerlo en vez de
> inventarlo. Ver también AGENTS.md, HANDOVER.md, .ai-context/session-context.md,
> AI-WORKFLOW.md, tooling-compatibility.md y ai-risk-register.md en la raíz.

## Tech Stack

> Fuente: package.json (leído, no asumido).

- Runtime: Node.js v22.17.1 (según `node -v` en la máquina de desarrollo; no hay `.nvmrc`)
- Framework: Next.js 16.2.10 (App Router, Turbopack), React 19.2.4
- Estilos: Tailwind CSS ^4 (`@tailwindcss/postcss`)
- Base de datos: Supabase (Postgres), cliente `@supabase/supabase-js` ^2.110.7
- Testing: ninguno configurado todavía (no hay Jest/Vitest instalado — F1 no incluyó tests)
- Linting: ESLint ^9 con `eslint-config-next` 16.2.10 (`eslint.config.mjs`)
- Tipos: TypeScript ^5

## Critical Commands

```bash
# Instalar dependencias
npm install

# Levantar servidor de desarrollo (Turbopack elige puerto libre si 3000 está ocupado)
npm run dev

# Compilar para producción
npm run build

# Lint
npm run lint

# No hay "npm test" — no hay tests configurados aún
```

## No-Guessing Rules

- Si no has leído el archivo, no sabes qué contiene. Léelo primero.
- Si un nombre de campo, firma de función o tipo no está confirmado por un archivo
  que realmente leíste, no lo uses.
- Si falta información, pregunta. No asumas.
- "El usuario ya explicó el contexto" no equivale a leer el archivo.
- Los nombres de tablas/columnas de Supabase están en `supabase/schema.sql` — esa
  es la única fuente de verdad del esquema, no la memoria ni el spec de arriba
  (el spec de arriba es la intención de negocio; el `.sql` es lo que existe).

## Files Prohibited from Modification Without Explicit Approval

- `.env.local` y cualquier `*.env*` real con llaves (nunca commitear; `.env.local.example` sí se versiona)
- `supabase/schema.sql` una vez que haya datos reales de producción cargados con ese esquema (cambios = migración, no edición directa)
- `.git/hooks/pre-commit` (mantiene `.ai-context/session-context.md` actualizado)

## Naming Conventions

> Leído del código existente, no inventado.

- Archivos de componentes: PascalCase (`BottomNav.tsx`, `SedeGate.tsx`)
- Archivos de utilidades/lib: camelCase (`sede.ts`, `useSede.ts`, `supabase.ts`)
- Rutas de páginas: minúsculas, una carpeta por ruta (`src/app/(tabs)/vender/page.tsx`)
- Tablas/columnas Supabase: snake_case, en español cuando el spec de negocio ya las nombra así (`inventario_mov`, `producto_id`)
- Tests: ninguno todavía; cuando se agreguen, `*.test.ts` junto al archivo que prueban

## Baseline (Established: 2026-07-19)

```
baseline_warnings: 0        (npm run lint, F1, 0 warnings/errors)
baseline_complexity: no medido (no hay herramienta de complejidad ciclomática configurada)
baseline_test_count: 0      (no hay tests todavía)
```

## Communication Style (Minimalist Mode)

- Salidas breves, sin relleno conversacional ni repetición del prompt.
- Español mexicano coloquial en todo lo visible al usuario final dentro de la app (sección 3); en la comunicación con el desarrollador (este chat), directo y sin rodeos.
- Excepción: cadenas de evidencia (`evidence_chain`) y resultados de gates se muestran completos, no se resumen.

## Active MCP Servers

| Server | Scope | Purpose | Verified On |
|--------|-------|---------|-------------|
| engram | user (CLI en PATH + MCP) | Memoria persistente entre sesiones | 2026-07-19 |

## Notes and Decisions

[2026-07-19] Decision: proyecto creado en carpeta temporal minúscula (`pos-evento-tmp`) y movido a `AppVenta/` porque `create-next-app` rechaza mayúsculas en el nombre del paquete al usar `.` directamente — Reason: limitación de npm naming, no de este proyecto.
[2026-07-19] Decision: `package.json.name` = `"pos-evento"` — Reason: nombre de paquete válido, el nombre de carpeta (`AppVenta`) es solo el directorio.
[2026-07-19] Decision: `.env.local` se crea con valores placeholder hasta que el usuario cree su proyecto Supabase y entregue URL + anon key — Reason: dato bloqueante identificado explícitamente por este mismo documento (línea 3); el usuario confirmó que tiene cuenta pero no proyecto creado.
[2026-07-19] Decision: RLS deshabilitado en las 5 tablas de `supabase/schema.sql` — Reason: sección 2 del spec establece que no hay login, la URL no pública es la única protección; con RLS activo sin políticas, la anon key no podría leer/escribir nada.
[2026-07-19] Decision: se instaló git localmente (antes no existía) para poder usar el pre-commit hook y `.ai-context/session-context.md` de advanced-ai-dev-skill — Reason: el usuario pidió trazabilidad estricta vía esta skill; no se ha hecho push a ningún remoto (eso es F7/sección 8, pendiente).
[2026-07-19] Decision: nombres reales de sede confirmados — Sede A = "UNIDEP Tampico", Sede B = "Parque Méndez"; evento = Festival Nacional Minibasket 2026 MX, Tampico Tamaulipas, 22–26 de julio de 2026 — Reason: usuario compartió el póster del evento y 2 links de Google Maps (`share.google/oWAHFcFMPlNHjam04` → resuelve a búsqueda "unidep tampico"; `share.google/6wqnDVH8E86xSuiK8` → resuelve a búsqueda "parque mendez"). **Advertencia de urgencia:** hoy es 2026-07-19, el evento empieza en 3 días (2026-07-22) — F2 a F7 deben completarse antes de esa fecha, prioridad máxima a llaves de Supabase y alta de productos.
[2026-07-19] Decision: repo remoto conectado en `git@github.com:Biergemg/AppVenta.git`, rama renombrada `master` → `main`, push inicial hecho (3 commits) — Reason: usuario dio la URL del repo y pidió commitear y pushear ahora. Deploy a Vercel sigue siendo manual: el usuario conecta el repo en Vercel una sola vez y desde ahí cada `git push` a `main` dispara un deploy automático (integración nativa de Vercel con GitHub, no requiere CLI ni acción del agente).
[2026-07-19] Decision: NO se hará deploy a Vercel hasta que el usuario diga que todo está completo — Reason: usuario lo pidió explícitamente ("no lo haré hasta tener todo listo completo"); seguir commiteando/pusheando a `main` normalmente, pero no conectar/activar Vercel todavía.
[2026-07-19] Decision: duraciones del inflable pasan de 30/60 min fijos a **15/30/45/60 min**, con precios editables en una tabla nueva `precios_inflable` (ver sección 4) en vez de hardcodeados — Reason: usuario no tiene confirmados los tiempos ni costos reales del inflable todavía; en vez de bloquear el desarrollo, se agregó la tabla ahora (antes de tener datos reales en Supabase, sin riesgo de migración) con las 4 duraciones sembradas y `precio = NULL` hasta que el usuario los defina en Ajustes. Un botón de duración sin precio se muestra deshabilitado, no rompe el resto de la app.
[2026-07-20] Decision: Supabase real conectado — Project URL `https://yjfnrcxpstmmnugnyjvr.supabase.co`, llave publishable en `.env.local` (no versionado). `schema.sql` corrido correctamente. **Gotcha encontrado:** en proyectos nuevos de Supabase (sistema de "Publishable/Secret keys"), crear una tabla desde el Table Editor la deja con RLS activado por default sin políticas, y los `alter table ... disable row level security` del script no bastaron por sí solos la primera vez — hubo que desactivar RLS manualmente por tabla desde Table Editor → ⋮ → Edit Table → desmarcar "Enable Row Level Security (RLS)" → Save, en las 6 tablas. Verificado con lectura y escritura reales vía REST (`insert`+`delete` de prueba en `productos`). F1 queda 100% completa, ya no hay bloqueo para F2.
[2026-07-20] Decision: F2 completa — alta rápida de producto (nombre, costo, precio, margen en vivo, stock inicial por sede) en Ajustes, "Entrada de mercancía" por producto, editar precio/costo, activar/desactivar, y edición de los 4 precios de inflable. Probado extremo a extremo contra Supabase real (insert producto + inventario_mov inicial ×2 + entrada + update precio + update precio_inflable), datos de prueba borrados después. Reason: siguiente paso natural del plan tras conectar Supabase; el usuario aclaró que él da de alta los productos reales, esto solo construye la herramienta.
[2026-07-20] Decision: F3 completa — Vender (cuadrícula de productos activos con precio y stock restante de mi sede, orden fijo por id ascendente, nunca por popularidad; tocar agrega al ticket; ticket con +/− por renglón respetando el stock disponible) + pantalla de Cobro (overlay de pantalla completa: total, botones Exacto/$50/$100/$200/$500 + campo libre, feria en número gigante verde/rojo, confirmar deshabilitado si el pago es menor al total). `registrarVenta` (src/lib/ventas.ts) inserta todas las líneas del ticket en un solo INSERT (atómico a nivel Postgres) con costo_unit/precio_unit copiados del producto en ese momento (snapshot). Probado extremo a extremo contra Supabase real: 1x + 2x de 2 productos de prueba, pago $500, feria $435 (misma fórmula pagoCon−total), stock teórico bajó exactamente lo vendido; datos de prueba borrados después.
[2026-07-20] Decision: F4 completa — Resumen con polling cada 12s (`src/lib/resumen.ts` calcula todo al vuelo desde `ventas`/`productos`/`inventario_mov`/`tiempos`, nada se guarda). Incluye: venta total y ganancia con desglose A/B y bebidas/inflable, ranking "todo el evento" y "última hora" (ventana de 1h sobre `ts`), inventario teórico por producto×sede con semáforo (rojo si stock≤0, amarillo si <15% del `inicial` sembrado en `inventario_mov`), ventas por hora (últimas 12 barras) y resumen de inflable (niños atendidos = filas de `tiempos`, ingreso = ventas tipo inflable). Verificado con datos reales: 18/20 vendidos en una sede (10%→amarillo) y 5/5 en la otra (0→rojo), venta $345 y ganancia $161 coincidieron con el cálculo manual; datos de prueba borrados.
[2026-07-20] Decision: F5 completa — Inflable con `FormularioNino` (nombre+responsable+duración, reutiliza `PantallaCobro` para cobrar en el acto), tarjetas de tiempo con cuenta regresiva local (tick cada 1s independiente del polling de red, que sigue cada 12s solo para traer niños nuevos de la otra sede), barra de color verde→amarillo (≤5 min)→rojo (vencido), botones "+30 min" y "Ya salió" solo en tarjetas de mi sede. `registrarNino`/`extenderTiempo` en `src/lib/tiempos.ts` hacen 2 pasos (insert/update en `tiempos`, luego insert en `ventas` con `tiempo_id`) — si el 2º paso falla, el timer ya quedó activo (no bloquea al niño jugando), solo se pierde el registro del cobro, que se puede reintentar. Alarma: beep de Web Audio (`src/lib/alarma.ts`, tono generado, sin archivos) + vibración cada 3s mientras haya un vencido de MI sede, nunca de la otra. Wake Lock (`src/lib/useWakeLock.ts`) activo mientras haya niños en mi sede, con aviso visual si el navegador lo rechaza o no lo soporta. `PantallaCobro` se movió de `vender/` a `src/components/` por ser compartido entre Vender e Inflable. Probado extremo a extremo contra Supabase real: registrar niño (insert tiempos + venta con tiempo_id), extender 15→45 min, terminar (estado=terminado, desaparece de activos); datos y precios de prueba revertidos.
[2026-07-20] Decision: F6 completa — Caja con "Debes tener $X en la caja" gigante (fondos + ventas efectivo − retiros) y desglose informativo bebidas/inflable, la otra sede en chico, botones "Registrar fondo"/"Retiro" (formulario monto+nota), y "Corte" (capturo lo contado, la app muestra la diferencia en verde si sobra/cuadra o rojo si falta — no se guarda en ninguna tabla, es una comparación efímera en pantalla, el spec no pide persistirla). Polling cada 15s. Verificado con datos reales: fondo $1000 + ventas efectivo $230 ($150 bebida + $80 inflable) − retiro $200 = $1030 exacto; datos de prueba borrados. **F1–F6 completas.** Solo queda F7 (pulido UX + deploy, este último bloqueado hasta que el usuario confirme que todo está listo).
[2026-07-20] Decision: precio real de inflable confirmado — **30 min = $30**, horario del inflable 9am–5pm. Cargado directo en `precios_inflable` de Supabase real (fila `minutos=30`), no es dato de prueba. El horario es **solo informativo** (letrero físico), la app NO restringe el registro de niños por hora — decisión explícita del usuario para no agregar riesgo a 2 días del evento.
[2026-07-20] Decision: F7 (pulido) en progreso — auditoría contra sección 3: se encontraron y corrigieron varios botones por debajo del mínimo de 56px (TicketBar +/- estaban en 40px, varios botones de Ajustes/Inflable en 48px) — ahora todos los `<button>` de la app cumplen ≥56px de alto (los `<input>` se dejaron en 48px, que sigue pasando el piso de accesibilidad de la sección 7). Se agregó manejo de error de red explícito ("Sin internet. Reintenta.") en la carga inicial de Vender, Inflable y Caja — antes fallaban en silencio (Caja incluso renderizaba pantalla en blanco sin ningún mensaje si Supabase no respondía). Se agregó confirmación visual ("✓ Guardado") a guardar precio/costo y activar/desactivar en Ajustes, que antes no daban ninguna señal de éxito. Pendiente de esta fase: correr Lighthouse móvil real (sección 7, prueba 5) una vez haya build desplegado — no se puede correr aquí sin URL pública.
[2026-07-20] Decision: NO habrá más duraciones — solo 30 min + extensión. Se desactivaron (`activo=false`) las filas 15/45/60 min de `precios_inflable` en Supabase real; `FormularioNino` ahora filtra por `activo` antes de mostrar botones de duración. Se agregó Activar/Desactivar por duración en Ajustes (`src/lib/preciosInflable.ts` → `actualizarActivoPrecioInflable`) por si el negocio cambia de opinión — no requiere tocar código, solo reactivar desde la app.
[2026-07-20] Decision: correcciones pre-produccion tras auditoria y deploy inicial en Vercel con pantalla en blanco - se endurecio `src/lib/supabase.ts` para no romper la app al importar si faltan variables, se agrego redondeo centralizado a centavos (`src/lib/dinero.ts`) para ventas/caja/inflable, se bloqueo Cancelar durante un cobro en curso, se limpia el timer del inflable si falla el insert de venta para evitar timers huerfanos, `Resumen` agrupa ventas por hora local `America/Mexico_City`, inventario vuelve a incluir productos desactivados, caja evita retiros mayores al efectivo teorico y pinta negativo en rojo, alarma de inflable requiere/permite activacion por toque y muestra aviso si el navegador bloquea audio, y se agrego `robots.txt` + metadata noindex. Verificado localmente con `npm run lint` y `npm run build` PASS. Para Vercel hacen falta `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en Project Settings -> Environment Variables y redeploy.
