import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
] as const;

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = i18n.language?.startsWith('ru') ? 'ru' : 'en';

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className="inline-flex items-center rounded-lg border border-border bg-bg-elevated p-0.5 font-data text-xs"
    >
      {LANGS.map(({ code, label }) => {
        const active = current === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => i18n.changeLanguage(code)}
            aria-pressed={active}
            className={`rounded-[6px] px-2.5 py-1.5 transition-colors ${
              active
                ? 'bg-accent-soft text-accent'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
