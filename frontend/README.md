# Đức Chính Jewelry Frontend

Ứng dụng Next.js cho cửa hàng trang sức Đức Chính Jewelry. Sản phẩm, tồn kho, đơn hàng, tài khoản, liên hệ và đăng ký newsletter đều sử dụng Laravel API qua các route proxy cùng origin trong `app/api`.

## Chạy cục bộ

```bash
npm install
npm run dev
```

Frontend chạy tại `http://localhost:3002`; Laravel API mặc định tại `http://127.0.0.1:8002/api`.

Các biến môi trường chính:

```env
LARAVEL_API_URL=http://127.0.0.1:8002/api
NEXT_PUBLIC_API_URL=http://127.0.0.1:8002/api
NEXT_PUBLIC_SITE_URL=http://localhost:3002
```

## Kiểm tra chất lượng

```bash
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```
