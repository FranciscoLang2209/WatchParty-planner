# WatchParty · plan de entrega

Fecha límite confirmada: **12/11/2026**. Equipo: **3 developers × 6 h/semana = 18 h/semana**. Corte de planificación: semana del 07/09. Sprints y estimaciones nuevas son propuestas; deben confirmarse en planificación semanal.

## Qué contiene el plan

97 tickets: 37 unidades existentes relevadas en Multica y 60 propuestas/reservas locales. Se preservan 28 completadas. WAT-87 se referencia como coordinadora, sin duplicar sus horas. Los otros 11 Done de gestión histórica no se transcribieron individualmente.

## Capacidad y corte sugerido

| Concepto | Horas |
| --- | ---: |
| Capacidad hasta el 12/11 (última semana prorrateada) | 172.29 |
| Must pendiente, incluyendo reservas y trabajo en curso | 148.25 |
| Should, pendiente de aprobación e inserción en calendario | 19 |
| Could, posterior al MVP | 52 |

El Must incluye 14 h explícitas de reserva. La capacidad no descuenta ausencias, feriados ni esfuerzo ya consumido esta semana; las tareas en curso mantienen toda su estimación hasta que se conozca el remanente. El margen no garantiza que todas las tareas encajen: importan dependencias y habilidades.

## Sprints propuestos

| Sprint | Ventana | Resultado de salida |
| --- | --- | --- |
| 2 · Cerrar las bases | 7 sept – 20 sept | Proveedor, persistencia y cuenta. Salida: catálogo persistido validado, perfil y reglas del MVP. |
| 3 · La experiencia WatchParty | 21 sept – 18 oct | Salas, chat, historial y calificaciones. Salida: recorrido social entre dos usuarios. Should se difiere si no entra. |
| 4 · MVP listo para probar | 19 oct – 1 nov | Seguridad, QA, concurrencia y despliegue. Salida: versión candidata accesible y aceptada. |
| 5 · Entrega y defensa | 2 nov – 12 nov | Documentación, evidencia y demo. Entrega confirmada: jueves 12 de noviembre. No añadir features nuevas. |

## Secuencia de trabajo

1. Cerrar WAT-102/103/105/106/107/108/109, revisar PRs #25/#26/#29 y reconciliar WAT-112. No reconstruir lo integrado.
2. Completar cuenta/perfil y entrar a una sala real con comentarios persistidos. Validar dos sesiones antes de extender el chat.
3. Agregar reacciones y moderación básica; registro de visto, calificaciones, reseñas, historial, búsqueda y feed cronológico.
4. Verificar permisos, accesibilidad, recorrido integrado y concurrencia; preparar QA y versión candidata.
5. Cerrar documentación, evidencia y demo antes de la entrega. Proteger este período de nuevas funcionalidades.

## Decisiones abiertas

- **Datos deportivos actuales:** PR #29 documenta que la cuenta Free rechaza temporada 2026. Resolver INC-001: demo histórica etiquetada o aprobación de otra cobertura. El chat en tiempo real no equivale a datos deportivos en vivo.
- **Cobertura de estadísticas/planteles:** el chequeo actual verifica fixtures, no todos los endpoints. Validar antes de desarrollar WP-023/024. Calificaciones de jugadores y fichas ampliadas quedan Should.
- **Canal social y permisos:** WAT-87 fija React → Node API para lectura. Definir la extensión de tiempo real sin saltar controles de autorización.
- **Carga individual:** conservar los responsables existentes y acordar nuevas asignaciones semanalmente, máximo 6 h por persona. El scheduler no sustituye ese acuerdo.

## Qué queda fuera del corte esencial

Las 19 h Should cubren presencia, jugadores/planteles, fichas ampliadas y compartir. Las 52 h Could cubren seguimiento, feed seguido, interacción ampliada, respuestas, búsqueda de personas, avatar, logros, notificaciones, avisos, actualización automática, estadísticas avanzadas, eliminación de cuenta y salas privadas. La política de retención/eliminación debe acordarse antes de ampliar un piloto a público general.

## Cómo usar este backlog

Cada ticket abre descripción, criterios de aceptación, evidencia, referencias, dependencias, responsable y sprint. Editar y aplicar en la web guarda los YAML locales. Exportar genera una copia JSON; `npm run export` actualiza esta lectura y el backlog Markdown. No se crean ni modifican tickets en Multica.

Fuentes y límites detallados: [evidence.md](evidence.md). Catálogo completo: [backlog.md](backlog.md).
