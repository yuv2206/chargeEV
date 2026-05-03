import { Router } from 'express';
import { cancelBooking, createBooking, getAllBookings, getMyBookings } from '../controllers/bookingController.js';
import { protectAdmin, protectUser } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/mine', protectUser, getMyBookings);
router.get('/', protectAdmin, getAllBookings);
router.post('/', protectUser, createBooking);
router.patch('/:id/cancel', protectUser, cancelBooking);

export default router;

