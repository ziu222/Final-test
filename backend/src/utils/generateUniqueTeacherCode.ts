import { Teacher } from '../models/Teacher';

function randomTenDigitCode(): string {
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

export async function generateUniqueTeacherCode(maxAttempts = 5): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = randomTenDigitCode();
    const exists = await Teacher.exists({ code });
    if (!exists) return code;
  }
  throw new Error(`Could not generate a unique teacher code after ${maxAttempts} attempts`);
}
