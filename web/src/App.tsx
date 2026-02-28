import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { Layout } from './components/Layout'
import { PrivateRoute } from './components/PrivateRoute'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const EvalComercialIndex = lazy(() => import('./pages/evaluacion-comercial/Index'))
const PerfilamientoIndex = lazy(() => import('./pages/perfilamiento/Index'))
const PerfilamientoEvaluation = lazy(() => import('./pages/perfilamiento/Evaluation'))
const PerfilamientoProperty = lazy(() => import('./pages/perfilamiento/PropertyEvaluation'))

const queryClient = new QueryClient()

function AppLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg-surface)' }}>
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200" style={{ borderTopColor: 'var(--accent-hex)' }} />
            </div>
          }
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <DashboardPage />
                  </AppLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <PrivateRoute admin>
                  <AppLayout>
                    <AdminPage />
                  </AppLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/evaluacion-comercial"
              element={
                <PrivateRoute tool="evaluacion_comercial">
                  <AppLayout>
                    <EvalComercialIndex />
                  </AppLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/perfilamiento"
              element={
                <PrivateRoute tool="perfilamiento">
                  <AppLayout>
                    <PerfilamientoIndex />
                  </AppLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/perfilamiento/evaluacion"
              element={
                <PrivateRoute tool="perfilamiento">
                  <AppLayout>
                    <PerfilamientoEvaluation />
                  </AppLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/perfilamiento/propiedad"
              element={
                <PrivateRoute tool="perfilamiento">
                  <AppLayout>
                    <PerfilamientoProperty />
                  </AppLayout>
                </PrivateRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  )
}
