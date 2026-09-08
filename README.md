# WatchParty · plan de entrega local

Tablero de planificación en español basado en el repositorio real, el prototipo visual, Multica y las restricciones confirmadas por el usuario. Incluye backlog editable, cronograma, planificación semanal, equipo, sprints, riesgos e incidentes.

## Abrir

Requiere Node 24 (disponible en este entorno):

```sh
npm install
npm run dev
```

Abrir <http://127.0.0.1:5180/>. El servidor queda ligado a loopback. Para volver a iniciarlo desde Finder también puede usarse `Abrir WatchParty.command`.

```sh
npm run typecheck
npm test
npm run build
npm run preview
npm run export
```

`preview` sirve el build y la misma API local de archivos; no debe ejecutarse a la vez que `dev` porque ambos usan 5180. Servir `dist/` de forma estática no permite leer ni guardar el plan.

## Datos y alcance

- `project-plan/features.yaml`: épicas, tickets, estados, estimaciones en horas, fechas, aceptación, evidencia, dependencias, referencias y responsables.
- `project-plan/team.yaml`: tres developers × 6 h/semana, entrega 12/11/2026, sprints propuestos y definición de terminado.
- `project-plan/risks.yaml`: registro de riesgos y el incidente de cobertura deportiva documentado en una PR.
- `project-plan/evidence.md`: fuentes, commits, PRs, discrepancias y límites del relevamiento.
- `project-plan/planning-notes.md`: lectura ejecutiva del plan y orden sugerido.
- `project-plan/backlog.md`: exportación legible de todos los tickets. Regenerar con `npm run export` tras editar el tablero.

Las propuestas WP-* no son tickets remotos. Los WAT-* conservan referencias reales; no hay credenciales ni escritura a Multica. No es una réplica completa del prompt adjunto: se toma su diseño y estructura para este backlog concreto. Se reutilizó el starter Sites, adaptado a Vite + React y middleware Node para almacenamiento local; no se publica en la nube.

## Uso

**Backlog:** buscar y filtrar por sprint/estado/MoSCoW; abrir el detalle, editar y aplicar. Crear/eliminar tickets y épicas; mover tickets entre épicas en su editor; ordenar con controles de subir/bajar accesibles por teclado. El orden siempre se modifica en la colección completa, preservando elementos ocultos por filtros. Las acciones de épica permiten renombrar y cambiar sprint. No hay arrastre ni reordenamiento entre épicas por drag-and-drop.

**Cronograma:** barras por fechas, zoom, expansión por épica, marcador de hoy y dependencias. Seleccionar una semana abre su planificación; seleccionar una barra permite editar sus fechas. El cronograma muestra trabajo fechado dentro del horizonte del proyecto; el backlog conserva el trabajo futuro sin fecha.

**Semana:** carga total/personal y trabajo reservado. La propuesta de nuevos tickets excluye referencias externas, bloqueados, Could/Won't, descripciones faltantes y dependencias sin resolver; descuenta trabajo ya reservado. Las instrucciones para un agente son autocontenidas y se pueden copiar. La selección es orientativa y requiere revisar el reparto individual.

**Equipo/Sprints:** editar personas existentes, su disponibilidad y elegibilidad; objetivos y fechas de los sprints. Agregar/quitar personas o sprints, editar metadata, DoD y exclusiones se hace en YAML y luego Recargar. No es un gestor de configuraciones ni de múltiples proyectos.

**Riesgos:** registro y matriz 5×5 usan el mismo filtro de estado. Editor de probabilidad, impacto, responsable, revisión, mitigación, contingencia, sprint y tickets. Los riesgos de 10+ necesitan responsable, revisión y mitigación para aplicar. Los incidentes se registran por separado; resolver/cerrar exige fecha, resolución y aprendizaje. La fecha de resolución se conserva al cerrar. La app no inventa incidentes de muestra.

## Guardado y protección de cambios

Un cambio aplicado queda en memoria y se guarda tras 800 ms. Las formas de ticket/riesgo/incidente mantienen un borrador hasta aplicar: valores inválidos no se envían. Se confirma al descartar borradores o recargar cambios pendientes. Hay botones Guardar, Recargar y Exportar JSON; los errores conservan la copia local para reintentar/exportar.

El cliente mantiene revisiones y serializa sus guardados: una respuesta vieja no marca una revisión nueva como guardada. El servidor usa `ETag` / `If-Match` para rechazar cambios de una pestaña o archivo externo (409) en lugar de sobrescribirlos. Ante conflicto, exportar el JSON local, recargar la versión de archivos y conciliar los cambios manualmente. No hay fusión automática ni importador de JSON en la interfaz.

Cada PUT valida el plan completo antes de escribir. Los YAML se preparan en temporales y se reemplazan con `rename`. Cada archivo se reemplaza atómicamente, pero los tres archivos **no constituyen una transacción conjunta**; una falla entre renames puede dejar una versión parcial. Los errores no se anuncian como guardados. Los comentarios YAML se reemplazan; metadata y campos no editados se preservan. Respaldar/versionar los YAML si se necesita historial.

## Calendario, capacidad y estimaciones

Semanas de lunes a domingo, fechas locales sin desplazamiento UTC. Se cuenta toda la estimación en la semana de inicio, incluso si empieza un miércoles; cronograma y semana usan la misma función. La última semana termina el 12/11 a efectos de capacidad: 4/7 de 18 = 10,29 h. Confirmar disponibilidad real de esa semana. No se descuentan feriados, ausencias o tiempo ya consumido dentro de la semana actual.

`null` consume 3 h para planificación y cero en progreso histórico por horas. El progreso no es una medición de horas reales. Las reservas FIX-* suman capacidad explícita, con buffer porcentual en cero para no duplicarlo. Estimaciones de trabajo en curso se contabilizan enteras, conservadoramente, porque no se conoce esfuerzo residual.

El planificador de fechas es voraz: prioriza reservas ancladas, luego orden del backlog; solo fecha Must sin fecha. Respeta las fechas ya existentes, la capacidad total y la individual del trabajo asignado a developers. Permite dependencias en la misma semana; no asegura el orden dentro del día y no asigna responsables a nuevas propuestas. Recalcular borra únicamente fechas de propuestas `todo`, conservando comprometidos. Reporta sobrecargas y dependencias incompatibles de los elementos fijados. Tras la fecha final no retrocede a semanas históricas: deja trabajo sin fecha y lo advierte. No extiende automáticamente 52 semanas ni afirma optimización de recursos.

Cambiar un sprint o capacidad no mueve silenciosamente tickets. Revisar avisos y recalcular cuando corresponda. El horizonte termina el 12/11; el sprint 6 es un contenedor de opciones, no un compromiso de entrega posterior.

## Verificaciones

`npm test` usa asserts de Node y fixtures temporales: fechas, semana parcial, datos semilla, capacidad general y personal, dependencias, ciclos, fechas comprometidas, cero capacidad, horizonte vencido, borrado de vínculos, riesgos, incidentes, prompt y API real (round-trip de tres archivos, guardados concurrentes, conflicto, entradas inválidas, origen y rutas). No toca los YAML de trabajo.

También se verificaron typecheck estricto, build de producción y respuestas HTTP del servidor local. No se realizó una prueba interactiva de navegador del planificador; no se volvió a ejecutar el stack del producto WatchParty.
