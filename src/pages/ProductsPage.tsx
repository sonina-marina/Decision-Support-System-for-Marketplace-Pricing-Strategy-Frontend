import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, AlertTriangle, PackageSearch } from 'lucide-react';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { computeProductMetrics } from '../types/product';

type Filter = 'all' | 'active' | 'archived';

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function ProductsPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const products = useMemo(() => MOCK_PRODUCTS.map(computeProductMetrics), []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesFilter = filter === 'all' ? true : p.status === filter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q === '' || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [products, filter, query]);

  const columns = [
    'product',
    'price',
    'cogs',
    'commission',
    'advertising',
    'margin',
    'netProfit',
    'breakEven',
  ] as const;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{t('products.title')}</h1>
          <p className="mt-1 text-sm text-text-muted">
            {t('products.shownCount', { shown: filtered.length, total: products.length })}
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold
            text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          <Plus size={16} />
          {t('products.addProduct')}
        </button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px] flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('products.searchPlaceholder')}
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-text-primary
              placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
          {(['all', 'active', 'archived'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-md px-3.5 py-1.5 text-sm transition-colors ${
                filter === f
                  ? 'border border-accent/30 bg-accent-soft text-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t(`products.filters.${f}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-muted">
                  {columns.map((col) => (
                    <th key={col} className="whitespace-nowrap px-6 py-3.5 font-normal">
                      {t(`products.table.${col}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const isNegativeMargin = p.marginPct < 0;
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-border-subtle last:border-0 hover:bg-bg-elevated/40"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-text-primary">{p.name}</p>
                        <p className="font-data text-xs text-text-muted">{p.sku}</p>
                      </td>
                      <td className="px-6 py-4 font-data text-text-primary">
                        {currency(p.price)}
                      </td>
                      <td className="px-6 py-4 font-data text-text-secondary">
                        {currency(p.cogs)}
                      </td>
                      <td className="px-6 py-4 font-data text-text-secondary">
                        {p.commissionPct}%
                      </td>
                      <td className="px-6 py-4 font-data text-text-secondary">
                        {currency(p.advertising)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 font-data ${
                            isNegativeMargin ? 'text-warning' : 'text-success'
                          }`}
                        >
                          {p.marginPct.toFixed(1)}%
                          {isNegativeMargin && <AlertTriangle size={13} />}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 font-data ${
                          p.netProfit < 0 ? 'text-danger' : 'text-text-primary'
                        }`}
                      >
                        {currency(p.netProfit)}
                      </td>
                      <td className="px-6 py-4 font-data text-text-secondary">
                        {currency(p.breakEvenPrice)}
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

function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bg-elevated text-text-muted">
        <PackageSearch size={20} />
      </div>
      <p className="mb-1 font-medium text-text-primary">{t('products.empty.title')}</p>
      <p className="mb-5 max-w-xs text-sm text-text-muted">{t('products.empty.subtitle')}</p>
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold
          text-accent-foreground transition-colors hover:bg-accent-hover"
      >
        <Plus size={16} />
        {t('products.empty.cta')}
      </button>
    </div>
  );
}

