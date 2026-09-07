import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, GitCompare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storesService } from '../services/stores';
import { productsService } from '../services/products';
import { MetricCalculator, type CalculatedMetrics } from '../utils/unitEconomicCalculator';
import { formatCurrency, type CurrencyCode } from '../utils/currency';
import {
  ProductCalcForm,
  CALC_FIELD_ORDER,
  emptyCalcFields,
  calcFieldToNumber,
  CUSTOM_OPTION,
  type StringFields,
  type ProductOption,
} from '../components/calculator/ProductCalcForm';
import type { ProductCalculationData } from '../types/product';
import type { StoreView } from '../types/store';

/** higherIsBetter: true — рост метрики это хорошо (зелёным), false — рост это плохо (красным). */
const METRIC_ROWS: { key: keyof CalculatedMetrics; labelKey: string; isPercent?: boolean; higherIsBetter: boolean }[] = [
  { key: 'conversion', labelKey: 'products.productPage.metricsFields.conversion', isPercent: true, higherIsBetter: true },
  { key: 'cac', labelKey: 'products.productPage.metricsFields.cac', higherIsBetter: false },
  { key: 'requiredCpa', labelKey: 'products.productPage.metricsFields.requiredCpa', higherIsBetter: false },
  { key: 'ltc', labelKey: 'products.productPage.metricsFields.ltc', higherIsBetter: false },
  { key: 'cm', labelKey: 'products.productPage.metricsFields.cm', higherIsBetter: true },
  { key: 'ltv', labelKey: 'products.productPage.metricsFields.ltv', higherIsBetter: true },
  { key: 'productRoi', labelKey: 'products.productPage.metricsFields.productRoi', isPercent: true, higherIsBetter: true },
];

interface Variant {
  selected: string;
  currency: CurrencyCode;
  fields: StringFields;
}

function emptyVariant(): Variant {
  return { selected: CUSTOM_OPTION, currency: 'USD', fields: emptyCalcFields() };
}

export default function ScenariosPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [stores, setStores] = useState<StoreView[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingVariant, setLoadingVariant] = useState<'A' | 'B' | null>(null);

  const [variantA, setVariantA] = useState<Variant>(emptyVariant());
  const [variantB, setVariantB] = useState<Variant>(emptyVariant());

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
        setProductOptions(
          perStore.flatMap(({ store, items }) => items.map((p) => ({ id: p.id, label: p.name, storeName: store.name })))
        );
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, [user]);

  async function handleSelect(which: 'A' | 'B', value: string) {
    const setVariant = which === 'A' ? setVariantA : setVariantB;

    if (value === CUSTOM_OPTION) {
      setVariant((prev) => ({ ...prev, selected: value, fields: emptyCalcFields() }));
      return;
    }

    setLoadingVariant(which);
    try {
      const product = await productsService.getWithMetrics(Number(value));
      setVariant({
        selected: value,
        currency: product.currency,
        fields: CALC_FIELD_ORDER.reduce((acc, key) => {
          acc[key] = String(product[key] ?? '');
          return acc;
        }, {} as StringFields),
      });
    } finally {
      setLoadingVariant(null);
    }
  }

  function updateField(which: 'A' | 'B', key: keyof ProductCalculationData, value: string) {
    const setVariant = which === 'A' ? setVariantA : setVariantB;
    setVariant((prev) => ({ ...prev, fields: { ...prev.fields, [key]: value } }));
  }

  function handleDuplicate() {
    setVariantB({ ...variantA, fields: { ...variantA.fields } });
  }

  function calcMetrics(fields: StringFields): CalculatedMetrics | null {
    const data: ProductCalculationData = CALC_FIELD_ORDER.reduce((acc, key) => {
      acc[key] = calcFieldToNumber(fields[key]);
      return acc;
    }, {} as ProductCalculationData);

    try {
      return MetricCalculator.calculate(data);
    } catch {
      return null;
    }
  }

  const metricsA = useMemo(() => calcMetrics(variantA.fields), [variantA.fields]);
  const metricsB = useMemo(() => calcMetrics(variantB.fields), [variantB.fields]);

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">{t('scenarios.title')}</h1>
        <p className="mt-1 text-sm text-text-muted">{t('scenarios.subtitle')}</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-semibold text-text-primary">{t('scenarios.variantA')}</p>
          <ProductCalcForm
            stores={stores}
            productOptions={productOptions}
            selected={variantA.selected}
            onSelectedChange={(v) => handleSelect('A', v)}
            currency={variantA.currency}
            onCurrencyChange={(c) => setVariantA((prev) => ({ ...prev, currency: c }))}
            fields={variantA.fields}
            onFieldChange={(k, v) => updateField('A', k, v)}
            loading={loadingOptions || loadingVariant === 'A'}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-text-primary">{t('scenarios.variantB')}</p>
          <ProductCalcForm
            stores={stores}
            productOptions={productOptions}
            selected={variantB.selected}
            onSelectedChange={(v) => handleSelect('B', v)}
            currency={variantB.currency}
            onCurrencyChange={(c) => setVariantB((prev) => ({ ...prev, currency: c }))}
            fields={variantB.fields}
            onFieldChange={(k, v) => updateField('B', k, v)}
            loading={loadingOptions || loadingVariant === 'B'}
            headerExtra={
              <button
                type="button"
                onClick={handleDuplicate}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-border px-3 py-2 text-xs
                  text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
              >
                <Copy size={13} />
                {t('scenarios.duplicateFromA')}
              </button>
            }
          />
        </div>
      </div>

      {/* Сравнение — таблица снизу, а не два блока рядом: строка на метрику, легче сверять глазами */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <GitCompare size={16} className="text-accent" />
          <h2 className="font-semibold text-text-primary">{t('scenarios.comparison')}</h2>
        </div>

        {!metricsA || !metricsB ? (
          <p className="text-sm text-text-muted">{t('scenarios.needBothVariants')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-text-muted">
                  <th className="w-[30%] px-4 py-2.5 font-normal" />
                  <th className="px-4 py-2.5 text-right font-normal">{t('scenarios.variantA')}</th>
                  <th className="px-4 py-2.5 text-right font-normal">{t('scenarios.variantB')}</th>
                  <th className="px-4 py-2.5 text-right font-normal">{t('scenarios.delta')}</th>
                </tr>
              </thead>
              <tbody>
                {METRIC_ROWS.map((row) => {
                  const a = metricsA[row.key];
                  const b = metricsB[row.key];
                  const delta = b - a;
                  const improved = row.higherIsBetter ? delta > 0 : delta < 0;
                  const worsened = row.higherIsBetter ? delta < 0 : delta > 0;

                  const format = (n: number, currency: CurrencyCode) =>
                    row.isPercent ? `${n.toFixed(1)}%` : formatCurrency(n, currency);

                  return (
                    <tr key={row.key} className="border-t border-border-subtle">
                      <td className="px-4 py-3 text-text-secondary">{t(row.labelKey)}</td>
                      <td className="px-4 py-3 text-right font-data text-text-primary">
                        {format(a, variantA.currency)}
                      </td>
                      <td className="px-4 py-3 text-right font-data text-text-primary">
                        {format(b, variantB.currency)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-data ${
                          improved ? 'text-success' : worsened ? 'text-danger' : 'text-text-muted'
                        }`}
                      >
                        {delta === 0 ? '—' : `${delta > 0 ? '+' : ''}${format(delta, variantB.currency)}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

