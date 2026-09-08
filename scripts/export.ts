import { readFile, writeFile } from 'node:fs/promises';
import { parse } from 'yaml';
import type { Plan } from '../src/types.ts';
import {
  allFeatures,
  scopeOf,
  points,
  weeks,
  remaining,
  STATUS,
  fmt,
} from '../src/plan.ts';
const p = {} as Plan;
for (const [key, file] of Object.entries({
  backlog: 'features',
  team: 'team',
  riskRegister: 'risks',
}))
  Object.assign(p, {
    [key]: parse(await readFile(`project-plan/${file}.yaml`, 'utf8')),
  });
const pending = remaining(p);
const sum = (s: string) =>
  pending
    .filter((x) => scopeOf(x.feature, x.epic.moscow) === s)
    .reduce((n, x) => n + points(x.feature, p), 0);
let text =
  '# WatchParty · backlog completo de planificación\n\nExportación de los YAML actuales. WP-* y FIX-* son IDs locales; WAT-* referencia trabajo remoto existente. No es una sincronización con Multica.\n\n';
for (const e of p.backlog.epics) {
  text += `## ${e.title} · Sprint ${e.sprint}\n\n${e.description}\n\n`;
  for (const f of e.features) {
    text += `### ${f.id} · ${f.title}\n\n- Estado: ${STATUS[f.status]}${f.tracker_status ? `; Multica al relevar: ${f.tracker_status}` : ''}\n- Alcance: ${scopeOf(f, e.moscow).toUpperCase()}\n- Estimación: ${f.estimate === null ? 'sin estimar (3 h para planificación, 0 para progreso)' : f.estimate + ' h'}\n- Fechas propuestas: ${f.starts ?? 'sin fecha'} → ${f.ends ?? 'sin fecha'}\n- Responsable: ${p.team.people.find((x) => x.id === f.owner_id)?.name ?? 'sin asignar'}\n- Dependencias: ${f.depends_on.join(', ') || 'ninguna'}\n- Tickets externos: ${f.ticket_refs.join(', ') || 'ninguno'}\n\n${f.description}\n\n**Criterios de aceptación**\n\n${f.acceptance.map((a) => '- ' + a).join('\n')}\n\n**Evidencia:** ${f.evidence}\n\n**Referencias:** ${f.prototype.join(', ') || 'ninguna'}\n\n`;
  }
}
await writeFile('project-plan/backlog.md', text);
let notes = `# WatchParty · plan de entrega\n\nFecha límite confirmada: **12/11/2026**. Equipo: **3 developers × 6 h/semana = 18 h/semana**. Corte de planificación: semana del 07/09. Sprints y estimaciones nuevas son propuestas; deben confirmarse en planificación semanal.\n\n## Qué contiene el plan\n\n${allFeatures(p).length} tickets: 37 unidades existentes relevadas en Multica y 60 propuestas/reservas locales. Se preservan 28 completadas. WAT-87 se referencia como coordinadora, sin duplicar sus horas. Los otros 11 Done de gestión histórica no se transcribieron individualmente.\n\n## Capacidad y corte sugerido\n\n| Concepto | Horas |\n| --- | ---: |\n| Capacidad hasta el 12/11 (última semana prorrateada) | ${weeks(
  p,
)
  .reduce((n, w) => n + w.capacity, 0)
  .toFixed(
    2,
  )} |\n| Must pendiente, incluyendo reservas y trabajo en curso | ${sum('must')} |\n| Should, pendiente de aprobación e inserción en calendario | ${sum('should')} |\n| Could, posterior al MVP | ${sum('could')} |\n\nEl Must incluye 14 h explícitas de reserva. La capacidad no descuenta ausencias, feriados ni esfuerzo ya consumido esta semana; las tareas en curso mantienen toda su estimación hasta que se conozca el remanente. El margen no garantiza que todas las tareas encajen: importan dependencias y habilidades.\n\n## Sprints propuestos\n\n| Sprint | Ventana | Resultado de salida |\n| --- | --- | --- |\n`;
for (const s of p.team.sprints.filter((s) => s.number >= 2 && s.number <= 5))
  notes += `| ${s.number} · ${s.name} | ${fmt(s.starts)} – ${fmt(s.ends)} | ${s.theme}. ${s.notes} |\n`;
notes +=
  '\n## Secuencia de trabajo\n\n1. Cerrar WAT-102/103/105/106/107/108/109, revisar PRs #25/#26/#29 y reconciliar WAT-112. No reconstruir lo integrado.\n2. Completar cuenta/perfil y entrar a una sala real con comentarios persistidos. Validar dos sesiones antes de extender el chat.\n3. Agregar reacciones y moderación básica; registro de visto, calificaciones, reseñas, historial, búsqueda y feed cronológico.\n4. Verificar permisos, accesibilidad, recorrido integrado y concurrencia; preparar QA y versión candidata.\n5. Cerrar documentación, evidencia y demo antes de la entrega. Proteger este período de nuevas funcionalidades.\n\n## Decisiones abiertas\n\n- **Datos deportivos actuales:** PR #29 documenta que la cuenta Free rechaza temporada 2026. Resolver INC-001: demo histórica etiquetada o aprobación de otra cobertura. El chat en tiempo real no equivale a datos deportivos en vivo.\n- **Cobertura de estadísticas/planteles:** el chequeo actual verifica fixtures, no todos los endpoints. Validar antes de desarrollar WP-023/024. Calificaciones de jugadores y fichas ampliadas quedan Should.\n- **Canal social y permisos:** WAT-87 fija React → Node API para lectura. Definir la extensión de tiempo real sin saltar controles de autorización.\n- **Carga individual:** conservar los responsables existentes y acordar nuevas asignaciones semanalmente, máximo 6 h por persona. El scheduler no sustituye ese acuerdo.\n\n## Qué queda fuera del corte esencial\n\nLas 19 h Should cubren presencia, jugadores/planteles, fichas ampliadas y compartir. Las 52 h Could cubren seguimiento, feed seguido, interacción ampliada, respuestas, búsqueda de personas, avatar, logros, notificaciones, avisos, actualización automática, estadísticas avanzadas, eliminación de cuenta y salas privadas. La política de retención/eliminación debe acordarse antes de ampliar un piloto a público general.\n\n## Cómo usar este backlog\n\nCada ticket abre descripción, criterios de aceptación, evidencia, referencias, dependencias, responsable y sprint. Editar y aplicar en la web guarda los YAML locales. Exportar genera una copia JSON; `npm run export` actualiza esta lectura y el backlog Markdown. No se crean ni modifican tickets en Multica.\n\nFuentes y límites detallados: [evidence.md](evidence.md). Catálogo completo: [backlog.md](backlog.md).\n';
await writeFile('project-plan/planning-notes.md', notes);
console.log('Exportados backlog.md y planning-notes.md.');
