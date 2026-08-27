import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Calculator as CalculatorIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storesService } from '../services/stores';
import { productsService } from '../services/products';
import { MetricCalculator, type CalculatedMetrics } from '../utils/unitEconomicCalculator';
import { formatCurrency, CURRENCY_OPTIONS, type CurrencyCode } from '../utils/currency';
import { TextField } from '../components/ui/TextField';
import type { ProductCalculationData } from '../types/product';
import type { StoreView } from '../types/store';

type FieldKey = keyof ProductCalculationData;
type StringFields = Record<FieldKey, string>;

const CALC_FIELD_ORDER: FieldKey[] = [
  'price',
  'cogs',
  'commission',
  'acquiring',
  'tax',
  'adCosts',
  'views',
  'targetActions',
  'buyers',
  'inboundLogistic',
  'directLogistic',
  'reverseLogistic',
  'sales',
  'returnRate',
  'defectRate',
  'avgPackaging',
  'avgStorage',
];

const INTEGER_FIELDS: FieldKey[] = ['views', 'targetActions', 'buyers', 'sales', 'returnRate', 'defectRate'];

function emptyFields(): StringFields {
  return CALC_FIELD_ORDER.reduce((acc, key) => {
    acc[key] = '';
    return acc;
  }, {} as StringFields);
}

function toNumber(value: string): number {
  const n = Number(value);
  return value.trim() === '' || Number.isNaN(n) ? 0 : n;
}

interface ProductOption {
  id: number;
  label: string;
  storeName: string;
}

const CUSTOM_OPTION = 'custom';

export default function CalculatorPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [stores, setStores] = useState<StoreView[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [selected, setSelected] = useState<string>(CUSTOM_OPTION);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [fields, setFields] = useState<StringFields>(emptyFields());

  useEffect(() => {
    async function loadOptions() {
      if (!user) return;
      setLoadingOptions(true);
      try {
        const storesRes = await storesService.getByUser(user.id);
        setStores(storesRes.items);

        const perStore = await Promise.all(
          storesRes.items.map((s) => productsService.getByStore(s.id).then((r) => ({ store: s, items: r.items })))
        );

        const options: ProductOption[] = perStore.flatMap(({ store, items }) =>
          items.map((p) => ({ id: p.id, label: p.name, storeName: store.name }))
        );
        setProductOptions(options);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, [user]);

  async function handleSelectChange(value: string) {
    setSelected(value);

    if (value === CUSTOM_OPTION) {
      setFields(emptyFields());
      return;
    }

    setLoadingProduct(true);
    try {
      const product = await productsService.getWithMetrics(Number(value));
      setCurrency(product.currency);
      setFields(
        CALC_FIELD_ORDER.reduce((acc, key) => {
          acc[key] = String(product[key] ?? '');
          return acc;
        }, {} as StringFields)
      );
    } finally {
      setLoadingProduct(false);
    }
  }

  function updateField(key: FieldKey, raw: string) {
    if (raw !== '' && !/^\d*\.?\d*$/.test(raw)) return;
    setFields((prev) => ({ ...prev, [key]: raw }));
  }

  const calcData: ProductCalculationData = useMemo(
    () => ({
      price: toNumber(fields.price),
      cogs: toNumber(fields.cogs),
      commission: toNumber(fields.commission),
      acquiring: toNumber(fields.acquiring),
      tax: toNumber(fields.tax),
      views: toNumber(fields.views),
      targetActions: toNumber(fields.targetActions),
      buyers: toNumber(fields.buyers),
      adCosts: toNumber(fields.adCosts),
      inboundLogistic: toNumber(fields.inboundLogistic),
      directLogistic: toNumber(fields.directLogistic),
      reverseLogistic: toNumber(fields.reverseLogistic),
      returnRate: toNumber(fields.returnRate),
      defectRate: toNumber(fields.defectRate),
      avgStorage: toNumber(fields.avgStorage),
      avgPackaging: toNumber(fields.avgPackaging),
      sales: toNumber(fields.sales),
    }),
    [fields]
  );

  const { metrics, calcError } = useMemo<{ metrics: CalculatedMetrics | null; calcError: string | null }>(() => {
    try {
      return { metrics: MetricCalculator.calculate(calcData), calcError: null };
    } catch (e) {
      return { metrics: null, calcError: e instanceof Error ? e.message : String(e) };
    }
  }, [calcData]);

  const hints = useMemo(() => (metrics ? buildHints(metrics, calcData, t) : []), [metrics, calcData, t]);

  function numberField(key: FieldKey) {
    return (
      <TextField
        label={t(`products.productForm.${key}`)}
        type="text"
        inputMode="decimal"
        step={INTEGER_FIELDS.includes(key) ? '1' : '0.01'}
        placeholder="0"
        value={fields[key]}
        onChange={(e) => updateField(key, e.target.value)}
      />
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">{t('calculator.title')}</h1>
        <p className="mt-1 text-sm text-text-muted">{t('calculator.subtitle')}</p>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="min-w-[260px] flex-1">
          <label className="mb-2 block text-sm text-text-secondary">{t('calculator.loadFrom')}</label>
          <select
            value={selected}
            onChange={(e) => handleSelectChange(e.target.value)}
            disabled={loadingOptions}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-[15px] text-text-primary
              focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            <option value={CUSTOM_OPTION}>{t('calculator.customOption')}</option>
            {stores.map((store) => {
              const opts = productOptions.filter((o) => o.storeName === store.name);
              if (opts.length === 0) return null;
              return (
                <optgroup key={store.id} label={store.name}>
                  {opts.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>

        {selected === CUSTOM_OPTION && (
          <div>
            <label className="mb-2 block text-sm text-text-secondary">{t('calculator.currency')}</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="rounded-lg border border-border bg-card px-3 py-3 text-sm text-text-primary
                focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              {CURRENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Левая колонка — поля ввода */}
        <div className="rounded-xl border border-border bg-card p-5">
          {loadingProduct ? (
            <p className="text-sm text-text-muted">{t('common.loading')}</p>
          ) : (
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
              {numberField('price')}
              {numberField('cogs')}
              {numberField('commission')}

              <div className="col-span-1 my-1 border-t border-border-subtle sm:col-span-3" />

              {numberField('acquiring')}
              {numberField('tax')}
              {numberField('adCosts')}

              {numberField('views')}
              {numberField('targetActions')}
              {numberField('buyers')}

              {numberField('inboundLogistic')}
              {numberField('directLogistic')}
              {numberField('reverseLogistic')}

              {numberField('sales')}
              {numberField('returnRate')}
              {numberField('defectRate')}

              {numberField('avgPackaging')}
              {numberField('avgStorage')}
            </div>
          )}
        </div>

        {/* Правая колонка — результат, растянута по высоте левой */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <CalculatorIcon size={16} className="text-accent" />
            <h2 className="font-semibold text-text-primary">{t('calculator.result')}</h2>
          </div>

          {calcError ? (
            <p className="text-sm text-text-muted">{calcError}</p>
          ) : metrics ? (
            <>
              <div className="mb-4 flex flex-col">
                <ResultRow label={t('products.productPage.metricsFields.conversion')} value={`${(metrics.conversion * 100).toFixed(1)}%`} />
                <ResultRow label={t('products.productPage.metricsFields.cac')} value={formatCurrency(metrics.cac, currency)} />
                <ResultRow
                  label={t('products.productPage.metricsFields.requiredCpa')}
                  value={formatCurrency(metrics.requiredCpa, currency)}
                />
                <ResultRow label={t('products.productPage.metricsFields.ltc')} value={formatCurrency(metrics.ltc, currency)} />
                <ResultRow
                  label={t('products.productPage.metricsFields.cm')}
                  value={formatCurrency(metrics.cm, currency)}
                  valueClassName={metrics.cm >= 0 ? 'text-success' : 'text-danger'}
                />
                <ResultRow label={t('products.productPage.metricsFields.ltv')} value={formatCurrency(metrics.ltv, currency)} />
                <ResultRow
                  label={t('products.productPage.metricsFields.productRoi')}
                  value={`${metrics.productRoi.toFixed(1)}%`}
                  valueClassName={metrics.productRoi >= 0 ? 'text-success' : 'text-danger'}
                />
              </div>

              {hints.length > 0 && (
                <div className="flex flex-col gap-2 border-t border-border-subtle pt-4">
                  {hints.map((hint) => (
                    <div key={hint} className="flex items-start gap-2 text-xs text-warning">
                      <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                      <span>{hint}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ResultRow({
  label,
  value,
  valueClassName = 'text-text-primary',
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border-subtle py-2 text-sm last:border-0">
      <span className="text-text-muted">{label}</span>
      <span className={`font-data ${valueClassName}`}>{value}</span>
    </div>
  );
}

/**
 * Простые пороговые правила поддержки решений — покрывают четыре сценария:
 * убыточность, чрезмерные расходы на рекламу, критически низкая маржа,
 * высокая доля операционных расходов в цене.
 */
function buildHints(
  metrics: CalculatedMetrics,
  data: ProductCalculationData,
  t: (key: string) => string
): string[] {
  const hints: string[] = [];

  if (metrics.cm < 0) {
    hints.push(t('calculator.hints.unprofitable'));
  } else if (metrics.productRoi < 15) {
    hints.push(t('calculator.hints.lowMargin'));
  }

  if (metrics.cac > metrics.cm && metrics.cm > 0) {
    hints.push(t('calculator.hints.adCostsTooHigh'));
  }

  if (data.price > 0 && metrics.ltc / data.price > 0.85) {
    hints.push(t('calculator.hints.operationalCostsHigh'));
  }

  return hints;
}

