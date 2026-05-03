import { Router } from 'express';
import {
  createCharger,
  deleteCharger,
  getChargers,
  updateCharger,
} from '../controllers/chargerController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getChargers);
router.post('/', protectAdmin, createCharger);
router.put('/:id', protectAdmin, updateCharger);
router.delete('/:id', protectAdmin, deleteCharger);

export default router;

