import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse, stringify } from 'yaml';
import { createServer } from 'vite';
import { planApi } from '../server/plan-api.ts';
import type { Plan } from '../src/types.ts';
import {
  validate,
  weeks,
  weekFeatures,
  allFeatures,
  schedule,
  monday,
  points,
  removeFeatures,
  handoff,
} from '../src/plan.ts';
const files = {
  backlog: 'features.yaml',
  team: 'team.yaml',
  riskRegister: 'risks.yaml',
} as const;
const plan = {} as Plan;
for (const [key, file] of Object.entries(files))
  Object.assign(plan, {
    [key]: parse(await readFile(`project-plan/${file}`, 'utf8')),
  });
assert.deepEqual(validate(plan), []);
assert.equal(monday('2026-09-09'), '2026-09-07');
assert.equal(weeks(plan).at(-1)!.capacity, 10.29);
const historical = structuredClone(plan);
historical.team.project.starts = '2020-01-06';
historical.team.project.deadline = '2020-01-12';
for (const { feature: f } of allFeatures(historical)) {
  f.starts = null;
  f.ends = null;
}
assert(
  allFeatures(schedule(historical, false, '2026-09-07').plan).every(
    (x) => x.feature.starts === null,
  ),
);
const manual = structuredClone(plan);
const mf = allFeatures(manual).find((x) => x.feature.id === 'WP-006')!.feature;
mf.starts = '2026-09-23';
mf.ends = '2026-09-25';
mf.status = 'in_progress';
assert(weekFeatures(manual, '2026-09-21').some((x) => x.feature.id === mf.id));
const preserved = schedule(manual, true, '2026-09-07').plan;
assert.equal(
  allFeatures(preserved).find((x) => x.feature.id === mf.id)!.feature.starts,
  '2026-09-23',
);
const scheduled = schedule(plan, false, '2026-09-07');
assert.deepEqual(scheduled.warnings, []);
for (const w of weeks(scheduled.plan)) {
  const features = weekFeatures(scheduled.plan, w.start).filter(
    (x) => x.feature.status !== 'done',
  );
  assert(
    features.reduce((n, x) => n + points(x.feature, plan), 0) <=
      w.capacity + 0.001,
  );
  for (const p of plan.team.people.filter((p) => p.takes_tickets))
    assert(
      features
        .filter((x) => x.feature.owner_id === p.id)
        .reduce((n, x) => n + points(x.feature, plan), 0) <=
        (p.weekly_points * w.capacity) / 18 + 0.001,
    );
}
for (const { feature: f } of allFeatures(plan).filter((x) => x.feature.starts))
  for (const dep of f.depends_on) {
    const d = allFeatures(plan).find((x) => x.feature.id === dep)!.feature;
    assert(
      d.status === 'done' ||
        (d.starts && monday(d.starts) <= monday(f.starts!)),
    );
  }
const zero = structuredClone(plan);
zero.team.people.forEach((p) => (p.weekly_points = 0));
allFeatures(zero).forEach((x) => {
  x.feature.starts = null;
  x.feature.ends = null;
});
assert(schedule(zero, false, '2026-09-07').warnings.length > 0);
assert(
  allFeatures(schedule(zero, false, '2026-09-07').plan).every(
    (x) => !x.feature.starts,
  ),
);
const cycle = structuredClone(plan);
cycle.backlog.epics[0].features[0].depends_on = [
  cycle.backlog.epics[0].features[1].id,
];
cycle.backlog.epics[0].features[1].depends_on = [
  cycle.backlog.epics[0].features[0].id,
];
assert(validate(cycle).some((x) => x.includes('circular')));
assert.deepEqual(validate(removeFeatures(plan, ['WP-003'])), []);
const risky = structuredClone(plan);
risky.riskRegister.risks[0].owner_id = null;
assert(validate(risky).some((x) => x.includes('responsable')));
const invalidIncident = structuredClone(plan);
invalidIncident.riskRegister.incidents[0].status = 'closed';
assert(validate(invalidIncident).some((x) => x.includes('resolución')));
const prompt = handoff(plan, '2026-09-07', ['WP-001']);
assert(
  prompt.includes('WP-001') &&
    prompt.includes('6 h') &&
    prompt.includes('12') &&
    !prompt.includes('PitStop'),
);
const tmp = await mkdtemp(join(tmpdir(), 'watchparty-planner-check-'));
const server = await createServer({
  configFile: false,
  root: tmp,
  plugins: [planApi(tmp)],
  server: { host: '127.0.0.1', port: 0 },
  logLevel: 'silent',
});
try {
  for (const [key, file] of Object.entries(files))
    await writeFile(join(tmp, file), stringify(plan[key as keyof Plan]));
  await server.listen();
  const address = server.httpServer!.address();
  assert(address && typeof address === 'object');
  const base = `http://127.0.0.1:${address.port}`;
  const read = await fetch(base + '/api/plan');
  assert.equal(read.status, 200);
  const tag = read.headers.get('etag')!;
  assert.deepEqual(await read.json(), plan);
  const changed = structuredClone(plan);
  changed.backlog.epics[0].features[0].title += ' · fixture';
  changed.team.people[0].name += ' · fixture';
  changed.riskRegister.risks[0].title += ' · fixture';
  const headers = { 'Content-Type': 'application/json', 'If-Match': tag };
  const requests = await Promise.all([
    fetch(base + '/api/plan', {
      method: 'PUT',
      headers,
      body: JSON.stringify(changed),
    }),
    fetch(base + '/api/plan', {
      method: 'PUT',
      headers,
      body: JSON.stringify(changed),
    }),
  ]);
  assert.deepEqual(
    requests.map((x) => x.status).sort((a, b) => a - b),
    [200, 409],
  );
  assert.deepEqual(await (await fetch(base + '/api/plan')).json(), changed);
  const before = await Promise.all(
    Object.values(files).map((f) => readFile(join(tmp, f), 'utf8')),
  );
  const invalid = await fetch(base + '/api/plan', {
    method: 'PUT',
    headers,
    body: JSON.stringify(cycle),
  });
  assert.equal(invalid.status, 400);
  const malformed = await fetch(base + '/api/plan', {
    method: 'PUT',
    headers,
    body: '{"team":null}',
  });
  assert.equal(malformed.status, 400);
  const remote = await fetch(base + '/api/plan', {
    method: 'PUT',
    headers: { ...headers, Origin: 'https://example.com' },
    body: JSON.stringify(changed),
  });
  assert.equal(remote.status, 403);
  assert.equal((await fetch(base + '/api/unknown')).status, 404);
  assert.deepEqual(
    await Promise.all(
      Object.values(files).map((f) => readFile(join(tmp, f), 'utf8')),
    ),
    before,
  );
  console.log(
    'OK: datos, fechas, dependencias, reservas, capacidad semanal/personal, borrado, riesgos, handoff y API (round-trip, concurrencia, conflictos, rechazo sin escritura).',
  );
} finally {
  await server.close();
  await rm(tmp, { recursive: true, force: true });
}
