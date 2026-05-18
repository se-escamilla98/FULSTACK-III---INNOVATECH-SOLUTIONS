import projectsRouter from './routes/projects.routes';
import teamsRouter from './routes/teams.routes';
import tasksRouter from './routes/tasks.routes';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());  
app.use( projectsRouter);
app.use( teamsRouter);
app.use( tasksRouter);

app.listen(port, () => {
  console.log(`🚀 BFF-GATEWAY corriendo en http://localhost:${port}`);
});