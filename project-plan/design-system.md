# Diseño del planificador WatchParty

Referencia: sección de diseño de `app-regeneration-prompt.md` adjunto. Es una herramienta de planificación, distinta del producto social oscuro del mockup.

- Superficie clara `#fafafa`, tarjetas blancas, texto `#15171a`, bordes `#e5e5e7`, verde funcional `#218565` y navegación activa oscura.
- Inter para interfaz y Space Grotesk para títulos/cifras; fallbacks del sistema si no hay conexión para cargar fuentes.
- Cuerpo 14 px; tickets 14 px y metadatos 12 px. El Gantt usa etiquetas compactas por restricciones espaciales y títulos nativos para el detalle.
- Encabezado sticky translúcido y seis pestañas compactas. Contenido máximo 1440 px; panel de ticket de 410 px en escritorio que se apila en pantallas pequeñas.
- Tarjetas de 13–14 px de radio, controles de 9–10 px. Foco visible, botones etiquetados, inputs nativos y pestañas accesibles del starter.
- Estados incluyen texto/icono además de color. Riesgos críticos y errores mantienen semántica roja, diferenciada del verde de marca.
- El cronograma es DOM/CSS y flechas SVG, no una imagen de calendario. No hay imágenes decorativas ni portada de marketing.
- No replica estilos ni wrappers del producto WatchParty. No agrega integraciones externas automáticas.
