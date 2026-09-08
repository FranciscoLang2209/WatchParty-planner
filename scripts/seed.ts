import { writeFile } from 'node:fs/promises';
import { stringify } from 'yaml';
import { schedule, validate, allFeatures } from '../src/plan.ts';
import type { Plan, Epic, Feature } from '../src/types.ts';
const epics: Epic[] = [];
function epic(
  id: string,
  title: string,
  sprint: number,
  description: string,
  moscow: Epic['moscow'] = 'must',
) {
  const e: Epic = { id, title, sprint, description, moscow, features: [] };
  epics.push(e);
  return e;
}
function add(
  e: Epic,
  id: string,
  title: string,
  estimate: number | null,
  depends: string,
  description: string,
  acceptance: string,
  evidence = 'Propuesta derivada del mockup y del alcance preliminar; no implementada en main.',
  owner: string | null = null,
  status: Feature['status'] = 'todo',
) {
  const f: Feature = {
    id,
    title,
    estimate,
    depends_on: depends.split(',').filter(Boolean),
    description,
    acceptance: acceptance.split('|'),
    evidence,
    owner_id: owner,
    status,
    starts: null,
    ends: null,
    prototype: ['app/page.tsx'],
    ticket_refs: id.startsWith('WAT-') ? [id] : [],
  };
  e.features.push(f);
  return f;
}
const base = epic(
  'base',
  'Base implementada',
  1,
  'Trabajo existente contrastado con main y Multica. Las fechas históricas y horas no verificadas no se inventan.',
);
const completed: [string, string, string, string][] = [
  ['77', 'Monorepo pnpm y calidad transversal', 'package.json', 'nacho'],
  ['76', 'Backend Express y health check', 'apps/api/src/app.ts', 'nacho'],
  ['79', 'Frontend React, Vite y Tailwind', 'apps/web/package.json', 'martina'],
  [
    '74',
    'Integración continua en GitHub Actions',
    '.github/workflows/ci.yml',
    'tomi',
  ],
  ['75', 'Supabase CLI y stack local', 'supabase/config.toml', 'tomi'],
  ['78', 'Despliegue frontend en Vercel', 'README.md', 'martina'],
  [
    '97',
    'Sesión Supabase y rutas protegidas',
    'apps/web/src/auth/AuthProvider.tsx',
    'martina',
  ],
  [
    '89',
    'Registro, login y logout con contraseña',
    'apps/web/src/features/auth/AuthForm.tsx',
    'martina',
  ],
  [
    '98',
    'Home privada y componentes UI',
    'apps/web/src/features/home/HomePage.tsx',
    'martina',
  ],
  [
    '99',
    'Header responsive y cambio de tema',
    'apps/web/src/components/layout/AppHeader.tsx',
    'martina',
  ],
  [
    '100',
    'Navegación inferior móvil',
    'apps/web/src/components/layout/BottomNavigation.tsx',
    'martina',
  ],
  [
    '101',
    'Skill de diseño WatchParty UI',
    '.agents/skills/watchparty-ui/SKILL.md',
    'martina',
  ],
  [
    '90',
    'Configuración de entorno y CORS',
    'apps/api/src/config/env.ts',
    'tomi',
  ],
  [
    '91',
    'Verificación de bearer tokens Supabase',
    'apps/api/src/middleware/require-authenticated-user.ts',
    'tomi',
  ],
  [
    '92',
    'Modelo y catálogo temporal de partidos',
    'apps/api/src/modules/matches/infrastructure/local-match-catalog.ts',
    'nacho',
  ],
  [
    '94',
    'Contrato de errores HTTP',
    'apps/api/src/middleware/error-handler.ts',
    'tomi',
  ],
  [
    '95',
    'Listado autenticado GET /matches',
    'apps/api/src/modules/matches/http/list-matches-handler.ts',
    'tomi',
  ],
  [
    '104',
    'Cliente frontend y formatos de partidos',
    'apps/web/src/features/matches/api.ts',
    'martina',
  ],
  [
    '110',
    'Listado de partidos en tarjetas responsive',
    'apps/web/src/features/home/HomePage.tsx',
    'martina',
  ],
  [
    '93',
    'Detalle mínimo del partido',
    'apps/web/src/features/matches/MatchDetailPage.tsx',
    'martina',
  ],
  [
    '88',
    'Smoke local de autenticación y partidos',
    'apps/api/scripts/smoke-auth-matches.ts',
    'nacho',
  ],
  [
    '111',
    'Runbook de recorrido y regresiones frontend',
    'docs/runbooks/match-frontend-validation.md',
    'martina',
  ],
];
for (const [n, title, path, owner] of completed) {
  const f = add(
    base,
    'WAT-' + n,
    title,
    ({ '104': 1, '110': 2, '93': 1.5, '111': 0.5 } as Record<string, number>)[
      n
    ] ?? null,
    '',
    'Incremento ya existente. Conservar y extender la implementación sin recrear su infraestructura.',
    'Código presente en main y ticket Done en Multica.|La validación histórica no sustituye una ejecución actual.',
    `main 4f32cea: ${path}. Multica: Done observado el 07/09/2026.`,
    owner,
    'done',
  );
  f.prototype = [path];
  f.tracker_status = 'Done';
}
const on = epic(
  'onboarding',
  'Onboarding completado',
  1,
  'Evaluaciones y desafíos ya cerrados en Multica; sin horas históricas verificadas.',
);
for (const [n, title, owner] of [
  ['81', 'Challenge técnico · Martina', 'martina'],
  ['82', 'Challenge técnico · Tomi', 'tomi'],
  ['83', 'Challenge técnico · Ignacio', 'nacho'],
  ['84', 'Evaluación · Martina', 'martina'],
  ['85', 'Evaluación · Ignacio', 'nacho'],
  ['86', 'Evaluación · Tomi', 'tomi'],
])
  add(
    on,
    'WAT-' + n,
    title,
    null,
    '',
    'Actividad de incorporación cerrada en Multica.',
    'Conservar el registro histórico y sus materiales.',
    'Multica: Done observado el 07/09/2026; no implica entrega de funcionalidad.',
    owner,
    'done',
  );
const data = epic(
  'sports',
  'Cerrar integración deportiva',
  2,
  'Continuar WAT-87 y sus tickets existentes. No duplicar proveedor, migraciones ni adaptadores ya en curso.',
);
const rows: [
  string,
  string,
  number | null,
  string,
  string,
  string,
  string,
  Feature['status'],
][] = [
  [
    '102',
    'Validar cobertura de API-Football Free',
    null,
    '',
    'Verificar competición, temporada, ventana y cuota realmente accesibles antes de comprometer datos en vivo.',
    'Registrar cobertura, cuota y límites sin secretos.|Si no hay cobertura reciente, explicitar el fallback y acordar el recorte.',
    'tomi',
    'in_progress',
  ],
  [
    '103',
    'Esquema y permisos de datos deportivos',
    1.5,
    'WAT-75',
    'Completar la migración mínima de equipos, competiciones y partidos con IDs del proveedor únicos.',
    'Reconstruir desde cero en Supabase local.|Lectura y escritura respetan permisos; importación idempotente.',
    'nacho',
    'review',
  ],
  [
    '105',
    'Cliente de fixtures y normalización',
    null,
    'WAT-102,WAT-92',
    'Implementar el adaptador de API-Football con normalización al modelo canónico existente.',
    'Mapear estados, equipos, IDs y fechas consistentemente.|Probar timeout, cuota, páginas vacías y respuesta incompleta.',
    'tomi',
    'backlog',
  ],
  [
    '106',
    'Persistencia y catálogo Supabase',
    1.5,
    'WAT-103,WAT-92',
    'Componer la API con el catálogo persistente manteniendo los consumidores del puerto MatchCatalog.',
    'GET /matches y detalle leen datos persistidos.|Reinicio no elimina partidos; contratos HTTP no cambian.',
    'nacho',
    'in_progress',
  ],
  [
    '107',
    'Importación manual con control de cuota',
    null,
    'WAT-105,WAT-103',
    'Importar una ventana acotada con bloqueo de concurrencia y presupuesto de llamadas.',
    'Repetir la importación no duplica fixtures.|Salir con causa legible ante cuota insuficiente; no exponer claves.',
    'tomi',
    'backlog',
  ],
  [
    '108',
    'Validar y documentar integración deportiva',
    null,
    'WAT-107',
    'Ejecutar una sincronización mínima controlada y registrar el runbook reproducible.',
    'Evidenciar registros persistidos y consumo de cuota.|No reconsultar el proveedor desde cada navegador.',
    'tomi',
    'backlog',
  ],
  [
    '109',
    'Validar persistencia e integración backend',
    1,
    'WAT-106,WAT-107',
    'Verificar migración, permisos, importación y lectura autenticada en entorno local desechable.',
    'Pruebas con usuario autorizado y no autorizado.|Datos conservados después del reinicio y errores HTTP estables.',
    'nacho',
    'in_progress',
  ],
  [
    '96',
    'Cerrar revisión del detalle autenticado',
    1,
    'WAT-95',
    'El endpoint ya existe en main; reconciliar su revisión y confirmar criterios antes de cerrar.',
    'Contrastar PR integrada con criterios de WAT-96.|Registrar la evidencia faltante, sin reimplementar el endpoint.',
    'nacho',
    'review',
  ],
  [
    '112',
    'Reconciliar arranque unificado pnpm dev',
    0.25,
    'WAT-75',
    'El arranque unificado ya está en main; el tablero remoto aún figura Todo. Confirmar estado real y cerrar discrepancia.',
    'Ejecutar el arranque según README en entorno disponible.|Actualizar estado remoto solo tras revisar evidencia.',
    'martina',
    'backlog',
  ],
];
for (const [n, t, h, d, desc, ac, o, s] of rows) {
  const f = add(
    data,
    'WAT-' + n,
    t,
    h,
    d,
    desc,
    ac,
    `Multica observado 07/09/2026: ${s === 'review' ? 'In Review' : s === 'in_progress' ? 'In Progress' : 'Todo'}. ${['96', '112'].includes(n) ? 'Código presente en main; discrepancia pendiente.' : 'No encontrado en main 4f32cea; puede existir en rama/PR.'}`,
    o,
    s,
  );
  f.tracker_status =
    s === 'review' ? 'In Review' : s === 'in_progress' ? 'In Progress' : 'Todo';
  f.prototype = ['apps/api/src/modules/matches/README.md'];
}
const account = epic(
  'identity',
  'Cuenta y perfil mínimo',
  2,
  'Completar los flujos de identidad que la base de autenticación todavía no cubre.',
);
add(
  account,
  'WP-001',
  'Definir el corte de MVP y reglas del producto',
  2,
  '',
  'Acordar salas públicas por partido, cuándo puede calificarse, qué cuenta como visto y cobertura deportiva. Congelar alcance esencial contra capacidad.',
  'Dejar decisiones, exclusiones y dueños en un documento breve.|Aprobar el recorte antes del 14/09; cualquier nueva historia reemplaza trabajo equivalente.',
  'Propuesta de planificación. La imagen es orientación, no calendario contractual.',
  'francisco',
);
add(
  account,
  'WP-002',
  'Completar recuperación de contraseña',
  3,
  'WAT-89',
  'El envío de email existe; agregar callback de recuperación y formulario para guardar contraseña nueva.',
  'Un enlace válido permite cambiar contraseña y volver al login.|Enlace vencido y contraseña inválida muestran error recuperable.',
  'ForgotPasswordPage envía resetPasswordForEmail; el router no define una pantalla de nueva contraseña.',
  'martina',
);
add(
  account,
  'WP-003',
  'Crear y editar perfil persistente',
  4,
  'WAT-89,WAT-103',
  'Como usuario quiero guardar nombre visible y biografía corta para identificarme en la comunidad.',
  'Perfil ligado al auth.uid con permisos de propietario.|Editar, recargar y abrir sesión nuevamente conserva los campos; otro usuario no puede modificarlos.',
);
add(
  account,
  'WP-004',
  'Elegir y cambiar equipo favorito',
  3,
  'WP-003,WAT-106',
  'Como usuario quiero seleccionar un equipo del catálogo y recuperar mi preferencia al iniciar sesión.',
  'Permite elegir, cambiar y quitar el equipo favorito.|La Home contempla usuario sin favorito y equipo sin próximo partido.',
);
add(
  account,
  'WP-005',
  'Validar registro y confirmación por email',
  2,
  'WAT-89',
  'Verificar alta con confirmación activada y redirecciones reales del entorno de entrega.',
  'Sin sesión tras registrarse se explica el siguiente paso.|Enlace vencido, sesión expirada y logout tienen recorrido recuperable.',
  'El código maneja Auth; confirmar experiencia integrada pendiente del runbook.',
);
const rooms = epic(
  'rooms',
  'Salas y conversación en vivo',
  3,
  'Primer incremento social utilizable por dos personas, con datos persistidos y permisos.',
);
const roomRows: [string, string, number, string, string, string][] = [
  [
    '006',
    'Entrar a la sala pública de un partido',
    5,
    'WP-003,WAT-106',
    'Crear una sala canónica por partido y permitir entrar desde el detalle autenticado.',
    'Dos usuarios del mismo partido llegan a la misma sala.|Partido inexistente y usuario sin sesión se rechazan; no crear salas duplicadas.',
  ],
  [
    '007',
    'Explorar el directorio de salas',
    3,
    'WP-006',
    'Activar /rooms con partidos en vivo y próximos; cada tarjeta abre su partido real.',
    'Equipos, horario y estado provienen del catálogo.|Carga, vacío, error y acceso móvil funcionan.',
  ],
  [
    '008',
    'Enviar y recuperar comentarios persistentes',
    5,
    'WP-006',
    'Publicar comentarios de texto en la sala con identidad del servidor y límite de 180 caracteres.',
    'Rechazar texto vacío, exceso y autor suplantado; renderizar como texto seguro.|El comentario reaparece tras recargar y no se duplica al reintentar.',
  ],
  [
    '009',
    'Recibir comentarios entre dos sesiones',
    5,
    'WP-008',
    'Agregar canal de tiempo real autorizado reutilizando el stack existente. Seleccionar Supabase Realtime o WebSocket tras validar permisos.',
    'Dos navegadores reciben el mismo mensaje sin refrescar.|Solo se reciben eventos de la sala elegida; se liberan suscripciones al salir.',
  ],
  [
    '010',
    'Recuperar conversación al reconectar',
    3,
    'WP-009',
    'Mostrar desconexión y recuperar mensajes faltantes al restablecer el canal.',
    'No duplicar mensajes propios ni omitir el intervalo offline.|El usuario puede reintentar y conservar el borrador.',
  ],
  [
    '011',
    'Cargar historial anterior del chat',
    2,
    'WP-008',
    'Paginar por cursor en orden estable sin cargar toda la conversación.',
    'Primera carga acotada; cargar anteriores mantiene el scroll.|Empates de timestamp y nuevos mensajes no duplican filas.',
  ],
  [
    '012',
    'Reaccionar a un comentario',
    3,
    'WP-009',
    'Agregar una reacción simple por usuario y comentario, reversible.',
    'El conteo cambia para ambos usuarios.|Restricción única impide dobles reacciones y el autor no se toma del cliente.',
  ],
  [
    '013',
    'Moderar comentarios y limitar abuso',
    4,
    'WP-008',
    'Permitir reportar un comentario y ocultarlo con un rol moderador comprobado en servidor. Limitar envíos repetidos.',
    'Usuarios comunes no pueden moderar a terceros.|Rate limit y validación son del servidor; los errores no borran el borrador.',
  ],
  [
    '014',
    'Mostrar presencia sin contar duplicados',
    3,
    'WP-009',
    'Mostrar participantes únicos de la sala con desconexión y pestañas duplicadas contempladas.',
    'Una persona con dos pestañas cuenta una vez.|No presentar el número ficticio del mockup como dato real.',
  ],
  [
    '015',
    'Destacar la sala del equipo favorito',
    2,
    'WP-004,WP-007',
    'Completar la tarjeta principal de Home con el partido relevante del equipo elegido.',
    'Abre la sala correcta, con horario y estado actuales.|Sin partido o favorito muestra alternativa útil.',
  ],
];
for (const [id, t, h, d, desc, ac] of roomRows)
  add(rooms, 'WP-' + id, t, h, d, desc, ac);
rooms.features.find((f) => f.id === 'WP-014')!.moscow = 'should';
const reviews = epic(
  'reviews',
  'Historial y calificaciones',
  3,
  'Registrar lo visto, calificar y recuperar la opinión del usuario.',
);
for (const [id, t, h, d, desc, ac] of [
  [
    '016',
    'Marcar un partido como visto y deshacer',
    3,
    'WP-003,WAT-106',
    'Guardar la relación única usuario–partido visto con una acción explícita.',
    'Repetir la acción no duplica el registro.|Solo el dueño puede eliminarlo; no registrar automáticamente por abrir una sala.',
  ],
  [
    '017',
    'Consultar historial personal paginado',
    3,
    'WP-016',
    'Activar /profile con partidos vistos, fecha, resultado y navegación al detalle.',
    'El historial persiste entre sesiones y está ordenado.|Estado vacío y paginación conservan coherencia.',
  ],
  [
    '018',
    'Calificar un partido y editar la nota',
    4,
    'WP-016',
    'Guardar una calificación propia de 1 a 5 según la regla de cierre aprobada.',
    'Una nota por usuario/partido; edición reemplaza la anterior.|Rango y elegibilidad se validan en servidor, incluidos valores decimales inválidos.',
  ],
  [
    '019',
    'Publicar una reseña con la calificación',
    3,
    'WP-018',
    'Adjuntar una opinión breve, editable y eliminable por su autor.',
    'Texto validado y renderizado sin HTML ejecutable.|Eliminar una reseña aplica la política acordada de historial y agregados.',
  ],
  [
    '020',
    'Mostrar promedio y cantidad de votos',
    2,
    'WP-018',
    'Calcular resultados de comunidad sin confundir ausencia de votos con cero estrellas.',
    'Edición de voto actualiza promedio sin sumar un votante.|Se ve número de votos y estado sin calificaciones.',
  ],
  [
    '021',
    'Calificar jugadores del partido',
    5,
    'WP-018,WP-023',
    'Permitir notas opcionales de 1 a 10 para jugadores realmente vinculados al partido.',
    'No admite jugadores de otro encuentro ni notas fuera de rango.|Cambiar nota conserva unicidad y ausencia de plantel se comunica.',
  ],
] as [string, string, number, string, string, string][])
  add(reviews, 'WP-' + id, t, h, d, desc, ac);
reviews.features.find((f) => f.id === 'WP-021')!.moscow = 'should';
const stats = epic(
  'statistics',
  'Estadísticas y descubrimiento',
  3,
  'Datos básicos reales; métricas avanzadas sujetas a cobertura verificada del proveedor.',
);
for (const [id, t, h, d, desc, ac] of [
  [
    '022',
    'Mostrar marcador, estado y actualización',
    3,
    'WAT-108,WAT-109',
    'Exponer marcador y última actualización en sala y detalle. La frescura es explícita.',
    'UTC se muestra en hora local; aplazados/cancelados no figuran en vivo.|Si el origen es histórico o está desactualizado se ve una etiqueta honesta.',
  ],
  [
    '023',
    'Validar y obtener planteles del encuentro',
    3,
    'WAT-102',
    'Verificar cobertura de alineaciones y guardar jugadores ligados al fixture.',
    'Documentar disponibilidad y cuota antes de implementar.|No inventar jugadores; presentar faltantes y fixture sin plantel.',
  ],
  [
    '024',
    'Mostrar estadísticas básicas del partido',
    4,
    'WP-022',
    'Presentar posesión, remates, tiros al arco, córners y faltas disponibles.',
    'No usar ceros para datos ausentes.|Barras normalizadas al total comparado; porcentajes y unidades correctos.',
  ],
  [
    '025',
    'Buscar partidos y equipos',
    3,
    'WAT-106',
    'Activar /search con consulta al catálogo, filtro de tipo y navegación a resultados.',
    'Búsqueda vacía, sin resultados y error tienen estados propios.|Limitar tamaño y paginar consultas; no mostrar resultados de una búsqueda vieja.',
  ],
  [
    '026',
    'Resumen de estadísticas personales',
    2,
    'WP-017,WP-018,WP-008',
    'Mostrar conteos reales de partidos vistos, calificaciones y comentarios propios.',
    'Los números coinciden con registros persistidos.|No reutilizar nivel, racha ni cantidades hardcodeadas del mockup.',
  ],
  [
    '027',
    'Ver ficha básica de equipo',
    3,
    'WP-025',
    'Mostrar equipo, próximos partidos y resultados cubiertos por el catálogo.',
    'Cada resultado abre su partido.|Equipo inexistente y datos parciales se comunican.',
  ],
  [
    '028',
    'Ver ficha básica de jugador',
    3,
    'WP-023',
    'Mostrar identidad, equipo y participaciones disponibles sin estadísticas inventadas.',
    'Ficha enlazada desde el partido real.|Datos faltantes no se representan como desempeño cero.',
  ],
] as [string, string, number, string, string, string][])
  add(stats, 'WP-' + id, t, h, d, desc, ac);
for (const id of ['023', '027', '028'])
  stats.features.find((f) => f.id === 'WP-' + id)!.moscow = 'should';
const social = epic(
  'social',
  'Perfil y feed social',
  3,
  'Feed básico cronológico. Seguir personas, logros y recomendaciones quedan fuera del corte inicial.',
);
add(
  social,
  'WP-029',
  'Ver un feed cronológico de actividad',
  4,
  'WP-019,WP-017',
  'Como usuario quiero ver reseñas públicas recientes vinculadas a su partido.',
  'Solo se muestra actividad que la política de privacidad permite publicar.|Orden estable y paginación; actividad eliminada deja de aparecer.',
);
add(
  social,
  'WP-030',
  'Abrir un perfil público acotado',
  3,
  'WP-003,WP-029',
  'Mostrar nombre, biografía y reseñas públicas sin email ni información privada.',
  'Perfil inexistente tiene respuesta clara.|El API no expone atributos privados y respeta visibilidad del historial.',
);
add(
  social,
  'WP-031',
  'Compartir un enlace a partido o reseña',
  2,
  'WP-029',
  'Usar compartir nativo o copiar enlace canónico con fallback.',
  'El enlace abre el mismo recurso tras login.|Cancelar compartir no informa error; copiar informa éxito o fallo.',
);
social.features.at(-1)!.moscow = 'should';
const quality = epic(
  'quality',
  'Validación, seguridad y release',
  4,
  'MVP comprobado con dos sesiones, carga controlada y entorno accesible antes de la defensa.',
);
for (const [id, t, h, d, desc, ac] of [
  [
    '032',
    'Completar la matriz responsive y teclado',
    3,
    'WP-007,WP-017,WP-025',
    'Cerrar pendientes del runbook y validar recorridos nuevos a 320, 390, 768 y 1440 px en ambos temas.',
    'No hay contenido cubierto por navegación ni scroll accidental.|Foco, etiquetas, contraste y anuncios de error verificados; guardar evidencia.',
  ],
  [
    '033',
    'Validar aislamiento de usuarios y salas',
    4,
    'WP-013,WP-018,WP-030',
    'Probar acceso directo a recursos de otros usuarios, suscripciones y controles de moderación.',
    'Usuario A no edita perfil, nota o historial de B.|Sin token/rol devuelve rechazo consistente y no filtra datos ni secretos.',
  ],
  [
    '034',
    'Probar el recorrido social de punta a punta',
    4,
    'WP-010,WP-012,WP-020,WP-029',
    'Con dos sesiones: registrar, entrar a sala, conversar, reaccionar, guardar visto, calificar y consultar historial/feed.',
    'Dejar un chequeo repetible y evidencia sobre el mismo commit.|Reintentos, refresh, sesión vencida y desconexión no pierden ni duplican información.',
  ],
  [
    '035',
    'Medir concurrencia controlada',
    3,
    'WP-009,WP-010',
    'Acordar objetivo de piloto y medir 20 conexiones simultáneas con mensajes, reconexión y límites de cuota.',
    'Objetivo propuesto a validar: entrega p95 menor de 2 s con 20 conexiones.|Reporte de carga, errores y límites; no prometer los 2.847 usuarios ficticios del mockup.',
  ],
  [
    '036',
    'Configurar entorno de prueba integrado',
    4,
    'WAT-109,WP-009',
    'Preparar web, API y Supabase remoto o infraestructura acordada con secretos fuera del repositorio.',
    'Login, REST y tiempo real funcionan desde la URL de QA.|Documentar CORS, HTTPS, redirects, migraciones y separación de datos de prueba.',
  ],
  [
    '037',
    'Agregar diagnóstico básico y recuperación',
    3,
    'WP-036',
    'Registrar errores con correlación sin tokens ni mensajes privados; comprobar health y respaldo/restauración.',
    'Una caída se identifica con pasos reproducibles.|Restaurar datos de prueba y documentar límites operativos.',
  ],
  [
    '038',
    'Aceptación del MVP con usuarios de prueba',
    3,
    'WP-032,WP-033,WP-034,WP-035,WP-036',
    'Ejecutar checklist con participantes y priorizar defectos que impidan el recorrido esencial.',
    'Registrar resultados, bugs y decisión go/no-go.|No aceptar incidentes críticos abiertos; pendientes menores tienen responsable.',
  ],
  [
    '039',
    'Publicar versión candidata y rollback',
    3,
    'WP-038,WP-037',
    'Etiquetar y desplegar un commit validado; conservar versión anterior y procedimiento de rollback.',
    'URL accesible; smoke postdeploy con dos cuentas de prueba.|Rollback ensayado y notas de versión con limitaciones reales.',
  ],
] as [string, string, number, string, string, string][])
  add(
    quality,
    'WP-' + id,
    t,
    h,
    d,
    desc,
    ac,
    'Propuesta para completar validación y entrega. El README solo documenta despliegue frontend; el runbook mantiene validación visual pendiente.',
  );
const delivery = epic(
  'delivery',
  'Entrega final · 12 de noviembre',
  5,
  'Documentación, evidencia y defensa. No sumar funcionalidad durante el cierre.',
);
for (const [id, t, h, d, desc, ac] of [
  [
    '040',
    'Documentar instalación, arquitectura y decisiones',
    3,
    'WP-036',
    'Actualizar README obsoleto, modelo de datos, contratos y decisiones realmente implementadas.',
    'Una persona nueva puede levantar el proyecto siguiendo los pasos.|El documento distingue implementación, limitaciones y trabajo futuro.',
  ],
  [
    '041',
    'Preparar demo y datos reproducibles',
    3,
    'WP-039',
    'Preparar guion: dos personas en sala, comentario, reacción, calificación, historial y feed; respaldar con grabación.',
    'Seed reproducible sin datos personales ni secretos.|Existe fallback ante caída de Internet o proveedor.',
  ],
  [
    '042',
    'Consolidar evidencias y reporte final',
    2,
    'WP-038',
    'Reunir pruebas, trazabilidad de requisitos, métricas reales y riesgos residuales.',
    'Cada requisito esencial tiene evidencia o limitación explícita.|Separar cantidades medidas de cifras simuladas del mockup.',
  ],
  [
    '043',
    'Ensayar defensa y completar entrega',
    2,
    'WP-040,WP-041,WP-042',
    'Ensayar presentación, respuestas y acceso al repositorio/URL para la entrega del 12/11/2026.',
    'Demo cronometrada y materiales revisados por el equipo.|Checklist final cerrado antes del 12/11, con enlaces vigentes.',
  ],
] as [string, string, number, string, string, string][])
  add(
    delivery,
    'WP-' + id,
    t,
    h,
    d,
    desc,
    ac,
    'Fecha final confirmada por el usuario: 12/11/2026. Actividad propuesta.',
  );
for (const [s, h] of [
  [2, 3],
  [3, 5],
  [4, 4],
  [5, 2],
]) {
  const e = epic(
    'fixes-' + s,
    'Reserva de correcciones · Sprint ' + s,
    s,
    'Capacidad explícita para bugs y arrastre; no duplicar con un porcentaje de buffer.',
  );
  e.fixes = true;
  add(
    e,
    `FIX-${s}`,
    'Resolver defectos y absorber arrastre',
    h,
    '',
    'Reserva explícita que se descompone en defectos reales al aparecer. No representa funcionalidad terminada.',
    'Consumir solo contra bugs o pendientes identificados.|Lo no utilizado se libera; no adelantar Could hasta cerrar los Must.',
    'Reserva propuesta, no incidencia observada.',
  );
}
const later = epic(
  'later',
  'Después del MVP',
  6,
  'Opciones visibles en el mockup o derivadas de evolución del producto. Sin compromiso de entrega al 12/11.',
  'could',
);
for (const [id, t, h, d, desc, ac] of [
  [
    '044',
    'Seguir y dejar de seguir personas',
    4,
    'WP-030',
    'Relación social persistente para construir una red de usuarios.',
    'No se permite seguirse a uno mismo ni duplicar relaciones.|Bloqueos y privacidad acordados antes de publicar.',
  ],
  [
    '045',
    'Feed de personas seguidas',
    3,
    'WP-044,WP-029',
    'Habilitar la pestaña Siguiendo usando relaciones reales.',
    'El feed solo incluye personas seguidas.|Cambios de relación se reflejan y hay estado vacío útil.',
  ],
  [
    '046',
    'Reaccionar y comentar en reseñas',
    4,
    'WP-029,WP-013',
    'Dar comportamiento real a las acciones de interacción del feed.',
    'Persistencia y unicidad de reacciones.|Comentarios moderables con límites y permisos.',
  ],
  [
    '047',
    'Responder a mensajes con contexto',
    3,
    'WP-008',
    'Implementar respuesta a un comentario sin crear hilos ilimitados.',
    'La respuesta referencia un mensaje de la misma sala.|Mensaje eliminado se representa sin romper la conversación.',
  ],
  [
    '048',
    'Buscar personas de la comunidad',
    3,
    'WP-030,WP-025',
    'Ampliar búsqueda unificada a perfiles públicos.',
    'Solo se indexan campos públicos.|Paginación, permisos y no resultados funcionan.',
  ],
  [
    '049',
    'Subir avatar de perfil',
    3,
    'WP-003',
    'Permitir imágenes de perfil con tamaño y tipo acotados.',
    'Validar archivo en servidor y controlar acceso al storage.|Reemplazo y borrado no dejan archivos huérfanos.',
  ],
  [
    '050',
    'Logros, niveles y rachas',
    5,
    'WP-026',
    'Definir reglas antes de implementar incentivos; el mockup tiene valores inconsistentes.',
    'Reglas de conteo documentadas e idempotentes.|Zona horaria y borrados no generan logros falsos.',
  ],
  [
    '051',
    'Notificaciones dentro de la aplicación',
    4,
    'WP-044,WP-046',
    'Dar funcionalidad al icono del mockup para eventos concretos.',
    'Solo eventos del destinatario y estado leído persistente.|No enviar push/email sin preferencias explícitas.',
  ],
  [
    '052',
    'Avisos de próximos partidos',
    4,
    'WP-004',
    'Recordatorios opcionales con preferencias de canal.',
    'Consentimiento y desactivación funcionan.|No duplicar notificaciones al reprogramar un partido.',
  ],
  [
    '053',
    'Actualización deportiva automática en vivo',
    5,
    'WAT-108,WP-022',
    'Evaluar polling compartido con cuotas reales y frecuencia acordada.',
    'Presupuesto de llamadas medido y límites respetados.|Mostrar datos atrasados sin simular un reloj en vivo.',
  ],
  [
    '054',
    'Estadísticas avanzadas y rankings',
    5,
    'WP-024,WP-028',
    'Ampliar comparaciones solo si el proveedor cubre los datos y hay demanda.',
    'Documentar cálculo y cobertura.|No tratar datos faltantes como cero ni comparar muestras incompatibles.',
  ],
  [
    '055',
    'Eliminar cuenta y gestionar retención',
    4,
    'WP-003',
    'Definir política y permitir eliminar o anonimizar información vinculada de forma consistente.',
    'Revocar sesión, limpiar dependencias según política acordada.|Confirmación explícita y resultado verificable.',
  ],
  [
    '056',
    'Salas privadas e invitaciones',
    5,
    'WP-006',
    'Extensión fuera del MVP público; requiere reglas de acceso y ciclo de invitaciones.',
    'Invitación vencida y usuario externo no acceden.|No filtrar mensajes ni presencia entre salas.',
  ],
] as [string, string, number, string, string, string][])
  add(
    later,
    'WP-' + id,
    t,
    h,
    d,
    desc,
    ac,
    'Propuesta posterior al MVP. No está implementada; algunas acciones del prototipo son decorativas.',
  );
const p: Plan = {
  backlog: {
    meta: {
      project: 'WatchParty',
      updated: '2026-09-07',
      real_repository: 'https://github.com/FranciscoLang2209/WatchParty',
      real_commit: '4f32cea36de42a6d675fd6d671f4b53c5894b0f6',
      reference_repository:
        'https://github.com/Pedrodeforonda/WatchParty-App-Styled',
      reference_commit: 'c50ee60936b70868e165bf5e143a6b7f2acda868',
      tracker: 'https://multica.ai/watchparty/issues',
      tracker_parent: 'WAT-87',
      snapshot:
        'Lectura manual de Multica; estados no sincronizados automáticamente. WP-* son propuestas locales, no tickets remotos.',
    },
    out_of_scope: [
      'Retransmisión de video, sincronización de streaming o derechos audiovisuales.',
      'Apuestas, pagos, suscripciones y monetización.',
      'Aplicaciones nativas iOS/Android: MVP web responsive.',
      'Salas privadas, mensajes directos, seguimiento, logros y notificaciones: candidatos posteriores.',
      'Cobertura universal de ligas o tiempo real deportivo sin proveedor validado.',
    ],
    epics,
  },
  team: {
    meta: { updated: '2026-09-07', tracker_user_ids: null },
    project: {
      name: 'WatchParty',
      starts: '2026-09-07',
      deadline: '2026-11-12',
      assumptions: [
        'Confirmado: 3 developers × 6 h/semana; entrega final 12/11/2026.',
        'Sprints 2 a 5 replanteados desde el estado actual; no transcripción exacta de fechas de la captura.',
        'La última semana se prorratea por días de calendario (4/7); validar distribución real de horas.',
        'Estimaciones nuevas son hipótesis de esfuerzo, no compromisos; incluyen implementación y verificación.',
        'Se preservan estimaciones explícitas de Multica; null consume 3 h para planificar, no inventa horas históricas.',
        'Asignaciones actuales provienen de Multica; nuevas asignaciones quedan sin responsable hasta planificar la semana.',
        'MVP debe recortarse si el trabajo supera 18 h/semana. Las propuestas Should y Could no son promesas.',
      ],
    },
    people: [
      {
        id: 'martina',
        name: 'Martina Cousido',
        role: 'Frontend · Multica',
        takes_tickets: true,
        weekly_points: 6,
      },
      {
        id: 'nacho',
        name: 'Ignacio García',
        role: 'Backend / persistencia · Multica',
        takes_tickets: true,
        weekly_points: 6,
      },
      {
        id: 'tomi',
        name: 'Tomi · tomassk2005',
        role: 'Backend / integración · Multica',
        takes_tickets: true,
        weekly_points: 6,
      },
      {
        id: 'francisco',
        name: 'Francisco Lang',
        role: 'Project Manager · coordinación',
        takes_tickets: false,
        weekly_points: 0,
      },
    ],
    sprints: [
      {
        number: 1,
        name: 'Base existente',
        starts: '2026-08-03',
        ends: '2026-09-06',
        theme: 'Autenticación y catálogo temporal',
        notes:
          'Agrupación histórica orientativa; no reconstruye fechas ni horas reales.',
      },
      {
        number: 2,
        name: 'Cerrar las bases',
        starts: '2026-09-07',
        ends: '2026-09-20',
        theme: 'Proveedor, persistencia y cuenta',
        notes: 'Salida: catálogo persistido validado, perfil y reglas del MVP.',
      },
      {
        number: 3,
        name: 'La experiencia WatchParty',
        starts: '2026-09-21',
        ends: '2026-10-18',
        theme: 'Salas, chat, historial y calificaciones',
        notes:
          'Salida: recorrido social entre dos usuarios. Should se difiere si no entra.',
      },
      {
        number: 4,
        name: 'MVP listo para probar',
        starts: '2026-10-19',
        ends: '2026-11-01',
        theme: 'Seguridad, QA, concurrencia y despliegue',
        notes: 'Salida: versión candidata accesible y aceptada.',
      },
      {
        number: 5,
        name: 'Entrega y defensa',
        starts: '2026-11-02',
        ends: '2026-11-12',
        theme: 'Documentación, evidencia y demo',
        notes:
          'Entrega confirmada: jueves 12 de noviembre. No añadir features nuevas.',
      },
      {
        number: 6,
        name: 'Después del MVP',
        starts: '2026-11-13',
        ends: '2026-12-31',
        theme: 'Evolución sin fecha comprometida',
        notes: 'Contenedor de opciones, no promesa de ejecución en diciembre.',
      },
    ],
    capacity: {
      scale:
        '1 punto = 1 hora estimada de esfuerzo. Nuevas estimaciones sujetas a revisión.',
      allowed_estimates: [0.25, 0.5, 1, 1.5, 2, 3, 4, 5, 6],
      default_estimate: 3,
      buffer_ratio: 0,
    },
    definition_of_done: [
      'Criterios de aceptación revisados por una persona del equipo.',
      'Tipos, lint, pruebas pertinentes y build pasan con pnpm validate.',
      'Migraciones reproducibles; permisos, entradas y errores comprobados.',
      'UI usable en móvil y desktop, teclado y ambos temas cuando aplica.',
      'Sin secretos ni datos personales de prueba en el repositorio.',
      'Evidencia adjunta al ticket y PR integrada; actualizar el estado de Multica.',
    ],
  },
  riskRegister: { meta: { updated: '2026-09-07' }, risks: [], incidents: [] },
};
const risks: [
  string,
  string,
  number,
  number,
  string,
  string,
  string,
  string,
  string[],
][] = [
  [
    'R-01',
    'El alcance excede las horas disponibles',
    5,
    5,
    'schedule',
    'francisco',
    'Separar Must, Should y Could; reestimar y retirar alcance cada semana antes de comprometerlo.',
    'Reducir estadísticas avanzadas, jugadores y feed extendido; proteger el recorrido social y la entrega.',
    ['WP-001', 'WP-021', 'WP-029'],
  ],
  [
    'R-02',
    'API-Football Free no cubre datos recientes',
    4,
    5,
    'external',
    'tomi',
    'Cerrar WAT-102 con evidencia de competición, temporada, cuota y coste antes de prometer vivo.',
    'Demo con partidos históricos etiquetados o proveedor alternativo aprobado.',
    ['WAT-102', 'WAT-108', 'WP-022'],
  ],
  [
    'R-03',
    'Pérdida o duplicación de mensajes al reconectar',
    3,
    4,
    'technical',
    'nacho',
    'IDs estables, persistencia antes de confirmar, cursor de recuperación y prueba de dos sesiones.',
    'Usar refresco explícito temporal y mostrar desconexión.',
    ['WP-009', 'WP-010'],
  ],
  [
    'R-04',
    'Datos privados expuestos por permisos incompletos',
    3,
    5,
    'technical',
    'nacho',
    'Validar RLS/roles y acceso cruzado para perfil, historial, notas y canales.',
    'Bloquear release hasta corregir acceso; restringir piloto.',
    ['WP-003', 'WP-033'],
  ],
  [
    'R-05',
    'Estado de Multica diverge de main',
    4,
    3,
    'schedule',
    'francisco',
    'Reconciliar WAT-96, WAT-112 y evidencia visual de WAT-111 sin recrear trabajo.',
    'Mantener snapshot con discrepancias visibles y revisar cada PR.',
    ['WAT-96', 'WAT-112', 'WAT-111'],
  ],
  [
    'R-06',
    'Integración remota tardía',
    3,
    4,
    'technical',
    'tomi',
    'Preparar QA antes de la semana de release; verificar Auth, CORS y tiempo real juntos.',
    'Demostración local reproducible con limitación declarada.',
    ['WP-036', 'WP-039'],
  ],
  [
    'R-07',
    'Ausencias o menor disponibilidad del equipo',
    3,
    4,
    'people',
    'francisco',
    'Confirmar 6 h reales por persona cada semana y mantener reservas explícitas.',
    'Redistribuir solo tras comprobar capacidad personal; bajar alcance.',
    ['FIX-3'],
  ],
  [
    'R-08',
    'Abuso en salas públicas',
    2,
    4,
    'scope',
    'nacho',
    'Límites de mensajes, reporte y rol moderador mínimo antes de un piloto público.',
    'Cerrar admisión y usar un grupo controlado.',
    ['WP-013'],
  ],
  [
    'R-09',
    'La demo depende de un partido o Internet',
    2,
    3,
    'external',
    'martina',
    'Seed, guion y grabación de respaldo.',
    'Reproducir grabación y explicar el entorno medido.',
    ['WP-041'],
  ],
];
for (const [
  id,
  title,
  probability,
  impact,
  category,
  owner_id,
  mitigation_plan,
  contingency_plan,
  related_feature_ids,
] of risks)
  p.riskRegister.risks.push({
    id,
    title,
    description:
      'Riesgo de planificación identificado al contrastar fuentes y capacidad; no es un incidente confirmado.',
    probability,
    impact,
    category,
    owner_id,
    mitigation_plan,
    contingency_plan,
    related_feature_ids,
    status: 'open',
    review_date: '2026-09-14',
    related_sprint: id === 'R-09' ? 5 : id === 'R-06' ? 4 : 2,
  });
// Evidencia adicional: PRs abiertas, sin asumir que están integradas o reejecutadas.
const current = allFeatures(p);
const feature = (id: string) =>
  current.find((x) => x.feature.id === id)!.feature;
feature('WAT-102').evidence =
  'Multica: In Progress. PR #29 abierta, SHA 2368ce2, leída 08/09/2026: documenta consulta real del 07/09, rechazo de temporada 2026 y 28 fixtures históricos de 2023. Evidencia del autor, no reejecutada por este planificador.';
feature('WAT-102').prototype = [
  'https://github.com/FranciscoLang2209/WatchParty/pull/29',
  'docs/integrations/api-football-coverage.md',
];
feature('WAT-103').evidence =
  'Multica: In Review. PR #25 abierta, SHA 934866b: tablas teams, matches y provider_sync_state, seed y funciones de lease; no integrada en main relevado.';
feature('WAT-103').description =
  'Revisar y completar la PR #25 existente: esquema mínimo de equipos, partidos y estado de sincronización, RLS y funciones de lease. No duplicar migraciones; no crear una tabla de competiciones sin necesidad.';
feature('WAT-103').prototype = [
  'https://github.com/FranciscoLang2209/WatchParty/pull/25',
  'supabase/migrations/20260904222112_sports_data_schema.sql',
];
feature('WAT-96').title = 'Completar pruebas HTTP y cerrar revisión de detalle';
feature('WAT-96').description =
  'El endpoint existe en main. La PR #26 agrega pruebas HTTP específicas; revisar e integrar esta cobertura, sin recrear el handler.';
feature('WAT-96').evidence =
  'Multica: In Review. PR #26 abierta, SHA ac43ac9: get-match.http.test.ts verifica 200, variantes 401, 404 y 500. El handler ya está en main.';
feature('WAT-96').prototype = [
  'https://github.com/FranciscoLang2209/WatchParty/pull/26',
  'apps/api/src/modules/matches/http/get-match.http.test.ts',
];
feature('WP-001').acceptance.push(
  'Decidir si la demo usa fixtures históricos etiquetados o si se aprueba cobertura de temporada actual; API-Football Free no puede sostener la promesa vigente según PR #29.',
);
feature('WP-009').description +=
  ' El recorrido REST existente sigue pasando por Node; cualquier canal Realtime directo requiere una decisión de arquitectura explícita y validación de permisos.';
feature('WP-024').description +=
  ' Validar primero la cobertura y cuota de este endpoint, ya que WAT-102 verifica fixtures pero no estadísticas.';
p.backlog.meta.tracker_counts = {
  backlog: 1,
  todo: 4,
  in_progress: 3,
  review: 2,
  done: 39,
  blocked: 0,
  cancelled: 0,
};
p.backlog.meta.tracker_import_scope =
  '37 unidades de desarrollo y onboarding relevadas individualmente; WAT-87 se conserva como épica coordinadora sin sumar estimación. Otros 11 registros Done de gestión histórica no fueron transcritos individualmente.';
p.backlog.meta.tracker_parent_url =
  'https://multica.ai/watchparty/issues/WAT-87';
p.backlog.meta.updated = '2026-09-08';
const coverage = p.riskRegister.risks.find((r) => r.id === 'R-02')!;
coverage.status = 'materialized';
coverage.description =
  'La PR #29 documenta que la cuenta Free rechaza fixtures de temporada 2026. Impacta la promesa de datos deportivos actuales; no impide chat en tiempo real sobre datos históricos.';
p.riskRegister.incidents.push({
  id: 'INC-001',
  title: 'Plan Free sin cobertura para temporada 2026',
  description:
    'Evidencia reportada en PR #29 (consulta del 07/09/2026): 2026 rechazada; temporada 2023 disponible. Pendiente decidir alcance de datos de demo o proveedor/acceso alternativo. No se llamó al proveedor desde este planificador.',
  status: 'open',
  severity: 'high',
  occurred_at: '2026-09-07',
  resolved_at: null,
  risk_id: 'R-02',
  resolution: '',
  lessons_learned: '',
});
const final = schedule(p, false, '2026-09-07');
const errors = validate(final.plan);
if (errors.length) throw Error(errors.join('\n'));
for (const [key, file] of Object.entries({
  backlog: 'features',
  team: 'team',
  riskRegister: 'risks',
}))
  await writeFile(
    `project-plan/${file}.yaml`,
    '# Generado por WatchParty Planner. Fuente editable; los comentarios se reemplazan al guardar.\n' +
      stringify(final.plan[key as keyof Plan]),
  );
console.log(
  `${allFeatures(p).length} tickets; ${final.warnings.length} alertas de planificación.`,
);
