import 'dotenv/config'; // Loads .env DURING the import phase, before all other imports

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import dns from 'dns';
import authRoutes from './routes/authRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import productRoutes from './routes/productRoutes.js';
import predictionRoutes from './routes/predictionRoute.js';
import alertRoutes from './routes/alertRoutes.js';
import { startScheduler } from './utils/scheduler.js';
import reportRoutes from './routes/reportRoutes.js';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();

app.use(cors());
app.use(express.json());

// test route
app.get('/api/health', (req, res) => {
  res
    .status(200)
    .json({ status: 'ok', message: 'Alert System API is healthy', service: 'Alert System API' });
});

// real routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);

// error handling middleware (must come after all routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  startScheduler();
});
