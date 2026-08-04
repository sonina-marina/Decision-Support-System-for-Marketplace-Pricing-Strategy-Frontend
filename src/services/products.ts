import { apiRequest } from './api/httpClient';
import type {
  ProductCreate,
  ProductUpdate,
  ProductView,
  ProductDetailedView,
} from '../types/product';

interface ProductList {
  count: number;
  items: ProductView[];
}

export const productsService = {
  getById: (id: number) => apiRequest<ProductView>('/api/v1/products/', { query: { id } }),

  getAll: () => apiRequest<ProductList>('/api/v1/products/all'),

  getByStore: (storeId: number) =>
    apiRequest<ProductList>('/api/v1/products/by_store', { query: { id: storeId } }),

  /** Товар + история его расчётов метрик */
  getWithMetrics: (id: number) =>
    apiRequest<ProductDetailedView>('/api/v1/products/metrics/', { query: { id } }),

  create: (data: ProductCreate) =>
    apiRequest<ProductView>('/api/v1/products/', { method: 'POST', body: data }),

  update: (data: ProductUpdate) =>
    apiRequest<ProductView>('/api/v1/products/', { method: 'PUT', body: data }),

  delete: (id: number) =>
    apiRequest<void>('/api/v1/products/', { method: 'DELETE', query: { id } }),
};
