import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { TextField } from '../ui/TextField';
import { productsService } from '../../services/products';
import type { ProductCreate } from '../../types/product';

interface AddProductModalProps {
  storeId: number;
  onClose: () => void;
  onCreated: () => void;
}

const DEFAULT_ADVANCED = {
  acquiring: 0,
  tax: 0,
  views: 0,
  targetActions: 0,
  buyers: 0,
  adCosts: 0,
  inboundLogistic: 0,
  directLogistic: 0,
  reverseLogistic: 0,
  returnRate: 0,
  defectRate: 0,
  avgStorage: 0,
  avgPackaging: 0,
  sales: 0,
};

type FormState = Omit<ProductCreate, 'storeId'>;

const INITIAL_STATE: FormState = {
  itemNumber: 0,
  name: '',
  category: '',
  price: 0,
  cogs: 0,
  commission: 0,
  ...DEFAULT_ADVANCED,
};

export function AddProductModal({ storeId, onClose, onCreated }: AddProductModalProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function numberField(key: keyof FormState, label: string, step = '0.01') {
    return (
      <TextField
        label={label}
        type="number"
        step={step}
        value={form[key] as number}
        onChange={(e) => update(key, Number(e.target.value) as FormState[typeof key])}
      />
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await productsService.create({ ...form, storeId });
      onCreated();
      onClose();
    } catch {
      setError(t('products.productForm.creationError'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={t('stores.addProduct')} onClose={onClose} widthClassName="max-w-2xl">
      <form onSubmit={handleSubmit}>
        {/* Основное */}
        <div className="mb-2 grid grid-cols-2 gap-x-4">
          <TextField
            label={t('products.productForm.name')}
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
          />
          <TextField
            label={t('products.productForm.category')}
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            required
          />
        </div>
        <div className="mb-2 grid grid-cols-2 gap-x-4">
          {numberField('itemNumber', t('products.productForm.itemNumber'), '1')}
          {numberField('price', t('products.productForm.price'))}
        </div>
        <div className="mb-2 grid grid-cols-2 gap-x-4">
          {numberField('cogs', t('products.productForm.cogs'))}
          {numberField('commission', t('products.productForm.commission'), '1')}
        </div>
 
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="mb-3 mt-1 text-sm font-medium text-accent hover:text-accent-hover"
        >
          {showAdvanced ? t('products.productForm.hideAdvanced') : t('products.productForm.showAdvanced')}
        </button>

        {showAdvanced && (
          <div className="mb-2 grid grid-cols-2 gap-x-4">
            {numberField('acquiring', t('products.productForm.acquiring'), '1')}
            {numberField('tax', t('products.productForm.tax'), '1')}
            {numberField('views', t('products.productForm.views'), '1')}
            {numberField('targetActions', t('products.productForm.targetActions'), '1')}
            {numberField('buyers', t('products.productForm.buyers'), '1')}
            {numberField('adCosts', t('products.productForm.adCosts'))}
            {numberField('inboundLogistic', t('products.productForm.inboundLogistic'))}
            {numberField('directLogistic', t('products.productForm.directLogistic'))}
            {numberField('reverseLogistic', t('products.productForm.reverseLogistic'))}
            {numberField('returnRate', t('products.productForm.returnRate'), '1')}
            {numberField('defectRate', t('products.productForm.defectRate'), '1')}
            {numberField('avgStorage', t('products.productForm.avgStorage'))}
            {numberField('avgPackaging', t('products.productForm.avgPackaging'))}
            {numberField('sales', t('products.productForm.sales'), '1')}              </div>
        )}

        {error && <p className="mb-3 text-sm text-danger">{error}</p>}

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2.5 text-sm text-text-secondary
              transition-colors hover:bg-bg"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting || !form.name || !form.category}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground
              transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {submitting ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

