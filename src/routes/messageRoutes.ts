import { Router } from 'express';
import { create, getAll, updateStatus, deleteMessage } from '../controllers/messageController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.post('/', create);
router.get('/', authenticateToken as any, getAll);
router.patch('/:id/status', authenticateToken as any, updateStatus);
router.delete('/:id', authenticateToken as any, deleteMessage);

export default router;
