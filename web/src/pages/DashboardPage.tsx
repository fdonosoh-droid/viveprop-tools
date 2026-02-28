import { Link } from 'react-router-dom'
import { Building2, Users, Settings } from 'lucide-react'
import { getStoredUser } from '../api/auth'

const toolCards = [
  {
    key: 'evaluacion_comercial' as const,
    title: 'Evaluacion Comercial',
    description: 'Tasacion de propiedades mediante analisis de comparables, depreciacion y rentabilidad.',
    icon: Building2,
    href: '/evaluacion-comercial',
    color: '#3B3B98',
  },
  {
    key: 'perfilamiento' as const,
    title: 'Perfilamiento de Compradores',
    description: 'Evaluacion financiera y calificacion hipotecaria de clientes.',
    icon: Users,
    href: '/perfilamiento',
    color: '#FF006D',
  },
]

export default function DashboardPage() {
  const user = getStoredUser()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Bienvenido, {user?.full_name?.split(' ')[0]}
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          Selecciona una herramienta para comenzar.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {toolCards.map((card) => {
          const hasAccess = user?.tool_permissions?.[card.key]
          if (!hasAccess) return null

          return (
            <Link
              key={card.key}
              to={card.href}
              className="group rounded-xl p-6 transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
              }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ background: `${card.color}15`, color: card.color }}
              >
                <card.icon size={24} />
              </div>
              <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {card.title}
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {card.description}
              </p>
            </Link>
          )
        })}

        {user?.is_admin && (
          <Link
            to="/admin"
            className="group rounded-xl p-6 transition-all hover:shadow-lg hover:-translate-y-0.5"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
            }}
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
              style={{ background: 'var(--accent-muted)', color: 'var(--accent-hex)' }}
            >
              <Settings size={24} />
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Administracion
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Gestionar permisos de acceso a herramientas por usuario.
            </p>
          </Link>
        )}
      </div>
    </div>
  )
}
