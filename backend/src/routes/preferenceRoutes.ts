import { Router } from 'express';
import { getPreferences, updatePreferences } from '../controllers/preferenceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, getPreferences);
router.put('/', protect, updatePreferences);

export default router;
