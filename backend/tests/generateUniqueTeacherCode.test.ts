import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Teacher } from '../src/models/Teacher';
import { generateUniqueTeacherCode } from '../src/utils/generateUniqueTeacherCode';

vi.mock('../src/models/Teacher', () => ({
  Teacher: { exists: vi.fn() },
}));

describe('generateUniqueTeacherCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a 10-digit numeric code when the first attempt is unique', async () => {
    vi.mocked(Teacher.exists).mockResolvedValue(null as any);

    const code = await generateUniqueTeacherCode();

    expect(code).toMatch(/^\d{10}$/);
    expect(Teacher.exists).toHaveBeenCalledTimes(1);
  });

  it('retries when a generated code already exists, then succeeds', async () => {
    vi.mocked(Teacher.exists)
      .mockResolvedValueOnce({ _id: 'x' } as any)
      .mockResolvedValueOnce(null as any);

    const code = await generateUniqueTeacherCode();

    expect(code).toMatch(/^\d{10}$/);
    expect(Teacher.exists).toHaveBeenCalledTimes(2);
  });

  it('throws after maxAttempts consecutive collisions', async () => {
    vi.mocked(Teacher.exists).mockResolvedValue({ _id: 'x' } as any);

    await expect(generateUniqueTeacherCode(3)).rejects.toThrow(
      'Could not generate a unique teacher code after 3 attempts'
    );
    expect(Teacher.exists).toHaveBeenCalledTimes(3);
  });
});
