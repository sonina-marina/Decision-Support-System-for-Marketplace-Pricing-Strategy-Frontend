import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

// TODO: заменить на реального пользователя из auth-контекста/сервиса,
// когда появится src/context/AuthContext.
const MOCK_USER = {
  name: 'Maria Chen',
  email: 'maria.chen@sellhub.io',
  role: 'seller' as const,
};

export default function MainLayout() {
  const handleSignOut = () => {
    // TODO: подключить реальный signOut() из auth-сервиса
    console.log('sign out');
  };

  return (
    <div className="flex min-h-screen bg-bg text-text-primary">
      <Sidebar user={MOCK_USER} onSignOut={handleSignOut} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-end gap-2 border-b border-border px-8 py-4">
          <LanguageSwitcher />
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
