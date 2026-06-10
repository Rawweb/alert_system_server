import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/aurthControllers.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe); // protect runs first, then getMe

export default router;
