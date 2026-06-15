import { Router } from 'express';
import { getAll, create, update, deleteMember } from '../controllers/teamController';
import { authenticateToken } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

router.get('/', getAll);
router.post('/', authenticateToken as any, upload.single('image'), create);
router.put('/:id', authenticateToken as any, upload.single('image'), update);
router.delete('/:id', authenticateToken as any, deleteMember);

export default router;
