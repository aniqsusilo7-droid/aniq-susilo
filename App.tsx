
import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_ITEMS } from './constants';
import { DEFAULT_CATEGORIES, FinanceItem, MonthlyBudget } from './types';
import SummaryCards from './components/SummaryCards';
import ExpenseTable from './components/ExpenseTable';
import FinancialCharts from './components/FinancialCharts';
import AIAssistant from './components/AIAssistant';
import CloudSync from './components/CloudSync';
import AlertBanner from './components/AlertBanner';
import YearlyView from './components/YearlyView';
import PWAInstaller from './components/PWAInstaller';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  LayoutDashboard,
  BarChart3,
  Calendar,
  Database,
  ShieldCheck,
  BrainCircuit
} from 'lucide-react';

const App: React.FC = () => {
  const getCurrentMonthKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());
  const [allMonthsData, setAllMonthsData] = useState<Record<string, MonthlyBudget>>({});
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'charts' | 'yearly' | 'data'>('dashboard');

  const selectedYear = useMemo(() => selectedMonth.split('-')[0], [selectedMonth]);

  useEffect(() => {
    const saved = localStorage.getItem('arthaku_master_data');
    if (saved) {
      try {
        setAllMonthsData(JSON.parse(saved));
      } catch (e) {
        console.error("Gagal memuat data master");
      }
    }
  }, []);

  useEffect(() => {
    if (Object.keys(allMonthsData).length > 0) {
      localStorage.setItem('arthaku_master_data', JSON.stringify(allMonthsData));
    }
  }, [allMonthsData]);

  useEffect(() => {
    if (!allMonthsData[selectedMonth]) {
      const sortedMonths = Object.keys(allMonthsData).sort().reverse();
      const lastMonthKey = sortedMonths.find(m => m < selectedMonth) || sortedMonths[0];
      const [y] = selectedMonth.split('-');
      
      let newData: MonthlyBudget;
      if (lastMonthKey && allMonthsData[lastMonthKey]) {
        const lastData = allMonthsData[lastMonthKey];
        newData = {
          income: lastData.income,
          categories: [...lastData.categories],
          items: lastData.items.map(item => ({ ...item, actual: 0 })),
          year: y
        };
      } else {
        newData = {
          income: 15000000,
          items: INITIAL_ITEMS,
          categories: DEFAULT_CATEGORIES,
          year: y
        };
      }
      setAllMonthsData(prev => ({ ...prev, [selectedMonth]: newData }));
      setDismissedAlerts(new Set()); 
    }
  }, [selectedMonth, allMonthsData]);

  const currentData = useMemo(() => {
    return allMonthsData[selectedMonth] || { income: 0, items: [], categories: [], year: selectedYear };
  }, [selectedMonth, allMonthsData, selectedYear]);

  const activeAlerts = useMemo(() => {
    return currentData.categories
      .map(category => {
        const catItems = currentData.items.filter(item => item.category === category);
        const budget = catItems.reduce((sum, item) => sum + item.budget, 0);
        const actual = catItems.reduce((sum, item) => sum + item.actual, 0);
        const ratio = budget > 0 ? actual / budget : 0;
        if (ratio >= 0.9 && !dismissedAlerts.has(`${selectedMonth}-${category}`)) {
          return { category, ratio, type: ratio >= 1.0 ? ('critical' as const) : ('warning' as const) };
        }
        return null;
      })
      .filter((alert): alert is any => alert !== null);
  }, [currentData, dismissedAlerts, selectedMonth]);

  const updateCurrentMonthData = (newData: Partial<MonthlyBudget>) => {
    setAllMonthsData(prev => ({ ...prev, [selectedMonth]: { ...currentData, ...newData } }));
  };

  const handleUpdateItem = (id: string, field: 'budget' | 'actual', value: number) => {
    const newItems = currentData.items.map(item => item.id === id ? { ...item, [field]: Math.max(0, value) } : item);
    updateCurrentMonthData({ items: newItems });
  };

  const handleAddItem = (category: string) => {
    const name = prompt('Nama pengeluaran baru:');
    if (!name) return;
    const newItem: FinanceItem = { id: `item-${Date.now()}`, name, category, budget: 0, actual: 0 };
    updateCurrentMonthData({ items: [...currentData.items, newItem] });
  };

  const handleRemoveItem = (id: string) => {
    updateCurrentMonthData({ items: currentData.items.filter(item => item.id !== id) });
  };

  const handleAddCategory = () => {
    const categoryName = prompt('Nama kategori baru:');
    if (categoryName && !currentData.categories.includes(categoryName)) {
      updateCurrentMonthData({ categories: [...currentData.categories, categoryName] });
    }
  };

  const handleRemoveCategory = (categoryName: string) => {
    if (confirm(`Hapus kategori "${categoryName}"?`)) {
      updateCurrentMonthData({ 
        categories: currentData.categories.filter(c => c !== categoryName),
        items: currentData.items.filter(item => item.category !== categoryName)
      });
    }
  };

  const totalBudget = currentData.items.reduce((sum, item) => sum + item.budget, 0);
  const totalActual = currentData.items.reduce((sum, item) => sum + item.actual, 0);

  const navigateMonth = (direction: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + direction, 1);
    const newKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newKey);
  };

  const displayMonthName = useMemo(() => {
    const [y, m] = selectedMonth.split('-');
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }, [selectedMonth]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 pb-24">
      {/* AppBar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 h-16 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <h1 className="text-lg font-black tracking-tight text-white uppercase">Aniq<span className="text-indigo-400">Finance</span></h1>
        </div>
        
        <div className="flex items-center bg-slate-800 rounded-full px-2 py-1 border border-slate-700">
          <button onClick={() => navigateMonth(-1)} className="p-1.5 text-slate-400"><ChevronLeft size={18} /></button>
          <span className="text-xs font-bold px-2 text-slate-200">{displayMonthName}</span>
          <button onClick={() => navigateMonth(1)} className="p-1.5 text-slate-400"><ChevronRight size={18} /></button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        <AlertBanner alerts={activeAlerts} onDismiss={(cat) => setDismissedAlerts(prev => new Set(prev).add(`${selectedMonth}-${cat}`))} />

        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700/50">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Penghasilan (THP)</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-500 font-bold">Rp</span>
                <input 
                  type="number"
                  value={currentData.income}
                  onChange={(e) => updateCurrentMonthData({ income: Number(e.target.value) })}
                  className="text-2xl font-black text-white bg-transparent border-none outline-none w-full"
                />
              </div>
            </div>

            <SummaryCards income={currentData.income} totalBudget={totalBudget} totalActual={totalActual} />
            
            <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-4">
                <BrainCircuit size={20} className="text-indigo-400" />
                <h3 className="font-bold text-sm uppercase tracking-wider">AI Analyst</h3>
              </div>
              <AIAssistant budget={currentData} />
            </div>

            <div className="flex items-center justify-between pt-4">
              <h2 className="text-lg font-black text-white tracking-tight uppercase">Daftar Anggaran</h2>
              <button 
                onClick={handleAddCategory}
                className="p-2 bg-indigo-600 rounded-full text-white shadow-lg active:scale-90 transition-transform"
              >
                <Plus size={20} />
              </button>
            </div>

            <ExpenseTable 
              items={currentData.items} 
              categories={currentData.categories}
              onUpdate={handleUpdateItem} 
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              onRemoveCategory={handleRemoveCategory}
            />
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <FinancialCharts items={currentData.items} categories={currentData.categories} />
          </div>
        )}

        {activeTab === 'yearly' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <YearlyView year={selectedYear} allData={allMonthsData} />
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6 animate-in fade-in duration-500 flex flex-col items-center justify-center min-h-[60vh]">
            <CloudSync data={allMonthsData} onDataLoaded={setAllMonthsData} />
            <p className="text-xs text-slate-500 mt-4 text-center font-medium max-w-[200px]">
              Kelola cadangan data Anda di Pusat Data Abadi
            </p>
          </div>
        )}
      </main>

      {/* Bottom Navigation (Android Native Style) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-2 py-2 safe-bottom">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-500'}`}
          >
            <div className={`p-1.5 rounded-full ${activeTab === 'dashboard' ? 'bg-indigo-500/10' : ''}`}>
              <LayoutDashboard size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Beranda</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('charts')}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${activeTab === 'charts' ? 'text-indigo-400' : 'text-slate-500'}`}
          >
            <div className={`p-1.5 rounded-full ${activeTab === 'charts' ? 'bg-indigo-500/10' : ''}`}>
              <BarChart3 size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Grafik</span>
          </button>

          <button 
            onClick={() => setActiveTab('yearly')}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${activeTab === 'yearly' ? 'text-indigo-400' : 'text-slate-500'}`}
          >
            <div className={`p-1.5 rounded-full ${activeTab === 'yearly' ? 'bg-indigo-500/10' : ''}`}>
              <Calendar size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Tahunan</span>
          </button>

          <button 
            onClick={() => setActiveTab('data')}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${activeTab === 'data' ? 'text-indigo-400' : 'text-slate-500'}`}
          >
            <div className={`p-1.5 rounded-full ${activeTab === 'data' ? 'bg-indigo-500/10' : ''}`}>
              <Database size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Data</span>
          </button>
        </div>
      </nav>

      <PWAInstaller />
    </div>
  );
};

export default App;
