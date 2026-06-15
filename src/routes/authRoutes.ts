import { Router } from 'express';
import { login, me } from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.post('/login', login);
router.get('/me', authenticateToken as any, me as any);

export default router;
