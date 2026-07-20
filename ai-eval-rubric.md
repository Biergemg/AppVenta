# AI Evaluation Rubric

> Operacionaliza las preguntas de evaluación de `references/06-evals-and-tracing.md`.
> Se completa al final de una fase significativa (aquí: cada Fase F1–F7 del
> spec de negocio, dado que el proyecto entero dura un evento puntual).

Project: Sistema POS de Evento — AppVenta
Phase / Period: F1 (scaffold Next.js + Tailwind + Supabase + selector de sede) + instalación completa de advanced-ai-dev-skill
Evaluator: agent (Claude Code) + usuario
Date: 2026-07-19

---

## Part 1: Skill Effectiveness

| Question | Rating | Evidence | Notes |
|----------|--------|----------|-------|
| Q1: ¿La skill evitó inventar contenido de archivos, nombres de campos o versiones de librerías? | Prevented | Se leyó `package.json` real antes de escribir "Tech Stack" en CLAUDE.md (versiones exactas: Next 16.2.10, React 19.2.4); se verificó `engram --help` antes de usar un subcomando en el hook de PreCompact, descubriendo que `engram session-summary` (sugerido por la skill) no existe en la CLI instalada — se corrigió a `engram save` | El caso de `engram session-summary` es evidencia directa: la skill misma tenía una instrucción no verificable que se habría instalado rota sin el gate de "no inventes, lee/prueba primero" |
| Q2: ¿Se redujo la pérdida de contexto entre sesiones? | N/A | Aún no hubo una segunda sesión que lo pruebe | Se preparó HANDOVER.md + .ai-context/session-context.md + mem_save para la próxima sesión |
| Q3: ¿Se evitó fricción innecesaria en tareas triviales? | N/A | Esta sesión fue de instalación de la skill, no una tarea trivial — modo strict correctamente aplicado (tocó .git/hooks, .claude/settings.json, schema.sql) | |
| Q4: ¿Se activó el fallback correcto cuando faltó una capacidad? | Prevented | Llaves de Supabase ausentes → se preguntó al usuario en vez de inventar/asumir; degraded mode documentado en tooling-compatibility.md como "ninguno" porque de hecho todo el tooling estaba disponible | |
| Q5: ¿Se detectó riesgo antes de una acción destructiva? | Prevented | Antes de mover archivos de la carpeta temporal a AppVenta se hizo `rm -rf pos-evento-tmp/.git` deliberadamente (evitar nested repo) pero el `mv` sobrescribió CLAUDE.md sin que se detectara ANTES — fue detectado y corregido DESPUÉS, no antes | Nota de calibración: este es un "Partial", no un "Prevented" completo — ver abajo |

**Ajuste:** Q5 debería calificarse **Partial**, no Prevented — el riesgo se corrigió rápido pero no se previno con una verificación previa (ej. diff antes de mover). Ver "Calibration Notes" en AI-WORKFLOW.md y considerar agregar un paso de verificación pre-mv en el futuro.

**Overall effectiveness score:** (3 Prevented + 0.5×1 Partial) / 4 preguntas no-N/A = 3.5 / 4 = 87.5%

---

## Part 2: Skill Cost Metrics

| Metric | Value | Target | Delta from target |
|--------|-------|--------|------------------|
| Gate override rate | 0% | < 30% por gate | dentro de objetivo |
| Gate false positive rate | no medido aún (una sola sesión) | < 20% | pendiente |
| Light mode usage rate | 0% (toda la sesión fue strict) | 10–40% | por debajo — esperado, sesión de infraestructura |
| Abandonment events | 0 | 0/semana | dentro de objetivo |
| Task completion without major rework | 1 rework (CLAUDE.md sobrescrito y restaurado) de ~2 tareas grandes = 50% | > 80% | por debajo del objetivo esta sesión |
| Context recovery success rate | no medido aún (sin sesión siguiente) | > 90% (Engram) | pendiente |

---

## Part 3: Gate Performance

| Gate | Times triggered | Pass rate | False positives | Notes |
|------|----------------|-----------|-----------------|-------|
| Gate 1 (antes de código) | 1 (F1) | 100% | 0 | |
| Gate 2 (después de código) | 1 (F1) | 100% | 0 | lint 0, build OK |
| Gate 3 (antes de merge) | 0 | N/A | N/A | no hay remoto/PR todavía |
| Gate 4 (métricas semanales) | 0 | N/A | N/A | proyecto de 1 día, no aplica cadencia semanal |

---

## Part 4: Findings and Actions

**What worked well:**
- Verificar `engram --help` antes de confiar en el comando sugerido por la skill evitó instalar un hook roto.
- Restaurar CLAUDE.md desde el contexto de la conversación en vez de re-escribirlo "de memoria" funcionó porque el contenido completo ya estaba en el historial de la sesión.

**What didn't work:**
- El `mv` de la carpeta temporal a `AppVenta/` no se verificó con un diff previo, lo que causó la sobrescritura accidental de CLAUDE.md. Debió haberse hecho un `ls`/backup antes del `mv`, no después de notar el problema.

**Calibration adjustments proposed:**
- Antes de mover/copiar archivos generados por un scaffolder hacia un directorio que ya tiene contenido del usuario, hacer `diff`/listar archivos que se van a sobrescribir ANTES de mover, no confiar en que "solo son archivos de plantilla".

**Actions before next review:**
- [ ] Cuando el usuario entregue las llaves de Supabase, validar la conexión real y actualizar este rubro con Q2/Q3 medibles.
- [ ] Al cerrar F2, volver a completar este rubro con datos reales de esa fase.

---

## Trend (Fill in after second evaluation)

| Period | Q1 | Q2 | Q3 | Q4 | Q5 | Override% | Completion% |
|--------|----|----|----|----|----|-----------|-----------  |
| F1 + instalación de skill (2026-07-19) | Prevented | N/A | N/A | Prevented | Partial | 0% | 50% |
