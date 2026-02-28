import { NavLink } from 'react-router-dom'
import { Home, Building2, Users, Settings, X } from 'lucide-react'
import { VivePropLogo } from './VivePropLogo'
import { getStoredUser } from '../api/auth'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const navItemClass = (isActive: boolean) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
    isActive
      ? 'bg-white/10 border-l-3 border-[var(--sidebar-accent)]'
      : 'hover:bg-white/5'
  }`

export function Sidebar({ open, onClose }: SidebarProps) {
  const user = getStoredUser()
  const permissions = user?.tool_permissions

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'var(--bg-sidebar)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <VivePropLogo height={32} white />
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded hover:bg-white/10 cursor-pointer"
            style={{ color: 'var(--sidebar-text)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1" style={{ color: 'var(--sidebar-text)' }}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => navItemClass(isActive)}
            onClick={onClose}
          >
            <Home size={18} />
            Dashboard
          </NavLink>

          {permissions?.evaluacion_comercial && (
            <NavLink
              to="/evaluacion-comercial"
              className={({ isActive }) => navItemClass(isActive)}
              onClick={onClose}
            >
              <Building2 size={18} />
              Evaluacion Comercial
            </NavLink>
          )}

          {permissions?.perfilamiento && (
            <NavLink
              to="/perfilamiento"
              className={({ isActive }) => navItemClass(isActive)}
              onClick={onClose}
            >
              <Users size={18} />
              Perfilamiento
            </NavLink>
          )}

          {user?.is_admin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => navItemClass(isActive)}
              onClick={onClose}
            >
              <Settings size={18} />
              Administracion
            </NavLink>
          )}
        </nav>

        {/* User info at bottom */}
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-xs truncate" style={{ color: 'var(--sidebar-text-muted)' }}>
            {user?.email}
          </p>
        </div>
      </aside>
    </>
  )
}
