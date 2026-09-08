import { readFile, writeFile, rename, mkdir, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { parse, stringify } from 'yaml';
import type { Plugin, Connect } from 'vite';
import type { Plan } from '../src/types.ts';
import { validate } from '../src/plan.ts';
const files = {
  backlog: 'features.yaml',
  team: 'team.yaml',
  riskRegister: 'risks.yaml',
} as const;
export function planApi(root = resolve('project-plan')): Plugin {
  let queue: Promise<unknown> = Promise.resolve();
  async function read() {
    const plan = {} as Plan;
    for (const [key, file] of Object.entries(files))
      Object.assign(plan, {
        [key]: parse(await readFile(join(root, file), 'utf8')),
      });
    return plan;
  }
  const revision = (p: Plan) =>
    createHash('sha256').update(JSON.stringify(p)).digest('hex');
  const middleware: Connect.NextHandleFunction = async (req, res, next) => {
    if (!req.url?.startsWith('/api/')) return next();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    const reply = (status: number, data: unknown) => {
      res.statusCode = status;
      res.end(JSON.stringify(data));
    };
    const origin = req.headers.origin;
    if (
      origin &&
      origin !== `http://${req.headers.host}` &&
      origin !== `https://${req.headers.host}`
    )
      return reply(403, { error: 'Origen no permitido.' });
    try {
      if (req.url === '/api/plan' && req.method === 'GET') {
        await queue.catch(() => {});
        const p = await read();
        res.setHeader('ETag', revision(p));
        return reply(200, p);
      }
      if (req.url === '/api/plan' && req.method === 'PUT') {
        if (!req.headers['content-type']?.startsWith('application/json'))
          return reply(400, { error: 'Se requiere JSON.' });
        let raw = '';
        for await (const chunk of req) {
          raw += chunk;
          if (Buffer.byteLength(raw) > 3_000_000)
            return reply(413, { error: 'El plan supera 3 MB.' });
        }
        let p: Plan;
        try {
          p = JSON.parse(raw);
          const errors = validate(p);
          if (errors.length) return reply(400, { error: errors.join(' ') });
        } catch {
          return reply(400, {
            error: 'El plan tiene una estructura inválida.',
          });
        }
        const task = queue
          .catch(() => {})
          .then(async () => {
            const current = await read();
            if (req.headers['if-match'] !== revision(current)) {
              reply(409, {
                error:
                  'El archivo cambió fuera de esta pestaña. Exportá tus cambios antes de recargar.',
              });
              return;
            }
            await mkdir(root, { recursive: true });
            const staged = [];
            for (const [key, file] of Object.entries(files)) {
              const temp = join(root, `.${file}.${randomUUID()}.tmp`);
              await writeFile(
                temp,
                '# Generado por WatchParty Planner. El editor conserva campos; los comentarios YAML se reemplazan.\n' +
                  stringify(p[key as keyof Plan]),
              );
              staged.push([temp, join(root, file)]);
            }
            // ponytail: renames atómicos por archivo, no transacción de tres archivos; migrar a SQLite si se requiere atomicidad conjunta.
            for (const [temp, file] of staged) await rename(temp, file);
            const tag = revision(p);
            res.setHeader('ETag', tag);
            reply(200, { ok: true, savedAt: new Date().toISOString() });
          });
        queue = task;
        await task;
        return;
      }
      if (req.url === '/api/prototype-files' && req.method === 'GET') {
        const refs: string[] = [];
        async function walk(base: string, prefix: string) {
          for (const e of await readdir(base, { withFileTypes: true })) {
            if (
              e.name.startsWith('.') ||
              ['node_modules', 'build', 'dist'].includes(e.name)
            )
              continue;
            const rel = prefix + e.name;
            if (e.isDirectory()) await walk(join(base, e.name), rel + '/');
            else if (/\.(tsx?|css|md)$/.test(e.name)) refs.push(rel);
          }
        }
        try {
          await walk(resolve('../watchparty-reference'), '');
        } catch {}
        return reply(200, { files: refs.sort() });
      }
      reply(404, { error: 'Ruta API inexistente.' });
    } catch (error) {
      reply(500, {
        error:
          error instanceof Error
            ? `No se pudo leer o guardar el plan: ${error.message}`
            : 'Error del servidor local.',
      });
    }
  };
  return {
    name: 'local-plan-api',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
