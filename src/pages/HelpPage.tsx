import { useTranslation } from 'react-i18next';

const METRICS = [
  { key: 'conversion', formula: 'targetActions / views' },
  { key: 'cac', formula: 'adCosts / buyers' },
  { key: 'requiredCpa', formula: 'adCosts / targetActions' },
  { key: 'ltc', formula: 'cogs + издержки маркетплейса + логистика + возвраты + хранение/упаковка' },
  { key: 'cm', formula: 'price − ltc' },
  { key: 'ltv', formula: 'cm × sales / buyers' },
  { key: 'productRoi', formula: '(cm / ltc) × 100%' },
] as const;

export default function HelpPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-5xl">
      <h1 className="mb-2 text-3xl font-bold text-text-primary">{t('help.title')}</h1>
      <p className="mb-8 text-text-secondary">{t('help.intro')}</p>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-text-primary">{t('help.howItWorksTitle')}</h2>
        <p className="text-sm leading-relaxed text-text-secondary">{t('help.howItWorksBody')}</p>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-text-primary">{t('help.metricsTitle')}</h2>
        <div className="flex flex-col gap-4">
          {METRICS.map((m) => (
            <div key={m.key} className="rounded-xl border border-border bg-card p-5">
              <p className="mb-1 font-medium text-text-primary">
                {t(`products.productPage.metricsFields.${m.key}`)}
              </p>
              <p className="mb-2 text-sm leading-relaxed text-text-secondary">
                {t(`help.metrics.${m.key}`)}
              </p>
              <p className="font-data text-xs text-text-muted">{m.formula}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
