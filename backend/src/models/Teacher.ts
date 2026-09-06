import { Schema, model, Types } from 'mongoose';

export interface IDegree {
  type: string;
  school: string;
  major: string;
  year: number;
  isGraduated: boolean;
}

export interface ITeacher {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  code: string;
  isActive: boolean;
  isDeleted: boolean;
  startDate: Date;
  endDate?: Date;
  teacherPositionsId: Types.ObjectId[];
  degrees: IDegree[];
}

const degreeSchema = new Schema<IDegree>(
  {
    type: { type: String, required: true },
    school: { type: String, required: true },
    major: { type: String, required: true },
    year: { type: Number, required: true },
    isGraduated: { type: Boolean, default: false },
  },
  { _id: false }
);

const teacherSchema = new Schema<ITeacher>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  code: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  teacherPositionsId: [{ type: Schema.Types.ObjectId, ref: 'TeacherPosition' }],
  degrees: [degreeSchema],
});

export const Teacher = model<ITeacher>('Teacher', teacherSchema);
