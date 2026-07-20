# Tooling Compatibility

> Mapa por proyecto de qué agentes IA se usan, qué capacidades están
> activas, y qué fallbacks aplican.

Last updated: 2026-07-19
Updated by: agent (Claude Code, Sonnet 5)

---

## Active Agents

| Agent | Version | Role | Configuration | Support Level |
|-------|---------|------|---------------|---------------|
| Claude Code | (VSCode extension / CLI, modelo Sonnet 5) | Desarrollo primario, único agente en este proyecto | ~/.claude/skills/, .claude/settings.json (proyecto) | Complete |

---

## Capability Status

| Capability | Available | Configuration | Fallback Active |
|------------|-----------|---------------|-----------------|
| Persistent memory (Engram) | yes | CLI + MCP en PATH, proyecto detectado como "appventa" por nombre de carpeta | ninguno necesario |
| MCP servers | yes | engram, r-mcptools, y conectores claude.ai (Gmail/Calendar/Drive/IBKR sin autorizar todavía) | N/A para engram; los conectores sin autorizar simplemente no están disponibles |
| Hooks (automatizados) | yes | .claude/settings.json (proyecto): SessionStart, PreCompact. .git/hooks/pre-commit: actualiza .ai-context/session-context.md | ninguno necesario |
| Subagent dispatch | yes | Agent tool disponible (Explore, general-purpose, Plan, claude-code-guide, statusline-setup) | Manual review checklist si no se usa subagente de verify dedicado |
| Skill auto-loading | yes | ~/.claude/skills/, carga por descripción sin @-mention | N/A |
| Native memory | yes (secundaria a Engram) | ~/.claude/projects/<hash>/memory/ | Engram es la fuente primaria; memoria nativa como respaldo |

---

## Active MCP Servers

| Server | Transport | Scope | Verified | Permissions |
|--------|-----------|-------|----------|-------------|
| engram | stdio | user (CLI en PATH + MCP) | 2026-07-19 | mem_save, mem_search, mem_context, mem_save_prompt, mem_get_observation, mem_capture_passive, mem_compare, mem_judge, mem_suggest_topic_key (y las deferred: mem_update, mem_review, mem_pin, mem_unpin, mem_session_start/end, mem_doctor) |
| r-mcptools | stdio (deferred) | — | no verificado en este proyecto | No aplica a este stack (Next.js/Supabase, no R) |

---

## Known Conflicts and Limitations

- Ninguno detectado todavía en este proyecto (primera sesión con la skill activa).
- El puerto 3000 local está ocupado por otra app no relacionada del usuario — `npm run dev` de este proyecto corre en 3001+ automáticamente; no es un conflicto de esta skill, solo una nota operativa para no confundir servidores al probar.

---

## Degraded Mode Declaration

> Ninguna capacidad requerida está ausente actualmente.

**Current degraded mode:** ninguno. Engram, hooks y subagentes están disponibles. Único bloqueo real es de datos de negocio (llaves de Supabase), no de tooling.

---

## Onboarding for New Team Members

1. Instalar Claude Code (CLI o extensión VSCode).
2. Este proyecto no usa `.mcp.json` de proyecto — Engram se configura a nivel de usuario/máquina (`engram` en PATH).
3. Leer `CLAUDE.md` (spec de negocio + contrato técnico al final) antes de la primera sesión.
4. Confirmar Engram: `engram version` — si no está instalado, ver `references/02-memory-protocol.md` de advanced-ai-dev-skill para instalación y usar el fallback nativo mientras tanto.
5. Correr `npm install` y `npm run dev` para validar que el proyecto levanta.

Known issues on first setup: create-next-app rechaza nombres de carpeta con mayúsculas si se corre `create-next-app .` directamente dentro de ella — si hay que regenerar algo desde cero, generar en una carpeta temporal minúscula y mover el contenido con cuidado de no pisar `CLAUDE.md` (ver Notes and Decisions en CLAUDE.md, 2026-07-19).
