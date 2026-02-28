import { Menu, LogOut } from 'lucide-react'
import { getStoredUser, logout } from '../api/auth'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const user = getStoredUser()

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-6 py-3"
      style={{
        background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
        style={{ color: 'var(--text-primary)' }}
      >
        <Menu size={20} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--text-secondary)' }}>
          {user?.full_name}
        </span>

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: 'var(--accent-muted)', color: 'var(--accent-hex)' }}
        >
          {user?.full_name?.charAt(0)?.toUpperCase() || '?'}
        </div>

        <button
          onClick={logout}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
          title="Cerrar sesion"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
