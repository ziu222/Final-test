export interface Degree {
  type: string;
  school: string;
  major: string;
  year: number;
  isGraduated: boolean;
}

export interface Teacher {
  code: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  isActive: boolean;
  positions: string[];
  degrees: Degree[];
}

export interface TeacherListResponse {
  data: Teacher[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateTeacherPayload {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  identity: string;
  dob: string;
  startDate: string;
  endDate?: string;
  teacherPositions: string[];
  degrees: Degree[];
}
