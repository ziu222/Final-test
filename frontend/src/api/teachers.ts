import { apiClient } from './client';
import type { TeacherListResponse, CreateTeacherPayload } from '../types/teacher';

export async function fetchTeachers(page: number, limit: number): Promise<TeacherListResponse> {
  const { data } = await apiClient.get<TeacherListResponse>('/teachers', {
    params: { page, limit },
  });
  return data;
}

export async function createTeacher(payload: CreateTeacherPayload) {
  const { data } = await apiClient.post('/teachers', payload);
  return data;
}
