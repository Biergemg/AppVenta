# AI Workflow Log

> Bitácora de auditoría de sesiones de desarrollo asistido por IA. Formato:
> `[YYYY-MM-DDThh:mmZ] [event_type] [mode] [detail]`

---

## Session Log

```
[2026-07-19T22:29Z] session_start standard agent=claude-code contract_version=none memory=engram
[2026-07-19T22:40Z] contract_load strict CLAUDE.md contract_version=none baseline_warnings=unknown (proyecto sin código aún)
[2026-07-19T22:40Z] memory_retrieval standard source=engram retrieved="No previous session memories found."
[2026-07-19T23:10Z] scaffold_complete strict F1: Next.js + Tailwind + Supabase + schema.sql + selector de sede
[2026-07-19T23:10Z] gate_1 strict PASS — se leyeron package.json/estructura real antes de escribir código
[2026-07-19T23:10Z] gate_2 strict PASS — npm run lint 0 warnings, npm run build OK, rutas verificadas con curl
[2026-07-19T23:15Z] memory_save standard mem_save id=98 "F1 completada: scaffold Next.js + Tailwind + Supabase + selector de sede"
[2026-07-19T23:20Z] user_request strict "instala el advanced-ai-dev-stack completo, trazabilidad total, nada fuera de la skill"
[2026-07-19T23:25Z] git_init strict repo local inicializado (no existía); sin remoto, sin push
[2026-07-19T23:30Z] hook_install strict .git/hooks/pre-commit instalado (versión modificada: preserva Active Tasks/Blocked Items)
[2026-07-19T23:35Z] hook_install strict .claude/settings.json — SessionStart + PreCompact vía skill update-config (schema verificado, no copiado a ciegas)
[2026-07-19T23:40Z] contract_update strict CLAUDE.md — se agregó frontmatter contract_version:1 + secciones técnicas (Stack/Comandos/Reglas/Baseline/Notes) sin borrar el spec de negocio
[2026-07-19T23:50Z] artifact_create strict AGENTS.md, HANDOVER.md, AI-WORKFLOW.md, tooling-compatibility.md, ai-risk-register.md, ai-eval-rubric.md
[2026-07-19T23:55Z] session_close strict mem_summary=pending handover=created
```

---

## Architectural Decision Log

### 2026-07-19 — Git local sin remoto

**Context:** el proyecto no tenía control de versiones; la skill requiere git para el pre-commit hook y `.ai-context/session-context.md`.
**Decision:** `git init` local, sin conectar GitHub/Vercel todavía.
**Evidence:** CLAUDE.md sección 8 ("Repo en GitHub → conectar en Vercel") es una tarea de la Fase 7, no de ahora.
**Alternatives rejected:** esperar a F7 para tener git — descartado porque el usuario pidió trazabilidad "todo el tiempo", no solo al final.
**Mode:** strict

### 2026-07-19 — Pre-commit hook modificado vs. el de la skill

**Context:** el script de ejemplo en `references/01-project-contract.md` sobrescribe `.ai-context/session-context.md` completo en cada commit (`git log --oneline -10 > archivo`), pero el propio `session-context.md.template` documenta que "Active Tasks"/"Blocked Items" deberían preservarse entre commits — contradicción interna de la skill.
**Decision:** se implementó una versión del hook que preserva esas dos secciones y solo reemplaza el bloque de commits.
**Evidence:** `references/templates/session-context.md.template` líneas 6 y 62-64 vs. `references/01-project-contract.md` líneas 90-94.
**Alternatives rejected:** copiar el script literal de la skill — se descartó por destruir contenido mantenido a mano, violando la regla general de "nunca borrar contenido sin instrucción explícita".
**Mode:** strict

### 2026-07-19 — `engram save` en vez de `engram session-summary` en el hook de PreCompact

**Context:** `references/agent-setup/claude-code-setup.md` sugiere `engram session-summary` para el hook PreCompact.
**Decision:** se verificó `engram --help` en esta máquina (CLI v1.19.0) y ese subcomando no existe; se usó `engram save "<título>" "<mensaje>" --type discovery`, probado con un guardado y borrado de prueba (#99) antes de instalarlo en el hook real.
**Evidence:** salida de `engram --help` (sin subcomando `session-summary`); prueba real de `engram save` con exit exitoso.
**Alternatives rejected:** copiar el comando de la skill sin probarlo — habría producido un hook silenciosamente roto (cae al fallback "Engram no disponible" siempre).
**Mode:** strict

---

## Gate Results Summary

| Date | Gate | Mode | Result | Task | Notes |
|------|------|------|--------|------|-------|
| 2026-07-19 | 1 | strict | PASS | F1 scaffold | Se leyó package.json/estructura generada antes de escribir cliente Supabase y componentes |
| 2026-07-19 | 2 | strict | PASS | F1 scaffold | lint 0 warnings, build OK, curl a las 6 rutas devolvió 200 |
| 2026-07-19 | 3 | strict | no alcanzado | F1 scaffold | No hay PR — proyecto local, sin remoto todavía |

---

## Override Log

| Date | Gate / Policy | Override reason | Outcome |
|------|--------------|-----------------|---------|
| (ninguno registrado) | | | |

---

## MCP Server Registry

| Server | Version | Verified | Checklist | Notes |
|--------|---------|----------|-----------|-------|
| engram | v1.19.0 (CLI + MCP stdio) | 2026-07-19 | No se corrió el checklist de 04-security-checklist.md formalmente (servidor ya estaba instalado y en uso antes de esta sesión, no se instaló en esta sesión) | Usado para mem_save/mem_context/mem_search |

---

## Calibration Notes

- 2026-07-19: el modo `strict` se aplicó a toda la sesión de instalación de la
  skill porque tocó `.git/hooks`, `.claude/settings.json` y `schema.sql` —
  correcto según la tabla de intensidad. F2 en adelante (formularios de UI
  sin tocar esquema) debería poder bajar a `standard` salvo que también
  toque `supabase/schema.sql`.
