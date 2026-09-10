import { useTranslation } from 'react-i18next';

const METRICS = [
  { key: 'conversion', formula: 'Target Actions / Views' },
  { key: 'cac', formula: 'Advertisement Costs / Buyers' },
  { key: 'requiredCpa', formula: 'Advertisement Costs / Target Actions' },
  { key: 'ltc', formula: 'COGS + Marketplace Fees + Logistis + Returns + Storage + Packaging' },
  { key: 'cm', formula: 'Price − LTC' },
  { key: 'ltv', formula: 'CM × Sales / Buyers' },
  { key: 'productRoi', formula: '(CM / LTC) × 100%' },
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
