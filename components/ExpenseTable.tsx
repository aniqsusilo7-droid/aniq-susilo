
import React from 'react';
import { FinanceItem } from '../types';
import { Plus, Trash2, X, Layers, ChevronRight } from 'lucide-react';

interface ExpenseTableProps {
  items: FinanceItem[];
  categories: string[];
  onUpdate: (id: string, field: 'budget' | 'actual', value: number) => void;
  onAddItem: (category: string) => void;
  onRemoveItem: (id: string) => void;
  onRemoveCategory: (category: string) => void;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({ 
  items, 
  categories, 
  onUpdate, 
  onAddItem, 
  onRemoveItem,
  onRemoveCategory 
}) => {
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const categoryItems = items.filter(item => item.category === category);
        const categoryTotalBudget = categoryItems.reduce((sum, item) => sum + item.budget, 0);
        const categoryTotalActual = categoryItems.reduce((sum, item) => sum + item.actual, 0);
        const usageRatio = categoryTotalBudget > 0 ? categoryTotalActual / categoryTotalBudget : 0;
        const isDanger = usageRatio > 1.0;

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Layers size={16} className={isDanger ? 'text-rose-500' : 'text-indigo-400'} />
                <h3 className="font-black text-slate-100 uppercase tracking-tight text-sm">{category}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onAddItem(category)}
                  className="p-1.5 bg-slate-800 text-indigo-400 rounded-lg border border-slate-700 active:bg-slate-700"
                >
                  <Plus size={16} />
                </button>
                <button 
                  onClick={() => onRemoveCategory(category)}
                  className="p-1.5 text-slate-600 active:text-rose-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {categoryItems.map((item) => {
                const itemRatio = item.budget > 0 ? item.actual / item.budget : 0;
                return (
                  <div key={item.id} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        defaultValue={item.name}
                        onBlur={(e) => { item.name = e.target.value; }}
                        className="bg-transparent border-none focus:ring-0 font-bold text-slate-200 text-sm flex-1"
                      />
                      <button onClick={() => onRemoveItem(item.id)} className="text-slate-600 p-1">
                        <X size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Anggaran</label>
                        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5">
                          <span className="text-[9px] text-slate-600 font-bold">Rp</span>
                          <input
                            type="number"
                            value={item.budget}
                            onChange={(e) => onUpdate(item.id, 'budget', Number(e.target.value))}
                            className="w-full bg-transparent border-none outline-none font-black text-xs text-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Realisasi</label>
                        <div className={`flex items-center gap-1 border rounded-xl px-2 py-1.5 ${itemRatio > 1 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-900 border-slate-800'}`}>
                          <span className="text-[9px] text-slate-600 font-bold">Rp</span>
                          <input
                            type="number"
                            value={item.actual}
                            onChange={(e) => onUpdate(item.id, 'actual', Number(e.target.value))}
                            className={`w-full bg-transparent border-none outline-none font-black text-xs ${itemRatio > 1 ? 'text-rose-400' : 'text-indigo-400'}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-800 rounded-2xl p-4 flex items-center justify-between border border-slate-700/60 shadow-inner">
               <div className="flex flex-col">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Subtotal {category}</span>
                 <span className="text-sm font-black text-white">{formatter.format(categoryTotalActual)}</span>
               </div>
               <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${usageRatio > 1 ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                 {(usageRatio * 100).toFixed(0)}% Digunakan
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExpenseTable;
