# Teacher Management — MERN

Ứng dụng quản lý giáo viên (MindX Web Fullstack Final Test): Express + TypeScript + MongoDB ở backend, React + Vite + TypeScript + Ant Design ở frontend.

## Cấu trúc

```
backend/   API: Express, Mongoose, MongoDB local
frontend/  UI: Vite, React, Ant Design, react-router-dom, axios
```

## Yêu cầu

- Node.js 18+
- MongoDB chạy local ở `mongodb://localhost:27017`

## Chạy backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Server chạy tại `http://localhost:4000`. Kiểm tra: `curl http://localhost:4000/health`.

Chạy test:

```bash
npm test
```

### Import dữ liệu mẫu

3 file `school.users.json`, `school.teacherpositions.json`, `school.teachers.json` ở thư mục gốc là data mẫu của đề bài. Import vào MongoDB local:

```bash
cd backend
npm run import:mock-data
```

## Chạy frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Mở `http://localhost:5173` (backend phải đang chạy ở `:4000`).

## API

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/teachers?page=&limit=` | Danh sách giáo viên (phân trang), kèm thông tin cá nhân, vị trí công tác, học vấn |
| POST | `/teachers` | Tạo giáo viên mới (sinh `code` 10 số ngẫu nhiên, unique; `email` unique) |
| GET | `/teacher-positions` | Danh sách vị trí công tác |
| POST | `/teacher-positions` | Tạo vị trí công tác mới (`code` unique) |

Ngoài phạm vi: không có đăng nhập/phân quyền, không có API sửa/xóa.

## Ghi chú

- `Teacher.teacherPositionsId` là tên field đúng theo schema đề bài và data mẫu.
- Trạng thái `isActive`/`isDeleted` dùng để lọc; bản ghi `isDeleted: true` sẽ không hiển thị.
