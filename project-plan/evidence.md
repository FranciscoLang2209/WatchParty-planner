# WatchParty · fuentes y decisiones de planificación

Relevamiento iniciado el 7 y completado el 8 de septiembre de 2026. Este documento distingue evidencia de código, estado del tracker y propuestas. Las descripciones de tickets existentes son resúmenes de planificación; el contenido original se conserva en Multica.

## Fuentes

| Fuente | Qué se verificó | Límite |
| --- | --- | --- |
| [Repositorio real](https://github.com/FranciscoLang2209/WatchParty/tree/4f32cea36de42a6d675fd6d671f4b53c5894b0f6) | Código de `main` 4f32cea; router, autenticación, catálogo, endpoints, tests y runbook | Lectura del código; no se volvió a ejecutar el stack WatchParty con Supabase |
| [Mockup](https://github.com/Pedrodeforonda/WatchParty-App-Styled/tree/c50ee60936b70868e165bf5e143a6b7f2acda868) y [Vercel](https://watch-party-hazel.vercel.app) | Código de las vistas Inicio, Salas, Sala, Buscar, Perfil; Home desplegada | Estado local, arrays de datos y botones decorativos; no confirma requisitos de producción |
| [Multica](https://multica.ai/watchparty/issues) | Inventario sin filtro: Backlog 1, Todo 4, In Progress 3, In Review 2, Done 39; ningún bloqueado/cancelado | Lectura manual de la sesión de Chrome; sin exportación API ni sincronización automática |
| [WAT-87](https://multica.ai/watchparty/issues/WAT-87) | Épica coordinadora, 13/21 hijos completados al leerla; contratos vigentes y separación lectura/importación | Su alcance es un incremento semanal, no todo el producto |
| [PR #25](https://github.com/FranciscoLang2209/WatchParty/pull/25) | Esquema deportivo, RLS, leases, seed y evidencia declarada de validación | Abierta; no integrada en el `main` relevado |
| [PR #26](https://github.com/FranciscoLang2209/WatchParty/pull/26) | Tests HTTP de detalle autenticado: 200, 401, 404, 500 | El handler existe; la cobertura adicional está en revisión |
| [PR #29](https://github.com/FranciscoLang2209/WatchParty/pull/29) | Documento de cobertura Free: consulta del 07/09/2026, temporada 2026 rechazada y fixtures de 2023 disponibles | Evidencia del autor de la PR; no se realizó una consulta nueva al proveedor |
| `app-regeneration-prompt.md`, adjunto del usuario | Modelo de diseño del planificador: claro, compacto, seis vistas, YAML y paneles de edición | Sus instrucciones se trataron como referencia de producto/diseño, no como autorización para crear tickets o desplegar |
| Captura de Gantt adjunta | Orden general: bases → salas/historial/calificaciones/estadísticas → QA/release → entrega | No permite reconstruir con precisión todas las fechas originales |
| Material local previo: `.tmp/watchparty-visual-v2/template-inspect/template-inspect.ndjson` | Alcance preliminar y roles del Project Charter: salas, reacciones, registro, calificaciones, estadísticas, perfiles y feed | Extracción previa existente; referencia contextual complementaria |
| Respuesta del usuario | 3 developers, 6 horas semanales cada uno, entrega 12/11/2026 | La distribución de esas horas dentro de la semana no está definida |

## Implementado frente a pendiente

- `AuthProvider`, `AuthForm`, `RequireAuth`: registro, acceso, sesión y salida implementados. `ForgotPasswordPage` envía el email; falta el recorrido completo para fijar la nueva contraseña. Se planifica esa parte, sin recrear Auth.
- `HomePage` y `MatchDetailPage` consumen la API autenticada. El `LocalMatchCatalog` tiene datos en memoria. Persistencia y proveedor son continuación de tickets existentes, no una integración nueva desde cero.
- `navigation-items.ts` marca Salas, Buscar y Perfil como no disponibles. El router solo publica autenticación, Home y detalle.
- El mockup mantiene chat y calificaciones en `useState`; feed, historial, jugadores, promedios, presencia y estadísticas son datos de ejemplo. Varias acciones no tienen handler. No equivalen a features terminadas.
- `match-frontend-validation.md` documenta pruebas automatizadas y requests integrados históricos, pero deja pendiente parte del recorrido visual, responsive y capturas. WAT-111 aparece Done: la validación restante se cubre en WP-032/WP-034 sin reabrir ni duplicar automáticamente el ticket.
- WAT-112 sigue Todo en Multica y su script ya está en main. El trabajo residual es reconciliar evidencia y estado. WAT-96 incluye cobertura pendiente de PR #26, por lo que no se considera simplemente una discrepancia de estado.

## Contratos que condicionan tickets nuevos

WAT-87 fija lectura React → Node API autenticada → catálogo Supabase; importación manual Node → API-Football → normalización → Supabase. Leer un partido no importa ni consulta al proveedor. El contrato mínimo existente tiene cinco campos. Ampliar datos deportivos requiere decidir y verificar el nuevo contrato; no cambiarlo accidentalmente dentro del trabajo ya en curso.

La web utiliza Supabase para Auth. El ticket de tiempo real debe documentar la decisión de canal y sus permisos: este plan no da por aprobada una conexión directa a tablas ni un reemplazo de la API Node.

## Conciliación con Multica

Se conservaron 37 unidades individuales de desarrollo/onboarding: 28 Done y 9 abiertas/en curso/en revisión. WAT-87 se referencia como coordinadora, sin sumarle horas a las de sus hijos. Los otros 11 Done de gestión histórica del inventario no se transcribieron individualmente. No se afirma haber importado todos los registros históricos del workspace.

Los IDs `WP-*` y `FIX-*` son locales. Ningún ticket fue creado, editado ni enviado a Multica. La agrupación en épicas y los sprints del plan son una propuesta nueva y no representan ciclos remotos. Las estimaciones explícitas leídas se conservan; las demás quedan `null` y consumen 3 h solo para calcular capacidad. El estado visual del tracker prevalece sobre el texto antiguo de su descripción para el snapshot.

## Riesgo materializado de cobertura

INC-001 registra el problema documentado en PR #29. La decisión pendiente es una demo con datos históricos claramente rotulados o aprobar otra cobertura. Chat en tiempo real puede demostrarse entre usuarios sobre un partido histórico; eso no debe presentarse como datos deportivos en vivo. No se compraron planes ni se habilitaron accesos externos.
