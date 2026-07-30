import express from 'express';
import {
  runPrediction,
  runScheduled,
} from '../controllers/predictionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Manual trigger: admin clicks the button, requires login
router.post('/run', protect, runPrediction);

// Scheduled trigger: called by cron-job.org, requires cron secret
// No JWT needed here because cron-job.org cannot log in
router.post('/run-scheduled', runScheduled);

export default router;
