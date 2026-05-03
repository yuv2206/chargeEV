import { Router } from 'express';
import {
  createMaintenanceLog,
  getMaintenanceLogs,
  updateMaintenanceLog,
} from '../controllers/maintenanceController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protectAdmin, getMaintenanceLogs);
router.post('/', protectAdmin, createMaintenanceLog);
router.put('/:id', protectAdmin, updateMaintenanceLog);

export default router;

