import express from 'express';
import {
  getAlerts,
  getUnreadCount,
  markAlertAsRead,
  markAllAlertsAsRead,
} from '../controllers/alertController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAlerts);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAlertsAsRead);
router.patch('/:id/read', markAlertAsRead);

export default router;
