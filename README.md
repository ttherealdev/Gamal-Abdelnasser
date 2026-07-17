# 🏫 Gamal Abdel Nasser Boys School (Franco) — Management System

<p>
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/tRPC-v11-2596BE?style=for-the-badge&logo=trpc&logoColor=white" alt="tRPC v11" />
  <img src="https://img.shields.io/badge/Prisma-7.8.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma 7.8.0" />
  <img src="https://img.shields.io/badge/better--auth-1.6-6E56CF?style=for-the-badge&logo=lock&logoColor=white" alt="better-auth" />
  <img src="https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white" alt="Bun" />
</p>

<p>
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Dokploy-ready-4F46E5?style=flat-square" alt="Dokploy ready" />
  <img src="https://img.shields.io/badge/RTL-Arabic%20UI-16A34A?style=flat-square" alt="RTL Arabic UI" />
  <img src="https://img.shields.io/badge/license-private-lightgrey?style=flat-square" alt="Private" />
</p>

A full-stack school management platform for students, teachers, parents, grades, and reports — built for a real secondary school, with role-based access baked in from the database up to the UI.

---

## ✨ Stack

| Layer      | Choice                                             |
| ---------- | --------------------------------------------------- |
| 🧩 Framework | Next.js 16 (App Router, Server Components)         |
| 🔌 API       | tRPC v11 — typed end-to-end, zero REST boilerplate |
| 🗄️ Database  | PostgreSQL + Prisma 7.8.0 (`@prisma/adapter-pg`)    |
| 🔐 Auth      | better-auth, with the built-in admin plugin         |
| 📦 Runtime   | Bun                                                 |
| 🐳 Deploy    | Docker Compose → Dokploy                            |

---

## 🚀 Run locally

```bash
bun install
cp .env.example .env   # fill in the values
docker compose up -d postgres   # or any local Postgres
bunx prisma migrate dev
bun run scripts/db-seed.ts
bun dev
```

🔑 The first developer account is created automatically by the seed script:

```
developer@school.local / change-me-now-12345
```

> ⚠️ **Change this password immediately after the first login.**

---

## 🛡️ Security model

> **Golden rule:** `RoleGate` only hides UI elements — real protection always lives in the tRPC procedure (`adminProcedure` / `staffProcedure` / ...) and in `requireRole` at the layout level. Never build security logic that relies on the client alone.

---

## ☁️ Deploying to Dokploy

1. 📤 Push the project to a Git repo.
2. 🐙 In Dokploy: **Create Application → Docker Compose**, and link it to the repo.
3. 🔧 Set these environment variables from the Dokploy application settings (not in code):
   - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
   - `BETTER_AUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL` (your real domain, e.g. `https://school.example.com`)
4. 🏗️ Dokploy builds the image from the `Dockerfile` (3 stages: `builder`, `migrator`, `runner`) and runs `docker-compose.yml` in this order:
   `postgres` → `migrate` (a one-shot service that applies migrations then exits) → `app` (waits for `migrate` to succeed before starting).
5. 🌱 To run the seed for the first time (after the first successful migration):
   ```bash
   docker compose run --rm migrate bun run scripts/db-seed.ts
   ```
   (or from the Dokploy Terminal tab, pick the service named `migrate`).
6. 🔒 Enable SSL from Dokploy (automatic Let's Encrypt) and connect your domain.

---

## ⚡ Performance at scale

Put PostgreSQL behind **PgBouncer** in transaction-pooling mode if concurrent connections start approaching Postgres's default limit (100). The current pooling setup in `server/db.ts` already uses the `@prisma/adapter-pg` driver adapter — the recommended choice for Prisma 7 in this scenario.