import { useState, useEffect, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Plus, Store as StoreIcon, Package, Trash2 } from 'lucide-react';
import { storesService } from '../services/stores';
import { productsService } from '../services/products';
import type { StoreView } from '../types/store';
import type { ProductView } from '../types/product';
import { useAuth } from '../context/AuthContext';
import { AddProductModal } from '../components/products/AddProductModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { formatCurrency, CURRENCY_OPTIONS, type CurrencyCode } from '../utils/currency';

type ProductsByStore = Record<number, { status: 'loading' | 'loaded' | 'error'; items: ProductView[] }>;

export default function ProductsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stores, setStores] = useState<StoreView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Было number | null (только один открытый магазин) — теперь набор id,
  // раскрытие одного больше не закрывает остальные.
  const [openStoreIds, setOpenStoreIds] = useState<Set<number>>(new Set());
  const [productsByStore, setProductsByStore] = useState<ProductsByStore>({});

  const [isCreatingStore, setIsCreatingStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreCurrency, setNewStoreCurrency] = useState<CurrencyCode>('USD');
  const [savingStore, setSavingStore] = useState(false);

  const [addProductStoreId, setAddProductStoreId] = useState<number | null>(null);
  const [deletingStore, setDeletingStore] = useState<StoreView | null>(null);

  async function loadStores() {
    if (!user) return;
    setLoading(true);
    try {
      const res = await storesService.getByUser(user.id);
      setStores(res.items);
      setError(null);
    } catch {
      setError(t('stores.loadError'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadProductsForStore(storeId: number, force = false) {
    if (productsByStore[storeId] && !force) return;

    setProductsByStore((prev) => ({ ...prev, [storeId]: { status: 'loading', items: [] } }));
    try {
      const res = await productsService.getByStore(storeId);
      setProductsByStore((prev) => ({
        ...prev,
        [storeId]: { status: 'loaded', items: res.items },
      }));
    } catch {
      setProductsByStore((prev) => ({ ...prev, [storeId]: { status: 'error', items: [] } }));
    }
  }

  function toggleStore(id: number) {
    setOpenStoreIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        loadProductsForStore(id);
      }
      return next;
    });
  }

  async function handleCreateStore(e: FormEvent) {
    e.preventDefault();
    if (!user || !newStoreName.trim()) return;

    setSavingStore(true);
    try {
      await storesService.create({
        userId: user.id,
        name: newStoreName.trim(),
        currency: newStoreCurrency,
      });
      setNewStoreName('');
      setNewStoreCurrency('USD');
      setIsCreatingStore(false);
      await loadStores();
    } finally {
      setSavingStore(false);
    }
  }

  if (loading) return <p className="text-text-muted">{t('common.loading')}</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <h1 className="text-3xl font-bold text-text-primary">{t('stores.title')}</h1>
        <button
          type="button"
          onClick={() => setIsCreatingStore((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold
            text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          <Plus size={16} />
          {t('stores.addStore')}
        </button>
      </div>

      {isCreatingStore && (
        <form
          onSubmit={handleCreateStore}
          className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4"
        >
          <input
            autoFocus
            type="text"
            value={newStoreName}
            onChange={(e) => setNewStoreName(e.target.value)}
            placeholder={t('stores.newStoreNamePlaceholder')}
            className="min-w-[200px] flex-1 rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text-primary
              placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <select
            value={newStoreCurrency}
            onChange={(e) => setNewStoreCurrency(e.target.value as CurrencyCode)}
            className="rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text-primary
              focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            {CURRENCY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={savingStore || !newStoreName.trim()}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground
              transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {savingStore ? t('common.loading') : t('stores.create')}
          </button>
        </form>
      )}

      {stores.length === 0 ? (
        <EmptyStoresState onCreate={() => setIsCreatingStore(true)} />
      ) : (
        <div className="flex flex-col gap-3">
          {stores.map((store) => (
            <StoreAccordionItem
              key={store.id}
              store={store}
              isOpen={openStoreIds.has(store.id)}
              onToggle={() => toggleStore(store.id)}
              productsState={productsByStore[store.id]}
              onAddProduct={() => setAddProductStoreId(store.id)}
              onDelete={() => setDeletingStore(store)}
              navigate={navigate}
            />
          ))}
        </div>
      )}

      {addProductStoreId !== null && (
        <AddProductModal
          storeId={addProductStoreId}
          onClose={() => setAddProductStoreId(null)}
          onCreated={() => loadProductsForStore(addProductStoreId, true)}
        />
      )}

      {deletingStore && (
        <ConfirmDialog
          title={t('stores.deleteTitle')}
          message={
            (productsByStore[deletingStore.id]?.items.length ?? 0) > 0
              ? t('stores.deleteMessageWithProducts', {
                  name: deletingStore.name,
                  count: productsByStore[deletingStore.id]?.items.length ?? 0,
                })
              : t('stores.deleteMessage', { name: deletingStore.name })
          }
          confirmLabel={t('stores.delete')}
          onClose={() => setDeletingStore(null)}
          onConfirm={async () => {
            await storesService.delete(deletingStore.id);
            await loadStores();
          }}
        />
      )}
    </div>
  );
}

function StoreAccordionItem({
  store,
  isOpen,
  onToggle,
  productsState,
  onAddProduct,
  onDelete,
  navigate,
}: {
  store: StoreView;
  isOpen: boolean;
  onToggle: () => void;
  productsState?: { status: 'loading' | 'loaded' | 'error'; items: ProductView[] };
  onAddProduct: () => void;
  onDelete: () => void;
  navigate: (path: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 px-6 py-4">
        <button type="button" onClick={onToggle} className="flex flex-1 items-center gap-3 text-left">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <StoreIcon size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-text-primary">{store.name}</p>
              {/* Валюта — нарочно приглушённая, не должна конкурировать с названием */}
              <span className="font-data text-xs text-text-muted">{store.currency}</span>
            </div>
            {productsState?.status === 'loaded' && (
              <p className="text-xs text-text-muted">
                {t('stores.productsCount', { count: productsState.items.length })}
              </p>
            )}
          </div>
          <ChevronDown
            size={18}
            className={`ml-auto text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={t('stores.delete')}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted
            transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-border">
          {!productsState || productsState.status === 'loading' ? (
            <p className="px-6 py-8 text-center text-sm text-text-muted">{t('common.loading')}</p>
          ) : productsState.status === 'error' ? (
            <p className="px-6 py-8 text-center text-sm text-danger">{t('stores.loadError')}</p>
          ) : productsState.items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
              <Package size={20} className="text-text-muted" />
              <p className="text-sm text-text-muted">{t('stores.noProducts')}</p>
              <AddProductButton onClick={onAddProduct} />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full table-fixed border-collapse text-sm">
                  <thead>
                    <tr className="text-left text-text-muted">
                      <th className="w-[15%] px-6 py-3 font-normal">{t('stores.table.itemNumber')}</th>
                      <th className="w-[35%] px-6 py-3 font-normal">{t('stores.table.name')}</th>
                      <th className="w-[25%] px-6 py-3 font-normal">{t('stores.table.category')}</th>
                      <th className="w-[25%] px-6 py-3 text-right font-normal">{t('stores.table.price')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsState.items.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => navigate(`/products/${p.id}`)}
                        className="cursor-pointer border-t border-border-subtle transition-colors hover:bg-bg-elevated/60"
                      >
                        <td className="px-6 py-3 font-data text-text-muted">{p.itemNumber}</td>
                        <td className="px-6 py-3 font-medium text-text-primary">{p.name}</td>
                        <td className="px-6 py-3 text-text-secondary">{p.category}</td>
                        <td className="px-6 py-3 text-right font-data text-text-primary">
                          {formatCurrency(p.price, p.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-border-subtle px-6 py-3">
                <AddProductButton onClick={onAddProduct} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function AddProductButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm
        text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
    >
      <Plus size={15} />
      {t('stores.addProduct')}
    </button>
  );
}

function EmptyStoresState({ onCreate }: { onCreate: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bg-elevated text-text-muted">
        <StoreIcon size={20} />
      </div>
      <p className="mb-1 font-medium text-text-primary">{t('stores.empty.title')}</p>
      <p className="mb-5 max-w-xs text-sm text-text-muted">{t('stores.empty.subtitle')}</p>
      <button
        type="button"
        onClick={onCreate}
        className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold
          text-accent-foreground transition-colors hover:bg-accent-hover"
      >
        <Plus size={16} />
        {t('stores.empty.cta')}
      </button>
    </div>
  );
}

