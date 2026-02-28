import api from './client'

export interface UserWithPermissions {
  id: number
  email: string
  full_name: string
  cellphone: string | null
  can_evaluacion_comercial: boolean
  can_perfilamiento: boolean
}

export const getToolPermissions = async (): Promise<{ success: boolean; data: UserWithPermissions[] }> => {
  const response = await api.get('/admin/tool_permissions')
  return response.data
}

export const updateToolPermission = async (
  userId: number,
  data: { can_evaluacion_comercial?: boolean; can_perfilamiento?: boolean }
): Promise<{ success: boolean }> => {
  const response = await api.patch(`/admin/tool_permissions/${userId}`, data)
  return response.data
}
