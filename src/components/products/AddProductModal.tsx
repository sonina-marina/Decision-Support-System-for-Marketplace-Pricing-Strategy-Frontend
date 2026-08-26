import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { TextField } from '../ui/TextField';
import { productsService } from '../../services/products';
import type { ProductCreate, ProductDetailedView } from '../../types/product';

interface AddProductModalProps {
  storeId: number;
  onClose: () => void;
  onCreated: () => void;
  editingProduct?: ProductDetailedView;
}

type FieldKey = Exclude<keyof ProductCreate, 'storeId' | 'name' | 'category'>;
type StringFields = Record<FieldKey, string>;

const ALL_NUMERIC_FIELDS: FieldKey[] = [
  'itemNumber',
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

// Целые числа (штуки/просмотры) — шаг 1, остальное — деньги/проценты, шаг 0.01
const INTEGER_FIELDS: FieldKey[] = ['itemNumber', 'views', 'targetActions', 'buyers', 'sales', 'returnRate', 'defectRate'];

function emptyStringFields(): StringFields {
  return ALL_NUMERIC_FIELDS.reduce((acc, key) => {
    acc[key] = '';
    return acc;
  }, {} as StringFields);
}

function toNumber(value: string): number {
  const n = Number(value);
  return value.trim() === '' || Number.isNaN(n) ? 0 : n;
}

export function AddProductModal({
  storeId,
  onClose,
  onCreated,
  editingProduct,
}: AddProductModalProps) {
  const { t } = useTranslation();
  const isEditing = !!editingProduct;

  const [name, setName] = useState(editingProduct?.name ?? '');
  const [category, setCategory] = useState(editingProduct?.category ?? '');
  const [fields, setFields] = useState<StringFields>(() => {
    if (!editingProduct) return emptyStringFields();
    return ALL_NUMERIC_FIELDS.reduce((acc, key) => {
      acc[key] = String(editingProduct[key] ?? '');
      return acc;
    }, {} as StringFields);
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(key: FieldKey, raw: string) {
    if (raw !== '' && !/^\d*\.?\d*$/.test(raw)) return;
    setFields((prev) => ({ ...prev, [key]: raw }));
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: ProductCreate = {
      storeId,
      name,
      category,
      itemNumber: toNumber(fields.itemNumber),
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
    };

    try {
      if (isEditing) {
        await productsService.update({ id: editingProduct.id, ...payload });
      } else {
        await productsService.create(payload);
      }
      onCreated();
      onClose();
    } catch {
      setError('Не удалось сохранить товар. Проверьте поля и попробуйте снова.');
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = !submitting && !!name && !!category;

  return (
    <Modal
      title={isEditing ? t('products.productForm.editTitle') : t('products.productForm.createTitle')}
      onClose={onClose}
      widthClassName="max-w-3xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
          {/* Ряд 1 — идентификация */}
          <TextField
            label={t('products.productForm.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label={t('products.productForm.category')}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
          {numberField('itemNumber')}

          {/* Ряд 2 — цена */}
          {numberField('price')}
          {numberField('cogs')}
          {numberField('commission')}

          {/* Разделитель между базовыми полями и данными для расчёта метрик */}
          <div className="col-span-1 my-1 border-t border-border-subtle sm:col-span-3" />

          {/* Ряд 3 — прочие издержки */}
          {numberField('acquiring')}
          {numberField('tax')}
          {numberField('adCosts')}

          {/* Ряд 4 — воронка */}
          {numberField('views')}
          {numberField('targetActions')}
          {numberField('buyers')}

          {/* Ряд 5 — логистика */}
          {numberField('inboundLogistic')}
          {numberField('directLogistic')}
          {numberField('reverseLogistic')}

          {/* Ряд 6 — продажи/возвраты/брак */}
          {numberField('sales')}
          {numberField('returnRate')}
          {numberField('defectRate')}

          {/* Ряд 7 — упаковка/хранение + кнопки третьим элементом */}
          {numberField('avgPackaging')}
          {numberField('avgStorage')}
          <div className="mb-5">
            {/* невидимый лейбл — чтобы кнопки встали вровень с полями по высоте */}
            <div className="mb-2 block select-none text-sm text-transparent" aria-hidden>
              &nbsp;
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-border px-4 py-3 text-sm text-text-secondary
                  transition-colors hover:bg-bg"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex-1 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground
                  transition-colors hover:bg-accent-hover disabled:opacity-60"
              >
                {submitting ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </div>
        </div>

        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      </form>
    </Modal>
  );
}

