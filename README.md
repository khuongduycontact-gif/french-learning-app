# Français avec Céline  — Nền tảng học tiếng Pháp trực tuyến

Dự án Next.js (App Router) viết bằng TypeScript (.tsx), gồm 2 phía:

- **Client (học viên):** xem trang chủ, tìm kiếm/lọc khoá học, xem chi tiết, đăng nhập Google, đăng ký khoá học, xem "Khoá học của tôi".
- **Admin (quản trị):** thêm / sửa / xoá khoá học, xem danh sách kèm số lượt đăng ký, xuất bản hoặc ẩn (bản nháp).

## Công nghệ sử dụng

| Thành phần   | Lựa chọn                          |
| ------------ | ---------------------------------- |
| Framework    | Next.js 14 (App Router) + TypeScript |
| Giao diện    | Tailwind CSS                       |
| Xác thực     | NextAuth.js (Google Provider)      |
| Cơ sở dữ liệu| Prisma ORM + MySQL                 |
| Lưu trữ ảnh/video | Cloudinary (upload qua API server, không giới hạn bởi trình duyệt) |

## Cấu trúc thư mục chính

```
src/
  app/
    page.tsx                  → Trang chủ
    courses/page.tsx          → Danh sách + tìm kiếm khoá học
    courses/[id]/page.tsx     → Chi tiết khoá học + nút đăng ký
    tai-khoan/page.tsx        → Khoá học đã đăng ký của học viên
    dang-nhap/page.tsx        → Trang đăng nhập Google
    admin/                    → Toàn bộ khu vực quản trị (được bảo vệ, chỉ ADMIN)
      page.tsx                 → Tổng quan (thống kê)
      courses/page.tsx         → Danh sách khoá học (sửa/xoá)
      courses/new/page.tsx     → Thêm khoá học
      courses/[id]/edit/page.tsx → Sửa khoá học
    api/
      auth/[...nextauth]/route.ts → NextAuth handler
      courses/route.ts             → GET (tìm kiếm/lọc), POST (tạo - admin)
      courses/[id]/route.ts        → GET, PUT (sửa - admin), DELETE (xoá - admin)
      enrollments/route.ts         → GET (khoá học đã đăng ký), POST (đăng ký)
      upload/route.ts              → POST (admin) - nhận file, đẩy lên Cloudinary, trả về URL
  components/                 → Navbar, AuthButton, CourseCard, SearchBar, CourseForm, EnrollButton, MediaUploader
  lib/                        → auth.ts (cấu hình NextAuth), prisma.ts, slug.ts, cloudinary.ts
prisma/
  schema.prisma               → User, Account, Session, Course (có imageUrl/videoUrl từ Cloudinary), Enrollment
  seed.ts                     → Dữ liệu mẫu (4 khoá học A1-B2)
```

## Cài đặt

### 1. Cài dependencies

```bash
npm install
```

### 2. Tạo file `.env` từ mẫu

```bash
cp .env.example .env
```

Điền các biến:

- `DATABASE_URL`: chuỗi kết nối MySQL, dạng `mysql://user:password@host:3306/ten_database`.
  - Local: cài MySQL rồi tạo database trống, ví dụ `CREATE DATABASE bonjour_francais;`
  - Hoặc dùng dịch vụ MySQL miễn phí/dễ triển khai: [PlanetScale](https://planetscale.com), [Railway](https://railway.app), [Aiven](https://aiven.io)...
- `NEXTAUTH_SECRET`: chuỗi bí mật bất kỳ, có thể tạo bằng `openssl rand -base64 32`.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: tạo tại [Google Cloud Console](https://console.cloud.google.com/apis/credentials) →
  - Loại: **OAuth client ID** → **Web application**
  - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
- `ADMIN_EMAILS`: danh sách email (cách nhau bởi dấu phẩy) sẽ tự động được cấp quyền **ADMIN** ngay khi đăng nhập lần đầu bằng Google. Ví dụ: `ban@gmail.com,dongnghiep@gmail.com`.
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`: lấy tại [Cloudinary Console](https://console.cloudinary.com) → trang **Dashboard** ngay sau khi đăng ký tài khoản miễn phí. Ba giá trị này hiển thị sẵn, chỉ cần copy.

### 3. Khởi tạo cơ sở dữ liệu

```bash
npm run db:push     # tạo bảng trong MySQL theo schema.prisma
npm run db:seed      # (tuỳ chọn) thêm 4 khoá học mẫu
```

### 4. Chạy dự án

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

Đăng nhập bằng một email có trong `ADMIN_EMAILS` để vào được mục **Quản trị** ở menu trên cùng (`/admin`).

## Phân quyền

- Người dùng thường (`USER`): xem khoá học đã xuất bản, đăng ký khoá học, xem khoá học của mình.
- Quản trị (`ADMIN`): thấy cả khoá học bản nháp, có toàn quyền thêm/sửa/xoá khoá học tại `/admin`.
- Việc gán quyền ADMIN dựa vào biến môi trường `ADMIN_EMAILS` — khi người dùng đăng nhập, nếu email khớp danh sách này, hệ thống tự động cập nhật `role = ADMIN` trong cơ sở dữ liệu. Muốn cấp quyền thủ công cho người khác, có thể sửa trực tiếp cột `role` trong bảng `User` (dùng `npm run db:studio` để mở giao diện quản lý dữ liệu Prisma Studio).

## Tải ảnh / video lên Cloudinary

Trong form thêm/sửa khoá học ở khu vực quản trị, admin chọn tệp ảnh bìa hoặc video giới thiệu từ máy tính. Luồng xử lý:

1. Trình duyệt gửi file tới `POST /api/upload` (route nội bộ của chính app, có kiểm tra quyền ADMIN).
2. Server dùng Cloudinary Node SDK để đẩy file lên thư mục `bonjour-francais/courses` trên Cloudinary.
3. Cloudinary trả về `secure_url` — URL này được lưu vào cột `imageUrl`/`videoUrl` của bảng `Course` trong MySQL.

Giới hạn mặc định đã cấu hình sẵn trong `src/app/api/upload/route.ts`: ảnh tối đa 10MB, video tối đa 200MB (có thể chỉnh trực tiếp trong file này).

**Lưu ý khi deploy lên nền tảng serverless (Vercel...):** một số nền tảng giới hạn kích thước body của request tới function (thường quanh 4.5MB trên gói miễn phí). Nếu cần tải video lớn, cân nhắc:
- Nâng gói dịch vụ hosting để tăng giới hạn, hoặc
- Tự host bằng `next start` trên VPS/Node server riêng (không bị giới hạn này), hoặc
- Chuyển sang tải trực tiếp từ trình duyệt lên Cloudinary bằng **unsigned upload preset** (bỏ qua route `/api/upload`) — có thể hỏi mình nếu muốn triển khai phương án này.

## Triển khai (deploy)

- Cập nhật `NEXTAUTH_URL` và redirect URI trên Google Cloud Console thành domain thật.
- Đảm bảo `DATABASE_URL` trỏ tới MySQL instance có thể truy cập được từ server deploy (whitelist IP nếu nhà cung cấp yêu cầu).
- Có thể deploy trên Vercel, Railway, hoặc VPS tự quản lý.

## Có thể mở rộng thêm

- Trang bài học / bài tập bên trong từng khoá học.
- Thanh toán trực tuyến (VNPay, Momo, Stripe...).
- Phân trang cho danh sách khoá học khi dữ liệu lớn.
- Gửi email xác nhận sau khi đăng ký khoá học.
