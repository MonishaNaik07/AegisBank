import express from 'express';
import { chatWithBot, getAIInsights } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/chatbot', chatWithBot);
router.get('/insights', getAIInsights);

export default router;
