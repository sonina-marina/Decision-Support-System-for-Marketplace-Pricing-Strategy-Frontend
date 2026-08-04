import type { ReactNode } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Layers } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

interface Stat {
  value: string;
  labelKey: string;
}

const STATS: Stat[] = [
  { value: '+18.4%', labelKey: 'auth.stats.marginLift' },
  { value: '2,840+', labelKey: 'auth.stats.productsTracked' },
  { value: '12.3', labelKey: 'auth.stats.calcsPerSession' },
  { value: '94%', labelKey: 'auth.stats.riskFlags' },
];

export function AuthLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="grid min-h-screen bg-bg-sunken lg:grid-cols-[minmax(0,1fr)_480px]">
      {/* Левая панель — hero */}
      <div className="relative hidden flex-col justify-center overflow-hidden bg-bg-sunken px-16 py-16 lg:flex">
        <div className="mx-auto w-full max-w-lg">
          <div className="mb-10 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/30 bg-accent-soft text-accent">
              <Layers size={18} />
            </div>
            <span className="text-[15px] font-bold text-text-primary">{t('app.name')}</span>
          </div>

          <p className="mb-3 font-data text-xs font-medium uppercase tracking-[0.2em] text-accent">
            {t('auth.eyebrow')}
          </p>
          <h1 className="mb-5 text-5xl leading-[1.1] text-text-primary">
            {t('auth.heroLine1')}
            <br />
            <span className="font-extrabold">{t('auth.heroLine2')}</span>
          </h1>
          <p className="mb-10 max-w-md text-[15px] leading-relaxed text-text-secondary">
            {t('auth.heroSubtitle')}
          </p>

          <div className="grid grid-cols-2 gap-4">
            {STATS.map((stat) => (
              <div
                key={stat.labelKey}
                className="rounded-xl border border-border-subtle bg-card px-5 py-4"
              >
                <p className="mb-1.5 font-data text-2xl font-semibold text-accent">
                  {stat.value}
                </p>
                <p className="whitespace-pre-line text-[13px] leading-snug text-text-muted">
                  {t(stat.labelKey)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="absolute bottom-8 left-16 font-data text-xs text-text-muted">
          <Trans i18nKey="app.name" /> — © {new Date().getFullYear()}
        </p>
      </div>

      {/* Правая панель — форма */}
      <div className="flex flex-col bg-bg-elevated px-8 py-8 sm:px-16">
        <div className="mb-8 flex items-center justify-between lg:justify-end">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/30 bg-accent-soft text-accent">
              <Layers size={16} />
            </div>
            <span className="text-sm font-bold text-text-primary">{t('app.name')}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <div className="mx-auto w-full max-w-sm">{children}</div>
        </div>

        <p className="mt-8 text-center font-data text-xs text-text-muted">
          {t('auth.footerNote')}
        </p>
      </div>
    </div>
  );
}
