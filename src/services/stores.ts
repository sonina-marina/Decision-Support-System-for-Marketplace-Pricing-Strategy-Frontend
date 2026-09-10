import { apiRequest } from './api/httpClient';
import type { StoreCreate, StoreUpdate, StoreView } from '../types/store';

interface StoreList {
  count: number;
  items: StoreView[];
}

export const storesService = {
  getById: (id: number) => apiRequest<StoreView>('/api/v1/stores/', { query: { id } }),

  getAll: () => apiRequest<StoreList>('/api/v1/stores/all'),

  getByUser: (userId: number) =>
    apiRequest<StoreList>('/api/v1/stores/by_user', { query: { id: userId } }),

  create: (data: StoreCreate) =>
    apiRequest<StoreView>('/api/v1/stores/', { method: 'POST', body: data }),

  update: (data: StoreUpdate) =>
    apiRequest<StoreView>('/api/v1/stores/', { method: 'PUT', body: data }),

  delete: (id: number) =>
    apiRequest<void>('/api/v1/stores/', { method: 'DELETE', query: { id } }),
};
