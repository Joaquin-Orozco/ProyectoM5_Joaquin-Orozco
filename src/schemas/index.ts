import { z } from 'zod';

const repositoryName = z.string().trim()
  .min(3, 'El nombre del repositorio debe tener al menos 3 caracteres.')
  .max(100, 'El nombre del repositorio no puede superar 100 caracteres.')
  .regex(/^[A-Za-z0-9](?:[A-Za-z0-9-]{1,98}[A-Za-z0-9])$/, 'Usa solo letras, números y guiones; no empieces ni termines con guion.');
const owner = z.string().trim().min(1, 'Indica el usuario u organización propietaria.');
const issueNumber = z.number().int('El número de issue debe ser un entero.').positive('El número de issue debe ser mayor que cero.');
const branchName = z.string().trim().min(1, 'El nombre de la rama no puede estar vacío.').max(255, 'El nombre de la rama es demasiado largo.')
  .regex(/^[A-Za-z0-9._/-]+$/, 'El nombre de la rama contiene caracteres no permitidos.')
  .refine((value) => !value.startsWith('/') && !value.endsWith('/') && !value.includes('..') && !value.includes('//'), 'El nombre de la rama no es válido para Git.');

export const createRepositorySchema = z.object({
  name: repositoryName.describe('Nombre único del repositorio: 3-100 caracteres alfanuméricos o guiones, sin guion inicial/final.'),
  description: z.string().max(350, 'La descripción no puede superar 350 caracteres.').default('').describe('Descripción breve del repositorio (máximo 350 caracteres).'),
  private: z.boolean().default(true).describe('Crea un repositorio privado por defecto; usa false solo si debe ser público.'),
});

export const createIssueSchema = z.object({
  owner: owner.describe('Usuario u organización propietaria del repositorio.'),
  repo: repositoryName.describe('Nombre exacto del repositorio existente.'),
  title: z.string().trim().min(1, 'El título del issue no puede estar vacío.').max(256, 'El título no puede superar 256 caracteres.').describe('Título claro y accionable del issue.'),
  body: z.string().max(65536, 'El cuerpo del issue es demasiado largo.').default('').describe('Descripción, contexto y pasos para reproducir; puede quedar vacío.'),
});

export const listRepositoriesSchema = z.object({
  type: z.enum(['all', 'owner', 'public', 'private', 'member']).default('owner').describe('Filtra repositorios: por defecto lista los propios.'),
});

export const createCommitSchema = z.object({
  owner: owner.describe('Usuario u organización propietaria del repositorio.'),
  repo: repositoryName.describe('Nombre exacto del repositorio existente.'),
  path: z.string().trim().min(1, 'Indica la ruta del archivo.').refine((value) => !value.startsWith('/') && !value.split('/').includes('..'), 'La ruta debe ser relativa al repositorio y no puede salir de él.').describe('Ruta relativa del archivo que se creará o actualizará.'),
  message: z.string().trim().min(1, 'El mensaje del commit no puede estar vacío.').max(500, 'El mensaje del commit es demasiado largo.').describe('Mensaje descriptivo del commit.'),
  content: z.string().min(1, 'El contenido del archivo no puede estar vacío.').describe('Contenido completo nuevo del archivo en texto plano.'),
  branch: branchName.optional().describe('Rama destino; si se omite GitHub usa la rama predeterminada.'),
});

export const listIssuesSchema = z.object({
  owner: owner.describe('Usuario u organización propietaria del repositorio.'),
  repo: repositoryName.describe('Nombre exacto del repositorio existente.'),
  perPage: z.number().int().min(1).max(100).default(30).describe('Cantidad de issues a devolver (1-100).'),
});

export const createBranchSchema = z.object({
  owner: owner.describe('Usuario u organización propietaria del repositorio.'),
  repo: repositoryName.describe('Nombre exacto del repositorio existente.'),
  branch: branchName.describe('Nombre de la nueva rama.'),
  fromBranch: branchName.optional().describe('Rama base; si se omite se utiliza la rama predeterminada.'),
});

export const closeIssueSchema = z.object({
  owner: owner.describe('Usuario u organización propietaria del repositorio.'),
  repo: repositoryName.describe('Nombre exacto del repositorio existente.'),
  issueNumber: issueNumber.describe('Número del issue que se cerrará.'),
});

export const addIssueCommentSchema = z.object({
  owner: owner.describe('Usuario u organización propietaria del repositorio.'),
  repo: repositoryName.describe('Nombre exacto del repositorio existente.'),
  issueNumber: issueNumber.describe('Número del issue o pull request al que se agregará el comentario.'),
  body: z.string().trim().min(1, 'El comentario no puede estar vacío.').max(65536, 'El comentario es demasiado largo.').describe('Texto del comentario en Markdown.'),
});

export const schemas = {
  create_repository: createRepositorySchema,
  create_issue: createIssueSchema,
  list_repositories: listRepositoriesSchema,
  create_commit: createCommitSchema,
  list_issues: listIssuesSchema,
  create_branch: createBranchSchema,
  close_issue: closeIssueSchema,
  add_comment_to_issue: addIssueCommentSchema,
};