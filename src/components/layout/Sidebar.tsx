import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Layers,
  LayoutGrid,
  Hexagon,
  FileText,
  Activity,
  BarChart3,
  LogOut,
} from 'lucide-react';
import type { UserView } from '../../types/user';

interface SidebarProps {
  user: UserView;
  onSignOut: () => void;
}

const NAV_ITEMS = [
//  { to: '/dashboard', icon: LayoutGrid, key: 'dashboard' },
  { to: '/products', icon: Hexagon, key: 'products' },
  { to: '/calculator', icon: FileText, key: 'unitEconomics' },
  { to: '/scenarios', icon: Activity, key: 'scenarios' },
  { to: '/reports', icon: BarChart3, key: 'reports' },
] as const;

const ROLE_LABEL_KEY = {
  ADMIN: 'administrator',
  SELLER: 'seller',
} as const;

export function Sidebar({ user, onSignOut }: SidebarProps) {
  const { t } = useTranslation();

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-border bg-bg px-5 py-6">
      {/* Логотип */}
      <div className="mb-6 flex items-center gap-2.5 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/30 bg-accent-soft text-accent">
          <Layers size={18} />
        </div>
        <span className="text-[15px] font-bold text-text-primary">{t('app.name')}</span>
      </div>

      {/* Роль */}
      <div className="mb-6 px-1">
        <span className="inline-block rounded-md border border-accent/30 bg-accent-soft px-2.5 py-1 font-data text-[11px] font-medium uppercase tracking-wider text-accent">
          {t(`role.${ROLE_LABEL_KEY[user.role]}`)}
        </span>
      </div>

      {/* Навигация */}
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-accent-soft text-accent'
                  : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
              }`
            }
          >
            <Icon size={17} strokeWidth={2} />
            {t(`nav.${key}`)}
          </NavLink>
        ))}
      </nav>

      {/* Пользователь */}
      <div className="mt-4 border-t border-border pt-4">
        <div className="mb-1 flex items-center gap-3 rounded-lg px-1 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft font-data text-sm font-semibold text-accent">
            {user.fullname.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-primary">{user.fullname}</p>
            <p className="truncate text-xs text-text-muted">{user.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-primary"
        >
          <LogOut size={17} />
          {t('nav.signOut')}
        </button>
      </div>
    </aside>
  );
}

