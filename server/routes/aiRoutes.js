import express from 'express';
import {
  chat,
  parseSearch,
  draftMessage,
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', chat);
router.post('/parse-search', parseSearch);
router.post('/draft-message', draftMessage);

export default router;
