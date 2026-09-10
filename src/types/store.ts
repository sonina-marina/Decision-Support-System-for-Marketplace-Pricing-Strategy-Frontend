import type { ProductView } from './product';
import type { CurrencyCode } from '../utils/currency';

/** Соответствует StoreView — приходит со списком товаров вложенным */
export interface StoreView {
  id: number;
  name: string;
  currency: CurrencyCode;
  products: ProductView[];
}

/** Соответствует StoreCreate — тело запроса POST /api/v1/stores/ */
export interface StoreCreate {
  userId: number;
  name: string;
  currency: CurrencyCode;
}

/** Соответствует StoreUpdate — тело запроса PUT /api/v1/stores/ */
export interface StoreUpdate {
  id: number;
  name: string;
}
