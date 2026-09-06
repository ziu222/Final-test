export interface TeacherPosition {
  _id: string;
  code: string;
  name: string;
  des: string;
  isActive: boolean;
}

export interface CreateTeacherPositionPayload {
  code: string;
  name: string;
  des: string;
  isActive: boolean;
}
