import { Router } from 'express';
import { getPreferences, updatePreferences, addPreferenceItem, removePreferenceItem } from '../controllers/preferenceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, getPreferences);
router.put('/', protect, updatePreferences);
router.post('/item', protect, addPreferenceItem);
router.delete('/item', protect, removePreferenceItem);

export default router;
