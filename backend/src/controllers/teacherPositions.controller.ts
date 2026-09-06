import { Request, Response, NextFunction } from 'express';
import { TeacherPosition } from '../models/TeacherPosition';

export async function listTeacherPositions(req: Request, res: Response, next: NextFunction) {
  try {
    const positions = await TeacherPosition.find({ isDeleted: false }).lean();
    res.json({ data: positions });
  } catch (err) {
    next(err);
  }
}

export async function createTeacherPosition(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, name, des, isActive } = req.body;
    if (!code || !name || !des) {
      res.status(400).json({ message: 'code, name, des are required' });
      return;
    }

    const existing = await TeacherPosition.findOne({ code });
    if (existing) {
      res.status(409).json({ message: `code '${code}' already exists` });
      return;
    }

    const position = await TeacherPosition.create({
      code,
      name,
      des,
      isActive: isActive ?? true,
    });
    res.status(201).json({ data: position });
  } catch (err) {
    next(err);
  }
}
