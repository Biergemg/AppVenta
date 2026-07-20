# AI Risk Register

> Riesgos introducidos o amplificados por el desarrollo asistido por IA en
> este proyecto. Revisar mensualmente o tras cualquier cambio grande de
> arquitectura, actualización de agente, o de servidor MCP.

Last reviewed: 2026-07-19
Reviewed by: agent (Claude Code, Sonnet 5) + usuario (biergemg@gmail.com)

---

## Active Risks

| Risk | Impact | Probability | Audit Trigger | Mitigation | Status |
|------|--------|------------|---------------|-----------|--------|
| Llaves de Supabase reales aún no existen; `.env.local` tiene placeholders | Medium | High (hasta que el usuario las entregue) | Cualquier intento de F2+ que necesite leer/escribir Supabase real | No avanzar F2 sin confirmar conexión real en /ajustes; no inventar llaves | Open |
| Sin login/RLS en Supabase (por diseño del spec, sección 2) — cualquiera con la URL puede leer/escribir | High | Low (URL no pública) | Si la URL se comparte fuera del círculo de las 2 sedes | La única mitigación es mantener la URL privada; documentado en CLAUDE.md sección 2 como decisión de negocio, no un descuido técnico | Monitoring |
| Contexto perdido tras compactación | Medium | High | Sesión > 2h o tarea compleja | Hook PreCompact guarda un marcador en Engram + HANDOVER.md manual | Mitigated |
| Deriva de contrato (CLAUDE.md desactualizado) | Medium | Medium | Refactor de arquitectura o cambio de dependencias | Pre-commit hook actualiza `.ai-context/session-context.md`; `last_updated` en CLAUDE.md se actualiza automáticamente al commitear CLAUDE.md | Mitigated |
| Servidor MCP no auditado | High | Low | Se agrega un nuevo servidor MCP | Checklist de `references/04-security-checklist.md` antes de instalar cualquiera nuevo — no se ha instalado ninguno nuevo en esta sesión | Open (preventivo, no hay incidente) |
| `engram save` en el hook PreCompact fallando silenciosamente si Engram deja de estar en PATH | Medium | Low | Cambio de máquina o desinstalación de Engram | El hook cae a `systemMessage` avisando "actualiza HANDOVER.md manualmente" | Mitigated |
| Sin tests automatizados (baseline_test_count: 0) | Medium | High | Cualquier regresión en F2+ no sería detectada automáticamente | Aceptado como deuda conocida para un proyecto de una sola persona/evento puntual; verificación manual (lint + build + prueba en navegador) sustituye tests por ahora | Open |

---

## Closed Risks

| Risk | Resolution | Closed On |
|------|-----------|-----------|
| CLAUDE.md real sobrescrito por el placeholder de create-next-app durante el scaffold de F1 | Restaurado completo desde el contexto de la conversación; verificado contra el original | 2026-07-19 |

---

## Risk Definitions

**Impact:** High = pérdida de datos/incidente de producción; Medium = retrabajo o pérdida de contexto recuperable; Low = fricción menor.
**Probability:** High = ocurre en la mayoría de sesiones; Medium = ocasional; Low = raro.
**Status:** Open = presente sin mitigar; Mitigated = mitigación activa; Monitoring = mitigado, vigilando recurrencia; Closed = eliminado.

---

## How to Update This Register

Agregar fila cuando: se instale un nuevo servidor MCP, se adopte un nuevo agente/herramienta, ocurra un incidente no anticipado, o se observe un patrón de riesgo nuevo.

Revisar mensualmente, o después de cada Fase (F1–F7) completada, dado que es un proyecto de vida corta (un evento puntual) — priorizar la revisión antes de F7 (despliegue a Vercel), que es donde el impacto de un riesgo no mitigado sería mayor.
