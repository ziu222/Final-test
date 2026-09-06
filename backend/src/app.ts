import express from 'express';
import cors from 'cors';
import teacherPositionsRouter from './routes/teacherPositions.routes';
import teachersRouter from './routes/teachers.routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/teacher-positions', teacherPositionsRouter);
  app.use('/teachers', teachersRouter);

  app.use(errorHandler);
  return app;
}
