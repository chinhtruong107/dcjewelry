# 💎 Duc Chinh Jewelry

A premium jewelry e-commerce site: Laravel REST API + Next.js storefront/admin, containerized with Docker, with automated build & deploy via GitHub Actions + Ansible.

**Demo:** https://dcjewelry.duckdns.org

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture & Deployment](#architecture--deployment)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Quality Checks](#quality-checks)
- [Admin Account](#admin-account)
- [Main API](#main-api)
- [Security](#security)

## Features

- Product catalog, search, cart, wishlist
- User accounts, reviews on purchased products
- COD or VNPay (sandbox) checkout
- Admin panel: order management, dashboard
- AI chatbot assistant (Gemini)
- Contact form and newsletter signup via Resend

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Radix UI, Framer Motion |
| Backend | Laravel 10, PHP 8.2, Sanctum, MySQL |
| Integrations | VNPay sandbox, Resend, Gemini |
| Operations | Docker Compose, GitHub Actions, Ansible |

## Architecture & Deployment

```
Push to main
      │
      ▼
GitHub Actions: test Backend (Pint + PHPUnit) & Frontend (lint + build)
      │  (both pass)
      ▼
SSH into Control Node (Ansible)
      │
      ▼
Control Node: pull latest playbook → run deploy script
      │
      ▼
Production updated + result notified via Telegram
```

CI and deployment run automatically on push/merge to `main`. If the test stage fails, deployment is skipped and production keeps running the current version.

## Getting Started

### With Docker (recommended)

```bash
docker compose up -d --build
docker compose logs -f backend frontend
```

The backend automatically runs migrations and seeds administrative division data on container startup. Only set `RUN_SEEDERS=true` when you need to reload all demo data.

| Component | Address |
| --- | --- |
| Storefront & Admin | http://localhost:3002 |
| Admin page | http://localhost:3002/admin |
| Laravel API | http://localhost:8002/api |

### Manual Setup

Open two separate terminals.

```bash
cd backend
composer install
php artisan key:generate
php artisan migrate
php artisan serve --host=0.0.0.0 --port=8002
```

```bash
cd frontend
npm install
npm run dev
```

## Environment Configuration

Copy `backend/.env.example` to `backend/.env`, then set at minimum:

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

The frontend calls the API from the same origin `/api`; the Next.js route handler forwards to Laravel via:

```env
NEXT_PUBLIC_API_URL=/api
LARAVEL_API_URL=http://127.0.0.1:8002/api
```

## Quality Checks

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

```bash
cd backend
php artisan test
php vendor/bin/pint --test
```

## Admin Account

Create an admin user via the `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` environment variables, then run:

```bash
php artisan db:seed --class=AdminUserSeeder
```

Do not use the sample password in a real environment.

## Main API

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/register` | Register |
| POST | `/api/login` | Log in |
| POST | `/api/forgot-password` | Password recovery |
| GET | `/api/products` | List products |
| GET | `/api/products/{id}` | Product detail |
| POST | `/api/orders` | Create an order |
| GET | `/api/orders` | Orders for the account |
| PATCH | `/api/orders/{id}/cancel` | Cancel an eligible order |
| GET/POST/DELETE | `/api/favorites` | Manage wishlist |
| POST | `/api/reviews` | Review a purchased product |
| POST | `/api/contact-messages` | Submit a contact request |
| POST | `/api/newsletter-subscriptions` | Subscribe to the newsletter |
| GET | `/api/admin/dashboard` | Admin dashboard data |

## Security

- Never commit `.env`, logs, sessions, cache, `.next`, or `tsconfig.tsbuildinfo`.
- Use your deployment system's secrets for database, Resend, Gemini, and VNPay credentials.
- Disable `APP_DEBUG` and use `APP_ENV=production` in real deployments.
- Rotate any key immediately if it was ever exposed in Git history.
