import api from './client'

export interface ToolPermissions {
  evaluacion_comercial: boolean
  perfilamiento: boolean
}

export interface User {
  id: string
  email: string
  full_name: string
  full_rut: string
  role: number
  avatar_url: string | null
  company_name: string | null
  role_type: 'gestor' | 'corredor'
  tool_permissions: ToolPermissions
  is_admin: boolean
}

export interface LoginResponse {
  token: string
  data: {
    id: string
    type: string
    attributes: {
      email: string
      full_name: string
      full_rut: string
      role: number
      avatar_url: string | null
      company_name: string | null
    }
    role_type: 'gestor' | 'corredor'
    tool_permissions: ToolPermissions
    is_admin: boolean
  }
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', { email, password })

  if (response.data.token) {
    localStorage.setItem('token', response.data.token)

    const user: User = {
      id: response.data.data.id,
      email: response.data.data.attributes.email,
      full_name: response.data.data.attributes.full_name,
      full_rut: response.data.data.attributes.full_rut,
      role: response.data.data.attributes.role,
      avatar_url: response.data.data.attributes.avatar_url,
      company_name: response.data.data.attributes.company_name,
      role_type: response.data.data.role_type,
      tool_permissions: response.data.data.tool_permissions,
      is_admin: response.data.data.is_admin,
    }

    localStorage.setItem('user', JSON.stringify(user))
  }

  return response.data
}

export const logout = (): void => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

export const getStoredUser = (): User | null => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token')
}
