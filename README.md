# Apex Billing — Simple Billing & Invoicing Web Application

A full-stack, serverless billing and invoicing web application built with **Next.js 14+ App Router**, **Prisma ORM**, and **Neon Postgres** with the official Neon serverless driver adapter.

---

## Architecture & Tech Stack

- **Framework**: Next.js 14 App Router (Single deployable app — frontend + serverless API routes under `app/api/*/route.ts`).
- **Database**: [Neon Postgres](https://neon.tech) (Serverless Postgres).
- **ORM**: Prisma with `@prisma/adapter-neon`, `@neondatabase/serverless`, and `ws`.
- **Authentication**: JWT Cookie session auth with `jose` and `bcryptjs`.
- **PDF Generation**: Native client-side PDF export via `jspdf` & `html2canvas`.
- **Deployment**: Vercel Serverless.

---

## Prisma + Neon Driver Adapter Setup Confirmation

This project implements the required serverless driver adapter wiring:

1. **`schema.prisma`**:
   ```prisma
   generator client {
     provider        = "prisma-client-js"
     previewFeatures = ["driverAdapters"]
   }

   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **`lib/prisma.ts`**:
   Instantiates a single global `PrismaClient` using `@prisma/adapter-neon` with `Pool` and `ws` WebSocket constructor to prevent connection pool exhaustion on Vercel serverless functions:
   ```ts
   import { PrismaClient } from '@prisma/client';
   import { Pool, neonConfig } from '@neondatabase/serverless';
   import { PrismaNeon } from '@prisma/adapter-neon';
   import ws from 'ws';

   neonConfig.webSocketConstructor = ws;
   ```

---

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your database URL (either a local Postgres instance or a free Neon Postgres project database string):
```env
DATABASE_URL="postgresql://user:password@ep-sample-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="antigravity-billing-secret-key-change-in-prod"
```

### 3. Initialize Database Schema & Seed Admin User
Run `prisma db push` to push tables to your database, followed by `prisma db seed`:
```bash
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

**Default Login Credentials:**
- **Email**: `admin@billing.com`
- **Password**: `admin123`

---

## Deploying to Vercel with Neon Integration

Follow these exact steps for deployment to Vercel:

### Step 1: Push Code to GitHub / Git Repository
Push your project repository to GitHub, GitLab, or Bitbucket.

### Step 2: Import Project in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) -> **Add New** -> **Project**.
2. Select your repository.

### Step 3: Connect Vercel's Neon Integration
1. In Vercel, navigate to the **Integrations** tab or select **Neon Integration** during project import.
2. Link your Neon project or create a new database.
3. Vercel automatically populates the `DATABASE_URL` environment variable for your deployment.

### Step 4: Configure Build Script
Ensure your package.json build script generates Prisma client before Next.js build:
```json
"scripts": {
  "build": "prisma generate && next build"
}
```

### Step 5: Push Database Schema & Seed Data to Neon
Run this command from your local terminal pointing to your Neon database URL (or via Vercel CLI):
```bash
npx prisma db push
npm run prisma:seed
```

### Step 6: Deploy!
Click **Deploy** on Vercel. Your serverless billing application is live!

---

## Core Features Summary

1. **Dashboard Analytics**: Real-time stats for Total Outstanding balances, Monthly Revenue Collected, Active Customers count, and status breakdown.
2. **Customer CRUD**: Add, edit, list, search, and delete customer records with billing addresses and contact info.
3. **Invoice Management**: Create invoices with dynamic line items (quantity, unit price, subtotal, tax rate %, and total calculation), change status (`DRAFT`, `SENT`, `PAID`, `OVERDUE`).
4. **Payments Processing**: Record partial or full payments against invoices. Recording a full payment automatically transitions the invoice status to `PAID`.
5. **PDF Export**: Download formatted PDF invoices with 1 click.
