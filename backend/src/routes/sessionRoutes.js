import { Router } from 'express';
import { endSession, getBill, startSession } from '../controllers/sessionController.js';
import { protectUser } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/start/:bookingId', protectUser, startSession);
router.post('/end/:sessionId', protectUser, endSession);
router.get('/bill/:sessionId', protectUser, getBill);

export default router;

