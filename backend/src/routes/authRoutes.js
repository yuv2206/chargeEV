import { Router } from 'express';
import { adminLogin, login, me, register } from '../controllers/authController.js';
import { protectUser } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.get('/me', protectUser, me);

export default router;

