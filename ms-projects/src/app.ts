import express from 'express';
import dotenv from 'dotenv';
import { ProjectController } from './controller/project.controller';
import { setupSwagger } from './swagger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;
const projectController = new ProjectController();

app.use(express.json());

// Documentación
setupSwagger(app);

/**
 * @openapi
 * /projects:
 * post:
 * tags:
 * - Projects
 * summary: Crear un nuevo proyecto
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - name
 * - description
 * properties:
 * name:
 * type: string
 * example: "Proyecto Innovatech"
 * description:
 * type: string
 * example: "Desarrollo de microservicios"
 * responses:
 * 201:
 * description: Proyecto creado exitosamente
 */
app.post('/projects', (req, res) => projectController.create(req, res));
app.get('/projects', (req, res) => projectController.getAll(req, res));

/**
 * @openapi
 * /projects/{id}/status:
 * patch:
 * tags: [Projects]
 * summary: Actualizar estado del proyecto
 */
app.patch('/projects/:id/status', (req, res) => projectController.updateStatus(req, res));

app.listen(port, () => {
  console.log(`🚀 MS-PROJECTS corriendo en http://localhost:${port}`);
  console.log(`📖 Documentación disponible en http://localhost:${port}/api-docs`);
});