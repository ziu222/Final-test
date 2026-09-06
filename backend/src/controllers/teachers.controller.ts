import { Request, Response, NextFunction } from 'express';
import { Teacher } from '../models/Teacher';
import { User } from '../models/User';
import { generateUniqueTeacherCode } from '../utils/generateUniqueTeacherCode';

export async function listTeachers(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.max(1, parseInt(String(req.query.limit ?? '10'), 10) || 10);

    const [teachers, total] = await Promise.all([
      Teacher.find({ isDeleted: false })
        .populate('userId', 'name email phoneNumber address')
        .populate('teacherPositions', 'name')
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Teacher.countDocuments({ isDeleted: false }),
    ]);

    const data = teachers.map((t: any) => ({
      code: t.code,
      name: t.userId?.name,
      email: t.userId?.email,
      phoneNumber: t.userId?.phoneNumber,
      address: t.userId?.address,
      isActive: t.isActive,
      positions: (t.teacherPositions ?? []).map((p: any) => p.name),
      degrees: t.degrees ?? [],
    }));

    res.json({ data, total, page, limit });
  } catch (err) {
    next(err);
  }
}

export async function createTeacher(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      name,
      email,
      phoneNumber,
      address,
      identity,
      dob,
      teacherPositions,
      startDate,
      endDate,
      degrees,
    } = req.body;

    if (!name || !email || !phoneNumber || !address || !identity || !dob || !startDate) {
      res.status(400).json({ message: 'missing required fields' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: `email '${email}' already exists` });
      return;
    }

    const user = await User.create({
      name,
      email,
      phoneNumber,
      address,
      identity,
      dob,
      role: 'TEACHER',
    });

    const code = await generateUniqueTeacherCode();

    const teacher = await Teacher.create({
      userId: user._id,
      code,
      startDate,
      endDate,
      teacherPositions: teacherPositions ?? [],
      degrees: degrees ?? [],
    });

    await teacher.populate([
      { path: 'userId', select: 'name email phoneNumber address' },
      { path: 'teacherPositions', select: 'name' },
    ]);

    res.status(201).json({ data: teacher });
  } catch (err) {
    next(err);
  }
}
