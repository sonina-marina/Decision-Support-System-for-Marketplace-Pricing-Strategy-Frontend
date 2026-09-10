import type { UserCreate, UserView } from '../types/user';
import { apiRequest } from './api/httpClient';

export const usersService = {
  getById: (id: number) => apiRequest<UserView>('/api/v1/users/', { query: { id } }),

  create: (data: UserCreate) =>
    apiRequest<UserView>('/api/v1/users/', { method: 'POST', body: data }),
};
