import { apiClient } from './client';
import type { TeacherPosition, CreateTeacherPositionPayload } from '../types/teacherPosition';

export async function fetchTeacherPositions(): Promise<{ data: TeacherPosition[] }> {
  const { data } = await apiClient.get('/teacher-positions');
  return data;
}

export async function createTeacherPosition(payload: CreateTeacherPositionPayload) {
  const { data } = await apiClient.post('/teacher-positions', payload);
  return data;
}
