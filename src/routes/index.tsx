import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';

// Layout
import { AppLayout } from '../components/layout/AppLayout';

// Route guards
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

// Public pages
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';

// Protected pages
import { DashboardPage } from '../pages/DashboardPage';
import { MembersPage } from '../pages/MembersPage';
import { AttendancePage } from '../pages/AttendancePage';
import { MembershipsPage } from '../pages/MembershipsPage';
import { PaymentsPage } from '../pages/PaymentsPage';
import { TrainersPage } from '../pages/TrainersPage';
import { WorkoutsPage } from '../pages/WorkoutsPage';
import { ProgressPage } from '../pages/ProgressPage';
import { ExpensesPage } from '../pages/ExpensesPage';
import { ReportsPage } from '../pages/ReportsPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { SettingsPage } from '../pages/SettingsPage';

const router = createBrowserRouter([
  // ── Public routes (redirect to /dashboard if already authenticated) ──
  {
    element: <PublicRoute />,
    children: [
      { path: '/login',            element: <LoginPage /> },
      { path: '/signup',           element: <SignupPage /> },
      { path: '/forgot-password',  element: <ForgotPasswordPage /> },
    ],
  },

  // ── Special: reset-password — needs auth session from recovery link ──
  // Not wrapped in PublicRoute because the user needs a temp session
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },

  // ── Protected routes (redirect to /login if not authenticated) ───────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true,              element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard',       element: <DashboardPage /> },
          { path: '/members',         element: <MembersPage /> },
          { path: '/attendance',      element: <AttendancePage /> },
          { path: '/memberships',     element: <MembershipsPage /> },
          { path: '/payments',        element: <PaymentsPage /> },
          { path: '/trainers',        element: <TrainersPage /> },
          { path: '/workouts',        element: <WorkoutsPage /> },
          { path: '/progress',        element: <ProgressPage /> },
          { path: '/expenses',        element: <ExpensesPage /> },
          { path: '/reports',         element: <ReportsPage /> },
          { path: '/notifications',   element: <NotificationsPage /> },
          { path: '/settings',        element: <SettingsPage /> },
        ],
      },
    ],
  },

  // ── Catch-all ─────────────────────────────────────────────────────────
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
