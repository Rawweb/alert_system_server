import express from 'express';
import { runPrediction } from '../controllers/predictionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/run', runPrediction);

export default router;
