import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import ticketRoutes from './routes/ticketRoutes';
import { notFound, errorHandler } from './middleware/errorHandler';
import { setupSwagger } from './docs/swagger';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Support Ticket Tracker API is running' });
});

setupSwagger(app);

app.use('/api/tickets', ticketRoutes);

const clientDist = path.resolve(__dirname, '../public');
if (fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/api-docs')) {
      next();
      return;
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
