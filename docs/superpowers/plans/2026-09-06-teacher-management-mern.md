# Teacher Management MERN Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a MERN teacher-management app: 4 REST endpoints (list/create teachers, list/create teacher positions) plus a 2-page React admin UI to drive them.

**Architecture:** `backend/` is an Express + TypeScript + Mongoose API talking to a local MongoDB. `frontend/` is a Vite + React + TypeScript SPA using Ant Design for the table/drawer/form UI, calling the API over axios. No auth, no edit/delete — read-and-create only, per spec.

**Tech Stack:** Node.js, Express 4, Mongoose 8, TypeScript 5, tsx (dev runner), vitest (unit tests); Vite 5, React 18, Ant Design 5, react-router-dom 6, axios.

**Spec:** [docs/superpowers/specs/2026-09-06-teacher-management-mern-design.md](../specs/2026-09-06-teacher-management-mern-design.md)

## Global Constraints

- Backend base URL: `http://localhost:4000`. Frontend reads it from `VITE_API_BASE_URL` (default `http://localhost:4000`).
- MongoDB: `mongodb://localhost:27017/mindx-teacher` (from spec — local MongoDB).
- `Teacher.code` is a random 10-digit numeric string, unique, generated server-side (never accepted from the client).
- `User.email` and `TeacherPosition.code` must be unique — violations return HTTP 409.
- No authentication, no edit/delete endpoints, no seed script — out of scope per spec.
- Only one automated test in the whole project: `generateUniqueTeacherCode` (per spec's Testing section). Every other task is verified manually (curl or browser).

---

### Task 1: Backend scaffold — Express app, DB connection, error handling

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/.env.example`
- Create: `backend/.env`
- Create: `backend/.gitignore`
- Create: `backend/src/db.ts`
- Create: `backend/src/middleware/errorHandler.ts`
- Create: `backend/src/app.ts`
- Create: `backend/src/server.ts`

**Interfaces:**
- Produces: `createApp(): express.Express` (from `app.ts`) — later tasks mount routers on it via `app.use('/teachers', ...)` / `app.use('/teacher-positions', ...)`.
- Produces: `connectDB(uri: string): Promise<void>` (from `db.ts`).
- Produces: `errorHandler(err, req, res, next)` Express error middleware (from `middleware/errorHandler.ts`) — mounted last in `app.ts`; later controllers call `next(err)` to reach it.

- [ ] **Step 1: Create `backend/package.json`**

```json
{
  "name": "backend",
  "version": "1.0.0",
  "private": true,
  "type": "commonjs",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest run"
  },
  "dependencies": {
    "express": "^4.19.2",
    "mongoose": "^8.5.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "typescript": "^5.5.4",
    "tsx": "^4.16.2",
    "vitest": "^2.0.5",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.14.15"
  }
}
```

- [ ] **Step 2: Create `backend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `backend/.env.example` and `backend/.env`** (identical content — `.env` is gitignored)

```
PORT=4000
MONGO_URI=mongodb://localhost:27017/mindx-teacher
```

- [ ] **Step 4: Create `backend/.gitignore`**

```
node_modules
dist
.env
```

- [ ] **Step 5: Create `backend/src/db.ts`**

```ts
import mongoose from 'mongoose';

export async function connectDB(uri: string): Promise<void> {
  await mongoose.connect(uri);
}
```

- [ ] **Step 6: Create `backend/src/middleware/errorHandler.ts`**

```ts
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(err);
  res.status(500).json({ message: 'internal server error' });
}
```

- [ ] **Step 7: Create `backend/src/app.ts`**

```ts
import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use(errorHandler);
  return app;
}
```

- [ ] **Step 8: Create `backend/src/server.ts`**

```ts
import 'dotenv/config';
import { createApp } from './app';
import { connectDB } from './db';

const PORT = process.env.PORT ?? 4000;
const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/mindx-teacher';

connectDB(MONGO_URI)
  .then(() => {
    const app = createApp();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
```

- [ ] **Step 9: Install dependencies and verify it boots**

Run:
```bash
cd backend && npm install
```
Make sure MongoDB is running locally (`mongod` or your local service), then:
```bash
npm run dev
```
Expected: console prints `Server running on port 4000` with no errors. In another terminal: `curl http://localhost:4000/health` → `{"status":"ok"}`. Stop the dev server (Ctrl+C) before continuing.

- [ ] **Step 10: Commit**

```bash
git add backend/package.json backend/tsconfig.json backend/.env.example backend/.gitignore backend/src
git commit -m "feat(backend): scaffold Express app with DB connection and error handler"
```

---

### Task 2: Mongoose data models

**Files:**
- Create: `backend/src/models/User.ts`
- Create: `backend/src/models/TeacherPosition.ts`
- Create: `backend/src/models/Teacher.ts`

**Interfaces:**
- Consumes: nothing new (standalone models).
- Produces: `User` model + `IUser` type (`name, email, phoneNumber, address, identity, dob, isDeleted, role`).
- Produces: `TeacherPosition` model + `ITeacherPosition` type (`name, code, des, isActive, isDeleted`).
- Produces: `Teacher` model + `ITeacher`/`IDegree` types (`userId, code, isActive, isDeleted, startDate, endDate, teacherPositions, degrees`). Later tasks (3, 5) import `Teacher`, `User`, `TeacherPosition` from these files.

- [ ] **Step 1: Create `backend/src/models/User.ts`**

```ts
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
```

- [ ] **Step 2: Create `backend/src/models/TeacherPosition.ts`**

```ts
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
```

- [ ] **Step 3: Create `backend/src/models/Teacher.ts`**

```ts
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
  teacherPositions: Types.ObjectId[];
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
  teacherPositions: [{ type: Schema.Types.ObjectId, ref: 'TeacherPosition' }],
  degrees: [degreeSchema],
});

export const Teacher = model<ITeacher>('Teacher', teacherSchema);
```

- [ ] **Step 4: Verify it compiles**

Run: `cd backend && npx tsc --noEmit`
Expected: no output, exit code 0.

- [ ] **Step 5: Commit**

```bash
git add backend/src/models
git commit -m "feat(backend): add User, TeacherPosition, Teacher Mongoose models"
```

---

### Task 3: `generateUniqueTeacherCode` util (TDD)

**Files:**
- Create: `backend/src/utils/generateUniqueTeacherCode.ts`
- Test: `backend/tests/generateUniqueTeacherCode.test.ts`

**Interfaces:**
- Consumes: `Teacher` model from `backend/src/models/Teacher.ts` (Task 2) — calls `Teacher.exists({ code })`.
- Produces: `generateUniqueTeacherCode(maxAttempts = 5): Promise<string>` — a 10-digit numeric string not already used by any `Teacher`. Throws `Error('Could not generate a unique teacher code after N attempts')` if every attempt collides. Task 5's `createTeacher` controller calls this with no arguments.

- [ ] **Step 1: Write the failing test**

Create `backend/tests/generateUniqueTeacherCode.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npx vitest run tests/generateUniqueTeacherCode.test.ts`
Expected: FAIL — `generateUniqueTeacherCode` (and the module it's imported from) does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create `backend/src/utils/generateUniqueTeacherCode.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npx vitest run tests/generateUniqueTeacherCode.test.ts`
Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/utils backend/tests
git commit -m "feat(backend): add generateUniqueTeacherCode with retry-on-collision"
```

---

### Task 4: Teacher Position API (`GET /teacher-positions`, `POST /teacher-positions`)

**Files:**
- Create: `backend/src/controllers/teacherPositions.controller.ts`
- Create: `backend/src/routes/teacherPositions.routes.ts`
- Modify: `backend/src/app.ts` — mount the router

**Interfaces:**
- Consumes: `TeacherPosition` model (Task 2).
- Produces: `GET /teacher-positions` → `{ data: ITeacherPosition[] }`. `POST /teacher-positions` → `201 { data: ITeacherPosition }`, `400` if `code`/`name`/`des` missing, `409` if `code` already exists. Task 8 (frontend) calls these two endpoints verbatim.

- [ ] **Step 1: Create `backend/src/controllers/teacherPositions.controller.ts`**

```ts
import { Request, Response, NextFunction } from 'express';
import { TeacherPosition } from '../models/TeacherPosition';

export async function listTeacherPositions(req: Request, res: Response, next: NextFunction) {
  try {
    const positions = await TeacherPosition.find({ isDeleted: false }).lean();
    res.json({ data: positions });
  } catch (err) {
    next(err);
  }
}

export async function createTeacherPosition(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, name, des, isActive } = req.body;
    if (!code || !name || !des) {
      res.status(400).json({ message: 'code, name, des are required' });
      return;
    }

    const existing = await TeacherPosition.findOne({ code });
    if (existing) {
      res.status(409).json({ message: `code '${code}' already exists` });
      return;
    }

    const position = await TeacherPosition.create({
      code,
      name,
      des,
      isActive: isActive ?? true,
    });
    res.status(201).json({ data: position });
  } catch (err) {
    next(err);
  }
}
```

- [ ] **Step 2: Create `backend/src/routes/teacherPositions.routes.ts`**

```ts
import { Router } from 'express';
import { listTeacherPositions, createTeacherPosition } from '../controllers/teacherPositions.controller';

const router = Router();
router.get('/', listTeacherPositions);
router.post('/', createTeacherPosition);

export default router;
```

- [ ] **Step 3: Modify `backend/src/app.ts` to mount the router**

In `backend/src/app.ts`, add the import at the top:

```ts
import teacherPositionsRouter from './routes/teacherPositions.routes';
```

And add this line right after the `/health` route (before `app.use(errorHandler)`):

```ts
  app.use('/teacher-positions', teacherPositionsRouter);
```

- [ ] **Step 4: Verify manually**

Run: `cd backend && npm run dev`, then in another terminal:

```bash
curl http://localhost:4000/teacher-positions
```
Expected: `{"data":[]}`.

```bash
curl -X POST http://localhost:4000/teacher-positions \
  -H "Content-Type: application/json" \
  -d '{"code":"GVBM","name":"Giáo viên bộ môn","des":"Giáo viên bộ môn giảng dạy tại trường","isActive":true}'
```
Expected: `201` with the created position (has `_id`).

```bash
curl -X POST http://localhost:4000/teacher-positions \
  -H "Content-Type: application/json" \
  -d '{"code":"GVBM","name":"dup","des":"dup"}'
```
Expected: `409 {"message":"code 'GVBM' already exists"}`.

Stop the dev server before continuing.

- [ ] **Step 5: Commit**

```bash
git add backend/src/controllers/teacherPositions.controller.ts backend/src/routes/teacherPositions.routes.ts backend/src/app.ts
git commit -m "feat(backend): add teacher-positions list/create endpoints"
```

---

### Task 5: Teacher API (`GET /teachers`, `POST /teachers`)

**Files:**
- Create: `backend/src/controllers/teachers.controller.ts`
- Create: `backend/src/routes/teachers.routes.ts`
- Modify: `backend/src/app.ts` — mount the router

**Interfaces:**
- Consumes: `Teacher`, `User` models (Task 2), `generateUniqueTeacherCode` (Task 3).
- Produces: `GET /teachers?page=&limit=` → `{ data: TeacherListItem[], total, page, limit }` where `TeacherListItem = { code, name, email, phoneNumber, address, isActive, positions: string[], degrees }`. `POST /teachers` → `201 { data: populated Teacher }`, `400` missing fields, `409` duplicate email. Task 9 (frontend) calls these two endpoints verbatim, with `TeacherListItem`'s shape matching `frontend/src/types/teacher.ts` (Task 7).

- [ ] **Step 1: Create `backend/src/controllers/teachers.controller.ts`**

```ts
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
```

- [ ] **Step 2: Create `backend/src/routes/teachers.routes.ts`**

```ts
import { Router } from 'express';
import { listTeachers, createTeacher } from '../controllers/teachers.controller';

const router = Router();
router.get('/', listTeachers);
router.post('/', createTeacher);

export default router;
```

- [ ] **Step 3: Modify `backend/src/app.ts` to mount the router**

Add the import:

```ts
import teachersRouter from './routes/teachers.routes';
```

And add this line next to the `/teacher-positions` mount:

```ts
  app.use('/teachers', teachersRouter);
```

- [ ] **Step 4: Verify manually**

Run: `cd backend && npm run dev`, then (reuse the `GVBM` position id from Task 4's curl output as `<POSITION_ID>`):

```bash
curl "http://localhost:4000/teachers?page=1&limit=10"
```
Expected: `{"data":[],"total":0,"page":1,"limit":10}`.

```bash
curl -X POST http://localhost:4000/teachers \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Nguyen Van A","email":"a@school.edu.vn","phoneNumber":"0900000000",
    "address":"Ha Noi","identity":"001199000111","dob":"1990-01-01",
    "startDate":"2020-01-01","teacherPositions":["<POSITION_ID>"],
    "degrees":[{"type":"Cử nhân","school":"DHBK","major":"CNTT","year":2012,"isGraduated":true}]
  }'
```
Expected: `201` with a 10-digit `code` and populated `userId`/`teacherPositions`.

```bash
curl "http://localhost:4000/teachers?page=1&limit=10"
```
Expected: `data` array has 1 item shaped `{ code, name: "Nguyen Van A", email, phoneNumber, address, isActive: true, positions: ["Giáo viên bộ môn"], degrees: [...] }`, `total: 1`.

Re-run the same POST with the same email → expect `409`.

Stop the dev server before continuing.

- [ ] **Step 5: Commit**

```bash
git add backend/src/controllers/teachers.controller.ts backend/src/routes/teachers.routes.ts backend/src/app.ts
git commit -m "feat(backend): add teachers list/create endpoints"
```

---

### Task 6: Frontend scaffold — Vite + React + TS + Ant Design + routing

**Files:**
- Create: `frontend/` (via Vite scaffold command)
- Modify: `frontend/src/main.tsx`
- Modify: `frontend/src/App.tsx`
- Create: `frontend/.env`
- Delete: `frontend/src/App.css`, default Vite boilerplate assets (not needed)

**Interfaces:**
- Produces: routed shell with `/teachers` and `/teacher-positions` paths and an Ant Design `Layout` header. Tasks 8–9 add the page components these routes render.

- [ ] **Step 1: Scaffold the Vite project**

Run from the project root (`D:\Final test`):

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install antd react-router-dom axios
```

- [ ] **Step 2: Remove unused boilerplate**

Delete `frontend/src/App.css` and clear out the default counter markup — it's replaced in Step 4.

- [ ] **Step 3: Create `frontend/.env`**

```
VITE_API_BASE_URL=http://localhost:4000
```

- [ ] **Step 4: Replace `frontend/src/App.tsx`**

```tsx
import { Layout, Menu } from 'antd';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import TeacherListPage from './pages/TeacherListPage';
import TeacherPositionListPage from './pages/TeacherPositionListPage';

const { Header, Content } = Layout;

export default function App() {
  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ color: '#fff', fontWeight: 'bold', marginRight: 32 }}>
          WEB FULLSTACK - FINAL TEST
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={[
            { key: '/teachers', label: <Link to="/teachers">Giáo viên</Link> },
            { key: '/teacher-positions', label: <Link to="/teacher-positions">Vị trí công tác</Link> },
          ]}
        />
      </Header>
      <Content style={{ padding: 24 }}>
        <Routes>
          <Route path="/" element={<TeacherListPage />} />
          <Route path="/teachers" element={<TeacherListPage />} />
          <Route path="/teacher-positions" element={<TeacherPositionListPage />} />
        </Routes>
      </Content>
    </Layout>
  );
}
```

Note: `App.tsx` references `./pages/TeacherListPage` and `./pages/TeacherPositionListPage`, which don't exist yet — that's expected, they're created in Tasks 8–9. The build will fail until then; this task's verification step below only checks that `npm run dev` starts (it will show a red error overlay for the missing imports, which is fine at this stage since it's fixed in Task 8).

- [ ] **Step 5: Update `frontend/src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'antd/dist/reset.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

- [ ] **Step 6: Commit**

```bash
git add frontend
git commit -m "feat(frontend): scaffold Vite + React + TS app with Ant Design and routing"
```

---

### Task 7: Frontend API client + types

**Files:**
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/api/teachers.ts`
- Create: `frontend/src/api/teacherPositions.ts`
- Create: `frontend/src/types/teacher.ts`
- Create: `frontend/src/types/teacherPosition.ts`

**Interfaces:**
- Consumes: backend endpoints from Tasks 4–5.
- Produces: `fetchTeachers(page, limit): Promise<TeacherListResponse>`, `createTeacher(payload: CreateTeacherPayload)`, `fetchTeacherPositions(): Promise<{ data: TeacherPosition[] }>`, `createTeacherPosition(payload: CreateTeacherPositionPayload)`. Tasks 8–9 import these directly.

- [ ] **Step 1: Create `frontend/src/api/client.ts`**

```ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000',
});
```

- [ ] **Step 2: Create `frontend/src/types/teacherPosition.ts`**

```ts
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
```

- [ ] **Step 3: Create `frontend/src/types/teacher.ts`**

```ts
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
```

- [ ] **Step 4: Create `frontend/src/api/teacherPositions.ts`**

```ts
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
```

- [ ] **Step 5: Create `frontend/src/api/teachers.ts`**

```ts
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
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/api frontend/src/types
git commit -m "feat(frontend): add typed API client for teachers and teacher-positions"
```

---

### Task 8: Teacher Position list page + create drawer

**Files:**
- Create: `frontend/src/pages/TeacherPositionListPage.tsx`
- Create: `frontend/src/components/PositionFormDrawer.tsx`

**Interfaces:**
- Consumes: `fetchTeacherPositions`, `createTeacherPosition` (Task 7); rendered by the `/teacher-positions` route in `App.tsx` (Task 6).
- Produces: `<PositionFormDrawer open, onClose, onCreated />` — reusable in this page only (no other consumer).

- [ ] **Step 1: Create `frontend/src/components/PositionFormDrawer.tsx`**

```tsx
import { useState } from 'react';
import { Drawer, Form, Input, Switch, Button, message } from 'antd';
import { createTeacherPosition } from '../api/teacherPositions';
import type { CreateTeacherPositionPayload } from '../types/teacherPosition';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function PositionFormDrawer({ open, onClose, onCreated }: Props) {
  const [form] = Form.useForm<CreateTeacherPositionPayload>();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: CreateTeacherPositionPayload) {
    setSubmitting(true);
    try {
      await createTeacherPosition({ ...values, isActive: values.isActive ?? true });
      message.success('Tạo vị trí công tác thành công');
      form.resetFields();
      onCreated();
      onClose();
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Drawer title="Vị trí công tác" open={open} onClose={onClose} width={420}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ isActive: true }}>
        <Form.Item name="code" label="Mã" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="des" label="Mô tả" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
          <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting}>
          Lưu
        </Button>
      </Form>
    </Drawer>
  );
}
```

- [ ] **Step 2: Create `frontend/src/pages/TeacherPositionListPage.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { Table, Button, Tag } from 'antd';
import { fetchTeacherPositions } from '../api/teacherPositions';
import type { TeacherPosition } from '../types/teacherPosition';
import PositionFormDrawer from '../components/PositionFormDrawer';

export default function TeacherPositionListPage() {
  const [positions, setPositions] = useState<TeacherPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetchTeacherPositions();
      setPositions(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" onClick={() => setDrawerOpen(true)}>
          + Tạo
        </Button>
      </div>
      <Table
        rowKey="_id"
        loading={loading}
        dataSource={positions}
        pagination={false}
        columns={[
          { title: 'Mã', dataIndex: 'code' },
          { title: 'Tên', dataIndex: 'name' },
          { title: 'Mô tả', dataIndex: 'des' },
          {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            render: (isActive: boolean) => (
              <Tag color={isActive ? 'green' : 'default'}>
                {isActive ? 'Hoạt động' : 'Ngừng'}
              </Tag>
            ),
          },
        ]}
      />
      <PositionFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={load}
      />
    </div>
  );
}
```

- [ ] **Step 3: Verify manually**

With the backend running (`cd backend && npm run dev`) and MongoDB up, start the frontend:

```bash
cd frontend && npm run dev
```

Open the printed local URL, navigate to "Vị trí công tác". Expected: table shows any positions created earlier via curl (e.g. `GVBM`). Click "+ Tạo", fill the form, submit → drawer closes, new row appears in the table. Submitting a duplicate `code` shows an error message from the 409 response.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/TeacherPositionListPage.tsx frontend/src/components/PositionFormDrawer.tsx
git commit -m "feat(frontend): add teacher-position list page and create drawer"
```

---

### Task 9: Teacher list page (paginated) + create drawer

**Files:**
- Create: `frontend/src/pages/TeacherListPage.tsx`
- Create: `frontend/src/components/TeacherFormDrawer.tsx`

**Interfaces:**
- Consumes: `fetchTeachers`, `createTeacher` (Task 7), `fetchTeacherPositions` (Task 7, to populate the position `Select`); rendered by the `/teachers` and `/` routes in `App.tsx` (Task 6).

- [ ] **Step 1: Create `frontend/src/components/TeacherFormDrawer.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { Drawer, Form, Input, DatePicker, Select, Button, message, Divider } from 'antd';
import dayjs from 'dayjs';
import { createTeacher } from '../api/teachers';
import { fetchTeacherPositions } from '../api/teacherPositions';
import type { TeacherPosition } from '../types/teacherPosition';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface FormValues {
  name: string;
  email: string;
  phoneNumber: string;
  identity: string;
  address: string;
  dob: dayjs.Dayjs;
  startDate: dayjs.Dayjs;
  teacherPositions: string[];
  degreeType: string;
  degreeSchool: string;
  degreeMajor: string;
  degreeYear: number;
}

export default function TeacherFormDrawer({ open, onClose, onCreated }: Props) {
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [positions, setPositions] = useState<TeacherPosition[]>([]);

  useEffect(() => {
    if (open) {
      fetchTeacherPositions().then((res) => setPositions(res.data));
    }
  }, [open]);

  async function handleSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      await createTeacher({
        name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber,
        identity: values.identity,
        address: values.address,
        dob: values.dob.toISOString(),
        startDate: values.startDate.toISOString(),
        teacherPositions: values.teacherPositions,
        degrees: [
          {
            type: values.degreeType,
            school: values.degreeSchool,
            major: values.degreeMajor,
            year: values.degreeYear,
            isGraduated: true,
          },
        ],
      });
      message.success('Tạo giáo viên thành công');
      form.resetFields();
      onCreated();
      onClose();
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Drawer title="Tạo thông tin giáo viên" open={open} onClose={onClose} width={480}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="name" label="Họ và tên" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <Input placeholder="VD: Nguyễn Văn A" />
        </Form.Item>
        <Form.Item name="dob" label="Ngày sinh" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
          <Input placeholder="example@school.edu.vn" />
        </Form.Item>
        <Form.Item name="identity" label="Số CCCD" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <Input />
        </Form.Item>

        <Divider>Thông tin công tác</Divider>
        <Form.Item name="teacherPositions" label="Vị trí công tác" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <Select
            mode="multiple"
            options={positions.map((p) => ({ label: p.name, value: p._id }))}
          />
        </Form.Item>
        <Form.Item name="startDate" label="Ngày bắt đầu công tác" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Divider>Học vị</Divider>
        <Form.Item name="degreeType" label="Bậc" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <Input placeholder="VD: Cử nhân, Thạc sĩ" />
        </Form.Item>
        <Form.Item name="degreeSchool" label="Trường" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="degreeMajor" label="Chuyên ngành" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="degreeYear" label="Năm tốt nghiệp" rules={[{ required: true, message: 'Bắt buộc' }]}>
          <Input type="number" />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={submitting}>
          Lưu
        </Button>
      </Form>
    </Drawer>
  );
}
```

- [ ] **Step 2: Install `dayjs`** (peer dependency Ant Design's `DatePicker` needs)

```bash
cd frontend && npm install dayjs
```

- [ ] **Step 3: Create `frontend/src/pages/TeacherListPage.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space } from 'antd';
import { fetchTeachers } from '../api/teachers';
import type { Teacher } from '../types/teacher';
import TeacherFormDrawer from '../components/TeacherFormDrawer';

export default function TeacherListPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function load(p = page, l = limit) {
    setLoading(true);
    try {
      const res = await fetchTeachers(p, l);
      setTeachers(res.data);
      setTotal(res.total);
      setPage(res.page);
      setLimit(res.limit);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" onClick={() => setDrawerOpen(true)}>
          + Tạo mới
        </Button>
      </div>
      <Table
        rowKey="code"
        loading={loading}
        dataSource={teachers}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          onChange: (p, l) => load(p, l),
        }}
        columns={[
          { title: 'Mã', dataIndex: 'code' },
          {
            title: 'Giáo viên',
            render: (_: unknown, t: Teacher) => (
              <Space direction="vertical" size={0}>
                <span>{t.name}</span>
                <span style={{ color: '#888' }}>{t.email}</span>
              </Space>
            ),
          },
          {
            title: 'Học vấn (cao nhất)',
            render: (_: unknown, t: Teacher) =>
              t.degrees[0] ? `${t.degrees[0].type} - ${t.degrees[0].school}` : '-',
          },
          {
            title: 'Vị trí công tác',
            render: (_: unknown, t: Teacher) => t.positions.join(', '),
          },
          { title: 'Địa chỉ', dataIndex: 'address' },
          {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            render: (isActive: boolean) => (
              <Tag color={isActive ? 'green' : 'default'}>
                {isActive ? 'Đang công tác' : 'Ngừng công tác'}
              </Tag>
            ),
          },
        ]}
      />
      <TeacherFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={() => load(1, limit)}
      />
    </div>
  );
}
```

- [ ] **Step 4: Verify manually — full end-to-end path**

With backend + MongoDB running, `cd frontend && npm run dev`, open the app on "Giáo viên":
1. Confirm the teacher created via curl in Task 5 shows up with correct code/name/email/position/status.
2. Click "+ Tạo mới", fill all fields (pick the existing position from the multi-select), submit.
3. Expected: drawer closes, table refreshes to page 1 and shows the new teacher.
4. Create one more teacher so there are 2+ rows; confirm the Ant Design pagination control appears and changing page re-fetches (`GET /teachers?page=2&limit=10` in Network tab).
5. Try submitting with a duplicate email → error message from the 409 response is shown, drawer stays open.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/TeacherListPage.tsx frontend/src/components/TeacherFormDrawer.tsx frontend/package.json frontend/package-lock.json
git commit -m "feat(frontend): add teacher list page with pagination and create drawer"
```

---

## Self-Review Notes

- **Spec coverage:** API 1.1–1.5 → Tasks 4–5. FE 2.1–2.4 → Tasks 8–9. Data model → Task 2. Unique `code` generation → Task 3. Error handling (400/409/500) → Tasks 4–5 controllers + Task 1 `errorHandler`. Testing section (single unit test) → Task 3. Mock data import is explicitly the user's own manual step per spec — no task needed.
- **Type consistency:** `TeacherListItem` shape returned by `listTeachers` (Task 5) matches `Teacher` type in `frontend/src/types/teacher.ts` (Task 7) — both use `{ code, name, email, phoneNumber, address, isActive, positions, degrees }`. `CreateTeacherPayload` fields match what `createTeacher` controller destructures from `req.body`.
- **No placeholders:** every step has runnable code or an exact shell command; no "add validation here" style steps remain.
