import { Schema, model, Types } from 'mongoose';

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  identity: string;
  dob: Date;
  isDeleted: boolean;
  role: UserRole;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  identity: { type: String, required: true },
  dob: { type: Date, required: true },
  isDeleted: { type: Boolean, default: false },
  role: { type: String, enum: ['STUDENT', 'TEACHER', 'ADMIN'], required: true },
});

export const User = model<IUser>('User', userSchema);
