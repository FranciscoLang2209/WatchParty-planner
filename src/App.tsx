import { useState, useEffect, useRef, type ReactNode } from 'react';
import {
  ListTodo,
  CalendarRange,
  CalendarDays,
  Users,
  Layers,
  ShieldAlert,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock3,
  Circle,
  Download,
  RefreshCw,
  Save,
  X,
  Trash2,
  GitBranch,
  Flag,
  Copy,
  AlertTriangle,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type {
  Plan,
  Feature,
  Epic,
  Risk,
  Incident,
  Status,
  Scope,
} from './types';
import {
  STATUS,
  SCOPE,
  allFeatures,
  capacity,
  weeks,
  weekFeatures,
  points,
  scopeOf,
  remaining,
  fmt,
  today,
  monday,
  days,
  addDays,
  validate,
  removeFeatures,
  schedule,
  handoff,
} from './plan';
const tabs = [
  ['backlog', 'Backlog', ListTodo],
  ['timeline', 'Cronograma', CalendarRange],
  ['week', 'Semana', CalendarDays],
  ['team', 'Equipo', Users],
  ['sprints', 'Sprints', Layers],
  ['risks', 'Riesgos', ShieldAlert],
] as const;
const palette = [
  '#25836b',
  '#5273ca',
  '#bc7b2d',
  '#9863bc',
  '#348d9d',
  '#bf637a',
  '#748b37',
];
const num = (n: number) =>
  n.toLocaleString('es-AR', { maximumFractionDigits: 2 });
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
function Badge({ status }: { status: Status }) {
  const Icon =
    status === 'done'
      ? CheckCircle2
      : status === 'in_progress'
        ? Clock3
        : status === 'blocked'
          ? AlertTriangle
          : Circle;
  return (
    <span className={`badge status-${status}`}>
      <Icon size={12} />
      {STATUS[status]}
    </span>
  );
}
function ScopeBadge({ value }: { value: Scope }) {
  return <span className={`scope scope-${value}`}>{value.toUpperCase()}</span>;
}
function download(name: string, content: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function uid(prefix: string, ids: string[]) {
  let n = 1;
  while (ids.includes(`${prefix}-${String(n).padStart(3, '0')}`)) n++;
  return `${prefix}-${String(n).padStart(3, '0')}`;
}
function Panel({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <aside className="editor" aria-label={title}>
      <header className="editor-head">
        <div>
          <small>{subtitle}</small>
          <h2>{title}</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Cerrar panel"
          onClick={onClose}
        >
          <X />
        </Button>
      </header>
      <div className="editor-body">{children}</div>
    </aside>
  );
}
function FeatureEditor({
  plan,
  item,
  onApply,
  onClose,
  onDelete,
  onDraft,
}: {
  plan: Plan;
  item: { feature: Feature; epic: Epic };
  onApply: (f: Feature, e: string) => void;
  onClose: () => void;
  onDelete: () => void;
  onDraft: (dirty: boolean) => void;
}) {
  const [f, setF] = useState(structuredClone(item.feature));
  const [epicId, setEpic] = useState(item.epic.id);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  function edit(change: Partial<Feature>) {
    setF({ ...f, ...change });
    setDirty(true);
    onDraft(true);
  }
  function close() {
    if (!dirty || confirm('Hay un borrador sin aplicar. ¿Descartarlo?')) {
      onDraft(false);
      onClose();
    }
  }
  const linked = plan.riskRegister.risks.filter((r) =>
    r.related_feature_ids.includes(f.id),
  );
  return (
    <Panel title={f.id} subtitle="DETALLE DEL TICKET" onClose={close}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const p = structuredClone(plan);
          for (const ep of p.backlog.epics)
            ep.features = ep.features.filter((x) => x.id !== f.id);
          p.backlog.epics.find((x) => x.id === epicId)!.features.push(f);
          const errors = validate(p);
          if (errors.length) {
            setError(errors.join(' '));
            return;
          }
          onApply(f, epicId);
          setError('');
          setDirty(false);
          onDraft(false);
        }}
      >
        <Field label="Título">
          <input
            value={f.title}
            onChange={(e) => edit({ title: e.target.value })}
            required
          />
        </Field>
        <div className="form-grid">
          <Field label="Estado">
            <select
              value={f.status}
              onChange={(e) => edit({ status: e.target.value as Status })}
            >
              {Object.entries(STATUS).map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Estimación · horas">
            <select
              value={f.estimate ?? ''}
              onChange={(e) =>
                edit({
                  estimate:
                    e.target.value === '' ? null : Number(e.target.value),
                })
              }
            >
              <option value="">Sin estimar</option>
              {plan.team.capacity.allowed_estimates.map((n) => (
                <option key={n} value={n}>
                  {num(n)} h
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Épica / sprint objetivo">
          <select
            value={epicId}
            onChange={(e) => {
              setEpic(e.target.value);
              setDirty(true);
              onDraft(true);
            }}
          >
            {plan.backlog.epics.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} · S{e.sprint}
              </option>
            ))}
          </select>
        </Field>
        <div className="form-grid">
          <Field label="Alcance">
            <select
              value={f.moscow ?? ''}
              onChange={(e) =>
                edit({
                  moscow: e.target.value
                    ? (e.target.value as Scope)
                    : undefined,
                })
              }
            >
              <option value="">
                Heredar{' '}
                {plan.backlog.epics
                  .find((e) => e.id === epicId)
                  ?.moscow.toUpperCase()}
              </option>
              {Object.entries(SCOPE).map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Responsable">
            <select
              value={f.owner_id ?? ''}
              onChange={(e) => edit({ owner_id: e.target.value || null })}
            >
              <option value="">Sin asignar</option>
              {plan.team.people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="form-grid">
          <Field label="Inicio previsto">
            <input
              type="date"
              value={f.starts ?? ''}
              onChange={(e) => edit({ starts: e.target.value || null })}
            />
          </Field>
          <Field label="Fin previsto">
            <input
              type="date"
              value={f.ends ?? ''}
              onChange={(e) => edit({ ends: e.target.value || null })}
            />
          </Field>
        </div>
        <Field label="Historia y alcance">
          <textarea
            rows={5}
            value={f.description}
            onChange={(e) => edit({ description: e.target.value })}
          />
        </Field>
        <Field label="Criterios de aceptación · uno por línea">
          <textarea
            rows={5}
            value={f.acceptance.join('\n')}
            onChange={(e) => edit({ acceptance: e.target.value.split('\n') })}
          />
        </Field>
        <Field label="Evidencia y límites">
          <textarea
            rows={4}
            value={f.evidence}
            onChange={(e) => edit({ evidence: e.target.value })}
          />
        </Field>
        {f.tracker_status && (
          <p className="notice neutral">
            Multica al relevar: <b>{f.tracker_status}</b>. El estado local se
            edita por separado.
          </p>
        )}
        <Field label="Dependencias">
          <select
            multiple
            size={5}
            value={f.depends_on}
            onChange={(e) =>
              edit({
                depends_on: Array.from(
                  e.target.selectedOptions,
                  (o) => o.value,
                ),
              })
            }
          >
            {allFeatures(plan)
              .filter((x) => x.feature.id !== f.id)
              .map(({ feature: x }) => (
                <option key={x.id} value={x.id}>
                  {x.id} · {x.title}
                </option>
              ))}
          </select>
        </Field>
        <small>
          ⌘ / Ctrl + clic para seleccionar varias. Se rechazan ciclos.
        </small>
        <Field label="Referencias de código · una por línea">
          <textarea
            rows={2}
            value={f.prototype.join('\n')}
            onChange={(e) =>
              edit({
                prototype: [...new Set(e.target.value.split('\n'))].filter(
                  Boolean,
                ),
              })
            }
          />
        </Field>
        <Field label="Tickets externos · ID o URL por línea">
          <textarea
            rows={2}
            value={f.ticket_refs.join('\n')}
            onChange={(e) =>
              edit({
                ticket_refs: [...new Set(e.target.value.split('\n'))].filter(
                  Boolean,
                ),
              })
            }
          />
        </Field>
        {f.ticket_refs.map((t) =>
          /^WAT-\d+$/.test(t) ? (
            <a
              className="source-link"
              key={t}
              href={`https://multica.ai/watchparty/issues/${t}`}
              target="_blank"
              rel="noreferrer"
            >
              <ArrowUpRight size={14} />
              Abrir {t} en Multica
            </a>
          ) : null,
        )}
        {linked.length > 0 && (
          <section className="mini-section">
            <h3>Riesgos vinculados</h3>
            {linked.map((r) => (
              <p key={r.id}>
                <ShieldAlert size={14} /> {r.title}{' '}
                <b>{r.probability * r.impact}/25</b>
              </p>
            ))}
          </section>
        )}
        {error && (
          <p role="alert" className="notice error">
            {error}
          </p>
        )}
        <div className="editor-actions">
          <Button type="submit" disabled={!dirty}>
            <Check size={15} />
            Aplicar cambios
          </Button>
          <span className="muted">
            {dirty ? 'Borrador sin guardar' : 'Sin cambios'}
          </span>
          <Button
            variant="destructive"
            size="icon"
            aria-label="Eliminar ticket"
            onClick={() => {
              if (
                confirm(
                  `¿Eliminar ${f.id}? Se quitarán sus dependencias y vínculos locales.`,
                )
              ) {
                onDraft(false);
                onDelete();
              }
            }}
          >
            <Trash2 />
          </Button>
        </div>
      </form>
    </Panel>
  );
}
export default function App() {
  const [plan, setPlan] = useState<Plan | null>(null),
    [tab, setTab] = useState('backlog'),
    [saveState, setSaveState] = useState('Cargando…'),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [sprint, setSprint] = useState('all'),
    [query, setQuery] = useState(''),
    [statusFilter, setStatusFilter] = useState('pending'),
    [scopeFilter, setScopeFilter] = useState('all');
  const [collapsed, setCollapsed] = useState<string[]>([
      'base',
      'onboarding',
      'later',
    ]),
    [selected, setSelected] = useState<string | null>(null),
    [week, setWeek] = useState(monday(today())),
    [zoom, setZoom] = useState(12),
    [allDeps, setAllDeps] = useState(false);
  const [riskId, setRiskId] = useState<string | null>(null),
    [riskView, setRiskView] = useState('register'),
    [riskFilter, setRiskFilter] = useState('all'),
    [incidentId, setIncidentId] = useState<string | null>(null);
  const latest = useRef<Plan | null>(null),
    revision = useRef(0),
    savedRevision = useRef(0),
    saving = useRef(false),
    loading = useRef(false),
    etag = useRef(''),
    draft = useRef(false),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  async function load(initial = false) {
    if (loading.current) return;
    if (saving.current) {
      setNotice('Esperá a que termine el guardado.');
      return;
    }
    if (
      !initial &&
      (revision.current !== savedRevision.current || draft.current) &&
      !confirm('¿Descartar cambios locales y volver a leer los archivos?')
    )
      return;
    if (timer.current) clearTimeout(timer.current);
    loading.current = true;
    try {
      const res = await fetch('/api/plan');
      const p = (await res.json()) as Plan & { error?: string };
      if (!res.ok) throw Error(p.error);
      const errors = validate(p);
      if (errors.length) throw Error(errors.join(' '));
      etag.current = res.headers.get('etag') ?? '';
      latest.current = p;
      setPlan(p);
      revision.current = 0;
      savedRevision.current = 0;
      draft.current = false;
      setSelected(null);
      setRiskId(null);
      setIncidentId(null);
      setSaveState('Guardado local');
      setError('');
    } catch (e) {
      setError(String(e));
      setSaveState('Error al cargar');
    } finally {
      loading.current = false;
    }
  }
  async function save() {
    if (
      saving.current ||
      loading.current ||
      !latest.current ||
      revision.current === savedRevision.current
    )
      return;
    saving.current = true;
    setSaveState('Guardando…');
    const rev = revision.current;
    try {
      const res = await fetch('/api/plan', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'If-Match': etag.current,
        },
        body: JSON.stringify(latest.current),
      });
      const result = (await res.json()) as { error?: string };
      if (!res.ok) throw Error(result.error);
      etag.current = res.headers.get('etag') ?? '';
      savedRevision.current = rev;
      setError('');
      setSaveState(
        revision.current === rev ? 'Guardado local' : 'Cambios sin guardar',
      );
    } catch (e) {
      setError(String(e));
      setSaveState('Error · cambios conservados');
    } finally {
      saving.current = false;
      if (revision.current !== rev) {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => void save(), 800);
      }
    }
  }
  function commit(p: Plan) {
    const errors = validate(p);
    if (errors.length) {
      setNotice(errors.join(' '));
      return false;
    }
    p.backlog.meta.updated = today();
    p.riskRegister.meta.updated = today();
    revision.current++;
    latest.current = p;
    setPlan(p);
    setSaveState('Cambios sin guardar');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void save(), 800);
    return true;
  }
  useEffect(() => {
    // La carga inicial aplica estado solo tras el fetch; el aviso síncrono es exclusivo de recargas manuales.
    // oxlint-disable-next-line react/react-compiler
    void load(true);
    function unload(e: BeforeUnloadEvent) {
      if (revision.current !== savedRevision.current || draft.current) {
        e.preventDefault();
      }
    }
    window.addEventListener('beforeunload', unload);
    return () => window.removeEventListener('beforeunload', unload);
  }, []);
  function safeSelect(id: string | null) {
    if (draft.current && !confirm('¿Descartar el borrador sin aplicar?'))
      return;
    draft.current = false;
    setSelected(id);
    setRiskId(null);
    setIncidentId(null);
  }
  if (!plan)
    return (
      <main className="loading">
        <img src="/favicon.svg" alt="" />
        <h1>WatchParty</h1>
        <p>{error || 'Abriendo tu plan de entrega…'}</p>
        <Button onClick={() => void load(true)}>Reintentar</Button>
      </main>
    );
  const all = allFeatures(plan),
    pending = remaining(plan),
    grid = weeks(plan),
    must = pending.filter((x) => scopeOf(x.feature, x.epic.moscow) === 'must'),
    mustHours = must.reduce((a, x) => a + points(x.feature, plan), 0),
    totalCapacity = grid.reduce((a, w) => a + w.capacity, 0),
    done = all.filter((x) => x.feature.status === 'done');
  const selectedItem = all.find((x) => x.feature.id === selected);
  const epicColor = (id: string) =>
    palette[
      [...plan.backlog.epics]
        .map((e) => e.id)
        .sort()
        .indexOf(id) % palette.length
    ];
  const matches = (f: Feature, e: Epic) =>
    (sprint === 'all' || e.sprint === Number(sprint)) &&
    (statusFilter === 'all' ||
      (statusFilter === 'pending' && f.status !== 'done') ||
      f.status === statusFilter) &&
    (scopeFilter === 'all' || scopeOf(f, e.moscow) === scopeFilter) &&
    `${f.id} ${f.title} ${f.description} ${f.ticket_refs.join(' ')}`
      .toLocaleLowerCase('es')
      .includes(query.toLocaleLowerCase('es'));
  function applyFeature(f: Feature, epicId: string) {
    const p = structuredClone(plan!);
    const old = p.backlog.epics.find((e) =>
      e.features.some((x) => x.id === f.id),
    );
    if (old?.id === epicId)
      old.features = old.features.map((x) => (x.id === f.id ? f : x));
    else {
      if (old) old.features = old.features.filter((x) => x.id !== f.id);
      p.backlog.epics.find((e) => e.id === epicId)!.features.push(f);
    }
    commit(p);
  }
  function addFeature(epicId: string) {
    if (draft.current && !confirm('¿Descartar el borrador actual?')) return;
    const p = structuredClone(plan!);
    const f: Feature = {
      id: uid(
        'WP',
        all.map((x) => x.feature.id),
      ),
      title: 'Nuevo ticket',
      description: '',
      acceptance: [],
      status: 'todo',
      estimate: null,
      starts: null,
      ends: null,
      depends_on: [],
      prototype: [],
      ticket_refs: [],
      evidence: 'Propuesta local pendiente de definición.',
      owner_id: null,
    };
    p.backlog.epics.find((e) => e.id === epicId)!.features.push(f);
    if (commit(p)) {
      draft.current = false;
      setSelected(f.id);
    }
  }
  function move(id: string, delta: number, epicId?: string) {
    const p = structuredClone(plan!);
    const arr = epicId
      ? p.backlog.epics.find((e) => e.id === epicId)!.features
      : p.backlog.epics;
    const i = arr.findIndex((x) => x.id === id);
    const j = i + delta;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    commit(p);
  }
  function planDates(recalc: boolean) {
    if (draft.current) {
      setNotice('Aplicá o descartá el borrador antes de planificar.');
      return;
    }
    if (
      recalc &&
      !confirm(
        '¿Recalcular fechas de propuestas sin ticket? Se conservan fechas de trabajo ya comprometido.',
      )
    )
      return;
    const result = schedule(plan!, recalc);
    if (commit(result.plan))
      setNotice(
        result.warnings.length
          ? result.warnings.join('\n')
          : 'Fechas calculadas respetando capacidad y dependencias.',
      );
  }
  function row(f: Feature, e: Epic, index: number) {
    return (
      <div
        key={f.id}
        className={`ticket-row ${selected === f.id ? 'selected' : ''}`}
      >
        <div className="order-control">
          <span>{String(index + 1).padStart(2, '0')}</span>
          <div>
            <button
              aria-label={`Subir ${f.id}`}
              onClick={() => move(f.id, -1, e.id)}
            >
              <ArrowUp size={12} />
            </button>
            <button
              aria-label={`Bajar ${f.id}`}
              onClick={() => move(f.id, 1, e.id)}
            >
              <ArrowDown size={12} />
            </button>
          </div>
        </div>
        <button className="ticket-main" onClick={() => safeSelect(f.id)}>
          <div>
            <span className="ticket-id">{f.id}</span>
            <strong>{f.title}</strong>
          </div>
          <p>{f.description || 'Falta describir el alcance'}</p>
        </button>
        {f.depends_on.length > 0 && (
          <span
            className="dep-count"
            title={`${f.depends_on.length} dependencias`}
          >
            <GitBranch size={13} />
            {f.depends_on.length}
          </span>
        )}
        <span
          className="estimate"
          title={
            f.estimate === null
              ? 'Sin estimar; planificación asume 3 h'
              : 'Estimación de esfuerzo'
          }
        >
          {f.estimate === null ? '—' : num(f.estimate)}
          <small>h</small>
        </span>
        <Badge status={f.status} />
        <button
          className="open-row"
          aria-label={`Abrir ${f.id}`}
          onClick={() => safeSelect(f.id)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }
  const weekWork = weekFeatures(plan, week).filter(
      (x) => x.feature.status !== 'done',
    ),
    weekCapacity = grid.find((w) => w.start === week)?.capacity ?? 0;
  const weekHours = weekWork.reduce((a, x) => a + points(x.feature, plan), 0);
  const riskActive = plan.riskRegister.risks.filter((r) =>
    ['open', 'monitoring'].includes(r.status),
  );
  const filteredRisks = plan.riskRegister.risks
    .filter((r) => riskFilter === 'all' || r.status === riskFilter)
    .sort(
      (a, b) =>
        b.probability * b.impact - a.probability * a.impact ||
        (a.review_date ?? '9999').localeCompare(b.review_date ?? '9999'),
    );
  const selectedRisk = plan.riskRegister.risks.find((r) => r.id === riskId),
    selectedIncident = plan.riskRegister.incidents.find(
      (i) => i.id === incidentId,
    );
  return (
    <Tabs
      value={tab}
      onValueChange={(v) => {
        if (
          draft.current &&
          !confirm(
            '¿Descartar el borrador sin aplicar antes de cambiar de vista?',
          )
        )
          return;
        draft.current = false;
        setTab(String(v));
      }}
      className="workspace"
    >
      <header className="topbar">
        <div className="brand">
          <img src="/favicon.svg" alt="" />
          <div>
            Watch<span>Party</span>
            <small>PLAN DE ENTREGA</small>
          </div>
        </div>
        <TabsList className="main-nav">
          {tabs.map(([value, label, Icon]) => (
            <TabsTrigger key={value} value={value}>
              <Icon size={15} />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="save-tools">
          <output className={`save-status ${error ? 'has-error' : ''}`}>
            <span />
            {saveState}
          </output>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Recargar archivos"
            onClick={() => void load()}
          >
            <RefreshCw size={16} />
          </Button>
          <Button variant="outline" onClick={() => void save()}>
            <Save size={14} />
            Guardar
          </Button>
        </div>
      </header>
      <main className="main-content">
        <div className="breadcrumb">
          <span>Workspace</span>
          <ChevronRight size={12} />
          <b>WatchParty</b>
          <span className="local-dot">Local · Multica como referencia</span>
        </div>
        {error && (
          <div role="alert" className="notice error">
            {error}
            <Button variant="outline" onClick={() => void save()}>
              Reintentar guardado
            </Button>
          </div>
        )}
        {notice && (
          <output className="notice neutral">
            <span style={{ whiteSpace: 'pre-line' }}>{notice}</span>
            <button aria-label="Cerrar aviso" onClick={() => setNotice('')}>
              <X size={16} />
            </button>
          </output>
        )}
        <div className="page-heading">
          <div>
            <div className="eyebrow">WATCHPARTY / LABORATORIO IV</div>
            <h1>{tabs.find((t) => t[0] === tab)?.[1]}</h1>
            <p>
              {tab === 'backlog'
                ? 'Del estado actual a una entrega concreta.'
                : tab === 'timeline'
                  ? 'Una semana, una capacidad real.'
                  : tab === 'week'
                    ? 'El próximo incremento del producto.'
                    : tab === 'team'
                      ? 'Tres personas. Dieciocho horas por semana.'
                      : tab === 'sprints'
                        ? 'Objetivos, límites y criterios de salida.'
                        : 'Anticipar lo que puede afectar la entrega.'}
            </p>
          </div>
          <div className="heading-actions">
            <span className="deadline">
              <Flag size={15} />
              <span>
                Entrega final<b>12 nov 2026</b>
              </span>
            </span>
            <Button
              variant="outline"
              onClick={() =>
                download('watchparty-plan.json', JSON.stringify(plan, null, 2))
              }
            >
              <Download size={15} />
              Exportar
            </Button>
            {tab === 'backlog' && (
              <Button
                onClick={() =>
                  addFeature(
                    plan.backlog.epics.find((e) => e.sprint === Number(sprint))
                      ?.id ??
                      plan.backlog.epics.find((e) => e.sprint === 2)?.id ??
                      plan.backlog.epics[0].id,
                  )
                }
              >
                <Plus size={15} />
                Nuevo ticket
              </Button>
            )}
          </div>
        </div>
        <section className="metrics" aria-label="Resumen del plan">
          <div>
            <span>Tickets del plan</span>
            <strong>
              {all.length}
              <small>
                {done.length} hechos · {pending.length} pendientes
              </small>
            </strong>
          </div>
          <div>
            <span>Esfuerzo esencial pendiente</span>
            <strong>
              {num(mustHours)}
              <small>horas · incluye reservas</small>
            </strong>
          </div>
          <div>
            <span>Capacidad hasta la entrega</span>
            <strong>
              {num(totalCapacity)}
              <small>horas · última semana parcial</small>
            </strong>
          </div>
          <div>
            <span>
              {mustHours > totalCapacity
                ? 'Alcance por recortar'
                : 'Margen del escenario'}
            </span>
            <strong
              className={
                mustHours > totalCapacity ? 'danger-text' : 'green-text'
              }
            >
              {num(Math.abs(totalCapacity - mustHours))}
              <small>
                {mustHours > totalCapacity
                  ? 'horas sobre capacidad'
                  : 'horas disponibles'}
              </small>
            </strong>
          </div>
        </section>
        <TabsContent value="backlog">
          <div className="scope-summary">
            <span>
              <b>Escenario MVP</b> · Must con fechas propuestas
            </span>
            <span>
              {num(
                pending
                  .filter((x) => scopeOf(x.feature, x.epic.moscow) === 'should')
                  .reduce((n, x) => n + points(x.feature, plan), 0),
              )}{' '}
              h deseables ·{' '}
              {num(
                pending
                  .filter((x) => scopeOf(x.feature, x.epic.moscow) === 'could')
                  .reduce((n, x) => n + points(x.feature, plan), 0),
              )}{' '}
              h posteriores · sin compromiso
            </span>
          </div>
          <div className="toolbar">
            <div className="searchbox">
              <Search size={16} />
              <input
                aria-label="Buscar tickets"
                placeholder="Buscar por título, ID o descripción…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  aria-label="Limpiar búsqueda"
                  onClick={() => setQuery('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <select
              aria-label="Filtrar sprint"
              value={sprint}
              onChange={(e) => setSprint(e.target.value)}
            >
              <option value="all">Todos los sprints</option>
              {plan.team.sprints.map((s) => (
                <option key={s.number} value={s.number}>
                  S{s.number} · {s.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Filtrar estado"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="pending">Pendientes</option>
              <option value="all">Todos los estados</option>
              {Object.entries(STATUS).map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </select>
            <select
              aria-label="Filtrar alcance"
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
            >
              <option value="all">Todo el alcance</option>
              {Object.entries(SCOPE).map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </select>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Colapsar o expandir todas las épicas"
              onClick={() =>
                setCollapsed(
                  collapsed.length ? [] : plan.backlog.epics.map((e) => e.id),
                )
              }
            >
              <SlidersHorizontal size={16} />
            </Button>
          </div>
          <div className={`split ${selectedItem ? 'has-editor' : ''}`}>
            <div className="backlog-list">
              <div className="list-caption">
                <span>
                  <Layers size={14} />
                  {
                    plan.backlog.epics.filter((e) =>
                      e.features.some((f) => matches(f, e)),
                    ).length
                  }{' '}
                  épicas visibles
                </span>
                <span>
                  Orden de ejecución · prioridad de arriba hacia abajo
                </span>
              </div>
              {plan.backlog.epics
                .filter(
                  (e) =>
                    e.features.some((f) => matches(f, e)) ||
                    (!e.features.length &&
                      (sprint === 'all' || Number(sprint) === e.sprint)),
                )
                .map((e) => {
                  const items = e.features.filter((f) => matches(f, e)),
                    closed = collapsed.includes(e.id),
                    h = e.features.reduce((a, f) => a + (f.estimate ?? 0), 0),
                    dh = e.features
                      .filter((f) => f.status === 'done')
                      .reduce((a, f) => a + (f.estimate ?? 0), 0);
                  return (
                    <section
                      className="epic-card"
                      key={e.id}
                      style={
                        { '--epic': epicColor(e.id) } as React.CSSProperties
                      }
                    >
                      <header className="epic-head">
                        <button
                          aria-label={`${closed ? 'Expandir' : 'Contraer'} ${e.title}`}
                          onClick={() =>
                            setCollapsed(
                              closed
                                ? collapsed.filter((x) => x !== e.id)
                                : [...collapsed, e.id],
                            )
                          }
                        >
                          {closed ? (
                            <ChevronRight size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                        <span className="epic-mark">
                          <Layers size={15} />
                        </span>
                        <button
                          className="epic-title"
                          onClick={() =>
                            setCollapsed(
                              closed
                                ? collapsed.filter((x) => x !== e.id)
                                : [...collapsed, e.id],
                            )
                          }
                        >
                          <h2>{e.title}</h2>
                          <span>
                            {e.id} <b>·</b> Sprint {e.sprint} <b>·</b>{' '}
                            {items.length} tickets
                          </span>
                        </button>
                        <ScopeBadge value={e.moscow} />
                        <div className="epic-total">
                          {num(h)} h
                          <small>
                            {
                              e.features.filter((f) => f.status === 'done')
                                .length
                            }
                            /{e.features.length} hechos
                          </small>
                        </div>
                        <details className="epic-menu">
                          <summary aria-label={`Acciones de ${e.title}`}>
                            •••
                          </summary>
                          <div>
                            <Button
                              variant="ghost"
                              onClick={() => move(e.id, -1)}
                            >
                              Subir épica
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => move(e.id, 1)}
                            >
                              Bajar épica
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => {
                                const title = prompt(
                                  'Nombre de la épica',
                                  e.title,
                                );
                                if (title?.trim()) {
                                  const p = structuredClone(plan);
                                  p.backlog.epics.find(
                                    (x) => x.id === e.id,
                                  )!.title = title;
                                  commit(p);
                                }
                              }}
                            >
                              Renombrar
                            </Button>
                            <select
                              aria-label={`Sprint de ${e.title}`}
                              value={e.sprint}
                              onChange={(ev) => {
                                const p = structuredClone(plan);
                                p.backlog.epics.find(
                                  (x) => x.id === e.id,
                                )!.sprint = Number(ev.target.value);
                                commit(p);
                              }}
                            >
                              {plan.team.sprints.map((s) => (
                                <option key={s.number} value={s.number}>
                                  Sprint {s.number}
                                </option>
                              ))}
                            </select>
                            <Button
                              variant="destructive"
                              disabled={plan.backlog.epics.length === 1}
                              onClick={() => {
                                if (
                                  confirm(
                                    `¿Eliminar la épica ${e.title} y sus tickets locales?`,
                                  )
                                ) {
                                  const p = removeFeatures(
                                    plan,
                                    e.features.map((f) => f.id),
                                  );
                                  p.backlog.epics = p.backlog.epics.filter(
                                    (x) => x.id !== e.id,
                                  );
                                  if (commit(p)) safeSelect(null);
                                }
                              }}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </details>
                      </header>
                      <progress
                        className="epic-progress"
                        aria-label={`Avance ${e.title}`}
                        value={dh}
                        max={h || 1}
                      />
                      {!closed && (
                        <>
                          <p className="epic-description">{e.description}</p>
                          {items.map((f) => row(f, e, e.features.indexOf(f)))}
                          <button
                            className="add-row"
                            onClick={() => addFeature(e.id)}
                          >
                            <Plus size={14} />
                            Agregar ticket
                          </button>
                        </>
                      )}
                    </section>
                  );
                })}
              {!all.some((x) => matches(x.feature, x.epic)) && (
                <div className="empty">
                  <Search />
                  <h3>No hay tickets con estos filtros</h3>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery('');
                      setSprint('all');
                      setStatusFilter('all');
                      setScopeFilter('all');
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  const title = prompt('Nombre de la nueva épica');
                  if (!title?.trim()) return;
                  const p = structuredClone(plan);
                  p.backlog.epics.push({
                    id: uid(
                      'epic',
                      p.backlog.epics.map((e) => e.id),
                    ),
                    title,
                    description: 'Épica propuesta.',
                    sprint: sprint === 'all' ? 2 : Number(sprint),
                    moscow: 'must',
                    features: [],
                  });
                  commit(p);
                }}
              >
                <Plus size={14} />
                Nueva épica
              </Button>
            </div>
            {selectedItem && (
              <FeatureEditor
                key={selectedItem.feature.id}
                plan={plan}
                item={selectedItem}
                onApply={applyFeature}
                onClose={() => safeSelect(null)}
                onDraft={(v) => (draft.current = v)}
                onDelete={() => {
                  commit(removeFeatures(plan, [selectedItem.feature.id]));
                  setSelected(null);
                }}
              />
            )}
          </div>
        </TabsContent>
        <TabsContent value="timeline">
          <div className="toolbar">
            <span className="muted">
              Fechas propuestas · seleccioná una barra o semana
            </span>
            <Button variant="outline" onClick={() => planDates(false)}>
              Ubicar sin fecha
            </Button>
            <Button variant="outline" onClick={() => planDates(true)}>
              Recalcular propuestas
            </Button>
            <select
              aria-label="Zoom del cronograma"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            >
              <option value={8}>Compacto</option>
              <option value={12}>Normal</option>
              <option value={18}>Ampliado</option>
            </select>
            <label className="inline-check">
              <input
                type="checkbox"
                checked={allDeps}
                onChange={(e) => setAllDeps(e.target.checked)}
              />
              Dependencias
            </label>
          </div>
          <Timeline
            plan={plan}
            zoom={zoom}
            allDeps={allDeps}
            selected={selected}
            selectedWeek={week}
            onFeature={safeSelect}
            onWeek={(s) => {
              setWeek(s);
              setTab('week');
            }}
            color={epicColor}
          />
          <p className="helper">
            {pending.filter((x) => !x.feature.starts).length} pendientes sin
            fecha · Las barras no implican confirmación. Las flechas unen
            dependencias visibles; secuencias en una semana requieren
            coordinación.
          </p>
          {selectedItem && (
            <div className="timeline-editor">
              <FeatureEditor
                key={selectedItem.feature.id}
                plan={plan}
                item={selectedItem}
                onApply={applyFeature}
                onClose={() => safeSelect(null)}
                onDraft={(v) => (draft.current = v)}
                onDelete={() => {
                  commit(removeFeatures(plan, [selectedItem.feature.id]));
                  setSelected(null);
                }}
              />
            </div>
          )}
        </TabsContent>
        <TabsContent value="week">
          <div className="narrow">
            <div className="toolbar">
              <select
                aria-label="Semana de planificación"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
              >
                {!grid.some((w) => w.start === week) && (
                  <option value={week}>{fmt(week)} · fuera del proyecto</option>
                )}
                {grid.map((w) => (
                  <option key={w.start} value={w.start}>
                    {fmt(w.start)} — {fmt(w.end)} · Sprint {w.sprint}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                onClick={() => setWeek(monday(today()))}
              >
                Semana actual
              </Button>
            </div>
            <div className="week-hero">
              <span className="eyebrow">
                PLAN SEMANAL / SPRINT{' '}
                {grid.find((w) => w.start === week)?.sprint ?? '—'}
              </span>
              <h2>
                {fmt(week)} <span>→</span> {fmt(addDays(week, 6))}
              </h2>
              <p>
                <b className={weekHours > weekCapacity ? 'danger-text' : ''}>
                  {num(weekHours)} h
                </b>{' '}
                planificadas de {num(weekCapacity)} h disponibles
              </p>
              <div className="capacity-bar">
                <span
                  className={weekHours > weekCapacity ? 'over' : ''}
                  style={{
                    width: `${Math.min(100, weekCapacity ? (weekHours / weekCapacity) * 100 : 0)}%`,
                  }}
                />
              </div>
              {weekHours > weekCapacity && (
                <p className="danger-text">
                  No entra en capacidad: retirás o movés{' '}
                  {num(weekHours - weekCapacity)} h antes de asignar.
                </p>
              )}
            </div>
            <div className="person-week">
              {plan.team.people
                .filter((p) => p.takes_tickets)
                .map((p) => {
                  const h = weekWork
                    .filter((x) => x.feature.owner_id === p.id)
                    .reduce((a, x) => a + points(x.feature, plan), 0);
                  const limit =
                    (p.weekly_points * weekCapacity) / (capacity(plan) || 1);
                  return (
                    <div key={p.id}>
                      <span className="avatar">
                        {p.name
                          .split(' ')
                          .slice(0, 2)
                          .map((x) => x[0])
                          .join('')}
                      </span>
                      <strong>
                        {p.name}
                        <small>
                          {num(h)} / {num(limit)} h asignadas
                        </small>
                      </strong>
                      {h > limit && (
                        <AlertTriangle className="danger-text" size={16} />
                      )}
                    </div>
                  );
                })}
            </div>
            <section className="section-card">
              <h3>
                Trabajo previsto{' '}
                <span className="count">{weekWork.length}</span>
              </h3>
              {weekWork.length ? (
                weekWork.map(({ feature: f, epic: e }, i) => (
                  <div key={f.id}>
                    {row(f, e, i)}
                    {f.depends_on.some(
                      (d) =>
                        all.find((x) => x.feature.id === d)?.feature.status !==
                        'done',
                    ) && (
                      <p className="dependency-note">
                        <GitBranch size={12} />
                        Revisar antes de iniciar:{' '}
                        {f.depends_on
                          .filter(
                            (d) =>
                              all.find((x) => x.feature.id === d)?.feature
                                .status !== 'done',
                          )
                          .join(', ')}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="muted">
                  No hay trabajo previsto esta semana. Asigná fechas desde el
                  backlog.
                </p>
              )}
            </section>
            <WeekHandoff plan={plan} start={week} onNotice={setNotice} />
            <section className="section-card">
              <h3>
                <ShieldAlert size={16} />
                Atención de la semana
              </h3>
              {riskActive
                .filter(
                  (r) =>
                    r.related_sprint ===
                      grid.find((w) => w.start === week)?.sprint ||
                    (r.review_date && r.review_date < today()),
                )
                .map((r) => (
                  <p key={r.id} className="risk-attention">
                    <b>{r.title}</b>
                    <span>{r.mitigation_plan}</span>
                  </p>
                ))}
              {plan.riskRegister.incidents
                .filter((i) => ['open', 'investigating'].includes(i.status))
                .map((i) => (
                  <p key={i.id}>{i.title}</p>
                ))}
            </section>
            {selectedItem && (
              <FeatureEditor
                key={selectedItem.feature.id}
                plan={plan}
                item={selectedItem}
                onApply={applyFeature}
                onClose={() => safeSelect(null)}
                onDraft={(v) => (draft.current = v)}
                onDelete={() => {
                  commit(removeFeatures(plan, [selectedItem.feature.id]));
                  setSelected(null);
                }}
              />
            )}
          </div>
        </TabsContent>
        <TabsContent value="team">
          <div className="narrow">
            <section className="section-card">
              <div className="section-head">
                <h2>Equipo de entrega</h2>
                <span className="chip">{capacity(plan)} h / semana</span>
              </div>
              <p className="muted">
                Disponibilidad confirmada por vos. Los nombres y roles de
                desarrollo provienen de Multica.
              </p>
              {plan.team.people.map((person) => (
                <form
                  className="person-card"
                  key={JSON.stringify(person)}
                  onChange={() => (draft.current = true)}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const p = structuredClone(plan);
                    Object.assign(
                      p.team.people.find((x) => x.id === person.id)!,
                      {
                        name: fd.get('name') as string,
                        role: fd.get('role') as string,
                        weekly_points: Number(fd.get('hours')),
                        takes_tickets: fd.get('takes') === 'on',
                      },
                    );
                    if (commit(p)) {
                      draft.current = false;
                      setNotice(
                        'Disponibilidad actualizada. Revisá sobrecargas antes de recalcular fechas.',
                      );
                    }
                  }}
                >
                  <div className="avatar large">
                    {person.name
                      .split(' ')
                      .slice(0, 2)
                      .map((x) => x[0])
                      .join('')}
                  </div>
                  <div className="person-fields">
                    <div className="form-grid">
                      <Field label="Nombre">
                        <input
                          name="name"
                          defaultValue={person.name}
                          required
                        />
                      </Field>
                      <Field label="Rol">
                        <input
                          name="role"
                          defaultValue={person.role}
                          required
                        />
                      </Field>
                    </div>
                    <div className="person-controls">
                      <label className="inline-check">
                        <input
                          name="takes"
                          type="checkbox"
                          defaultChecked={person.takes_tickets}
                        />
                        Toma tickets
                      </label>
                      <label>
                        Horas/semana{' '}
                        <input
                          className="hours-input"
                          name="hours"
                          type="number"
                          min={0}
                          step={0.25}
                          defaultValue={person.weekly_points}
                        />
                      </label>
                      <Button variant="outline" type="submit">
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </form>
              ))}
            </section>
            <section className="section-card">
              <h2>Definición de terminado</h2>
              {plan.team.definition_of_done.map((x) => (
                <p className="dod" key={x}>
                  <CheckCircle2 size={16} />
                  {x}
                </p>
              ))}
            </section>
            <section className="section-card">
              <h2>Acuerdos de planificación</h2>
              {plan.team.project.assumptions.map((a) => (
                <p className="assumption" key={a}>
                  {a}
                </p>
              ))}
            </section>
          </div>
        </TabsContent>
        <TabsContent value="sprints">
          <div className="narrow">
            {plan.team.sprints.map((s) => {
              const es = plan.backlog.epics.filter(
                  (e) => e.sprint === s.number,
                ),
                fs = es
                  .flatMap((e) => e.features)
                  .filter((f) => f.status !== 'done'),
                h = fs.reduce((a, f) => a + points(f, plan), 0),
                c = grid
                  .filter((w) => w.sprint === s.number)
                  .reduce((a, w) => a + w.capacity, 0);
              return (
                <section className="section-card sprint-card" key={s.number}>
                  <div className="section-head">
                    <span className="sprint-number">
                      {String(s.number).padStart(2, '0')}
                    </span>
                    <div>
                      <span className="eyebrow">SPRINT {s.number}</span>
                      <h2>{s.name}</h2>
                    </div>
                    <span
                      className={`chip ${s.number !== 6 && h > c ? 'warning' : ''}`}
                    >
                      {s.number === 6
                        ? 'Sin compromiso'
                        : s.number === 1
                          ? 'Histórico'
                          : `${num(h)} / ${num(c)} h`}
                    </span>
                  </div>
                  <form
                    key={JSON.stringify(s)}
                    onChange={() => (draft.current = true)}
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const p = structuredClone(plan);
                      Object.assign(
                        p.team.sprints.find((x) => x.number === s.number)!,
                        {
                          theme: fd.get('theme') as string,
                          starts: fd.get('starts') as string,
                          ends: fd.get('ends') as string,
                        },
                      );
                      if (commit(p)) draft.current = false;
                    }}
                  >
                    <Field label="Objetivo">
                      <input name="theme" defaultValue={s.theme} required />
                    </Field>
                    <div className="form-grid">
                      <Field label="Inicio">
                        <input
                          name="starts"
                          type="date"
                          defaultValue={s.starts}
                          required
                        />
                      </Field>
                      <Field label="Fin">
                        <input
                          name="ends"
                          type="date"
                          defaultValue={s.ends}
                          required
                        />
                      </Field>
                    </div>
                    <div className="sprint-footer">
                      <span>
                        {es.length} épicas · {fs.length} pendientes
                      </span>
                      <Button variant="outline" type="submit">
                        Aplicar fechas
                      </Button>
                    </div>
                  </form>
                  <p className="sprint-note">{s.notes}</p>
                  {s.number > 1 && s.number < 6 && h > c && (
                    <p className="notice warning">
                      El sprint objetivo excede su capacidad en {num(h - c)} h.
                      Las fechas de algunos tickets pueden pasar al siguiente
                      sprint; revisá el cronograma.
                    </p>
                  )}
                </section>
              );
            })}
            <section className="section-card">
              <h2>Fuera de alcance</h2>
              {plan.backlog.out_of_scope.map((t) => (
                <p className="assumption" key={t}>
                  {t}
                </p>
              ))}
            </section>
          </div>
        </TabsContent>
        <TabsContent value="risks">
          <div className="risk-summary">
            <span>
              <b>{riskActive.length}</b> riesgos activos
            </span>
            <span>
              <b>
                {
                  riskActive.filter((r) => r.impact * r.probability >= 15)
                    .length
                }
              </b>{' '}
              críticos
            </span>
            <span>
              <b>
                {
                  riskActive.filter(
                    (r) => r.review_date && r.review_date < today(),
                  ).length
                }
              </b>{' '}
              revisiones vencidas
            </span>
            <span>
              <b>
                {
                  plan.riskRegister.incidents.filter((i) =>
                    ['open', 'investigating'].includes(i.status),
                  ).length
                }
              </b>{' '}
              incidentes abiertos
            </span>
          </div>
          <div className="toolbar">
            <div className="subnav">
              {[
                ['register', 'Registro'],
                ['matrix', 'Matriz'],
                ['incidents', 'Incidentes'],
              ].map(([v, t]) => (
                <Button
                  key={v}
                  variant={riskView === v ? 'default' : 'ghost'}
                  onClick={() => setRiskView(v)}
                >
                  {t}
                </Button>
              ))}
            </div>
            <select
              aria-label="Filtrar riesgos por estado"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              {Object.entries({
                open: 'Abierto',
                monitoring: 'En seguimiento',
                mitigated: 'Mitigado',
                closed: 'Cerrado',
                materialized: 'Materializado',
              }).map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={() => {
                if (draft.current && !confirm('¿Descartar borrador?')) return;
                draft.current = false;
                const p = structuredClone(plan);
                if (riskView === 'incidents') {
                  const id = uid(
                    'INC',
                    p.riskRegister.incidents.map((x) => x.id),
                  );
                  p.riskRegister.incidents.push({
                    id,
                    title: 'Nuevo incidente',
                    description: '',
                    status: 'open',
                    severity: 'medium',
                    occurred_at: today(),
                    resolved_at: null,
                    risk_id: null,
                    resolution: '',
                    lessons_learned: '',
                  });
                  if (commit(p)) {
                    setIncidentId(id);
                    setRiskId(null);
                  }
                } else {
                  const id = uid(
                    'R',
                    p.riskRegister.risks.map((x) => x.id),
                  );
                  p.riskRegister.risks.push({
                    id,
                    title: 'Nuevo riesgo',
                    description: '',
                    probability: 1,
                    impact: 1,
                    status: 'open',
                    category: 'technical',
                    owner_id: null,
                    review_date: null,
                    mitigation_plan: '',
                    contingency_plan: '',
                    related_feature_ids: [],
                    related_sprint: null,
                  });
                  if (commit(p)) {
                    setRiskId(id);
                    setIncidentId(null);
                  }
                }
              }}
            >
              <Plus size={15} />
              {riskView === 'incidents' ? 'Nuevo incidente' : 'Nuevo riesgo'}
            </Button>
          </div>
          <div
            className={`split ${selectedRisk || selectedIncident ? 'has-editor' : ''}`}
          >
            <div>
              {riskView === 'register' && (
                <div className="section-card risk-register">
                  {filteredRisks.map((r) => (
                    <button
                      className="risk-row"
                      key={r.id}
                      onClick={() => {
                        if (draft.current && !confirm('¿Descartar borrador?'))
                          return;
                        draft.current = false;
                        setRiskId(r.id);
                        setIncidentId(null);
                      }}
                    >
                      <span
                        className={`risk-score level-${r.probability * r.impact >= 15 ? 'critical' : r.probability * r.impact >= 10 ? 'high' : r.probability * r.impact >= 5 ? 'medium' : 'low'}`}
                      >
                        {r.probability * r.impact}
                      </span>
                      <div>
                        <strong>{r.title}</strong>
                        <small>
                          {r.id} ·{' '}
                          {plan.team.people.find((p) => p.id === r.owner_id)
                            ?.name ?? 'Sin responsable'}{' '}
                          · Revisar {fmt(r.review_date)}
                        </small>
                      </div>
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>
              )}
              {riskView === 'matrix' && (
                <section className="section-card">
                  <h2>Probabilidad × impacto</h2>
                  <p className="muted">
                    Seleccioná un riesgo dentro de la matriz. 15–25 crítico ·
                    10–14 alto · 5–9 medio · 1–4 bajo.
                  </p>
                  <div className="matrix">
                    {[5, 4, 3, 2, 1].flatMap((prob) =>
                      [1, 2, 3, 4, 5].map((impact) => (
                        <div
                          key={`${prob}-${impact}`}
                          className={`matrix-cell level-${prob * impact >= 15 ? 'critical' : prob * impact >= 10 ? 'high' : prob * impact >= 5 ? 'medium' : 'low'}`}
                        >
                          <span>
                            P{prob} × I{impact} <b>{prob * impact}</b>
                          </span>
                          {filteredRisks
                            .filter(
                              (r) =>
                                r.probability === prob && r.impact === impact,
                            )
                            .map((r) => (
                              <button
                                key={r.id}
                                title={r.title}
                                onClick={() => {
                                  if (
                                    draft.current &&
                                    !confirm('¿Descartar borrador?')
                                  )
                                    return;
                                  draft.current = false;
                                  setRiskId(r.id);
                                  setIncidentId(null);
                                }}
                              >
                                {r.id}
                              </button>
                            ))}
                        </div>
                      )),
                    )}
                  </div>
                </section>
              )}
              {riskView === 'incidents' && (
                <section className="section-card">
                  {!plan.riskRegister.incidents.length ? (
                    <div className="empty">
                      <CheckCircle2 />
                      <h3>Sin incidentes registrados</h3>
                      <p>
                        Los riesgos son previsiones. Registrá un incidente
                        cuando ocurra.
                      </p>
                    </div>
                  ) : (
                    plan.riskRegister.incidents.map((i) => (
                      <button
                        className="risk-row"
                        key={i.id}
                        onClick={() => {
                          if (draft.current && !confirm('¿Descartar borrador?'))
                            return;
                          draft.current = false;
                          setIncidentId(i.id);
                          setRiskId(null);
                        }}
                      >
                        <AlertTriangle size={20} />
                        <div>
                          <strong>{i.title}</strong>
                          <small>
                            {i.id} · {fmt(i.occurred_at)} · {i.status}
                          </small>
                        </div>
                        <ChevronRight size={16} />
                      </button>
                    ))
                  )}
                </section>
              )}
            </div>
            {selectedRisk && (
              <RiskEditor
                key={selectedRisk.id}
                risk={selectedRisk}
                plan={plan}
                onDraft={(v) => (draft.current = v)}
                onClose={() => {
                  if (!draft.current || confirm('¿Descartar borrador?')) {
                    draft.current = false;
                    setRiskId(null);
                  }
                }}
                onApply={(r) => {
                  const p = structuredClone(plan);
                  p.riskRegister.risks = p.riskRegister.risks.map((x) =>
                    x.id === r.id ? r : x,
                  );
                  return commit(p);
                }}
                onDelete={() => {
                  const p = structuredClone(plan);
                  p.riskRegister.risks = p.riskRegister.risks.filter(
                    (x) => x.id !== selectedRisk.id,
                  );
                  p.riskRegister.incidents = p.riskRegister.incidents.map(
                    (i) => ({
                      ...i,
                      risk_id: i.risk_id === selectedRisk.id ? null : i.risk_id,
                    }),
                  );
                  if (commit(p)) {
                    setRiskId(null);
                    draft.current = false;
                  }
                }}
              />
            )}
            {selectedIncident && (
              <IncidentEditor
                key={selectedIncident.id}
                incident={selectedIncident}
                plan={plan}
                onDraft={(v) => (draft.current = v)}
                onClose={() => {
                  if (!draft.current || confirm('¿Descartar borrador?')) {
                    draft.current = false;
                    setIncidentId(null);
                  }
                }}
                onApply={(i) => {
                  const p = structuredClone(plan);
                  p.riskRegister.incidents = p.riskRegister.incidents.map(
                    (x) => (x.id === i.id ? i : x),
                  );
                  return commit(p);
                }}
                onDelete={() => {
                  const p = structuredClone(plan);
                  p.riskRegister.incidents = p.riskRegister.incidents.filter(
                    (x) => x.id !== selectedIncident.id,
                  );
                  if (commit(p)) {
                    draft.current = false;
                    setIncidentId(null);
                  }
                }}
              />
            )}
          </div>
        </TabsContent>
        <footer className="footer">
          <span>WatchParty · Plan local · Relevamiento 07/09/2026</span>
          <a
            href="https://multica.ai/watchparty/issues"
            target="_blank"
            rel="noreferrer"
          >
            Multica <ArrowUpRight size={12} />
          </a>
          <a
            href="https://github.com/FranciscoLang2209/WatchParty"
            target="_blank"
            rel="noreferrer"
          >
            Repositorio real <ArrowUpRight size={12} />
          </a>
          <a
            href="https://watch-party-hazel.vercel.app"
            target="_blank"
            rel="noreferrer"
          >
            Mockup <ArrowUpRight size={12} />
          </a>
        </footer>
      </main>
    </Tabs>
  );
}
function Timeline({
  plan,
  zoom,
  allDeps,
  selected,
  selectedWeek,
  onFeature,
  onWeek,
  color,
}: {
  plan: Plan;
  zoom: number;
  allDeps: boolean;
  selected: string | null;
  selectedWeek: string;
  onFeature: (id: string) => void;
  onWeek: (s: string) => void;
  color: (id: string) => string;
}) {
  const grid = weeks(plan),
    start = grid[0].start,
    width = grid.length * zoom * 7,
    left = 280;
  const [collapsed, setCollapsed] = useState<string[]>([
    'base',
    'onboarding',
    'later',
  ]);
  const inRange = (f: Feature) =>
    Boolean(
      f.starts &&
      f.ends &&
      f.ends >= start &&
      f.starts <= plan.team.project.deadline,
    );
  const rows = plan.backlog.epics
    .filter((e) => e.features.some(inRange))
    .flatMap((e) => [
      { epic: e, feature: null as Feature | null },
      ...(!collapsed.includes(e.id)
        ? e.features.filter(inRange).map((f) => ({ epic: e, feature: f }))
        : []),
    ]);
  const visible = new Map(
    rows.flatMap((r, i) =>
      r.feature ? [[r.feature.id, { f: r.feature, i }] as const] : [],
    ),
  );
  const arrows = rows.flatMap((r, i) =>
    r.feature
      ? r.feature.depends_on.flatMap((d) => {
          const dep = visible.get(d);
          if (
            !dep ||
            !dep.f.ends ||
            !r.feature!.starts ||
            (!allDeps && r.feature!.id !== selected && d !== selected)
          )
            return [];
          const x1 = Math.min(
              width,
              Math.max(0, days(start, dep.f.ends) + 1) * zoom,
            ),
            x2 = Math.max(0, days(start, r.feature!.starts)) * zoom;
          const y1 = dep.i * 42 + 21,
            y2 = i * 42 + 21;
          return (
            <path
              key={`${d}-${r.feature!.id}`}
              d={`M ${x1} ${y1} H ${x1 + 8} V ${y2 - 12} H ${Math.max(3, x2 - 7)} V ${y2} H ${x2}`}
              fill="none"
              stroke="#626975"
              strokeWidth="1.3"
              strokeDasharray="3 3"
              markerEnd="url(#arrow)"
            />
          );
        })
      : [],
  );
  return (
    <section className="gantt-card">
      <div className="gantt-scroll">
        <div className="gantt" style={{ width: left + width }}>
          <div
            className="gantt-header"
            style={{
              gridTemplateColumns: `${left}px repeat(${grid.length},${zoom * 7}px)`,
            }}
          >
            <div className="gantt-label">
              <b>Épica / ticket</b>
              <button
                onClick={() =>
                  setCollapsed(
                    collapsed.length ? [] : plan.backlog.epics.map((e) => e.id),
                  )
                }
              >
                {collapsed.length ? 'Expandir' : 'Contraer'}
              </button>
            </div>
            {grid.map((w) => {
              const load = weekFeatures(plan, w.start)
                .filter((x) => x.feature.status !== 'done')
                .reduce((a, x) => a + points(x.feature, plan), 0);
              return (
                <button
                  className={`gantt-week ${selectedWeek === w.start ? 'current' : ''}`}
                  key={w.start}
                  onClick={() => onWeek(w.start)}
                >
                  <span>Sprint {w.sprint}</span>
                  <b>{fmt(w.start)}</b>
                  <small className={load > w.capacity ? 'danger-text' : ''}>
                    {num(load)} / {num(w.capacity)} h
                  </small>
                </button>
              );
            })}
          </div>
          <div className="gantt-body">
            {rows.map(({ epic: e, feature: f }) => {
              const dated = e.features.filter(inRange),
                starts = f?.starts ?? dated.map((f) => f.starts!).sort()[0],
                ends =
                  f?.ends ??
                  dated
                    .map((f) => f.ends!)
                    .sort()
                    .at(-1);
              const x = Math.max(0, days(start, starts)) * zoom,
                w = Math.max(
                  0,
                  Math.min(width, (days(start, ends!) + 1) * zoom) - x,
                );
              return (
                <div
                  className={`gantt-row ${f ? '' : 'group-row'}`}
                  key={f?.id ?? e.id}
                  style={{ height: 42 }}
                >
                  <div className="gantt-row-label" style={{ width: left }}>
                    {f ? (
                      <button onClick={() => onFeature(f.id)}>
                        <span className="ticket-id">{f.id}</span>
                        {f.title}
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          setCollapsed(
                            collapsed.includes(e.id)
                              ? collapsed.filter((id) => id !== e.id)
                              : [...collapsed, e.id],
                          )
                        }
                      >
                        {collapsed.includes(e.id) ? (
                          <ChevronRight size={13} />
                        ) : (
                          <ChevronDown size={13} />
                        )}
                        <b>{e.title}</b>
                      </button>
                    )}
                  </div>
                  <div
                    className="gantt-lane"
                    style={{
                      left,
                      width,
                      backgroundSize: `${zoom * 7}px 100%`,
                    }}
                  >
                    {f ? (
                      <button
                        className={`gantt-bar ${e.fixes ? 'striped' : ''} ${selected === f.id ? 'active' : ''}`}
                        style={{
                          left: x,
                          width: Math.max(3, w - 3),
                          backgroundColor: color(e.id),
                        }}
                        onClick={() => onFeature(f.id)}
                        title={`${f.id} · ${f.title} · ${fmt(f.starts)} al ${fmt(f.ends)} · ${points(f, plan)} h · ${STATUS[f.status]}`}
                      >
                        <span>
                          {f.id} · {num(points(f, plan))} h
                        </span>
                      </button>
                    ) : (
                      <div
                        className="gantt-epic-bar"
                        style={{
                          left: x,
                          width: Math.max(3, w - 3),
                          backgroundColor: color(e.id),
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
            <svg
              aria-hidden="true"
              className="dependency-arrows"
              style={{ left }}
              width={width}
              height={rows.length * 42}
            >
              <defs>
                <marker
                  id="arrow"
                  markerWidth="5"
                  markerHeight="5"
                  refX="4"
                  refY="2.5"
                  orient="auto"
                >
                  <path d="M0 0 L5 2.5 L0 5" fill="#626975" />
                </marker>
              </defs>
              {arrows}
            </svg>
            {today() >= start && today() <= plan.team.project.deadline && (
              <div
                className="today-line"
                style={{ left: left + days(start, today()) * zoom }}
              >
                <span>Hoy</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
function WeekHandoff({
  plan,
  start,
  onNotice,
}: {
  plan: Plan;
  start: string;
  onNotice: (s: string) => void;
}) {
  const all = allFeatures(plan),
    grid = weeks(plan),
    w = grid.find((w) => w.start === start),
    cap = w?.capacity ?? 0;
  const candidates = all
    .filter(
      ({ feature: f, epic: e }) =>
        f.status === 'todo' &&
        !f.ticket_refs.length &&
        ['must', 'should'].includes(scopeOf(f, e.moscow)) &&
        e.sprint === w?.sprint,
    )
    .sort(
      (a, b) =>
        Number(b.feature.starts === start) - Number(a.feature.starts === start),
    );
  const booked = weekFeatures(plan, start)
    .filter(
      (x) =>
        x.feature.status !== 'done' &&
        !candidates.some((c) => c.feature.id === x.feature.id),
    )
    .reduce((n, x) => n + points(x.feature, plan), 0);
  const available = Math.max(0, cap - booked);
  const selected: typeof candidates = [];
  let total = 0;
  // ponytail: selección voraz en prioridad del backlog; revisar reparto por persona antes de comprometer.
  for (const item of candidates) {
    const f = item.feature;
    if (
      !f.description.trim() ||
      f.depends_on.some(
        (id) =>
          all.find((x) => x.feature.id === id)?.feature.status !== 'done' &&
          !selected.some((x) => x.feature.id === id),
      )
    )
      continue;
    if (total + points(f, plan) > available) continue;
    selected.push(item);
    total += points(f, plan);
  }
  const prompt = handoff(
    plan,
    start,
    selected.map((x) => x.feature.id),
  );
  return (
    <section className="section-card">
      <div className="section-head">
        <h3>
          <ListTodo size={16} />
          Propuesta para nuevos tickets
        </h3>
        <span className="chip">
          {num(total)} / {num(available)} h libres
        </span>
      </div>
      <p className="muted">
        {num(booked)} h ya reservadas. Solo propuestas sin ticket externo,
        dentro de capacidad y con dependencias terminadas o incluidas. Revisar
        las asignaciones y el trabajo ya comprometido.
      </p>
      {selected.length ? (
        selected.map((x) => (
          <p key={x.feature.id}>
            {x.feature.id} · {x.feature.title}
          </p>
        ))
      ) : (
        <p>
          No hay candidatos listos. Revisá las dependencias o las fechas del
          backlog.
        </p>
      )}
      <details>
        <summary>Ver instrucciones para el agente</summary>
        <textarea
          className="handoff"
          aria-label="Instrucciones de planificación"
          readOnly
          value={prompt}
          rows={10}
        />
      </details>
      <Button
        variant="outline"
        onClick={() =>
          navigator.clipboard
            .writeText(prompt)
            .then(() =>
              onNotice(
                'Instrucciones copiadas. No se creó ningún ticket externo.',
              ),
            )
            .catch(() =>
              onNotice(
                'No se pudo copiar. Seleccioná el texto de las instrucciones y copialo manualmente.',
              ),
            )
        }
      >
        <Copy size={15} />
        Copiar instrucciones
      </Button>
    </section>
  );
}
function RiskEditor({
  risk,
  plan,
  onApply,
  onDelete,
  onClose,
  onDraft,
}: {
  risk: Risk;
  plan: Plan;
  onApply: (r: Risk) => boolean;
  onDelete: () => void;
  onClose: () => void;
  onDraft: (b: boolean) => void;
}) {
  const [r, setR] = useState(structuredClone(risk)),
    [dirty, setDirty] = useState(false),
    [err, setErr] = useState('');
  function edit(p: Partial<Risk>) {
    setR({ ...r, ...p });
    setDirty(true);
    onDraft(true);
  }
  return (
    <Panel title={r.id} subtitle="RIESGO DEL PROYECTO" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const p = structuredClone(plan);
          p.riskRegister.risks = p.riskRegister.risks.map((x) =>
            x.id === r.id ? r : x,
          );
          const errors = validate(p);
          if (errors.length) {
            setErr(errors.join(' '));
            return;
          }
          if (onApply(r)) {
            setDirty(false);
            onDraft(false);
            setErr('');
          }
        }}
      >
        <Field label="Título">
          <input
            required
            value={r.title}
            onChange={(e) => edit({ title: e.target.value })}
          />
        </Field>
        <Field label="Descripción">
          <textarea
            rows={3}
            value={r.description}
            onChange={(e) => edit({ description: e.target.value })}
          />
        </Field>
        <div className="form-grid">
          <Field label="Probabilidad (1–5)">
            <input
              type="number"
              min={1}
              max={5}
              required
              value={r.probability}
              onChange={(e) => edit({ probability: Number(e.target.value) })}
            />
          </Field>
          <Field label="Impacto (1–5)">
            <input
              type="number"
              min={1}
              max={5}
              required
              value={r.impact}
              onChange={(e) => edit({ impact: Number(e.target.value) })}
            />
          </Field>
        </div>
        <p className="notice neutral">
          Exposición: <b>{r.probability * r.impact}/25</b>
          {r.probability * r.impact >= 10
            ? ' · Requiere responsable, mitigación y revisión.'
            : ''}
        </p>
        <div className="form-grid">
          <Field label="Estado">
            <select
              value={r.status}
              onChange={(e) =>
                edit({ status: e.target.value as Risk['status'] })
              }
            >
              {Object.entries({
                open: 'Abierto',
                monitoring: 'En seguimiento',
                mitigated: 'Mitigado',
                closed: 'Cerrado',
                materialized: 'Materializado',
              }).map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Categoría">
            <select
              value={r.category}
              onChange={(e) => edit({ category: e.target.value })}
            >
              {Object.entries({
                technical: 'Técnica',
                schedule: 'Cronograma',
                scope: 'Alcance',
                people: 'Equipo',
                external: 'Externa',
              }).map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Responsable">
          <select
            value={r.owner_id ?? ''}
            onChange={(e) => edit({ owner_id: e.target.value || null })}
          >
            <option value="">Sin asignar</option>
            {plan.team.people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="form-grid">
          <Field label="Próxima revisión">
            <input
              type="date"
              value={r.review_date ?? ''}
              onChange={(e) => edit({ review_date: e.target.value || null })}
            />
          </Field>
          <Field label="Sprint relacionado">
            <select
              value={r.related_sprint ?? ''}
              onChange={(e) =>
                edit({
                  related_sprint: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
            >
              <option value="">Ninguno</option>
              {plan.team.sprints.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Mitigación">
          <textarea
            rows={4}
            value={r.mitigation_plan}
            onChange={(e) => edit({ mitigation_plan: e.target.value })}
          />
        </Field>
        <Field label="Contingencia">
          <textarea
            rows={3}
            value={r.contingency_plan}
            onChange={(e) => edit({ contingency_plan: e.target.value })}
          />
        </Field>
        <Field label="Tickets relacionados">
          <select
            multiple
            size={5}
            value={r.related_feature_ids}
            onChange={(e) =>
              edit({
                related_feature_ids: Array.from(
                  e.target.selectedOptions,
                  (x) => x.value,
                ),
              })
            }
          >
            {allFeatures(plan).map(({ feature: f }) => (
              <option key={f.id} value={f.id}>
                {f.id} · {f.title}
              </option>
            ))}
          </select>
        </Field>
        {err && (
          <p role="alert" className="notice error">
            {err}
          </p>
        )}
        <div className="editor-actions">
          <Button type="submit" disabled={!dirty}>
            Aplicar cambios
          </Button>
          <Button
            variant="destructive"
            size="icon"
            aria-label="Eliminar riesgo"
            onClick={() => {
              if (
                confirm(
                  '¿Eliminar este riesgo? Se conservan sus incidentes sin vínculo.',
                )
              )
                onDelete();
            }}
          >
            <Trash2 />
          </Button>
        </div>
      </form>
    </Panel>
  );
}
function IncidentEditor({
  incident,
  plan,
  onApply,
  onDelete,
  onClose,
  onDraft,
}: {
  incident: Incident;
  plan: Plan;
  onApply: (i: Incident) => boolean;
  onDelete: () => void;
  onClose: () => void;
  onDraft: (b: boolean) => void;
}) {
  const [i, setI] = useState(structuredClone(incident)),
    [dirty, setDirty] = useState(false),
    [err, setErr] = useState('');
  function edit(p: Partial<Incident>) {
    setI({ ...i, ...p });
    setDirty(true);
    onDraft(true);
  }
  return (
    <Panel title={i.id} subtitle="INCIDENTE" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const p = structuredClone(plan);
          p.riskRegister.incidents = p.riskRegister.incidents.map((x) =>
            x.id === i.id ? i : x,
          );
          const errors = validate(p);
          if (errors.length) {
            setErr(errors.join(' '));
            return;
          }
          if (onApply(i)) {
            onDraft(false);
            setDirty(false);
            setErr('');
          }
        }}
      >
        <Field label="Título">
          <input
            required
            value={i.title}
            onChange={(e) => edit({ title: e.target.value })}
          />
        </Field>
        <Field label="Descripción e impacto">
          <textarea
            rows={4}
            value={i.description}
            onChange={(e) => edit({ description: e.target.value })}
          />
        </Field>
        <div className="form-grid">
          <Field label="Estado">
            <select
              value={i.status}
              onChange={(e) =>
                edit({
                  status: e.target.value as Incident['status'],
                  resolved_at: ['resolved', 'closed'].includes(e.target.value)
                    ? (i.resolved_at ?? today())
                    : i.resolved_at,
                })
              }
            >
              {Object.entries({
                open: 'Abierto',
                investigating: 'Investigando',
                resolved: 'Resuelto',
                closed: 'Cerrado',
              }).map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Severidad">
            <select
              value={i.severity}
              onChange={(e) => edit({ severity: e.target.value })}
            >
              {Object.entries({
                low: 'Baja',
                medium: 'Media',
                high: 'Alta',
                critical: 'Crítica',
              }).map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="form-grid">
          <Field label="Ocurrió el">
            <input
              required
              type="date"
              value={i.occurred_at}
              onChange={(e) => edit({ occurred_at: e.target.value })}
            />
          </Field>
          <Field label="Resuelto el">
            <input
              type="date"
              value={i.resolved_at ?? ''}
              onChange={(e) => edit({ resolved_at: e.target.value || null })}
            />
          </Field>
        </div>
        <Field label="Riesgo vinculado">
          <select
            value={i.risk_id ?? ''}
            onChange={(e) => edit({ risk_id: e.target.value || null })}
          >
            <option value="">Ninguno</option>
            {plan.riskRegister.risks.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id} · {r.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Resolución">
          <textarea
            rows={4}
            value={i.resolution}
            onChange={(e) => edit({ resolution: e.target.value })}
          />
        </Field>
        <Field label="Aprendizajes">
          <textarea
            rows={3}
            value={i.lessons_learned}
            onChange={(e) => edit({ lessons_learned: e.target.value })}
          />
        </Field>
        {err && (
          <p role="alert" className="notice error">
            {err}
          </p>
        )}
        <div className="editor-actions">
          <Button type="submit" disabled={!dirty}>
            Aplicar cambios
          </Button>
          <Button
            variant="destructive"
            size="icon"
            aria-label="Eliminar incidente"
            onClick={() => {
              if (confirm('¿Eliminar este incidente local?')) onDelete();
            }}
          >
            <Trash2 />
          </Button>
        </div>
      </form>
    </Panel>
  );
}
