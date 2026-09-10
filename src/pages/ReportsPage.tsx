import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import ExcelJS from 'exceljs';

import { useAuth } from '../context/AuthContext';
import { storesService } from '../services/stores';
import { productsService } from '../services/products';

import type { StoreView } from '../types/store';
import type { ProductDetailedView } from '../types/product';


interface ReportProduct extends ProductDetailedView {
  storeName: string;
  latestMetrics: ProductDetailedView['metrics'][number] | null;
}


export default function ReportsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [stores, setStores] = useState<StoreView[]>([]);
  const [selectedStoreIds, setSelectedStoreIds] = useState<number[]>([]);

  const [products, setProducts] = useState<ReportProduct[]>([]);

  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function loadStores() {
      if (!user) return;

      setLoadingStores(true);

      try {
        const response = await storesService.getByUser(user.id);
        setStores(response.items);

        // По умолчанию выбираем все магазины
        setSelectedStoreIds(response.items.map((store) => store.id));
      } finally {
        setLoadingStores(false);
      }
    }

    loadStores();
  }, [user]);


  useEffect(() => {
    async function loadProducts() {
      if (selectedStoreIds.length === 0) {
        setProducts([]);
        return;
      }

      setLoadingProducts(true);

      try {
        const productsByStore = await Promise.all(
          selectedStoreIds.map(async (storeId) => {
            const store = stores.find((s) => s.id === storeId);

            if (!store) return [];

            const response = await productsService.getByStore(storeId);

            const detailedProducts = await Promise.all(
              response.items.map(async (product) => {
                const detailed = await productsService.getWithMetrics(product.id);

                const latestMetrics =
                  detailed.metrics.length > 0
                    ? [...detailed.metrics].sort(
                        (a, b) =>
                          new Date(b.calculatedAt).getTime() -
                          new Date(a.calculatedAt).getTime()
                      )[0]
                    : null;

                return {
                  ...detailed,
                  storeName: store.name,
                  latestMetrics,
                };
              })
            );

            return detailedProducts;
          })
        );

        setProducts(productsByStore.flat());
      } finally {
        setLoadingProducts(false);
      }
    }

    loadProducts();
  }, [selectedStoreIds, stores]);


  const toggleStore = (storeId: number) => {
    setSelectedStoreIds((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId]
    );
  };


  const selectAllStores = () => {
    setSelectedStoreIds(stores.map((store) => store.id));
  };


  const clearStores = () => {
    setSelectedStoreIds([]);
  };


  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '—';

    return new Intl.NumberFormat('ru-RU', {
      maximumFractionDigits: 2,
    }).format(value);
  };


  const formatPercent = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '—';

    return `${(value * 100).toFixed(1)}%`;
  };


  const formatCurrency = (
    value: number | null | undefined,
    currency: string
  ) => {
    if (value === null || value === undefined) return '—';

    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  };


  const getLogisticsCost = (product: ReportProduct) => {
    return (
      product.inboundLogistic +
      product.directLogistic +
      product.reverseLogistic
    );
  };


  const getReturnCount = (product: ReportProduct) => {
    return Math.round(product.sales * product.returnRate / 100);
  };


  const hasNegativeMetrics = (product: ReportProduct) => {
    if (!product.latestMetrics) return false;

    return (
      product.latestMetrics.cm < 0 ||
      product.latestMetrics.productRoi < 0
    );
  };


  const selectedStoreNames = useMemo(
    () =>
      stores
        .filter((store) => selectedStoreIds.includes(store.id))
        .map((store) => store.name),
    [stores, selectedStoreIds]
  );


  async function exportToExcel() {
    if (products.length === 0) return;

    setExporting(true);

    try {
      const workbook = new ExcelJS.Workbook();

      workbook.creator = 'Unit Economics';
      workbook.created = new Date();

      // Группируем товары по магазинам
      const productsByStore = products.reduce<Record<string, ReportProduct[]>>(
        (acc, product) => {
          if (!acc[product.storeName]) {
            acc[product.storeName] = [];
          }

          acc[product.storeName].push(product);

          return acc;
        },
        {}
      );


      for (const [storeName, storeProducts] of Object.entries(productsByStore)) {
        const worksheet = workbook.addWorksheet(
          storeName.substring(0, 31)
        );

        worksheet.mergeCells('A1:AE1');
        worksheet.getCell('A1').value = t('reports.excel.storeName');
        worksheet.getCell('B1').value = storeName;

        worksheet.mergeCells('A2:AE2');
        worksheet.getCell('A2').value = t('reports.excel.productsCount');
        worksheet.getCell('B2').value = storeProducts.length;


        const headers = [
          t('reports.columns.itemNumber'),
          t('reports.columns.store'),
          t('reports.columns.name'),
          t('reports.columns.category'),
          t('reports.columns.price'),
          t('reports.columns.cogs'),
          t('reports.columns.sales'),
          t('reports.columns.buyers'),
          t('reports.columns.views'),
          t('reports.columns.targetActions'),
          t('reports.columns.adCosts'),
          t('reports.columns.commission'),
          t('reports.columns.logistics'),
          t('reports.columns.tax'),
          t('reports.columns.stock'),
          t('reports.columns.acquiring'),
          t('reports.columns.inboundLogistic'),
          t('reports.columns.directLogistic'),
          t('reports.columns.avgPackaging'),
          t('reports.columns.avgStorage'),
          t('reports.columns.reverseLogistic'),
          t('reports.columns.returns'),
          t('reports.columns.defectRate'),
          '',
          t('reports.columns.conversion'),
          t('reports.columns.cac'),
          t('reports.columns.cpa'),
          t('reports.columns.ltc'),
          t('reports.columns.cm'),
          t('reports.columns.ltv'),
          t('reports.columns.roi'),
        ];


        const headerRow = worksheet.addRow(headers);

        headerRow.eachCell((cell) => {
          cell.font = {
            bold: true,
          };

          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
          };

          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
          };
        });


        storeProducts.forEach((product) => {
          const metrics = product.latestMetrics;

          const row = worksheet.addRow([
            product.itemNumber,
            product.storeName,
            product.name,
            product.category,
            product.price,
            product.cogs,
            product.sales,
            product.buyers,
            product.views,
            product.targetActions,
            product.adCosts,
            product.commission,
            getLogisticsCost(product),
            product.tax,
            '',
            product.acquiring,
            product.inboundLogistic,
            product.directLogistic,
            product.avgPackaging,
            product.avgStorage,
            product.reverseLogistic,
            getReturnCount(product),
            product.defectRate,
            '',
            metrics ? metrics.conversion : '',
            metrics ? metrics.cac : '',
            metrics ? metrics.requiredCpa : '',
            metrics ? metrics.ltc : '',
            metrics ? metrics.cm : '',
            metrics ? metrics.ltv : '',
            metrics ? metrics.productRoi : '',
          ]);


          row.eachCell((cell) => {
            cell.border = {
              bottom: { style: 'hair' },
            };
          });


          // Отрицательные CM и ROI выделяем красным
          if (metrics?.cm !== undefined && metrics.cm < 0) {
            const cell = row.getCell(29);

            cell.font = {
              bold: true,
              color: {
                argb: 'FFDC2626',
              },
            };

            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: {
                argb: 'FFFEE2E2',
              },
            };
          }


          if (
            metrics?.productRoi !== undefined &&
            metrics.productRoi < 0
          ) {
            const cell = row.getCell(31);

            cell.font = {
              bold: true,
              color: {
                argb: 'FFDC2626',
              },
            };

            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: {
                argb: 'FFFEE2E2',
              },
            };
          }
        });


        worksheet.freezePanes = {
          xSplit: 0,
          ySplit: 3,
        };


        worksheet.autoFilter = {
          from: {
            row: 3,
            column: 1,
          },
          to: {
            row: 3 + storeProducts.length,
            column: headers.length,
          },
        };


        worksheet.columns.forEach((column) => {
          let maxLength = 10;

          column.eachCell({ includeEmpty: false }, (cell) => {
            const length = String(cell.value ?? '').length;

            if (length > maxLength) {
              maxLength = length;
            }
          });

          column.width = Math.min(maxLength + 2, 30);
        });


        // Формат процентов
        storeProducts.forEach((_, index) => {
          const rowNumber = index + 4;

          worksheet.getCell(rowNumber, 23).numFmt = '0.0%';
          worksheet.getCell(rowNumber, 25).numFmt = '0.0%';
          worksheet.getCell(rowNumber, 31).numFmt = '0.0%';
        });
      }


      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;

      const date = new Date().toISOString().slice(0, 10);

      link.download = `unit-economics-report-${date}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }


  return (
    <div className="max-w-7xl">
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">
          {t('titles.reports')}
        </h1>

        <p className="mt-1 text-sm text-text-muted">
          {t('reports.subtitle')}
        </p>
      </div>


      {/* Выбор магазинов */}
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-text-primary">
              {t('reports.selectStores')}
            </h2>

            <p className="mt-1 text-xs text-text-muted">
              {t('reports.selectStoresHint')}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAllStores}
              className="rounded-lg px-3 py-2 text-xs text-accent hover:bg-accent/10"
            >
              {t('reports.selectAll')}
            </button>

            <button
              type="button"
              onClick={clearStores}
              className="rounded-lg px-3 py-2 text-xs text-text-muted hover:bg-background"
            >
              {t('reports.clear')}
            </button>
          </div>
        </div>


        {loadingStores ? (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Loader2 size={16} className="animate-spin" />
            {t('common.loading')}
          </div>
        ) : stores.length === 0 ? (
          <p className="text-sm text-text-muted">
            {t('reports.noStores')}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => {
              const checked = selectedStoreIds.includes(store.id);

              return (
                <label
                  key={store.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                    checked
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:bg-background'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleStore(store.id)}
                    className="h-4 w-4 accent-accent"
                  />

                  <div className="truncate text-sm font-medium text-text-primary">
                    {store.name}
                  </div>

                </label>
              );
            })}
          </div>
        )}
      </div>


      {/* Результат */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-accent" />

            <div>
              <h2 className="font-semibold text-text-primary">
                {t('reports.preview')}
              </h2>

              <p className="text-xs text-text-muted">
                {selectedStoreNames.length > 0
                  ? selectedStoreNames.join(', ')
                  : t('reports.noStoresSelected')}
              </p>
            </div>
          </div>


          <button
            type="button"
            onClick={exportToExcel}
            disabled={
              exporting ||
              loadingProducts ||
              products.length === 0
            }
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white
              transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}

            {exporting
              ? t('reports.exporting')
              : t('reports.exportExcel')}
          </button>
        </div>


        {loadingProducts ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Loader2 size={18} className="animate-spin" />
              {t('reports.loadingProducts')}
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center text-sm text-text-muted">
            {t('reports.noProducts')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-left">
                  <th className="px-3 py-3 font-medium text-text-muted">
                    {t('reports.columns.itemNumber')}
                  </th>

                  <th className="px-3 py-3 font-medium text-text-muted">
                    {t('reports.columns.store')}
                  </th>

                  <th className="px-3 py-3 font-medium text-text-muted">
                    {t('reports.columns.name')}
                  </th>

                  <th className="px-3 py-3 text-right font-medium text-text-muted">
                    {t('reports.columns.price')}
                  </th>

                  <th className="px-3 py-3 text-right font-medium text-text-muted">
                    {t('reports.columns.sales')}
                  </th>

                  <th className="px-3 py-3 text-right font-medium text-text-muted">
                    {t('reports.columns.conversion')}
                  </th>

                  <th className="px-3 py-3 text-right font-medium text-text-muted">
                    {t('reports.columns.cac')}
                  </th>

                  <th className="px-3 py-3 text-right font-medium text-text-muted">
                    {t('reports.columns.cm')}
                  </th>

                  <th className="px-3 py-3 text-right font-medium text-text-muted">
                    {t('reports.columns.ltv')}
                  </th>

                  <th className="px-3 py-3 text-right font-medium text-text-muted">
                    {t('reports.columns.roi')}
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const metrics = product.latestMetrics;

                  const negative =
                    metrics &&
                    (metrics.cm < 0 || metrics.productRoi < 0);

                  return (
                    <tr
                      key={product.id}
                      className={`border-b border-border-subtle last:border-0 ${
                        negative ? 'bg-danger/5' : ''
                      }`}
                    >
                      <td className="px-3 py-3 text-text-primary">
                        {product.itemNumber}
                      </td>

                      <td className="px-3 py-3 text-text-muted">
                        {product.storeName}
                      </td>

                      <td className="max-w-[260px] truncate px-3 py-3 text-text-primary">
                        {product.name}
                      </td>

                      <td className="px-3 py-3 text-right text-text-primary">
                        {formatCurrency(
                          product.price,
                          product.currency
                        )}
                      </td>

                      <td className="px-3 py-3 text-right text-text-primary">
                        {formatNumber(product.sales)}
                      </td>

                      <td className="px-3 py-3 text-right text-text-primary">
                        {metrics
                          ? formatPercent(metrics.conversion)
                          : '—'}
                      </td>

                      <td className="px-3 py-3 text-right text-text-primary">
                        {metrics
                          ? formatCurrency(
                              metrics.cac,
                              product.currency
                            )
                          : '—'}
                      </td>

                      <td
                        className={`px-3 py-3 text-right font-medium ${
                          metrics && metrics.cm < 0
                            ? 'text-danger'
                            : 'text-text-primary'
                        }`}
                      >
                        {metrics
                          ? formatCurrency(
                              metrics.cm,
                              product.currency
                            )
                          : '—'}
                      </td>

                      <td className="px-3 py-3 text-right text-text-primary">
                        {metrics
                          ? formatCurrency(
                              metrics.ltv,
                              product.currency
                            )
                          : '—'}
                      </td>

                      <td
                        className={`px-3 py-3 text-right font-medium ${
                          metrics && metrics.productRoi < 0
                            ? 'text-danger'
                            : 'text-text-primary'
                        }`}
                      >
                        {metrics
                          ? `${metrics.productRoi.toFixed(1)}%`
                          : '—'}
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
