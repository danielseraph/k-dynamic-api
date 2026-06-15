import { Router } from 'express';
import { getAll, getOne, create, update, deleteVessel } from '../controllers/vesselController';
import { authenticateToken } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

const vesselUploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
]);

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', authenticateToken as any, vesselUploadFields, create);
router.put('/:id', authenticateToken as any, vesselUploadFields, update);
router.delete('/:id', authenticateToken as any, deleteVessel);

export default router;
