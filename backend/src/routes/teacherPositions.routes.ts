import { Router } from 'express';
import { listTeacherPositions, createTeacherPosition } from '../controllers/teacherPositions.controller';

const router = Router();
router.get('/', listTeacherPositions);
router.post('/', createTeacherPosition);

export default router;
