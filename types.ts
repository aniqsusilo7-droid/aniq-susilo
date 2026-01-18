
// Fix: Defined CategoryType enum to provide missing export needed by constants.ts
export enum CategoryType {
  FIXED_EXPENSE = 'Kebutuhan Pokok',
  DEBT = 'Cicilan / Hutang',
  SAVINGS = 'Tabungan / Investasi',
  UNEXPECTED = 'Lain-lain (Tak Terduga)'
}

export const DEFAULT_CATEGORIES = [
  CategoryType.FIXED_EXPENSE,
  CategoryType.DEBT,
  CategoryType.SAVINGS,
  CategoryType.UNEXPECTED
];

export interface FinanceItem {
  id: string;
  name: string;
  category: string;
  budget: number;
  actual: number;
}

export interface MonthlyBudget {
  income: number;
  items: FinanceItem[];
  categories: string[];
  year: string;
}
