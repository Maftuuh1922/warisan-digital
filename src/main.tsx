import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { BatikDetailPage } from '@/pages/BatikDetailPage';
import { AuthPage } from '@/pages/AuthPage';
import { ArtisanDashboardPage } from '@/pages/dashboard/ArtisanDashboardPage';
import { AdminDashboardPage } from '@/pages/dashboard/AdminDashboardPage';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute } from './components/ProtectedRoute';
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/batik/:id",
    element: <BatikDetailPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/auth",
    element: <AuthPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/dashboard/artisan",
    element: (
      <ProtectedRoute role="artisan">
        <ArtisanDashboardPage />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/dashboard/admin",
    element: (
      <ProtectedRoute role="admin">
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster richColors closeButton />
    </ErrorBoundary>
  </StrictMode>,
)