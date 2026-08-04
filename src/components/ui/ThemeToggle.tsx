import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
      title={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border
                 bg-bg-elevated text-text-secondary transition-colors hover:text-text-primary
                 hover:border-border-subtle focus-visible:outline focus-visible:outline-2
                 focus-visible:outline-accent"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
