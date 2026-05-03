import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/adminController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/dashboard', protectAdmin, getDashboardAnalytics);

export default router;

