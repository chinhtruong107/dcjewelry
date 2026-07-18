# Đức Chính Jewelry

Website thương mại điện tử trang sức cao cấp gồm Laravel REST API, Next.js storefront/admin và Docker Compose. Dự án hỗ trợ danh mục sản phẩm, tìm kiếm, giỏ hàng, yêu thích, tài khoản, đánh giá, checkout COD/VNPay, quản trị đơn hàng và chatbot tư vấn.

## Công nghệ

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS, Radix UI, Framer Motion
- Backend: Laravel 10, PHP 8.2, Sanctum, MySQL
- Tích hợp: VNPay sandbox, Resend, Gemini
- Vận hành: Docker Compose, GitHub Actions, Ansible

## Cổng mặc định

| Thành phần | Địa chỉ |
| --- | --- |
| Storefront và admin | http://localhost:3002 |
| Laravel API | http://localhost:8002/api |
| Trang admin | http://localhost:3002/admin |

## Chạy bằng Docker

```powershell
cd D:\trangsuc
docker compose up -d --build
docker compose logs -f backend frontend
```

Backend tự chạy migration và seed dữ liệu địa giới hành chính khi container khởi động. Chỉ đặt `RUN_SEEDERS=true` khi cần nạp lại toàn bộ dữ liệu demo.

## Chạy thủ công

Mở hai terminal riêng.

```powershell
cd D:\trangsuc\backend
composer install
php artisan key:generate
php artisan migrate
php artisan serve --host=0.0.0.0 --port=8002
```

```powershell
cd D:\trangsuc\frontend
npm install
npm run dev
```

## Cấu hình môi trường

Sao chép `backend/.env.example` thành `backend/.env`, sau đó cấu hình tối thiểu:

```env
APP_NAME="Duc Chinh Jewelry"
APP_URL=http://localhost:8002
FRONTEND_URL=http://localhost:3002

DB_CONNECTION=mysql
DB_HOST=your-database-host
DB_PORT=3306
DB_DATABASE=jewelry
DB_USERNAME=your-database-user
DB_PASSWORD=your-database-password

RESEND_API_KEY=
RESEND_FROM_ADDRESS="Duc Chinh Jewelry <onboarding@resend.dev>"
CONTACT_NOTIFICATION_EMAIL=hello@ducchinhjewelry.vn

VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_RETURN_URL=http://localhost:8002/api/payments/vnpay/return
```

Frontend dùng API cùng origin `/api`; route handler Next.js gọi Laravel qua:

```env
NEXT_PUBLIC_API_URL=/api
LARAVEL_API_URL=http://127.0.0.1:8002/api
```

## Contact và newsletter

- `POST /api/contact-messages`: lưu yêu cầu vào `contact_messages` và gửi thông báo Resend khi có `CONTACT_NOTIFICATION_EMAIL`.
- `POST /api/newsletter-subscriptions`: lưu đăng ký nhận tin theo email, không tạo bản ghi trùng.
- Dữ liệu vẫn được lưu nếu Resend tạm thời không gửi được.

Sau khi cập nhật code, chạy migration:

```powershell
cd D:\trangsuc\backend
php artisan migrate
```

## Kiểm tra chất lượng

```powershell
cd D:\trangsuc\frontend
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

```powershell
cd D:\trangsuc\backend
php artisan test
php vendor/bin/pint --test
```

## Tài khoản quản trị

Tạo quản trị viên qua biến môi trường `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, rồi chạy:

```powershell
php artisan db:seed --class=AdminUserSeeder
```

Không dùng mật khẩu mẫu trên môi trường thật.

## API chính

| Method | Endpoint | Chức năng |
| --- | --- | --- |
| POST | `/api/register` | Đăng ký |
| POST | `/api/login` | Đăng nhập |
| POST | `/api/forgot-password` | Khôi phục mật khẩu |
| GET | `/api/products` | Danh sách sản phẩm |
| GET | `/api/products/{id}` | Chi tiết sản phẩm |
| POST | `/api/orders` | Tạo đơn hàng |
| GET | `/api/orders` | Đơn hàng của tài khoản |
| PATCH | `/api/orders/{id}/cancel` | Hủy đơn hợp lệ |
| GET/POST/DELETE | `/api/favorites` | Quản lý yêu thích |
| POST | `/api/reviews` | Đánh giá sản phẩm đã mua |
| POST | `/api/contact-messages` | Gửi yêu cầu liên hệ |
| POST | `/api/newsletter-subscriptions` | Đăng ký nhận tin |
| GET | `/api/admin/dashboard` | Dữ liệu dashboard quản trị |

## Lưu ý bảo mật

- Không commit `.env`, log, session, cache, `.next` hoặc `tsconfig.tsbuildinfo`.
- Dùng secrets của hệ thống deploy cho database, Resend, Gemini và VNPay.
- Tắt `APP_DEBUG` và dùng `APP_ENV=production` khi triển khai thật.
- Xoay khóa ngay nếu khóa từng xuất hiện trong lịch sử Git.
