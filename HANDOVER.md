# HANDOVER — 2026-07-19T23:00Z

> **Para la sesión que retome esto:** lee este archivo PRIMERO. Luego corre
> `mem_context` (Engram) para recuperar decisiones guardadas. Luego lee
> `.ai-context/session-context.md`. Recién después continúa desde "Siguiente
> paso exacto".

---

## Qué se estaba haciendo

Se completó la Fase 1 del plan en CLAUDE.md (scaffold Next.js + Tailwind +
Supabase + selector de sede) y, a pedido explícito del usuario, se instaló
por completo el protocolo de advanced-ai-dev-skill en este proyecto: git
local, pre-commit hook, hooks de Claude Code (SessionStart/PreCompact),
CLAUDE.md extendido con contrato técnico, AGENTS.md, HANDOVER.md (este
archivo), AI-WORKFLOW.md, tooling-compatibility.md, ai-risk-register.md y
ai-eval-rubric.md.

## Decisiones tomadas en esta sesión

- **Estructura de carpetas:** proyecto Next.js generado en `pos-evento-tmp`
  y movido a `AppVenta/` — **Reason:** `create-next-app` rechaza mayúsculas
  en el nombre del paquete cuando se apunta a `.` con una carpeta que las
  tiene.
- **CLAUDE.md restaurado:** el `mv` sobrescribió el CLAUDE.md real (spec de
  negocio) con el placeholder `@AGENTS.md` del template de create-next-app —
  se restauró completo desde el contexto de la conversación antes de seguir.
- **Llaves de Supabase:** no se tienen aún (usuario tiene cuenta pero nunca
  creó un proyecto). Se avanzó con `.env.local` con valores placeholder;
  Fase 2 no puede validarse contra Supabase real hasta que el usuario las
  entregue.
- **RLS deshabilitado** en las 5 tablas de `supabase/schema.sql` — el spec
  (sección 2) dice que no hay login, la URL no pública es la protección.
- **Git inicializado localmente** (no existía) para poder usar el
  pre-commit hook y `.ai-context/session-context.md` — sin remoto, sin
  push. El remoto/GitHub es parte de la Fase 7 / sección 8 del spec.
- **Pre-commit hook reescrito** para preservar "Active Tasks"/"Blocked
  Items" de `.ai-context/session-context.md` entre commits (el script de
  ejemplo en `references/01-project-contract.md` de la skill sobrescribe
  todo el archivo; se mejoró para que coincida con lo que el propio
  `session-context.md.template` dice que debería pasar).
- **Hooks de Claude Code:** se usó el skill `update-config` (en vez de
  copiar el JSON de ejemplo de la skill a ciegas) porque ese ejemplo no
  usa el schema real de `hooks` en `settings.json`. Se verificó que
  `engram save` (CLI) funciona desde este directorio antes de usarlo en el
  hook de PreCompact — el ejemplo de la skill sugiere `engram
  session-summary`, que **no existe** como subcomando de la CLI instalada
  (v1.19.0); se usó `engram save` en su lugar.

## Siguiente paso exacto al retomar

1. Si el usuario ya dio las llaves de Supabase: pegarlas en `.env.local`
   (no en `.env.local.example`), correr `supabase/schema.sql` en el SQL
   Editor del proyecto Supabase real, y verificar en `/ajustes` que el
   chequeo de conexión (src/app/(tabs)/ajustes/page.tsx) muestre "✓
   Conectado".
2. Si aún no las tiene: seguir esperando, no inventar credenciales.
3. Una vez conectado: arrancar Fase 2 — formulario de alta rápida de
   producto (nombre, costo, precio, stock inicial por sede) con
   ganancia/margen calculados en vivo mientras el usuario teclea, en
   `src/app/(tabs)/ajustes/page.tsx` (agregar debajo del bloque de
   conexión existente) o en una subruta nueva si crece demasiado.
   Criterio de aceptación (CLAUDE.md sección 6, F2): dar de alta 5
   productos en <2 min desde el celular.

## Archivos modificados en esta sesión

```
(ver git log — commit "Fase 1: scaffold Next.js + Tailwind + Supabase + selector de sede"
 más los archivos de esta skill que se commitean después de este HANDOVER)
```

## Archivos leídos pero no modificados

- `references/01-project-contract.md`, `03-verification-gates.md`,
  `02-memory-protocol.md`, `agent-setup/claude-code-setup.md` y todos los
  `references/templates/*.template` de advanced-ai-dev-skill — para no
  inventar la estructura de los artefactos que se generaron.

## Preguntas abiertas / pendientes

- [ ] Llaves reales de Supabase (URL + anon key) — bloqueante para F2 en adelante.
- [x] Nombre real de las 2 sedes — RESUELTO 2026-07-19: Sede A = "UNIDEP Tampico", Sede B = "Parque Méndez" (usuario compartió póster del evento + 2 links de Google Maps). Ya actualizado en `src/lib/sede.ts` y `CLAUDE.md`.

## Actualización 2026-07-19 (misma sesión, después del handover inicial)

Usuario compartió el póster del evento y 2 enlaces `share.google/...`. Los
enlaces no resuelven a una ficha de lugar (Google los redirige a una
búsqueda), pero el término de búsqueda en la URL de redirección reveló los
nombres reales: `share.google/oWAHFcFMPlNHjam04` → "unidep tampico";
`share.google/6wqnDVH8E86xSuiK8` → "parque mendez". Confianza: alta en el
nombre del lugar, sin confirmar la dirección exacta (la app no la necesita,
solo el nombre para el selector de sede).

**Dato crítico de calendario:** el evento (Festival Nacional Minibasket 2026
MX, Tampico Tamaulipas) es del 22 al 26 de julio de 2026. Hoy es 2026-07-19.
Quedan **3 días** para completar F2–F7 antes de que arranque el evento.
Priorizar: 1) llaves de Supabase, 2) F2 (alta de productos), 3) F3 (vender),
el resto según tiempo disponible — F5 (inflable) y F6 (caja) son necesarias
para operar el día 1, F7 (pulido/deploy) es la que más se puede recortar si
el tiempo aprieta.

Archivos actualizados en esta actualización: `CLAUDE.md` (sección 1,
sección 5.1, sección 5.6, Notes and Decisions), `AGENTS.md` (Active Project
State), `src/lib/sede.ts` (SEDES).

## Context at Handover

| Field | Value |
|-------|-------|
| Context usage at rotation | no aplica (handover generado por instalación de skill, no por rotación de contexto) |
| Active mode | strict (esquema/infra tocados en F1) |
| Memory saved to Engram | sí — observación "F1 completada: scaffold Next.js + Tailwind + Supabase + selector de sede" (id 98) |
| Tests passing | no hay tests configurados (baseline_test_count: 0) |
| Warnings delta from baseline | 0 (baseline_warnings: 0, `npm run lint` limpio) |
| Gate 1 last result | PASS (se leyeron los archivos reales antes de escribir código; no se inventaron nombres de campos) |
| Gate 2 last result | PASS (lint 0, build exitoso, rutas verificadas con curl) |
| Gate 3 last result | no alcanzado (no hay PR/merge en este proyecto local todavía) |

---

## Actualizacion 2026-07-20 - correcciones pre-produccion / Vercel

Usuario reporto que el sitio ya esta deployado en Vercel pero "no se ve nada" y pidio corregir, commitear, pushear y decir que variables poner en Vercel.

Cambios aplicados:
- `src/lib/supabase.ts`: ya no truena al importar si faltan variables publicas; las pantallas pueden mostrar error en vez de quedar en blanco.
- `src/lib/dinero.ts`: helper central para redondear dinero a 2 decimales.
- `src/components/PantallaCobro.tsx`: bloquea Cancelar mientras guarda, usa total exacto con 2 decimales y rechaza mas de 2 decimales en pago.
- `src/lib/ventas.ts`, `src/lib/tiempos.ts`, `src/lib/caja.ts`, `src/lib/resumen.ts`: totales, feria, caja y resumen redondeados a centavos.
- `src/lib/tiempos.ts`: si se crea el timer pero falla el cobro del inflable, borra el timer para evitar huerfanos indistinguibles.
- `src/lib/resumen.ts`: "Ventas por hora" usa hora local `America/Mexico_City`; inventario incluye productos desactivados para no ocultar stock historico.
- `src/lib/alarma.ts` + `src/app/(tabs)/inflable/page.tsx`: boton "Activar alarma", manejo de `AudioContext.resume()` con `await`, y aviso si el navegador bloquea audio.
- `src/app/(tabs)/caja/*`: retiro mayor al efectivo teorico queda bloqueado; efectivo negativo se muestra rojo.
- `src/app/layout.tsx` + `public/robots.txt`: noindex/nofollow para reducir riesgo de indexacion accidental.

Verificacion:
- `npm run lint` PASS.
- `npm run build` PASS.

Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Despues de guardar esas variables, hacer redeploy. Si sigue en blanco, revisar logs de Vercel y consola del navegador.

---

## Actualizacion 2026-07-20 - URL oficial

URL oficial de produccion: `https://app-venta.vercel.app/`.

El usuario confirmo que no comprara dominio; esta URL de Vercel sera la oficial del evento. Verificado desde navegador: abre correctamente y muestra el selector de sede (UNIDEP Tampico / Parque Mendez), por lo que el deploy ya no esta en blanco.

Siguiente paso: prueba operativa final en celular real con flujo completo de venta, inflable, caja y resumen.

---

## Actualizacion 2026-07-20 - pulido visual premium final

Pedido del usuario: entregar visualmente como app premium que hasta su mama entienda.

Cambios aplicados:
- `PRODUCT.md`: contexto de producto y principios de diseno.
- `src/app/globals.css`: tokens visuales, fondo claro, paneles, botones, focus states, reduced motion.
- `src/components/BottomNav.tsx`: navegacion inferior con iconos `lucide-react`.
- `src/components/SedeGate.tsx`: header de sede mas claro y badge universal "Sede activa".
- `src/app/page.tsx`: selector de sede redisenado con botones grandes.
- `Vender`, `TicketBar` y `PantallaCobro`: jerarquia de venta/cobro mas clara, total y feria protagonistas.
- `Inflable`: formulario/tarjetas/timer con mejor contraste, alarma destacada y estados claros.
- `Resumen`: tarjetas y listas mas legibles para venta, ganancia, ranking, inventario y barras por hora.
- `Caja`: teorico, movimientos y corte con paneles consistentes.
- `Ajustes`: productos, precios e inventario con controles mas grandes y menos apariencia tecnica.

Verificacion:
- `npm run lint` PASS.
- `npm run build` PASS.
- Playwright local en viewport movil 390x844: pantalla inicial, Vender e Inflable revisadas visualmente; sin traslapes relevantes. El circulo negro visto en capturas es overlay de Next dev, no produccion.

Nota: se agrego dependencia `lucide-react` para iconos.
