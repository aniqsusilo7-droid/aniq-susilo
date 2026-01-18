
import { CategoryType, FinanceItem } from './types';

export const INITIAL_ITEMS: FinanceItem[] = [
  // Kebutuhan Pokok (16 items)
  { id: '1', name: 'Listrik Rumah 1', category: CategoryType.FIXED_EXPENSE, budget: 500000, actual: 0 },
  { id: '2', name: 'Listrik Rumah 2', category: CategoryType.FIXED_EXPENSE, budget: 350000, actual: 0 },
  { id: '3', name: 'PDAM Rumah 1', category: CategoryType.FIXED_EXPENSE, budget: 150000, actual: 0 },
  { id: '4', name: 'PDAM Rumah 2', category: CategoryType.FIXED_EXPENSE, budget: 100000, actual: 0 },
  { id: '5', name: 'Indihome', category: CategoryType.FIXED_EXPENSE, budget: 450000, actual: 0 },
  { id: '6', name: 'BPJS Kesehatan', category: CategoryType.FIXED_EXPENSE, budget: 150000, actual: 0 },
  { id: '7', name: 'Pasca Bayar Halo', category: CategoryType.FIXED_EXPENSE, budget: 200000, actual: 0 },
  { id: '8', name: 'Gas PGN Rumah 1', category: CategoryType.FIXED_EXPENSE, budget: 100000, actual: 0 },
  { id: '9', name: 'Gas PGN Rumah 2', category: CategoryType.FIXED_EXPENSE, budget: 80000, actual: 0 },
  { id: '10', name: 'Bensin Motor/Mobil', category: CategoryType.FIXED_EXPENSE, budget: 1500000, actual: 0 },
  { id: '11', name: 'Bayar ART', category: CategoryType.FIXED_EXPENSE, budget: 2000000, actual: 0 },
  { id: '12', name: 'Untuk Ibu', category: CategoryType.FIXED_EXPENSE, budget: 1000000, actual: 0 },
  { id: '13', name: 'Untuk Istri', category: CategoryType.FIXED_EXPENSE, budget: 3000000, actual: 0 },
  { id: '14', name: 'Netflix', category: CategoryType.FIXED_EXPENSE, budget: 186000, actual: 0 },
  { id: '15', name: 'YouTube Premium', category: CategoryType.FIXED_EXPENSE, budget: 59000, actual: 0 },
  { id: '16', name: 'Kebutuhan Anak', category: CategoryType.FIXED_EXPENSE, budget: 2000000, actual: 0 },
  
  // Cicilan
  { id: '17', name: 'Cicilan Rumah/Hutang', category: CategoryType.DEBT, budget: 2500000, actual: 0 },
  
  // Tabungan / Investasi
  { id: '18', name: 'Tabungan Masa Tua', category: CategoryType.SAVINGS, budget: 1000000, actual: 0 },
  { id: '19', name: 'Dana Pendidikan Anak', category: CategoryType.SAVINGS, budget: 1000000, actual: 0 },
  
  // Tak Terduga
  { id: '20', name: 'Pengeluaran Tak Terduga', category: CategoryType.UNEXPECTED, budget: 1000000, actual: 0 },
];
