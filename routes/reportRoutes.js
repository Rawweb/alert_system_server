import express from 'express';
import {
  getSummary,
  getByCategory,
  getExpiringSoon,
  downloadReport,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/by-category', getByCategory);
router.get('/expiring-soon', getExpiringSoon);
router.get('/download', downloadReport);

export default router;
