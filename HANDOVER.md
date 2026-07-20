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
- [ ] Nombre real de las 2 sedes si el usuario quiere cambiar "Frente A"/"Frente B" (configurable en Ajustes según sección 5.6, aún no implementado — hoy están hardcodeadas en `src/lib/sede.ts`).

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
