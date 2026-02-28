import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { getToolPermissions, updateToolPermission, type UserWithPermissions } from '../api/admin'

export default function AdminPage() {
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['tool-permissions'],
    queryFn: () => getToolPermissions(),
    staleTime: 5 * 60 * 1000,
  })

  const mutation = useMutation({
    mutationFn: ({ userId, field, value }: { userId: number; field: string; value: boolean }) =>
      updateToolPermission(userId, { [field]: value }),
    onMutate: async ({ userId, field, value }) => {
      await queryClient.cancelQueries({ queryKey: ['tool-permissions'] })
      const prev = queryClient.getQueryData(['tool-permissions'])

      queryClient.setQueryData(['tool-permissions'], (old: any) => ({
        ...old,
        data: old.data.map((u: UserWithPermissions) =>
          u.id === userId ? { ...u, [field]: value } : u
        ),
      }))

      return { prev }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['tool-permissions'], context?.prev)
      toast.error('Error al actualizar permiso')
    },
    onSuccess: () => {
      toast.success('Permiso actualizado')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tool-permissions'] })
    },
  })

  const users = data?.data ?? []
  const filtered = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggle = (userId: number, field: 'can_evaluacion_comercial' | 'can_perfilamiento', current: boolean) => {
    mutation.mutate({ userId, field, value: !current })
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        Administracion de Herramientas
      </h1>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
        }}
      >
        {isLoading ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
            Cargando usuarios...
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
                  Nombre
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>
                  Email
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
                  Eval. Comercial
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
                  Perfilamiento
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  style={{ borderBottom: '1px solid var(--border-default)' }}
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {user.full_name}
                    </div>
                    <div className="text-xs md:hidden" style={{ color: 'var(--text-muted)' }}>
                      {user.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ToggleSwitch
                      checked={user.can_evaluacion_comercial}
                      onChange={() => handleToggle(user.id, 'can_evaluacion_comercial', user.can_evaluacion_comercial)}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ToggleSwitch
                      checked={user.can_perfilamiento}
                      onChange={() => handleToggle(user.id, 'can_perfilamiento', user.can_perfilamiento)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
        {filtered.length} de {users.length} usuarios
      </p>
    </div>
  )
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer"
      style={{ background: checked ? 'var(--accent-hex)' : '#D1D5DB' }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
        style={{ transform: checked ? 'translateX(1.375rem)' : 'translateX(0.25rem)' }}
      />
    </button>
  )
}
