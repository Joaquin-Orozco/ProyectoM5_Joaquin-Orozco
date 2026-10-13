# Presentación y defensa

## Orden sugerido para las diapositivas

1. Problema: automatizar tareas repetitivas de GitHub usando lenguaje natural.
2. Diferencia entre chatbot (responde), asistente (ayuda dentro de un flujo) y agente (elige herramientas y ejecuta acciones con autorización).
3. Arquitectura: Antigravity es el Host, el LLM es el Client y este proceso Node es el MCP Server; GitHub es el servicio externo.
4. Recorrido del código: server stdio, schemas Zod, tools, operaciones Octokit y normalización de errores.
5. Demo: listar repositorios, crear un issue, crear una rama o añadir un comentario; usar un recurso conocido y seguro.
6. Tests: dependencias simuladas, casos felices, validación, 404 y rate limit.
7. Aprendizajes, límites conocidos y mejoras futuras.

## Guion de demostración

- Ejecuta `npm test` y `npm run build` antes de compartir pantalla.
- Verifica que el PAT funciona y que las herramientas aparecen en Antigravity.
- Pide listar repositorios; después lista issues de un repositorio de prueba.
- Crea un issue de demostración y agrega un comentario a ese issue.
- Muestra al menos un error entendible, sin provocar cambios destructivos ni exponer el token.
- Ten capturas de la lista de tools y de tests como plan B. Oculta `.env` y cualquier valor secreto al compartir pantalla.

## Decisiones técnicas que conviene defender

- **stdio:** transporte local sencillo para que el Host lance el proceso y use JSON-RPC por stdin/stdout; mantener logs en stderr evita corromper el protocolo.
- **Separación client/operations/tools:** el cliente configura autenticación, operations contiene llamadas de dominio y tools enlaza contratos MCP; esta frontera permite sustituir Octokit por mocks.
- **Zod:** valida antes de tocar la API y publica restricciones/descripciones que ayudan al LLM a elegir y completar parámetros.
- **Errores en lenguaje natural:** el modelo necesita saber si corregir parámetros, permisos o esperar; no debe recibir stack traces ni secretos.
- **Retry limitado:** se reintenta una vez solo frente a 429 o a 403 identificado como rate limit, respetando `Retry-After` o reset de GitHub si la espera no supera 60 segundos. Si el reset es más lejano, se devuelve el error para no reintentar antes de tiempo.
- **Token mínimo:** los permisos dependen de las operaciones y de las políticas del propietario. No se usa `admin:org` porque este alcance no administra organizaciones.

## Preguntas probables

- **¿Quién escoge el tool?** El LLM interpreta las descripciones disponibles y propone una llamada; el Host la enruta al Server.
- **¿Por qué no llamar directamente a GitHub desde el LLM?** MCP define un contrato común, permite validar entradas y concentra credenciales y lógica en el server.
- **¿Por qué no llamar a la API real en tests?** Los mocks hacen que el test sea aislado, rápido, repetible y no consuma rate limit ni modifique repositorios.
- **¿Qué mejorarías después?** Añadir paginación completa, create pull request, verificación previa de permisos y pruebas de contrato contra un cliente MCP en memoria.
- **¿Qué riesgo tiene `create_commit`?** Reemplaza el contenido completo del archivo. Hay que confirmar la ruta, rama y contenido; se puede mejorar con diff o confirmación explícita antes de escribir.

## Límites conocidos

- `list_repositories` devuelve una página de hasta 100; no implementa paginación posterior.
- El backoff reintenta una sola vez y solo espera automáticamente hasta 60 segundos; un límite primario de GitHub puede requerir esperar más y volver a invocar manualmente.
- La demo real requiere que el usuario configure un token con permisos y conecte el servidor a Antigravity.