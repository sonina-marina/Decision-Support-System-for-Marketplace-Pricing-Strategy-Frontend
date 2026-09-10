import { apiRequest } from './api/httpClient';
import type { ProductCalculationData } from '../types/product';

interface MetricsView {
  id: number;
  conversion: number;
  cac: number;
  requiredCpa: number;
  ltc: number;
  cm: number;
  ltv: number;
  productRoi: number;
  calculatedAt: string;
}

interface MetricsList {
  count: number;
  items: MetricsView[];
}

export const metricsService = {
  /** Считает и СОХРАНЯЕТ метрику для товара, который уже есть в базе. */
  calculateForProduct: (productId: number) =>
    apiRequest<MetricsView>('/api/v1/metrics/', { method: 'POST', query: { id: productId } }),

  /**
   * Считает метрику для "своего" набора цифр, без привязки к товару в базе.
   * Именно этот эндпоинт нужен для калькулятора с ручным вводом.
   */
  calculateCustom: (data: ProductCalculationData) =>
    apiRequest<MetricsView>('/api/v1/metrics/custom', { method: 'POST', body: data }),

  getById: (id: number) => apiRequest<MetricsView>('/api/v1/metrics/', { query: { id } }),

  getHistoryByProduct: (productId: number) =>
    apiRequest<MetricsList>('/api/v1/metrics/by_product', { query: { id: productId } }),
};
