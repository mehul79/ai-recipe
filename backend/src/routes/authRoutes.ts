import { Router } from 'express';
import { register, login, getMe, updatePassword, updateProfile, deleteAccount } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/password', protect, updatePassword);
router.put('/profile', protect, updateProfile);
router.delete('/account', protect, deleteAccount);

export default router;
