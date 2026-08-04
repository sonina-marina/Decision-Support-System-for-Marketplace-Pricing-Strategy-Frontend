/** Данные для расчёта юнит-экономики — соответствует ProductCalculationData */
export interface ProductCalculationData {
  price: number;
  cogs: number;
  commission: number;
  acquiring: number;
  tax: number;
  views: number;
  targetActions: number;
  buyers: number;
  adCosts: number;
  inboundLogistic: number;
  directLogistic: number;
  reverseLogistic: number;
  returnRate: number;
  defectRate: number;
  avgStorage: number;
  avgPackaging: number;
  sales: number;
}

/** Соответствует ProductCreate — тело запроса POST /api/v1/products/ */
export interface ProductCreate extends ProductCalculationData {
  storeId: number;
  itemNumber: number;
  name: string;
  category: string;
}

/** Соответствует ProductUpdate — тело запроса PUT /api/v1/products/ */
export interface ProductUpdate extends ProductCalculationData {
  id: number;
  name: string;
  category: string;
}

/** Соответствует ProductView — короткая карточка, используется в списках/по магазину */
export interface ProductView {
  id: number;
  itemNumber: number;
  name: string;
  category: string;
  price: number;
}

/** Соответствует ProductDetailedView — GET /api/v1/products/metrics/ */
export interface ProductDetailedView extends ProductCalculationData {
  id: number;
  storeId: number;
  itemNumber: number;
  name: string;
  category: string;
  metrics: MetricsView[];
}

/** Соответствует MetricsView — результат расчёта, приходящий с бэка */
export interface MetricsView {
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

