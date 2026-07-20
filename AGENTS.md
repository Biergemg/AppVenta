# AGENTS.md — Coordinación de Fases

> Proyecto de un solo agente (Claude Code). No hay múltiples agentes IA
> colaborando todavía, pero se usa esta tabla de fases (adaptada del patrón
> SDD de advanced-ai-dev-skill) para llevar trazabilidad de en qué etapa
> está cada Fase del plan de CLAUDE.md (F1–F7).

---

## Phase Table

| Phase | Agent / Role | Produces | Consumes | Exit Gate |
|-------|-------------|----------|----------|-----------|
| `init` | Claude Code | CLAUDE.md, baseline | — | Contrato cargado; stack confirmado sin preguntar |
| `explore` | Claude Code | Mapa de arquitectura | CLAUDE.md | Describe estructura y restricciones correctamente |
| `propose` | Claude Code | Opciones de solución | Explore | Usuario elige opción (cuando aplica) |
| `spec` | Claude Code | Sección de CLAUDE.md correspondiente a la Fase | Propuesta elegida | Usuario aprueba (implícito: CLAUDE.md ya es el spec) |
| `design` | Claude Code | Diseño técnico (rutas, tablas, componentes) | Spec | Sin hallazgos críticos |
| `tasks` | Claude Code | Lista de tareas atómicas (TodoWrite) | Diseño | Cada tarea es verificable |
| `apply` | Claude Code | Código + verificación manual | Tareas | Gates 1 y 2 pasan |
| `verify` | Claude Code (self-review, sin subagente dedicado aún) | Reporte Crítico/Importante/Menor/Aprobado | Apply | Sin hallazgos Críticos/Importantes sin resolver |
| `archive` | Claude Code | HANDOVER.md, mem_save/mem_session_summary, CLAUDE.md actualizado | Verify | Próxima sesión retoma sin re-derivar contexto |

---

## Phase Rules

1. Cada fase (F1–F7 de CLAUDE.md) produce un artefacto concreto antes de avanzar a la siguiente.
2. Ninguna fase se salta su exit gate (criterio de aceptación de la tabla en CLAUDE.md sección 6).
3. Aprobación humana requerida en: decisiones que toquen datos bloqueantes (llaves, credenciales), y antes de cualquier despliegue a Vercel/producción (F7 / sección 8).
4. Si un exit gate falla, la fase actual no se considera completa — se vuelve al inicio de esa fase, no a la anterior.
5. Ninguna fase de código (`apply`) se da por cerrada sin correr `npm run lint` y (cuando existan) los tests correspondientes.

---

## Agent Assignment

| Phase | Assigned agent / model | Notes |
|-------|----------------------|-------|
| init | Claude Code (Sonnet 5) | Único agente en este proyecto |
| explore | Claude Code (Sonnet 5) | |
| propose | Claude Code (Sonnet 5) | |
| spec | Claude Code (Sonnet 5) | El spec ya vive en CLAUDE.md |
| design | Claude Code (Sonnet 5) | |
| tasks | Claude Code (Sonnet 5) | Vía TodoWrite |
| apply | Claude Code (Sonnet 5) | |
| verify | Claude Code (Sonnet 5) | Self-review; sin subagente de code-review dedicado activado aún |
| archive | Claude Code (Sonnet 5) | HANDOVER.md + mem_save (Engram) |

---

## Handoff Protocol

Al terminar una fase (F1, F2, ... F7), el agente debe:

1. Confirmar el criterio de aceptación de la tabla de CLAUDE.md sección 6 con evidencia concreta (build/lint corridos, no "creo que ya quedó").
2. Actualizar `.ai-context/session-context.md` (lo hace automáticamente el pre-commit hook).
3. Actualizar `HANDOVER.md` con lo producido, lo que sigue, y preguntas abiertas.
4. Llamar `mem_save` con el resumen de decisiones de la fase.
5. Nombrar explícitamente los archivos producidos.

La siguiente sesión debe:
1. Leer `HANDOVER.md` primero.
2. Correr `mem_context` para cargar el historial.
3. Confirmar qué artefacto recibió antes de empezar a trabajar.

---

## Escalation Protocol

Si algo bloquea una fase (ej. falta de llaves de Supabase, decisión de negocio ambigua):

1. Detente — no lo resuelvas unilateralmente inventando un valor.
2. Documenta el bloqueo en HANDOVER.md bajo "Open Questions".
3. Pregunta al usuario: qué es el bloqueo, qué información falta, qué opciones hay, cuál recomienda el agente.
4. No avances de fase mientras el bloqueo siga abierto.

---

## Active Project State

| Field | Value |
|-------|-------|
| Current phase | F7 (Pulido UX + correcciones pre-producción + Vercel) — en verificación post-push |
| Last completed phase | F6 (Caja: fondo, retiros, corte con diferencia) + correcciones críticas F7 |
| Last completed on | 2026-07-20 |
| Next action | Verificar redeploy de Vercel con variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`; si sigue en blanco, revisar logs de Vercel/runtime del navegador |
| Blocking items | Ninguno en código local: `npm run lint` y `npm run build` pasan. Configuración obligatoria en Vercel: variables públicas de Supabase |
| **Fecha límite real** | **Evento (Festival Nacional Minibasket 2026 MX) empieza 2026-07-22 en Tampico, Tamaulipas — quedan 2 días para F5–F7** |
| Sedes reales | Sede A = UNIDEP Tampico, Sede B = Parque Méndez (confirmado 2026-07-19, ver CLAUDE.md sección 1 y Notes and Decisions) |
