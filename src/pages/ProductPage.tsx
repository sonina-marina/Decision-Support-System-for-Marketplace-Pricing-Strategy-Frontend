import { useEffect, useState, type ReactNode } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Pencil, ChevronDown, TrendingUp, Info } from 'lucide-react';
import { productsService } from '../services/products';
import { metricsService } from '../services/metrics';
import { MetricCalculator } from '../utils/unitEconomicCalculator';
import type { ProductDetailedView, MetricsView } from '../types/product';
import { AddProductModal } from '../components/products/AddProductModal';
import { formatCurrency } from '../utils/currency';
const percent = (n: number) => `${n.toFixed(1)}%`;
const dateTime = (iso: string) => new Date(iso).toLocaleString();

function getMissingFieldsForCalculation(
  product: ProductDetailedView,
  t: (key: string) => string
): string[] {
  const missing: string[] = [];
  if (product.views <= 0) missing.push(t('products.productForm.views'));
  if (product.buyers <= 0) missing.push(t('products.productForm.buyers'));
  if (product.targetActions <= 0) missing.push(t('products.productForm.targetActions'));

  let ltc = 0;
  try {
    ltc = MetricCalculator.calculateLtc(product);
  } catch {
  }
  if (ltc <= 0) missing.push(t('products.productPage.costsLabel'));

  return missing;
}

type MetricStatus = 'below' | 'normal' | 'above' | null;

/** CM ниже нуля — товар в убытке на уровне продажи. Верхней границы нет — прибыль не бывает "слишком высокой". */
function getCmStatus(cm: number): MetricStatus {
  return cm < 0 ? 'below' : 'normal';
}

/**
 * LTV:CAC — единственная пара с сопоставимой размерностью ("на одного покупателя").
 * < 1 — реклама не окупается (кассовый разрыв); 1–5 — здоровый диапазон (включает точку
 * безубыточности и "золотой стандарт" 3:1 из статьи); > 5 — либо мало конкурентов,
 * либо недовкладываетесь в рекламу.
 */
function getLtvStatus(ltv: number, cac: number): MetricStatus {
  if (cac <= 0) return null; // не с чем сравнивать
  const ratio = ltv / cac;
  if (ratio < 1) return 'below';
  if (ratio > 5) return 'above';
  return 'normal';
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [product, setProduct] = useState<ProductDetailedView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  async function loadProduct() {
    setLoading(true);
    try {
      const data = await productsService.getWithMetrics(productId);
      setProduct(data);
      setError(null);
    } catch {
      setError(t('products.productPage.loadError'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isNaN(productId)) loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function handleCalculate() {
    setCalculating(true);
    try {
      await metricsService.calculateForProduct(productId);
      await loadProduct();
    } catch {
      setError(t('products.productPage.calculateError'));
    } finally {
      setCalculating(false);
    }
  }

  if (loading) return <p className="text-text-muted">{t('common.loading')}</p>;
  if (error && !product) return <p className="text-danger">{error}</p>;
  if (!product) return null;

  const sortedMetrics = [...product.metrics].sort(
    (a, b) => new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime()
  );
  const latestMetrics: MetricsView | undefined = sortedMetrics[0];
  const missingFields = getMissingFieldsForCalculation(product, t);
  const canCalculate = missingFields.length === 0;

  return (
    <div className="max-w-6xl">
      <button
        type="button"
        onClick={() => navigate('/products')}
        className="mb-4 flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft size={15} />
        {t('products.productPage.back')}
      </button>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{product.name}</h1>
          <p className="mt-1 font-data text-sm text-text-muted">
            {product.category} · {t('stores.table.itemNumber')} {product.itemNumber}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm
            text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
        >
          <Pencil size={15} />
          {t('products.productPage.edit')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[7fr_5fr]">
        {/* Левая колонка — характеристики товара, теперь уже */}
        <div className="rounded-xl border border-border bg-card p-5">
          <SectionHeading>{t('products.productPage.section.pricing')}</SectionHeading>
          <TwoColumnList>
            <DetailRow label={t('products.productForm.price')} value={formatCurrency(product.price, product.currency)} />
            <DetailRow label={t('products.productForm.cogs')} value={formatCurrency(product.cogs, product.currency)} />
            <DetailRow label={t('products.productForm.commission')} value={`${product.commission}%`} />
            <DetailRow label={t('products.productForm.acquiring')} value={`${product.acquiring}%`} />
            <DetailRow label={t('products.productForm.tax')} value={`${product.tax}%`} />
          </TwoColumnList>

          <SectionHeading>{t('products.productPage.section.funnel')}</SectionHeading>
          <TwoColumnList>
            <DetailRow label={t('products.productForm.views')} value={String(product.views)} />
            <DetailRow label={t('products.productForm.targetActions')} value={String(product.targetActions)} />
            <DetailRow label={t('products.productForm.buyers')} value={String(product.buyers)} />
            <DetailRow label={t('products.productForm.adCosts')} value={formatCurrency(product.adCosts, product.currency)} />
            <DetailRow label={t('products.productForm.sales')} value={String(product.sales)} />
          </TwoColumnList>

          <SectionHeading>{t('products.productPage.section.logistics')}</SectionHeading>
          <TwoColumnList>
            <DetailRow label={t('products.productForm.inboundLogistic')} value={formatCurrency(product.inboundLogistic, product.currency)} />
            <DetailRow label={t('products.productForm.directLogistic')} value={formatCurrency(product.directLogistic, product.currency)} />
            <DetailRow label={t('products.productForm.reverseLogistic')} value={formatCurrency(product.reverseLogistic, product.currency)} />
            <DetailRow label={t('products.productForm.returnRate')} value={`${product.returnRate}%`} />
            <DetailRow label={t('products.productForm.defectRate')} value={`${product.defectRate}%`} />
            <DetailRow label={t('products.productForm.avgStorage')} value={formatCurrency(product.avgStorage, product.currency)} />
            <DetailRow label={t('products.productForm.avgPackaging')} value={formatCurrency(product.avgPackaging, product.currency)} />
          </TwoColumnList>
        </div>

        {/* Правая колонка — расчёт + результат с описаниями */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 font-semibold text-text-primary">{t('products.productPage.metrics')}</h2>

          <div className="mb-4 flex items-center gap-2">
            <button
              type="button"
              onClick={handleCalculate}
              disabled={calculating || !canCalculate}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5
                text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover
                disabled:cursor-not-allowed disabled:bg-border disabled:text-text-muted disabled:hover:bg-border"
            >
              <TrendingUp size={15} />
              {calculating ? t('common.loading') : t('products.productPage.calculate')}
            </button>

            {!canCalculate && (
              <InfoTooltip text={`${t('products.productPage.missingFieldsHint')}: ${missingFields.join(', ')}`} />
            )}
          </div>

          {error && <p className="mb-3 text-sm text-danger">{error}</p>}

          {!latestMetrics ? (
            <p className="text-sm text-text-muted">{t('products.productPage.noMetrics')}</p>
          ) : (
            <div className="flex flex-col">
              <MetricRow
                label={t('products.productPage.metricsFields.conversion')}
                description={t('products.productPage.metricsShortDesc.conversion')}
                value={percent(latestMetrics.conversion * 100)}
              />
              <MetricRow
                label={t('products.productPage.metricsFields.cac')}
                description={t('products.productPage.metricsShortDesc.cac')}
                value={formatCurrency(latestMetrics.cac, product.currency)}
              />
              <MetricRow
                label={t('products.productPage.metricsFields.requiredCpa')}
                description={t('products.productPage.metricsShortDesc.requiredCpa')}
                value={formatCurrency(latestMetrics.requiredCpa, product.currency)}
              />
              <MetricRow
                label={t('products.productPage.metricsFields.ltc')}
                description={t('products.productPage.metricsShortDesc.ltc')}
                value={formatCurrency(latestMetrics.ltc, product.currency)}
              />
              <MetricRow
                label={t('products.productPage.metricsFields.cm')}
                description={t('products.productPage.metricsShortDesc.cm')}
                value={formatCurrency(latestMetrics.cm, product.currency)}
                valueClassName={latestMetrics.cm >= 0 ? 'text-success' : 'text-danger'}
                status={getCmStatus(latestMetrics.cm)}
                metricKey="cm"
              />
              <MetricRow
                label={t('products.productPage.metricsFields.ltv')}
                description={t('products.productPage.metricsShortDesc.ltv')}
                value={formatCurrency(latestMetrics.ltv, product.currency)}
                status={getLtvStatus(latestMetrics.ltv, latestMetrics.cac)}
                metricKey="ltv"
              />
              <MetricRow
                label={t('products.productPage.metricsFields.productRoi')}
                description={t('products.productPage.metricsShortDesc.productRoi')}
                value={percent(latestMetrics.productRoi)}
                valueClassName={latestMetrics.productRoi >= 0 ? 'text-success' : 'text-danger'}
              />
            </div>
          )}
        </div>
      </div>

      {/* История */}
      {sortedMetrics.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-card">
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <span className="font-medium text-text-primary">
              {t('products.productPage.history')} ({sortedMetrics.length})
            </span>
            <ChevronDown
              size={18}
              className={`text-text-muted transition-transform ${historyOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {historyOpen && (
            <div className="overflow-x-auto border-t border-border">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-left text-text-muted">
                    <th className="px-5 py-3 font-normal">{t('products.productPage.history')}</th>
                    <th className="px-5 py-3 font-normal">{t('products.productPage.metricsFields.conversion')}</th>
                    <th className="px-5 py-3 font-normal">{t('products.productPage.metricsFields.cac')}</th>
                    <th className="px-5 py-3 font-normal">{t('products.productPage.metricsFields.ltc')}</th>
                    <th className="px-5 py-3 font-normal">{t('products.productPage.metricsFields.cm')}</th>
                    <th className="px-5 py-3 font-normal">{t('products.productPage.metricsFields.ltv')}</th>
                    <th className="px-5 py-3 font-normal">{t('products.productPage.metricsFields.productRoi')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMetrics.map((m) => (
                    <tr key={m.id} className="border-t border-border-subtle">
                      <td className="whitespace-nowrap px-5 py-3 font-data text-text-muted">
                        {dateTime(m.calculatedAt)}
                      </td>
                      <td className="px-5 py-3 font-data text-text-secondary">
                        {percent(m.conversion * 100)}
                      </td>
                      <td className="px-5 py-3 font-data text-text-secondary">{formatCurrency(m.cac, product.currency)}</td>
                      <td className="px-5 py-3 font-data text-text-secondary">{formatCurrency(m.ltc, product.currency)}</td>
                      <td
                        className={`px-5 py-3 font-data ${m.cm >= 0 ? 'text-success' : 'text-danger'}`}
                      >
                        {formatCurrency(m.cm, product.currency)}
                      </td>
                      <td className="px-5 py-3 font-data text-text-secondary">{formatCurrency(m.ltv, product.currency)}</td>
                      <td
                        className={`px-5 py-3 font-data ${m.productRoi >= 0 ? 'text-success' : 'text-danger'}`}
                      >
                        {percent(m.productRoi)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {isEditing && (
        <AddProductModal
          storeId={product.storeId}
          editingProduct={product}
          onClose={() => setIsEditing(false)}
          onCreated={loadProduct}
        />
      )}
    </div>
  );
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <div className="group relative shrink-0">
      <div
        tabIndex={0}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border
          text-text-muted transition-colors hover:text-text-primary focus:outline-none"
      >
        <Info size={16} />
      </div>
      <div
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-10 mt-2 w-64 rounded-lg border border-border
          bg-bg-elevated px-3 py-2 text-xs text-text-secondary opacity-0 shadow-card transition-opacity
          group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {text}
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 mt-4 text-xs font-medium uppercase tracking-wide text-text-muted first:mt-0">
      {children}
    </p>
  );
}

function TwoColumnList({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">{children}</div>;
}

function MetricRow({
  label,
  description,
  value,
  valueClassName = 'text-text-primary',
  status,
  metricKey,
}: {
  label: string;
  description: string;
  value: string;
  valueClassName?: string;
  status?: MetricStatus;
  metricKey?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border-subtle py-3 text-sm last:border-0">
      <div className="min-w-0">
        <p className="text-text-primary">{label}</p>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
    <div className="flex shrink-0 items-center gap-3">
      {status && metricKey && <StatusBadge status={status} metricKey={metricKey} />}
      <span className={`font-data ${valueClassName}`}>{value}</span>
    </div>
    </div>
  );
}

function StatusBadge({ status, metricKey }: { status: MetricStatus; metricKey: string }) {
  const { t } = useTranslation();
  if (!status) return null;

  const colorClass =
    status === 'below'
      ? 'border-danger/30 bg-danger/10 text-danger'
      : status === 'above'
        ? 'border-warning/30 bg-warning/10 text-warning'
        : 'border-success/30 bg-success/10 text-success';

  const badge = (
    <span className={`inline-block whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium ${colorClass}`}>
      {t(`products.productPage.status.${status}`)}
    </span>
  );

  if (status === 'normal') return badge;

  return (
    <Link to={`/help/metrics/${metricKey}/${status}`} className="transition-opacity hover:opacity-80">
      {badge}
    </Link>
  );
}

function DetailRow({
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

