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
import { AboutPage } from './pages/AboutPage';
import { ArtisansPage } from './pages/ArtisansPage';
import { PrintQrPage } from './pages/PrintQrPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { GaleriPage } from './pages/GaleriPage';
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/galeri",
    element: <GaleriPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/analisis-ai",
    element: <PlaceholderPage pageName="Analisis AI" />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/scan-qr",
    element: <PlaceholderPage pageName="Scan QR" />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/batik/:id",
    element: <BatikDetailPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/about",
    element: <AboutPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/artisans",
    element: <ArtisansPage />,
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
  {
    path: "/dashboard/artisan/qr/:batikId",
    element: (
      <ProtectedRoute role="artisan">
        <PrintQrPage />
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