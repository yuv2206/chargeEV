import { Router } from 'express';
import { getPayments, makePayment } from '../controllers/paymentController.js';
import { protectAdmin, protectUser } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protectAdmin, getPayments);
router.post('/', protectUser, makePayment);

export default router;

