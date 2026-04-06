# 🧑‍💻 Portal de Trabajo - TRABAJAHOY

Portal web **TrabajaHoy**, enfocado en la gestión de usuarios (candidatos y empresas) con una arquitectura limpia basada en vistas independientes.

---

Arquitectura Frontend
Cada vista tiene su propio:
HTML
CSS
No se utiliza un style.css global gigante
Esto permite:
mejor mantenimiento
escalabilidad
separación clara de responsabilidades
Diseño UI/UX

El diseño está basado en prototipos de Figma, priorizando:

consistencia visual
espaciados precisos
tipografía uniforme (Inter)
componentes reutilizables (inputs, botones, layouts)

Workflow con Figma + MCP

Durante el desarrollo se utilizó integración local con Figma mediante MCP para acelerar el proceso de maquetación:

{
  "servers": {
    "Figma": {
      "type": "http",
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
Uso en desarrollo:
inspección de diseño (spacing, colors, typography)
extracción de estilos directamente desde Figma
referencia visual precisa para replicar UI

Nota:
Esta configuración es opcional y local.
El proyecto no depende de MCP para ejecutarse.

Cómo ejecutar el proyecto

Este es un proyecto estático, no requiere backend.

Opciones:

1. Abrir directamente
Abrir cualquier index.html en el navegador

Ejemplo:

views/landing/index.html
views/login/index.html
2. Usar Live Server (recomendado)





Licencia

Este proyecto es de uso educativo/profesional.
