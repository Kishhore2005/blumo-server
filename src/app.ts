import express from 'express';
import helmet from 'helmet';
import cors from './middleware/cors';
import campaignRoutes from './routes/campaign.routes';
import dashboardRoutes from './routes/dashboard.routes';
import authRoutes from './routes/auth.routes';
import errorHandler from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(cors);
app.use(express.json());

// Register all API routes under /api
app.use('/api/campaign', campaignRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

export default app;