# Teacher Management MERN — Design Spec

## Bối cảnh

Bài test "WEB FULLSTACK - FINAL TEST" (MindX): xây dựng hệ thống quản lý
giáo viên đơn giản. Đề bài đã cho sẵn sơ đồ CSDL, mock UI tham khảo, và
danh sách API bắt buộc. Data mẫu để import vào MongoDB đã có sẵn
(https://github.com/khoatranpc/WEB/tree/main/mock-data-fullstack).

## Phạm vi

Trong phạm vi (theo đúng đề, 7đ API + 3đ FE):
- API `GET /teachers` (list + phân trang)
- API `POST /teachers` (tạo giáo viên, sinh `code` unique, email unique)
- API `GET /teacher-positions` (list)
- API `POST /teacher-positions` (tạo vị trí công tác, `code` unique)
- FE: trang danh sách giáo viên (bảng + phân trang), drawer tạo giáo viên
- FE: trang danh sách vị trí công tác (bảng), drawer tạo vị trí công tác

Ngoài phạm vi (không làm): đăng nhập/phân quyền, sửa/xóa, upload ảnh thật
(dùng placeholder), test suite đầy đủ.

## Stack

- Backend: Node.js + Express + TypeScript + Mongoose, MongoDB local
  (`mongodb://localhost:27017/mindx-teacher`)
- Frontend: React + Vite + TypeScript + Ant Design (Table, Pagination,
  Drawer, Form), axios để gọi API
- Cấu trúc thư mục:
  ```
  backend/   (Express app, models/routes/controllers)
  frontend/  (Vite React app)
  ```

## Data model (Mongoose, khớp sơ đồ đề bài)

**User**
```
name: string
email: string (unique)
phoneNumber: string
address: string
identity: string
dob: Date
isDeleted: boolean (default false)
role: 'STUDENT' | 'TEACHER' | 'ADMIN'
```

**TeacherPosition**
```
name: string
code: string (unique)
des: string
isActive: boolean
isDeleted: boolean (default false)
```

**Teacher**
```
userId: ObjectId ref User
code: string (10 chữ số random, unique)
isActive: boolean
isDeleted: boolean (default false)
startDate: Date
endDate: Date
teacherPositions: [ObjectId ref TeacherPosition]
degrees: [{ type: string, school: string, major: string, year: number, isGraduated: boolean }]
```

## API

### `GET /teachers?page=1&limit=10`
- Populate `userId` (name, email, phoneNumber, address) và
  `teacherPositions` (name).
- Response:
  ```json
  {
    "data": [{ "code", "name", "email", "phoneNumber", "isActive",
               "address", "positions": ["..."], "degrees": [...] }],
    "total": 25, "page": 1, "limit": 10
  }
  ```
- `page`/`limit` mặc định 1/10 nếu không truyền.

### `POST /teachers`
- Body: thông tin cá nhân (name, dob, phoneNumber, email, identity,
  address) + thông tin công tác (teacherPositions, startDate, endDate)
  + degrees[].
- Xử lý: tạo `User` trước (role=TEACHER), sinh `code` 10 số random,
  kiểm tra trùng trong `Teacher` collection và random lại tối đa 5 lần
  nếu đụng (ném lỗi 500 nếu vẫn trùng sau 5 lần — xác suất gần như 0
  với 10^10 tổ hợp) — đây là phần logic có retry loop, sẽ có 1 test riêng.
- Validate: email chưa tồn tại trong `User` → 409 nếu trùng.
- Trả về Teacher vừa tạo (populate đầy đủ).

### `GET /teacher-positions`
- Trả toàn bộ danh sách (không phân trang, vì đề không yêu cầu).

### `POST /teacher-positions`
- Body: code, name, des, isActive.
- Validate: `code` chưa tồn tại → 409 nếu trùng.

## Error handling
- 400: thiếu field bắt buộc / sai định dạng (dùng middleware validate
  đơn giản, không cần thư viện validation ngoài).
- 409: trùng email (POST /teachers) hoặc trùng code (POST /teacher-positions).
- 500: lỗi server (bắt qua middleware error handler chung của Express).

## Frontend

- `react-router-dom` với 2 route: `/teachers`, `/teacher-positions`.
- `TeacherListPage`: Ant Design `Table` (server-side pagination qua
  `GET /teachers`), nút "Tạo mới" mở `Drawer` render `TeacherFormDrawer`.
- `TeacherPositionListPage`: `Table` đơn giản (không phân trang, khớp
  đề), nút mở `Drawer` render `PositionFormDrawer`.
- Gọi API qua 1 module `frontend/src/api/client.ts` (axios instance,
  base URL từ `.env`).

## Testing
- 1 unit test cho hàm `generateUniqueTeacherCode` (logic sinh code +
  retry khi trùng) — dùng Jest, mock query trùng để xác nhận retry
  logic không sinh code trùng và dừng sau N lần thử.
- Không viết test cho các route CRUD đơn giản còn lại (YAGNI).

## Data mẫu
Học viên (người dùng) tự import mock data từ repo tham khảo vào
MongoDB qua `mongoimport`/Compass sau khi backend định nghĩa xong
schema — không cần viết seed script riêng trừ khi được yêu cầu thêm.
