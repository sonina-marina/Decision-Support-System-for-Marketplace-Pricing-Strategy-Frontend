import { useState, useEffect, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Plus, Store as StoreIcon, Package } from 'lucide-react';
import { storesService } from '../services/stores';
import { productsService } from '../services/products';
import type { StoreView } from '../types/store';
import type { ProductView } from '../types/product';
import { useAuth } from '../context/AuthContext';
import { AddProductModal } from '../components/products/AddProductModal';

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

type ProductsByStore = Record<number, { status: 'loading' | 'loaded' | 'error'; items: ProductView[] }>;

export default function ProductsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [stores, setStores] = useState<StoreView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openStoreId, setOpenStoreId] = useState<number | null>(null);
  const [productsByStore, setProductsByStore] = useState<ProductsByStore>({});

  const [isCreatingStore, setIsCreatingStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [savingStore, setSavingStore] = useState(false);

  const [addProductStoreId, setAddProductStoreId] = useState<number | null>(null);

  async function loadStores() {
    setLoading(true);
    try {
      const res = await storesService.getAll();
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
    const next = openStoreId === id ? null : id;
    setOpenStoreId(next);
    if (next !== null) loadProductsForStore(next);
  }

  async function handleCreateStore(e: FormEvent) {
    e.preventDefault();
    if (!user || !newStoreName.trim()) return;

    setSavingStore(true);
    try {
      await storesService.create({ userId: user.id, name: newStoreName.trim() });
      setNewStoreName('');
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
          className="mb-5 flex items-center gap-3 rounded-xl border border-border bg-card p-4"
        >
          <input
            autoFocus
            type="text"
            value={newStoreName}
            onChange={(e) => setNewStoreName(e.target.value)}
            placeholder={t('stores.newStoreNamePlaceholder')}
            className="flex-1 rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text-primary
              placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
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
              isOpen={openStoreId === store.id}
              onToggle={() => toggleStore(store.id)}
              productsState={productsByStore[store.id]}
              onAddProduct={() => setAddProductStoreId(store.id)}
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
    </div>
  );
}

function StoreAccordionItem({
  store,
  isOpen,
  onToggle,
  productsState,
  onAddProduct,
}: {
  store: StoreView;
  isOpen: boolean;
  onToggle: () => void;
  productsState?: { status: 'loading' | 'loaded' | 'error'; items: ProductView[] };
  onAddProduct: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <StoreIcon size={16} />
          </div>
          <div>
            <p className="font-medium text-text-primary">{store.name}</p>
            {productsState?.status === 'loaded' && (
              <p className="text-xs text-text-muted">
                {t('stores.productsCount', { count: productsState.items.length })}
              </p>
            )}
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

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
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-left text-text-muted">
                      <th className="px-6 py-3 font-normal">{t('stores.table.itemNumber')}</th>
                      <th className="px-6 py-3 font-normal">{t('stores.table.name')}</th>
                      <th className="px-6 py-3 font-normal">{t('stores.table.category')}</th>
                      <th className="px-6 py-3 font-normal">{t('stores.table.price')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsState.items.map((p) => (
                      <tr key={p.id} className="border-t border-border-subtle">
                        <td className="px-6 py-3 font-data text-text-muted">{p.itemNumber}</td>
                        <td className="px-6 py-3 font-medium text-text-primary">{p.name}</td>
                        <td className="px-6 py-3 text-text-secondary">{p.category}</td>
                        <td className="px-6 py-3 font-data text-text-primary">
                          {currency(p.price)}
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

