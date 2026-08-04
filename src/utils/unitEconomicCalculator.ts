import type { ProductCalculationData } from '../types/product';

export interface CalculatedMetrics {
  conversion: number;
  cac: number;
  requiredCpa: number;
  ltc: number;
  cm: number;
  ltv: number;
  productRoi: number;
}

export const MetricCalculator = {
  calculateConversion(product: ProductCalculationData): number {
    if (product.views <= 0) {
      throw new Error('Количество просмотров должно быть больше нуля.');
    }
    return product.targetActions / product.views;
  },

  calculateCac(product: ProductCalculationData): number {
    if (product.buyers <= 0) {
      throw new Error('Количество покупателей должно быть больше нуля.');
    }
    return product.adCosts / product.buyers;
  },

  calculateRequiredCpa(product: ProductCalculationData): number {
    if (product.targetActions <= 0) {
      throw new Error('Количество целевых действий должно быть больше нуля.');
    }
    return product.adCosts / product.targetActions;
  },

  calculateLtc(product: ProductCalculationData): number {
    return (
      product.cogs +
      (product.price * product.commission) / 100 +
      (product.price * product.acquiring) / 100 +
      (product.price * product.tax) / 100 +
      product.inboundLogistic +
      product.directLogistic +
      (product.returnRate / 100) * product.reverseLogistic +
      product.cogs * (product.returnRate / 100) * (product.defectRate / 100) +
      product.avgStorage +
      product.avgPackaging
    );
  },

  calculateCm(product: ProductCalculationData, ltc: number): number {
    return product.price - ltc;
  },

  calculateLtv(product: ProductCalculationData, cm: number): number {
    if (product.buyers <= 0) {
      throw new Error('Количество покупателей должно быть больше нуля.');
    }
    return (cm * product.sales) / product.buyers;
  },

  calculateProductRoi(cm: number, ltc: number): number {
    if (ltc <= 0) {
      throw new Error('Затраты должны быть больше нуля.');
    }
    return (cm / ltc) * 100;
  },

  calculate(product: ProductCalculationData): CalculatedMetrics {
    const conversion = MetricCalculator.calculateConversion(product);
    const cac = MetricCalculator.calculateCac(product);
    const requiredCpa = MetricCalculator.calculateRequiredCpa(product);
    const ltc = MetricCalculator.calculateLtc(product);
    const cm = MetricCalculator.calculateCm(product, ltc);
    const ltv = MetricCalculator.calculateLtv(product, cm);
    const productRoi = MetricCalculator.calculateProductRoi(cm, ltc);

    return { conversion, cac, requiredCpa, ltc, cm, ltv, productRoi };
  },
};

