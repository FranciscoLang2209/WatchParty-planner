import type { Plan, Feature, Scope } from './types.ts';
export const STATUS = {
  todo: 'Por hacer',
  backlog: 'En backlog',
  in_progress: 'En curso',
  review: 'En revisión',
  done: 'Hecho',
  blocked: 'Bloqueado',
};
export const SCOPE = {
  must: 'Must · Esencial',
  should: 'Should · Deseable',
  could: 'Could · Después',
  wont: 'Fuera de alcance',
};
export const today = () => dateString(new Date());
export function dateString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function date(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}
export function addDays(s: string, n: number) {
  const d = date(s);
  d.setDate(d.getDate() + n);
  return dateString(d);
}
export function days(a: string, b: string) {
  return Math.round((date(b).getTime() - date(a).getTime()) / 86400000);
}
export function monday(s: string) {
  return addDays(s, -((date(s).getDay() + 6) % 7));
}
export function fmt(s: string | null) {
  return s
    ? date(s).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
    : 'Sin fecha';
}
export const allFeatures = (p: Plan) =>
  p.backlog.epics.flatMap((epic) =>
    epic.features.map((feature) => ({ feature, epic })),
  );
export const points = (f: Feature, p: Plan) =>
  f.estimate ?? p.team.capacity.default_estimate;
export const scopeOf = (f: Feature, s: Scope) => f.moscow ?? s;
export const capacity = (p: Plan) =>
  p.team.people
    .filter((x) => x.takes_tickets)
    .reduce((a, x) => a + x.weekly_points, 0) *
  (1 - p.team.capacity.buffer_ratio);
export function weeks(p: Plan) {
  const out: {
    start: string;
    end: string;
    capacity: number;
    sprint: number | null;
  }[] = [];
  for (
    let s = monday(p.team.project.starts);
    s <= p.team.project.deadline;
    s = addDays(s, 7)
  ) {
    const end = addDays(s, 6);
    const n = Math.max(
      0,
      days(
        s < p.team.project.starts ? p.team.project.starts : s,
        end > p.team.project.deadline ? p.team.project.deadline : end,
      ) + 1,
    );
    out.push({
      start: s,
      end,
      capacity: Math.round(((capacity(p) * n) / 7) * 100) / 100,
      sprint:
        p.team.sprints.find((x) => s >= x.starts && s <= x.ends)?.number ??
        null,
    });
  }
  return out;
}
export function weekFeatures(p: Plan, w: string) {
  return allFeatures(p).filter(
    ({ feature: f }) => f.starts && monday(f.starts) === w,
  );
}
export function remaining(p: Plan) {
  return allFeatures(p).filter(
    ({ feature: f, epic: e }) =>
      f.status !== 'done' && scopeOf(f, e.moscow) !== 'wont',
  );
}
export function validate(p: Plan): string[] {
  const errors: string[] = [];
  const fail = (m: string) => errors.push(m);
  if (!p?.backlog || !p?.team || !p?.riskRegister)
    return ['El plan está incompleto.'];
  if (
    !Array.isArray(p.backlog.epics) ||
    !p.backlog.epics.length ||
    !Array.isArray(p.team.people) ||
    !p.team.people.length ||
    !Array.isArray(p.team.sprints) ||
    !p.team.sprints.length ||
    !Array.isArray(p.riskRegister.risks) ||
    !Array.isArray(p.riskRegister.incidents)
  )
    return [
      'Se requiere al menos una épica, una persona y un sprint, y colecciones válidas.',
    ];
  const validDate = (s: unknown): s is string =>
    typeof s === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(s) &&
    dateString(date(s)) === s;
  const unique = (ids: string[], label: string) => {
    if (
      ids.some((x) => typeof x !== 'string' || !x.trim()) ||
      new Set(ids).size !== ids.length
    )
      fail(`IDs vacíos o repetidos en ${label}.`);
  };
  const fs = allFeatures(p).map((x) => x.feature);
  const ids = new Set(fs.map((x) => x.id));
  const people = new Set(p.team.people.map((x) => x.id));
  const ss = new Set(p.team.sprints.map((x) => x.number));
  unique(
    p.backlog.epics.map((x) => x.id),
    'épicas',
  );
  unique(
    fs.map((x) => x.id),
    'tickets',
  );
  unique(
    p.team.people.map((x) => x.id),
    'equipo',
  );
  unique(
    p.riskRegister.risks.map((x) => x.id),
    'riesgos',
  );
  unique(
    p.riskRegister.incidents.map((x) => x.id),
    'incidentes',
  );
  if (
    !validDate(p.team.project.starts) ||
    !validDate(p.team.project.deadline) ||
    p.team.project.starts > p.team.project.deadline
  )
    fail('Fechas del proyecto inválidas.');
  if (
    !Number.isFinite(p.team.capacity.buffer_ratio) ||
    p.team.capacity.buffer_ratio < 0 ||
    p.team.capacity.buffer_ratio >= 1
  )
    fail('La reserva debe ser entre 0 y menos de 1.');
  if (
    !Number.isFinite(p.team.capacity.default_estimate) ||
    p.team.capacity.default_estimate <= 0 ||
    !Array.isArray(p.team.capacity.allowed_estimates) ||
    p.team.capacity.allowed_estimates.some((x) => !Number.isFinite(x) || x < 0)
  )
    fail('Escala de estimaciones inválida.');
  for (const x of p.team.people)
    if (
      !x.name?.trim() ||
      !x.role?.trim() ||
      typeof x.takes_tickets !== 'boolean' ||
      !Number.isFinite(x.weekly_points) ||
      x.weekly_points < 0
    )
      fail('Nombre, rol o capacidad personal inválidos.');
  const sorted = [...p.team.sprints].sort((a, b) =>
    a.starts.localeCompare(b.starts),
  );
  if (ss.size !== sorted.length) fail('Números de sprint repetidos.');
  sorted.forEach((s, i) => {
    if (
      !Number.isInteger(s.number) ||
      !s.name?.trim() ||
      !validDate(s.starts) ||
      !validDate(s.ends) ||
      s.starts > s.ends
    )
      fail(`Fechas inválidas: ${s.name}.`);
    if (i && sorted[i - 1].ends >= s.starts) fail('Los sprints se superponen.');
  });
  for (const e of p.backlog.epics) {
    if (
      !e.title?.trim() ||
      !ss.has(e.sprint) ||
      !Object.hasOwn(SCOPE, e.moscow)
    )
      fail(`Épica inválida: ${e.id}.`);
    for (const f of e.features) {
      if (
        !f.title?.trim() ||
        typeof f.description !== 'string' ||
        typeof f.evidence !== 'string' ||
        !Object.hasOwn(STATUS, f.status) ||
        (f.moscow && !Object.hasOwn(SCOPE, f.moscow))
      )
        fail(`Título, contenido, alcance o estado inválido: ${f.id}.`);
      if (
        f.estimate !== null &&
        (!Number.isFinite(f.estimate) ||
          !p.team.capacity.allowed_estimates.includes(f.estimate))
      )
        fail(`Estimación fuera de escala: ${f.id}.`);
      if (
        (f.starts !== null && !validDate(f.starts)) ||
        (f.ends !== null && !validDate(f.ends)) ||
        (f.starts && f.ends && f.starts > f.ends) ||
        Boolean(f.starts) !== Boolean(f.ends)
      )
        fail(`Completá ambas fechas en orden: ${f.id}.`);
      if (f.owner_id && !people.has(f.owner_id))
        fail(`Responsable inexistente: ${f.id}.`);
      for (const key of [
        'depends_on',
        'prototype',
        'ticket_refs',
        'acceptance',
      ] as const)
        if (!Array.isArray(f[key]) || f[key].some((x) => typeof x !== 'string'))
          fail(`Lista inválida: ${f.id} / ${key}.`);
      if (f.depends_on.some((d) => !ids.has(d) || d === f.id))
        fail(`Dependencia inválida: ${f.id}.`);
    }
  }
  const visiting = new Set<string>(),
    visited = new Set<string>();
  const byId = new Map(fs.map((f) => [f.id, f]));
  function visit(id: string) {
    if (visiting.has(id)) {
      fail(`Dependencia circular: ${id}.`);
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dep of byId.get(id)?.depends_on ?? [])
      if (ids.has(dep)) visit(dep);
    visiting.delete(id);
    visited.add(id);
  }
  fs.forEach((f) => visit(f.id));
  const riskIds = new Set(p.riskRegister.risks.map((x) => x.id));
  for (const r of p.riskRegister.risks) {
    if (
      !r.title?.trim() ||
      !['technical', 'schedule', 'scope', 'people', 'external'].includes(
        r.category,
      ) ||
      !['open', 'monitoring', 'mitigated', 'closed', 'materialized'].includes(
        r.status,
      ) ||
      ![r.probability, r.impact].every(
        (n) => Number.isInteger(n) && n >= 1 && n <= 5,
      )
    )
      fail(`Riesgo inválido: ${r.id}.`);
    if (
      (r.owner_id && !people.has(r.owner_id)) ||
      (r.related_sprint !== null && !ss.has(r.related_sprint)) ||
      !Array.isArray(r.related_feature_ids) ||
      r.related_feature_ids.some((id) => !ids.has(id))
    )
      fail(`Referencias inválidas: ${r.id}.`);
    if (r.review_date !== null && !validDate(r.review_date))
      fail(`Fecha de revisión inválida: ${r.id}.`);
    if (
      r.probability * r.impact >= 10 &&
      (!r.owner_id || !r.review_date || !r.mitigation_plan?.trim())
    )
      fail(`Riesgo alto: ${r.id} requiere responsable, revisión y mitigación.`);
  }
  for (const i of p.riskRegister.incidents) {
    if (
      !i.title?.trim() ||
      !['open', 'investigating', 'resolved', 'closed'].includes(i.status) ||
      !['low', 'medium', 'high', 'critical'].includes(i.severity) ||
      !validDate(i.occurred_at) ||
      (i.risk_id && !riskIds.has(i.risk_id)) ||
      (i.resolved_at !== null &&
        (!validDate(i.resolved_at) || i.resolved_at < i.occurred_at))
    )
      fail(`Incidente inválido: ${i.id}.`);
    if (
      ['resolved', 'closed'].includes(i.status) &&
      (!i.resolution?.trim() || !i.lessons_learned?.trim() || !i.resolved_at)
    )
      fail(`El incidente ${i.id} requiere resolución, aprendizaje y fecha.`);
  }
  return [...new Set(errors)];
}
export function removeFeatures(p: Plan, ids: string[]) {
  const next = structuredClone(p),
    set = new Set(ids);
  for (const e of next.backlog.epics)
    e.features = e.features
      .filter((f) => !set.has(f.id))
      .map((f) => ({
        ...f,
        depends_on: f.depends_on.filter((d) => !set.has(d)),
      }));
  for (const r of next.riskRegister.risks)
    r.related_feature_ids = r.related_feature_ids.filter((d) => !set.has(d));
  return next;
}
export function schedule(p: Plan, recalculate = false, now = today()) {
  const next = structuredClone(p),
    warnings: string[] = [];
  const grid = weeks(next);
  const all = allFeatures(next);
  const load = new Map<string, number>();
  const ownerLoad = new Map<string, number>();
  const byId = new Map(all.map((x) => [x.feature.id, x.feature]));
  const earliest =
    monday(now) < monday(next.team.project.starts)
      ? monday(next.team.project.starts)
      : monday(now);
  for (const { feature: f, epic: e } of all) {
    if (recalculate && f.status === 'todo' && !e.fixes) {
      f.starts = null;
      f.ends = null;
    }
    if (f.starts && f.status !== 'done') {
      load.set(
        monday(f.starts),
        (load.get(monday(f.starts)) ?? 0) + points(f, next),
      );
      if (f.owner_id)
        ownerLoad.set(
          `${monday(f.starts)}:${f.owner_id}`,
          (ownerLoad.get(`${monday(f.starts)}:${f.owner_id}`) ?? 0) +
            points(f, next),
        );
    }
  }
  const pending = all.filter(
    ({ feature: f, epic: e }) =>
      !f.starts && f.status !== 'done' && scopeOf(f, e.moscow) === 'must',
  );
  let work = [
    ...pending.filter((x) => x.epic.fixes),
    ...pending.filter((x) => !x.epic.fixes),
  ];
  for (let pass = 0; pass < all.length && work.length; pass++) {
    let placed = 0;
    work = work.filter(({ feature: f, epic: e }) => {
      const deps = f.depends_on.map((id) => byId.get(id));
      if (
        f.status === 'blocked' ||
        deps.some((d) => !d || (d.status !== 'done' && !d.starts))
      )
        return true;
      const sprint = next.team.sprints.find((s) => s.number === e.sprint)!;
      const floor = deps.reduce(
        (a, d) =>
          d?.status !== 'done' && d?.starts && monday(d.starts) > a
            ? monday(d.starts)
            : a,
        earliest > sprint.starts ? earliest : monday(sprint.starts),
      );
      const w = grid.find(
        (w) =>
          w.start >= floor &&
          (!e.fixes || w.start === monday(sprint.ends)) &&
          (load.get(w.start) ?? 0) + points(f, next) <= w.capacity + 0.001 &&
          (!f.owner_id ||
            !next.team.people.find((p) => p.id === f.owner_id)?.takes_tickets ||
            (ownerLoad.get(`${w.start}:${f.owner_id}`) ?? 0) +
              points(f, next) <=
              next.team.people.find((p) => p.id === f.owner_id)!.weekly_points *
                (w.capacity / capacity(next)) +
                0.001),
      );
      if (!w) return true;
      f.starts = w.start;
      f.ends =
        w.end > next.team.project.deadline ? next.team.project.deadline : w.end;
      load.set(w.start, (load.get(w.start) ?? 0) + points(f, next));
      if (f.owner_id)
        ownerLoad.set(
          `${w.start}:${f.owner_id}`,
          (ownerLoad.get(`${w.start}:${f.owner_id}`) ?? 0) + points(f, next),
        );
      placed++;
      return false;
    });
    if (!placed) break;
  }
  for (const { feature: f } of work)
    warnings.push(
      `${f.id}: sin espacio antes de la entrega o dependencia pendiente.`,
    );
  for (const { feature: f } of all) {
    if (f.starts) {
      for (const depId of f.depends_on) {
        const dep = byId.get(depId);
        if (
          dep?.status !== 'done' &&
          (!dep?.starts || monday(dep.starts) > monday(f.starts))
        )
          warnings.push(
            `${f.id}: la dependencia ${depId} no está prevista antes o en la misma semana.`,
          );
      }
    }
  }
  for (const w of grid)
    if ((load.get(w.start) ?? 0) > w.capacity)
      warnings.push(
        `${fmt(w.start)}: capacidad excedida por fechas ya comprometidas.`,
      );
  for (const w of grid)
    for (const person of next.team.people.filter((p) => p.takes_tickets)) {
      if (
        (ownerLoad.get(`${w.start}:${person.id}`) ?? 0) >
        person.weekly_points * (w.capacity / (capacity(next) || 1)) + 0.001
      )
        warnings.push(
          `${person.name}: sobrecapacidad en semana ${fmt(w.start)}.`,
        );
    }
  return { plan: next, warnings };
}
export function handoff(p: Plan, start: string, ids: string[]) {
  const chosen = allFeatures(p).filter((x) => ids.includes(x.feature.id));
  return `Plan semanal de WatchParty · ${fmt(start)} al ${fmt(addDays(start, 6))}\nFecha límite: ${p.team.project.deadline}. Capacidad: ${capacity(p)} h/semana. ${p.team.capacity.scale}\nEquipo: ${p.team.people
    .filter((x) => x.takes_tickets)
    .map((x) => `${x.name}: ${x.weekly_points} h (${x.role})`)
    .join(
      '; ',
    )}.\n\nFuentes: project-plan/features.yaml, team.yaml, risks.yaml, project-plan/evidence.md; repositorio https://github.com/FranciscoLang2209/WatchParty; referencia https://github.com/Pedrodeforonda/WatchParty-App-Styled; tracker https://multica.ai/watchparty/issues.\n\n${chosen.map(({ feature: f, epic: e }) => `${f.id} · ${f.title} · ${points(f, p)} h · Sprint ${e.sprint}\n${f.description}\nAceptación:\n${f.acceptance.map((a) => '- ' + a).join('\n')}\nDependencias: ${f.depends_on.join(', ') || 'ninguna'}\nReferencias: ${f.prototype.join(', ')}\nTickets existentes: ${f.ticket_refs.join(', ') || 'ninguno; comprobar duplicados'}\nEvidencia: ${f.evidence}`).join('\n\n')}\n\nDoD:\n${p.team.definition_of_done.join('\n')}\n\nFuera de alcance:\n${p.backlog.out_of_scope.join('\n')}\n\nAtención:\n${p.riskRegister.risks
    .filter((r) => ['open', 'monitoring'].includes(r.status))
    .map((r) => `${r.title}: ${r.mitigation_plan}`)
    .join('\n')}\n${p.riskRegister.incidents
    .filter((i) => ['open', 'investigating'].includes(i.status))
    .map((i) => i.title)
    .join(
      '\n',
    )}\n\nLeé el código actual y estas fuentes. Contrastá el mockup con el stack real React/Vite, Express y Supabase. Consultá los tickets remotos para evitar duplicados; no inventes resultados si no hay acceso. Estimaciones nuevas son propuestas, las existentes conservan su unidad original. Proponé entregas verticales pequeñas y distribución entre las tres personas, máximo 6 h cada una, respetando dependencias; preferí la misma persona para una cadena semanal. Mostrá coordinación inevitable y sobrecapacidad. Conservá los tickets existentes y su contenido. Presentá borradores y asignación concreta para revisión humana antes de solicitar autorización para crear o modificar tickets externos. Este planificador no crea tickets externos. Registrá únicamente IDs reales devueltos, fechas y estados acordados en YAML; pedí recargar el tablero tras cambios externos.`;
}
