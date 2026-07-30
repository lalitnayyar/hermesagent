import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Toasts } from '@/components/ui/Toasts'
import { useTaskSimulation } from '@/hooks/useTaskSimulation'

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'dashboard' },
  { path: '/workflows', label: 'Workflows', icon: 'account_tree' },
  { path: '/agents', label: 'Agents', icon: 'smart_toy' },
  { path: '/tasks', label: 'Tasks', icon: 'assignment' },
  { path: '/approvals', label: 'Approvals', icon: 'fact_check' },
  { path: '/automation', label: 'Automation', icon: 'auto_mode' },
  { path: '/monitor', label: 'Monitor', icon: 'monitoring' },
  { path: '/settings', label: 'Settings', icon: 'settings' }
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  useTaskSimulation()

  const NavItem = ({ path, label, icon }: typeof navItems[0]) => (
    <NavLink
      to={path}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-md px-md py-sm rounded-lg transition-all',
          isActive
            ? 'text-primary font-bold border-r-2 border-primary bg-surface-variant/30'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'
        )
      }
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span className="font-body-md">{label}</span>
    </NavLink>
  )

  return (
    <div className="min-h-screen bg-background text-on-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant py-lg z-50">
        <div className="px-md mb-xl">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 bg-primary-container rounded flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[28px]">hub</span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-bold text-primary leading-tight">Hermes Studio</h1>
              <p className="text-[10px] text-on-surface-variant tracking-wider uppercase">Agentic Orchestration</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-sm space-y-xs overflow-y-auto">
          {navItems.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </nav>
        <div className="mt-auto px-sm border-t border-outline-variant pt-md">
          <NavLink
            to="/mobile"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-md px-md py-sm rounded-lg transition-all',
                isActive
                  ? 'text-secondary font-bold border-r-2 border-secondary bg-surface-variant/30'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'
              )
            }
          >
            <span className="material-symbols-outlined">smartphone</span>
            <span className="font-body-md">Mobile Companion</span>
          </NavLink>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between h-16 px-md bg-surface-container-low border-b border-outline-variant sticky top-0 z-40">
        <div className="flex items-center gap-sm">
          <div className="w-8 h-8 bg-primary-container rounded flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">hub</span>
          </div>
          <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">Hermes Studio</h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-on-surface-variant hover:text-on-surface"
        >
          <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-md p-lg">
          <div className="flex justify-end mb-lg">
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <nav className="space-y-xs">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-md px-md py-md rounded-lg text-lg',
                    isActive ? 'text-primary font-bold bg-surface-variant/30' : 'text-on-surface-variant'
                  )
                }
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen flex flex-col pb-20 md:pb-0">
        {/* Desktop Top Bar */}
        <div className="hidden md:flex h-16 items-center justify-between px-lg border-b border-outline-variant bg-background/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-lg">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {navItems.find((n) => n.path === location.pathname)?.label || 'Hermes AgentFlow'}
            </h2>
            <div className="flex items-center gap-xs px-md py-xs bg-surface-container-high rounded-full border border-outline-variant">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse-dot" />
              <span className="text-secondary font-tech-mono text-label-xs uppercase tracking-wider">Enhanced Gateway Mode</span>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">notifications</span>
            <div className="w-8 h-8 rounded-full border border-outline-variant bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xs">
              HS
            </div>
          </div>
        </div>

        <div className="flex-1 p-md lg:p-lg">{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-surface-container-highest border-t border-outline-variant flex justify-around items-center py-sm px-md rounded-t-xl shadow-lg">
        {[
          { path: '/', icon: 'home', label: 'Home' },
          { path: '/agents', icon: 'smart_toy', label: 'Agents' },
          { path: '/tasks', icon: 'assignment', label: 'Tasks' },
          { path: '/mobile', icon: 'smartphone', label: 'Mobile' },
          { path: '/approvals', icon: 'fact_check', label: 'Alerts' }
        ].map(({ path, icon, label }) => {
          const active = location.pathname === path
          return (
            <NavLink
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center justify-center rounded-full px-4 py-1 transition-all',
                active ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'
              )}
            >
              <span className={cn('material-symbols-outlined', active && "[font-variation-settings:'FILL'_1]")}>{icon}</span>
              <span className="font-label-xs text-label-xs">{label}</span>
            </NavLink>
          )
        })}
      </nav>
      <Toasts />
    </div>
  )
}
