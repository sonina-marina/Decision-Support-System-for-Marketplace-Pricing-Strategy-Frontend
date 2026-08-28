import { useTranslation } from 'react-i18next';
import { TextField } from '../ui/TextField';
import { CURRENCY_OPTIONS, type CurrencyCode } from '../../utils/currency';
import type { ProductCalculationData } from '../../types/product';
import type { StoreView } from '../../types/store';

export type FieldKey = keyof ProductCalculationData;
export type StringFields = Record<FieldKey, string>;

export const CALC_FIELD_ORDER: FieldKey[] = [
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

export function emptyCalcFields(): StringFields {
  return CALC_FIELD_ORDER.reduce((acc, key) => {
    acc[key] = '';
    return acc;
  }, {} as StringFields);
}

export function calcFieldToNumber(value: string): number {
  const n = Number(value);
  return value.trim() === '' || Number.isNaN(n) ? 0 : n;
}

export interface ProductOption {
  id: number;
  label: string;
  storeName: string;
}

export const CUSTOM_OPTION = 'custom';

interface ProductCalcFormProps {
  stores: StoreView[];
  productOptions: ProductOption[];
  selected: string;
  onSelectedChange: (value: string) => void;
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  fields: StringFields;
  onFieldChange: (key: FieldKey, value: string) => void;
  loading?: boolean;
  headerExtra?: React.ReactNode;
}

export function ProductCalcForm({
  stores,
  productOptions,
  selected,
  onSelectedChange,
  currency,
  onCurrencyChange,
  fields,
  onFieldChange,
  loading,
  headerExtra,
}: ProductCalcFormProps) {
  const { t } = useTranslation();

  function updateField(key: FieldKey, raw: string) {
    if (raw !== '' && !/^\d*\.?\d*$/.test(raw)) return;
    onFieldChange(key, raw);
  }

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
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-[200px] flex-1">
          <label className="mb-2 block text-sm text-text-secondary">{t('calculator.loadFrom')}</label>
          <select
            value={selected}
            onChange={(e) => onSelectedChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text-primary
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
              onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
              className="rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text-primary
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

        {headerExtra}
      </div>

      {loading ? (
        <p className="text-sm text-text-muted">{t('common.loading')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          {CALC_FIELD_ORDER.map((key) => (
            <div key={key}>{numberField(key)}</div>
          ))}
        </div>
      )}
    </div>
  );
}

