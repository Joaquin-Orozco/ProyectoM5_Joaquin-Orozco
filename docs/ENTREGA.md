# Checklist de entrega

## Listo y verificado localmente

- [x] MCP Server TypeScript con SDK oficial y transporte stdio.
- [x] Octokit separado en cliente y operaciones; token obtenido de variable de entorno.
- [x] Cinco tools requeridos y tres extras: `create_branch`, `close_issue`, `add_comment_to_issue`.
- [x] Schemas Zod con límites y descripciones para el LLM.
- [x] Errores clasificados y traducidos; retry de rate limit acotado; logs estructurados por stderr.
- [x] `.gitignore`, `.env.example`, `package.json`, lockfile y configuración TypeScript.
- [x] README, diagrama Mermaid, troubleshooting, ejemplos y licencia MIT.
- [x] Guion y material de diapositivas en Markdown: [PRESENTACION.md](PRESENTACION.md).
- [x] `npm run build` correcto; `npm test`: 21 tests pasan.
- [x] Smoke test JSON-RPC por stdio confirmó `initialize` y las 8 tools.
- [x] `npm audit --omit=dev`: 0 vulnerabilidades.
- [x] `git check-ignore .env` confirma que el token local está excluido.

## Requiere acción del estudiante

- [ ] Crear `.env` a partir de `.env.example` y configurar un PAT propio. No compartir el token.
- [ ] Revisar scopes/permisos del PAT y autorización de la organización si aplica.
- [ ] Instalar/ejecutar Inspector con `npm run inspector`; no se pudo verificar aquí porque la descarga npm de Inspector quedó bloqueada y se canceló. La versión fijada 0.16 admite Node 18, pero npm la marca como línea v1 de mantenimiento.
- [ ] Ajustar ruta y sintaxis de configuración en Antigravity, conectar el server y verificar al menos tres tools con GitHub real.
- [ ] Crear/publicar el repositorio público y hacer commit/push. El repo local se inicializó en `main`, pero no se creó repo remoto ni se subió código.
- [ ] Convertir [PRESENTACION.md](PRESENTACION.md) a PDF o Google Slides, ensayar demo y preparar capturas de respaldo.

## Avisos

- La auditoría completa detecta avisos en dependencias de desarrollo de Vitest; las versiones corregidas consultadas requieren Node 20, así que se conserva compatibilidad con Node 18. Las dependencias de producción no reportan vulnerabilidades.
- No se probó una llamada real a GitHub: requiere un PAT válido y podría crear/modificar recursos. Las pruebas unitarias mockean Octokit.