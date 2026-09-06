import { Router } from 'express';
import { listTeachers, createTeacher } from '../controllers/teachers.controller';

const router = Router();
router.get('/', listTeachers);
router.post('/', createTeacher);

export default router;
