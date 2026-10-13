GitHub AI Agent — AutomateHub

Servidor MCP desarrollado con TypeScript y Node.js para automatizar operaciones de GitHub mediante instrucciones en lenguaje natural. Permite que un host compatible con el protocolo MCP, como Antigravity, invoque herramientas para administrar repositorios, issues, ramas y archivos.

El proyecto utiliza el Model Context Protocol (MCP), el SDK oficial de MCP para TypeScript, Octokit para comunicarse con la API de GitHub y Zod para validar los parámetros de entrada.

Características principales

- Servidor MCP que se comunica mediante "stdio".
- Integración con GitHub a través de Octokit.
- Validación de parámetros con Zod.
- Manejo de errores de validación, autenticación, permisos y solicitudes a la API.
- Ocho herramientas para realizar operaciones sobre GitHub.
- Pruebas automatizadas con Vitest.
- Configuración mediante variables de entorno.
- Compatibilidad con hosts que admitan servidores MCP mediante "stdio".

Arquitectura

El proyecto sigue una arquitectura cliente-servidor basada en MCP:

1. Host: aplicación compatible con MCP que recibe las instrucciones del usuario.
2. Cliente MCP: establece la comunicación con el servidor y permite descubrir e invocar las herramientas disponibles.
3. Servidor MCP: valida los argumentos, ejecuta la operación solicitada y devuelve el resultado.
4. API de GitHub: recibe las solicitudes realizadas mediante Octokit.

El modelo de lenguaje puede seleccionar las herramientas según las instrucciones y descripciones disponibles. La ejecución de las operaciones queda a cargo del servidor.

La comunicación MCP utiliza "stdio". Los mensajes del protocolo se envían por la salida estándar ("stdout"); los registros de diagnóstico deben enviarse por la salida de errores ("stderr") para no interferir con la comunicación.

Tecnologías utilizadas

- Node.js: entorno de ejecución.
- TypeScript: tipado estático.
- Model Context Protocol SDK: implementación del servidor MCP.
- Octokit REST: integración con la API de GitHub.
- Zod: validación de datos.
- Vitest: pruebas automatizadas.
- dotenv: carga de variables de entorno.
- MCP Inspector: herramienta para inspeccionar y probar el servidor.

Requisitos previos

- Node.js 18 o superior.
- npm.
- Una cuenta de GitHub.
- Un Personal Access Token (PAT) con los permisos necesarios.
- Un host compatible con MCP, como Antigravity.
- MCP Inspector para realizar pruebas manuales.

Instalación

Cloná el repositorio y entrá en la carpeta del proyecto:

git clone https://github.com/Joaquin-Orozco/ProyectoM5_Joaquin-Orozco.git
cd ProyectoM5_Joaquin-Orozco

Instalá las dependencias:

npm install

Creá el archivo local de variables de entorno a partir de la plantilla:

Copy-Item .env.example .env

Abrí el archivo ".env" y configurá tu token:

GITHUB_TOKEN=tu_token_de_github

Reemplazá el valor de ejemplo por un token válido. No compartas el token ni lo incluyas en el código fuente, en archivos de configuración versionados o en capturas de pantalla.

El archivo ".env" está excluido del control de versiones mediante ".gitignore". El archivo ".env.example" debe contener únicamente valores de ejemplo, nunca credenciales reales.

Permisos de GitHub

El token debe contar con los permisos necesarios para las operaciones que se quieran realizar.

Para un Fine-grained Personal Access Token, configurá el acceso a los repositorios correspondientes y concedé únicamente los permisos necesarios, por ejemplo:

- Metadata: lectura.
- Contents: lectura y escritura para consultar y modificar archivos.
- Issues: lectura y escritura para crear, listar, comentar y cerrar issues.
- Administración de repositorios: los permisos adicionales necesarios para crear repositorios, según la configuración y el tipo de token.

Los permisos efectivos dependen de las operaciones solicitadas y de las restricciones de la cuenta u organización. Es recomendable aplicar el principio de mínimo privilegio.

Compilación y pruebas

Compilá el proyecto con:

npm run build

Ejecutá las pruebas automatizadas con:

npm test

Para ejecutar el servidor en modo de desarrollo:

npm run dev

Para iniciar el servidor compilado:

npm start

El comando "npm start" ejecuta el archivo generado en "dist/server.js". Por eso, compilá el proyecto antes de iniciar el servidor si todavía no existe la carpeta "dist" o si realizaste cambios en el código.

Herramientas MCP disponibles

El servidor expone ocho herramientas para interactuar con GitHub.

Herramienta| Función| Parámetros principales
"create_repository"| Crea un repositorio.| "name", "description?", "private?"
"create_issue"| Crea un issue en un repositorio.| "owner", "repo", "title", "body?"
"list_repositories"| Lista repositorios de GitHub.| "type?"
"create_commit"| Crea un commit para crear o actualizar un archivo.| "owner", "repo", "path", "message", "content", "branch?"
"list_issues"| Lista los issues abiertos de un repositorio.| "owner", "repo", "perPage?"
"create_branch"| Crea una rama a partir de otra existente.| "owner", "repo", "branch", "fromBranch?"
"close_issue"| Cierra un issue.| "owner", "repo", "issueNumber"
"add_comment_to_issue"| Agrega un comentario a un issue.| "owner", "repo", "issueNumber", "body"

Ejemplos de instrucciones en lenguaje natural

- “Creá un repositorio privado llamado "api-demo" con una descripción breve”.
- “Listá mis repositorios privados”.
- “Creá un issue para documentar el endpoint de salud”.
- “Agregá el archivo "docs/plan.md" con el contenido indicado y registrá un commit”.
- “Listá los issues abiertos del repositorio indicado”.
- “Creá la rama "feature/health-check" desde "main"”.
- “Agregá un comentario a un issue específico”.
- “Cerrá el issue número 1 del repositorio indicado”.

Los ejemplos son ilustrativos: cada operación requiere los argumentos correspondientes y los permisos adecuados.

Validación de nombres de repositorios

Los nombres de repositorio admiten entre 3 y 100 caracteres y pueden contener letras, números, guiones ("-") y guiones bajos ("_"). No pueden comenzar ni terminar con un guion o guion bajo.

La validación de entrada se realiza con Zod antes de ejecutar la operación correspondiente. GitHub también aplica sus propias reglas y restricciones.

Creación y actualización de archivos

La herramienta "create_commit" permite crear un archivo o reemplazar completamente el contenido de uno existente. Cuando el archivo ya existe, se obtiene su SHA para realizar la actualización mediante la API de GitHub.

Esta operación no agrega automáticamente contenido al final del archivo: reemplaza el contenido completo por el nuevo texto proporcionado.

Pruebas manuales con MCP Inspector

Para compilar el proyecto y abrir MCP Inspector, ejecutá:

npm run inspector

El script compila el servidor y utiliza MCP Inspector para conectarse al proceso local.

1. Esperá a que se inicie el Inspector.
2. Abrí la dirección local que aparece en la terminal.
3. Configurá "GITHUB_TOKEN" en el entorno del servidor si el Inspector lo requiere.
4. Conectate al servidor.
5. Verificá que aparezcan las ocho herramientas.
6. Probá las operaciones con un repositorio de prueba.
7. Revisá los resultados y los cambios en GitHub.

Las operaciones que crean repositorios, issues, ramas, comentarios o commits modifican recursos reales. Para las pruebas manuales, utilizá repositorios de prueba y verificá los cambios antes de continuar.

Configuración en Antigravity

Primero, compilá el proyecto:

npm run build

Después, agregá el servidor MCP en la configuración de MCP de Antigravity. La configuración debe indicar el comando "node" y la ruta absoluta al archivo compilado "dist/server.js".

Ejemplo orientativo:

{
  "mcpServers": {
    "automatehub-github": {
      "command": "node",
      "args": [
        "C:/ruta/a/ProyectoM5_Joaquin-Orozco/dist/server.js"
      ],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}

Importante: reemplazá la ruta de ejemplo por la ubicación real del proyecto. La interpolación de "${GITHUB_TOKEN}" depende del host y de su versión; no todos los hosts la procesan de la misma manera. Configurá la variable de entorno de acuerdo con la documentación del host y verificá que el servidor pueda autenticarse.

No incluyas un token real directamente en el archivo JSON ni subas credenciales a GitHub.

Una vez configurado, reiniciá o reconectá el servidor MCP y comprobá que el host detecte las ocho herramientas.

Estructura del proyecto

ProyectoM5_Joaquin-Orozco/
├── src/
│   └── server.ts
├── tests/
├── docs/
│   └── DEFENSA.md
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
├── vitest.config.ts
├── README.md
└── LICENSE

La estructura anterior representa los archivos principales esperados; la ubicación y el nombre de los archivos de pruebas pueden variar según la organización real del proyecto.

Manejo de errores

El servidor contempla errores que pueden producirse durante la validación de los parámetros y las solicitudes a GitHub.

Entre los casos relevantes se encuentran:

- Error de validación: uno o más argumentos no cumplen el esquema esperado.
- Error 401: el token no es válido o la autenticación falla.
- Error 403: faltan permisos o se alcanzó un límite de solicitudes.
- Error 404: el repositorio, archivo o issue no existe o no está accesible.
- Error 409: existe un conflicto con el estado actual del recurso, por ejemplo, al intentar crear una rama en un repositorio sin una referencia de origen válida.

Los mensajes de error deben facilitar el diagnóstico sin revelar credenciales ni información sensible.

Seguridad

- No subas ".env" a GitHub.
- No incluyas tokens reales en el código fuente.
- Mantené ".env.example" libre de secretos.
- Limitá los permisos del token a las operaciones necesarias.
- Evitá registrar credenciales en la consola.
- Utilizá repositorios de prueba para las operaciones que modifican datos.
- Si un token se expone accidentalmente, revocalo y generá uno nuevo.

Solución de problemas

El servidor no se inicia

Verificá que Node.js y npm estén instalados y ejecutá:

npm install
npm run build

La autenticación falla

Comprobá que "GITHUB_TOKEN" esté definido en el entorno del proceso que inicia el servidor y que el token sea válido. No compartas el valor del token para diagnosticar el problema.

GitHub devuelve un error 403

Revisá los permisos del token, el acceso al repositorio y los límites de solicitudes de la API.

Una herramienta devuelve un error de validación

Verificá que los nombres de los parámetros sean correctos y que sus valores cumplan las validaciones del esquema.

No aparecen las herramientas en el host

Comprobá la ruta del archivo "dist/server.js", la configuración del servidor MCP y que la compilación finalice correctamente. Después, reiniciá la conexión.

MCP Inspector no conecta

Revisá los mensajes de la terminal, confirmá que el proceso se encuentre activo y verificá que los puertos locales necesarios estén disponibles.

Documentación de la defensa

El archivo "docs/DEFENSA.md" contiene el material de apoyo para explicar el funcionamiento del proyecto, la arquitectura MCP, las decisiones técnicas, las herramientas implementadas y las pruebas realizadas.

Licencia

Este proyecto utiliza la licencia indicada en el archivo "LICENSE". Consultá ese archivo para conocer sus términos y condiciones.