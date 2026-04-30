import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import healthRouter from './routes/health.js';
import predictRouter from './routes/predict.js';
import historyRouter from './routes/history.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.use('/api/health', healthRouter);
app.use('/api/predict', predictRouter);
app.use('/api/history', historyRouter);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    status: 'error',
    error: { code: err.code || 'INTERNAL_ERROR', message: err.message },
  });
});

export default app;