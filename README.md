TheFitnessDen --- Gym Management System

Train. Track. Transform.

TheFitnessDen is a modern full-stack gym management system designed to
help gym staff manage members, memberships, payments, attendance,
trainers, workout plans, progress, expenses, reports, notifications,
reminders, and gym settings from one dashboard.

Features

🔐 Authentication with Supabase

📊 Dashboard with gym statistics and analytics

👥 Member management

💳 Membership plans and member memberships

💰 Payment management

🏃 Attendance tracking

🧑‍🏫 Trainer management and member-trainer assignment

🏋️ Workout plan management

📈 Member progress and measurement tracking

📸 Progress photo management

🧾 Expense management and receipt uploads

📊 Reports and analytics

🔔 Notifications and reminders

⚙️ Gym configuration and settings

🖼️ Gym logo/branding management

🌙 Dark/light appearance settings

📱 Responsive interface for desktop and mobile

🔒 Supabase Row Level Security (RLS)

☁️ Supabase Storage for uploaded assets

Technology Stack

Frontend

React

TypeScript

Vite

Tailwind CSS

React Router

Lucide React

Recharts

Backend / Database

Supabase

PostgreSQL

Supabase Authentication

Supabase Storage

Row Level Security (RLS)

Deployment

Vercel

Project Structure

thefitnessden/
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── services/
│   ├── lib/
│   └── ...
├── supabase/
│   └── migrations/
├── public/
├── .env.local
├── package.json
├── vite.config.*
└── README.md

Getting Started

1. Clone the repository

git clone <YOUR_GITHUB_REPOSITORY_URL>
cd thefitnessden

2. Install dependencies

npm install

3. Configure environment variables

Create a .env.local file in the project root:

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

Do not commit .env.local or any Supabase service-role/secret key.

4. Run the development server

npm run dev

The application will be available at the local Vite development URL
shown in the terminal.

5. Build for production

npm run build

Supabase Setup

The application uses Supabase for authentication, PostgreSQL data, Row
Level Security, and file storage.

Main database areas include:

Members

Membership plans

Memberships

Payments

Attendance

Trainers

Workout plans

Exercises

Progress records

Progress photos

Expenses

Notifications

Reminders

Gym settings

Notification preferences

Storage buckets include:

gym-assets

trainer-photos

progress-photos

expense-receipts

Apply the project's Supabase migrations to a new Supabase project before
using the application.

Environment Variables

Required frontend variables:

Variable                   Description

VITE_SUPABASE_URL        Supabase project URL
VITE_SUPABASE_ANON_KEY   Supabase public/anon key

Never expose the Supabase service-role key in frontend code or Vite
environment variables.

Production Deployment

The project can be deployed using Vercel.

Push the latest code to GitHub.

Import the repository into Vercel.

Select the Vite project configuration.

Add the required environment variables.

Deploy the application.

Test authentication and Supabase functionality on the deployed URL.

Typical Vite settings:

Framework Preset: Vite
Build Command: npm run build
Output Directory: dist

Security

The project uses Supabase Row Level Security (RLS) for database
protection.

Before production deployment:

Keep RLS enabled on application tables.

Review database policies.

Keep private storage buckets private where appropriate.

Use signed URLs for private files.

Never commit .env.local.

Never expose a Supabase service-role/secret key in the frontend.

Branding

Product: TheFitnessDen

Tagline: Train. Track. Transform.

The application is designed with a premium dark gym-management aesthetic
and supports configurable gym branding, logo, currency, timezone,
appearance, and notification preferences.

Development Commands

npm install
npm run dev
npm run build

Status

TheFitnessDen has completed its core feature implementation and
functional testing and is prepared for production deployment.

License

This project is intended for the TheFitnessDen gym management
application.