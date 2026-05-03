import { Router } from 'express';
import {
  createStation,
  deleteStation,
  getStationById,
  getStations,
  updateStation,
} from '../controllers/stationController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getStations);
router.get('/:id', getStationById);
router.post('/', protectAdmin, createStation);
router.put('/:id', protectAdmin, updateStation);
router.delete('/:id', protectAdmin, deleteStation);

export default router;

