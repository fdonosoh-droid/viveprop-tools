import { Navigate } from 'react-router-dom'
import { isAuthenticated, getStoredUser } from '../api/auth'

interface PrivateRouteProps {
  children: React.ReactNode
  tool?: 'evaluacion_comercial' | 'perfilamiento'
  admin?: boolean
}

export function PrivateRoute({ children, tool, admin }: PrivateRouteProps) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />
  }

  const user = getStoredUser()

  if (admin && !user?.is_admin) {
    return <Navigate to="/" />
  }

  if (tool && !user?.tool_permissions?.[tool]) {
    return <Navigate to="/" />
  }

  return <>{children}</>
}
