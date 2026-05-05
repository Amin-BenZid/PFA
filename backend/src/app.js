import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import healthRouter from './routes/health.js';
import predictRouter from './routes/predict.js';
import historyRouter from './routes/history.js';

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max 100 requests per IP per window
  message: { status: 'error', error: { code: 'RATE_LIMIT', message: 'Too many requests, please try again later.' } },
});

const predictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // max 10 predictions per IP per minute
  message: { status: 'error', error: { code: 'RATE_LIMIT', message: 'Too many predictions, slow down.' } },
});

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'https://d3j1y3kiqalty4.cloudfront.net' }));app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.use(limiter);
app.use('/api/health', healthRouter);
app.use('/api/predict', predictLimiter, predictRouter);
app.use('/api/history', historyRouter);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    status: 'error',
    error: { code: err.code || 'INTERNAL_ERROR', message: err.message },
  });
});

export default app;