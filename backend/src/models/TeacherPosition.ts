import { Schema, model, Types } from 'mongoose';

export interface ITeacherPosition {
  _id: Types.ObjectId;
  name: string;
  code: string;
  des: string;
  isActive: boolean;
  isDeleted: boolean;
}

const teacherPositionSchema = new Schema<ITeacherPosition>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  des: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
});

export const TeacherPosition = model<ITeacherPosition>('TeacherPosition', teacherPositionSchema);
