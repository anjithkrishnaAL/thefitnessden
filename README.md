# TheFitnessDen

**Train. Track. Transform.**

TheFitnessDen is a full-stack gym management system that gives gym staff a single dashboard for members, memberships, payments, attendance, trainers, workout plans, progress tracking, expenses, reports, notifications, and gym settings.

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![License](https://img.shields.io/badge/license-proprietary-lightgrey)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Supabase Setup](#supabase-setup)
- [Deployment](#deployment)
- [Security](#security)
- [Development Commands](#development-commands)
- [Status](#status)
- [License](#license)

---

## Features

| Category | Capabilities |
|---|---|
| 🔐 Authentication | Secure login via Supabase Auth |
| 📊 Dashboard | Real-time gym statistics and analytics |
| 👥 Members | Full member management |
| 💳 Memberships | Plans, subscriptions, and renewals |
| 💰 Payments | Payment tracking and history |
| 🏃 Attendance | Check-in/check-out tracking |
| 🧑‍🏫 Trainers | Trainer profiles and member assignment |
| 🏋️ Workout Plans | Custom plans and exercise libraries |
| 📈 Progress | Measurements and progress photos |
| 🧾 Expenses | Expense logging with receipt uploads |
| 📊 Reports | Analytics and exportable reports |
| 🔔 Notifications | In-app notifications and reminders |
| ⚙️ Settings | Branding, currency, timezone, appearance |
| 📱 Responsive | Optimized for desktop and mobile |
| 🔒 RLS | Row Level Security on all tables |

---

## Tech Stack

**Frontend**
- React + TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React (icons)
- Recharts (charts)

**Backend / Database**
- Supabase (Auth, Database, Storage)
- PostgreSQL
- Row Level Security (RLS)

**Deployment**
- Vercel

---

## Project Structure

```text
thefitnessden/
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/         # React context providers
│   ├── pages/            # Route-level views
│   ├── services/       # API and data-access layer
│   ├── lib/                # Utilities and Supabase client
│   └── ...
├── supabase/
│   └── migrations/     # Database schema migrations
├── public/
├── .env.local             # Local environment variables (not committed)
├── package.json
├── vite.config.*
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd thefitnessden
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> ⚠️ Never commit `.env.local` or any Supabase service-role/secret key.

### 4. Apply database migrations

Apply the migrations in `supabase/migrations/` to your Supabase project (via the Supabase CLI or SQL editor) before running the app.

### 5. Run the development server

```bash
npm run dev
```

The app will be available at the local Vite URL printed in the terminal.

### 6. Build for production

```bash
npm run build
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase public/anon key |

Never expose the Supabase **service-role** key in frontend code or Vite environment variables — it belongs only in server-side/admin contexts.

---

## Supabase Setup

The application relies on Supabase for authentication, PostgreSQL data storage, Row Level Security, and file storage.

**Database areas:**
Members · Membership plans · Memberships · Payments · Attendance · Trainers · Workout plans · Exercises · Progress records · Progress photos · Expenses · Notifications · Reminders · Gym settings · Notification preferences

**Storage buckets:**

| Bucket | Purpose |
|---|---|
| `gym-assets` | Logos and branding assets |
| `trainer-photos` | Trainer profile photos |
| `progress-photos` | Member progress photos |
| `expense-receipts` | Uploaded expense receipts |

---

## Deployment

Deploy to Vercel in a few steps:

1. Push the latest code to GitHub.
2. Import the repository into Vercel.
3. Select the **Vite** project preset.
4. Add the required environment variables.
5. Deploy.
6. Verify authentication and Supabase functionality on the deployed URL.

**Vercel build settings:**

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

---

## Security

- Keep Row Level Security (RLS) enabled on all application tables.
- Review database policies regularly.
- Keep private storage buckets private; use signed URLs for private files.
- Never commit `.env.local`.
- Never expose the Supabase service-role/secret key in frontend code.

---

## Development Commands

```bash
npm install     # Install dependencies
npm run dev     # Start local dev server
npm run build   # Build for production
```

---

## Status

✅ Core features implemented and functionally tested — ready for production deployment.

---

## License

This project is intended for the TheFitnessDen gym management application. All rights reserved.
