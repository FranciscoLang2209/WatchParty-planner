# WatchParty · Cierre del 5 al 12/11/2026

Estado: plan aprobado por Francisco. Reservas disponibles; no son tareas de implementación ni horas de trabajo identificado. No acredita aceptación funcional, correcciones realizadas o una versión desplegada aceptada.

## Objetivo y condiciones confirmadas

Entregar el 12/11/2026 los recorridos existentes funcionando, sin funcionalidades nuevas. Es la última semana de desarrollo.

- Tres desarrolladores fullstack, hasta 6 h cada uno: 18 h máximas para todo el período 5–12/11. No se prorratea la semana ni se suman dos semanas de capacidad.
- Cada cupo incluye diagnóstico, implementación, pruebas técnicas, ajustes de revisión e integración. La participación técnica en el despliegue conjunto también consume el cupo de quien la realiza.
- Las tareas anteriores, incluida WAT-270, conservan la capacidad del período anterior. No se trasladan a estas reservas ni se duplican como nuevos defectos para descontarlas de esta semana.
- Documentación general, presentación y defensa quedan fuera de las horas-dev.
- QA verifica y acepta; los devs comprueban técnicamente sus correcciones antes de entregarlas a QA. Las actividades propias de QA no consumen horas-dev.
- El prototipo es referencia visual. Sus funcionalidades y los requisitos históricos descartados no generan trabajo nuevo.
- No hay defectos concretos reportados al aprobar este plan. No se inventan defectos para completar la carga; las horas no utilizadas permanecen libres.

## Reservas de capacidad

| Responsable | Máximo | Frente |
| --- | ---: | --- |
| Ignacio García | 6 h | Reseñas, calificaciones y detalle del partido |
| Martina Cousido | 6 h | Cuenta, perfil, historial y estadísticas personales |
| Tomás | 6 h | Salas, chat, Inicio y búsqueda |
| Total | 18 h | Capacidad máxima, sin obligación de consumirla |

Estas tres filas representan la capacidad máxima por persona. Por pedido de Francisco, el seguimiento se divide en nueve tickets concretos de hasta 2 h, tres por dev. Estimated TIme (h) muestra 2 h por ticket como cupo correctivo reservado, no como horas consumidas ni defectos confirmados. Cada defecto real consume capacidad una sola vez: convertir el ticket correspondiente al defecto concreto, o reducir la reserva por las horas asignadas a un ticket independiente. Nunca sumar ambos importes.

### Ignacio · Reseñas, calificaciones y detalle

Atiende defectos al consultar, publicar, editar o eliminar reseñas; calificar partidos; consultar promedios y utilizar el detalle. Corrige las capas necesarias de interfaz, cliente, API o persistencia.

Las correcciones conservan elegibilidad, privacidad, permisos y paginación. Eliminar una reseña no borra notas o historial. Un error recuperable no debe perder el borrador y una respuesta atrasada no debe mostrar datos de otro usuario o partido. Sin feed global, reacciones a reseñas ni ampliaciones funcionales.

### Martina · Cuenta, perfil, historial y estadísticas personales

Atiende defectos de registro, acceso, recuperación de contraseña, edición del perfil, equipo favorito, historial y estadísticas personales. Corrige las capas necesarias para completar el comportamiento esperado.

Las correcciones conservan el aislamiento entre cuentas, filtros, paginación y definiciones de estadísticas. Un fallo de consulta se distingue de ausencia de datos. Sin avatares nuevos, logros, perfiles públicos ni cambios en los KPIs del reporter.

### Tomás · Salas, chat, Inicio y búsqueda

Atiende defectos al encontrar partidos, combinar filtros, actualizar el directorio, ingresar a una sala, comentar o reaccionar, incluidos los accesos desde Inicio y Buscar. Corrige las capas necesarias del recorrido afectado.

Las correcciones conservan la coherencia entre partido y sala, la combinación de favorito/estado/fecha y los filtros al actualizar. Reintentos o reconexión no deben duplicar comentarios o reacciones. Los fallos se distinguen de ausencia de resultados o cobertura limitada del catálogo. Sin nuevas fuentes deportivas, estadísticas ampliadas, salas privadas ni optimización de CI.

### Dependencias y colaboración

No existe una dependencia planificada para comenzar. Toda dependencia detectada se registra con responsable, impedimento y siguiente acción, y se coordina con Francisco. Mantener compatibles las interfaces existentes y evitar refactorizaciones generales.

Se puede reasignar un defecto completo a otro dev con disponibilidad: transferir contexto, PR y responsabilidad; registrar la reasignación; evitar modificaciones simultáneas sobre los mismos archivos. Las horas ya consumidas siguen contando en el cupo de quien las trabajó; el esfuerzo restante se estima contra el cupo de quien recibe el defecto. Nadie supera 6 h.

## Tickets independientes y prioridad

Usar la plantilla adjunta a este plan para cada defecto reportado por QA. Son obligatorios: responsable, prioridad, comportamiento actual y esperado, reproducción, entorno y versión afectada, alcance, dependencias, esfuerzo restante y evidencia. Registrar por separado esfuerzo consumido y restante; no confundir estimación con horas reales.

No agrupar errores independientes ni duplicar tareas anteriores. Si varios síntomas comparten causa, documentar la relación y corregirla en el lugar compartido correspondiente.

| Prioridad | Criterio | Tratamiento |
| --- | --- | --- |
| P0 · Bloqueante | Impide usar la aplicación o compromete seguridad o integridad de datos | Desplaza el resto del trabajo. |
| P1 · Esencial | Impide completar un recorrido comprometido | Después de P0, antes de cualquier P2. |
| P2 · Menor | Presentación o comodidad, permitiendo completar el recorrido | Solo con capacidad sobrante. |

Francisco coordina prioridad y reparto con QA. Antes de tomar otro defecto, revisar las horas consumidas y el esfuerzo restante de cada persona, incluyendo integración y despliegue que tenga asignados. Un exceso previsto desplaza trabajo de menor prioridad; no amplía horas.

## Criterios de cierre de cada defecto

1. Corrección integrada en la rama de entrega, con PR y commit registrados.
2. Comprobación técnica del dev completada, con comandos/resultados y evidencia pertinentes. Reutilizar los checks existentes del área y la validación del repositorio que corresponda.
3. Corrección disponible en una versión desplegada identificable por URL y commit o identificador de despliegue.
4. Retest satisfactorio de QA sobre esa versión, con persona, fecha, resultado y evidencia registrados.

Una PR abierta o integrada no basta. Si falla el retest, el defecto sigue abierto y se actualiza el esfuerzo restante dentro de los cupos disponibles. QA realiza la aceptación; el dev no la sustituye con sus comprobaciones técnicas.

## Calendario

Fechas en la zona horaria de Buenos Aires.

| Fecha | Actividad y resultado esperado |
| --- | --- |
| 5–6/11 | Primera pasada de QA sobre recorridos existentes; registrar y priorizar defectos; comenzar correcciones disponibles. |
| 5–10/11 | Entregas pequeñas y continuas para retest. Cada dev comprueba técnicamente su corrección antes de entregarla a QA. |
| 10/11 | Cortar P2, concentrarse en P0/P1 y revisar viabilidad del alcance con la capacidad restante. |
| Antes de la aceptación del 11/11 | Integrar y desplegar la versión conjunta; registrar commit y URL. |
| 11/11 | QA verifica la versión conjunta desplegada. Solo si la acepta y se cumplen las condiciones de entrega, fijar commit o tag y URL. |
| 12/11 | Entregar exactamente esa versión. Reabrir únicamente por un bloqueo de entrega. |

Las actividades de QA son hitos de coordinación, no tickets de desarrollo ni horas-dev.

## Responsables y pendientes expresos

| Responsabilidad | Persona y estado |
| --- | --- |
| Coordinación, prioridades y capacidad | Francisco Lang · PM, rol registrado |
| Corrección, comprobación técnica e integración de cada defecto | Dev responsable del ticket, dentro de su cupo |
| Integración de la versión conjunta | Pendiente de asignación por Francisco |
| Despliegue conjunto | Pendiente de asignación por Francisco a una persona con acceso al entorno |
| Verificación y aceptación | QA; persona nominal pendiente de confirmar |
| PO para decisiones de alcance/fecha | Persona pendiente de confirmar por Francisco |

Francisco debe asignar integración y despliegue al inicio del período, el 5/11, confirmando accesos y disponibilidad. Ambos roles pueden recaer en una persona si tiene capacidad. Un pipeline automático no sustituye la asignación. Si los asume un dev, su esfuerzo técnico se descuenta de sus 6 h; no crea capacidad adicional.

Estas asignaciones siguen pendientes: registrar la persona real y la fecha de confirmación cuando se acuerden. Este documento no las da por realizadas ni designa personas en su nombre.

## Condiciones de entrega y desvíos

La entrega requiere versión conjunta desplegada, commit o tag y URL registrados, aceptación final de QA y ausencia de P0/P1 abiertos sobre los recorridos comprometidos.

Si quedan P0/P1 y no alcanza la capacidad, PM/PO deben decidir y registrar un ajuste del alcance de entrega o de la fecha. Registrar recorrido afectado, decisión, alcance o fecha resultante, impacto, responsables de aprobación y fecha de la decisión. Hasta resolverlo no se declara cierre funcional ni se amplían automáticamente las horas.

Los pendientes anteriores no se suponen terminados. Si bloquean la entrega, registrar y escalar por separado, manteniendo su capacidad del período anterior. Las reservas actuales no absorben esos pendientes.

## Registro de aceptación de la versión conjunta

Completar con hechos y evidencia; los campos pendientes no representan trabajo realizado.

| Campo | Estado inicial |
| --- | --- |
| Responsable de integración conjunta | Pendiente |
| Responsable de despliegue | Pendiente |
| Commit o tag de entrega | Pendiente |
| URL desplegada e identificador del despliegue | Pendiente |
| QA responsable, fecha y evidencia de aceptación del 11/11 | Pendiente |
| P0/P1 abiertos y decisiones PM/PO, si corresponden | Pendiente de primera pasada de QA |
| Confirmación de entrega de la misma versión el 12/11 | Pendiente |

## Tickets modularizados en Multica

| Ticket | Responsable | Alcance concreto | Cupo en Estimated TIme (h) |
| --- | --- | --- | ---: |
| [WAT-271](https://multica.ai/watchparty/issues/WAT-271) | Ignacio García | Reseña propia: publicar, editar y eliminar | 2 h |
| [WAT-274](https://multica.ai/watchparty/issues/WAT-274) | Ignacio García | Opiniones del partido: listado y Cargar más | 2 h |
| [WAT-275](https://multica.ai/watchparty/issues/WAT-275) | Ignacio García | Calificación y promedio en el detalle del partido | 2 h |
| [WAT-272](https://multica.ai/watchparty/issues/WAT-272) | Martina Cousido | Cuenta: acceso, sesión y recuperación de contraseña | 2 h |
| [WAT-276](https://multica.ai/watchparty/issues/WAT-276) | Martina Cousido | Perfil: edición y equipo favorito | 2 h |
| [WAT-277](https://multica.ai/watchparty/issues/WAT-277) | Martina Cousido | Historial: notas, filtros y resumen personal | 2 h |
| [WAT-273](https://multica.ai/watchparty/issues/WAT-273) | Tomás | Directorio: filtros combinados y actualización | 2 h |
| [WAT-278](https://multica.ai/watchparty/issues/WAT-278) | Tomás | Sala: ingreso, comentarios y reacciones | 2 h |
| [WAT-279](https://multica.ai/watchparty/issues/WAT-279) | Tomás | Inicio y búsqueda: resultados y navegación | 2 h |

Tres tickets de 2 h por dev: 6 h máximas por persona y 18 h en total. Se reutilizaron WAT-271/272/273 y se crearon WAT-274–279; ya no existen contenedores de 6 h adicionales. Todos inician en Todo, del 05/11 al 12/11/2026. Las tareas de períodos anteriores mantienen sus horas y fechas.

Estos cupos no acreditan defectos identificados ni trabajo realizado. Cada ticket detalla recorrido, límites, criterios y activación contra un reporte real de QA. Un único defecto puede registrarse completando el ticket del recorrido con la plantilla; si se crean otros tickets de defectos, reducir primero el cupo reservado equivalente para no duplicar capacidad. Si QA no reporta un problema, registrar el cupo sin consumo, sin declarar una corrección o aceptación inexistente. Diagnóstico, implementación, comprobación técnica, ajustes de revisión e integración están incluidos.

## Fuentes y límites

- Plan aprobado por Francisco en este chat el 5/11/2026: fuente de las condiciones de este período.
- Repositorio real: https://github.com/FranciscoLang2209/WatchParty
- Prototipo visual: https://github.com/Pedrodeforonda/WatchParty-App-Styled
- Proyecto de Multica WatchParty: b1fdb124-221c-4fdf-ba68-44067d2ff08d. El tracker y los repos aportan contexto; no acreditan aceptación funcional.
- Los YAML históricos del planificador mantienen su snapshot anterior. No representan las reservas actuales ni sustituyen este plan semanal aprobado.
- Este registro no ejecuta QA, despliegues, asignaciones pendientes ni tareas de períodos anteriores.
