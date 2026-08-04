import type { ProductView } from './product';

/** Соответствует StoreView — приходит со списком товаров вложенным */
export interface StoreView {
  id: number;
  name: string;
  products: ProductView[];
}

/** Соответствует StoreCreate — тело запроса POST /api/v1/stores/ */
export interface StoreCreate {
  userId: number;
  name: string;
}

/** Соответствует StoreUpdate — тело запроса PUT /api/v1/stores/ */
export interface StoreUpdate {
  id: number;
  name: string;
}
