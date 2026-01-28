
import React, { useState, useEffect, useRef } from 'react';
import { FinanceItem, CategoryType } from '../types';
import { Plus, Trash2, Layers, ChevronRight, Wallet2 } from 'lucide-react';

const formatInput = (num: number) => {
  if (num === 0) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
const parseInput = (str: string) => Number(str.replace(/[^0-9]/g, ''));

// Komponen Reusable untuk input uang agar tidak "loncat-loncat"
const MoneyInput: React.FC<{
  label: string;
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  className?: string;
  textIndigo?: boolean;
}> = ({ label, value, onChange, placeholder = "0", className = "", textIndigo = false }) => {
  const [localValue, setLocalValue] = useState(formatInput(value));

  // Sinkronisasi saat nilai dari props berubah (misal pindah bulan)
  useEffect(() => {
    setLocalValue(formatInput(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numeric = parseInput(rawValue);
    setLocalValue(formatInput(numeric));
    onChange(numeric);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
        {label}
      </label>
      <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 focus-within:border-indigo-500/50 transition-colors">
        <span className="text-[9px] text-slate-600 font-bold">Rp</span>
        <input
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          value={localValue}
          onChange={handleChange}
          className={`w-full bg-transparent border-none outline-none font-black text-xs placeholder-slate-600 ${textIndigo ? 'text-indigo-400' : 'text-white'}`}
        />
      </div>
    </div>
  );
};

const NewItemForm: React.FC<{
  onSave: (data: { name: string; budget: number; actual: number; }) => void;
  onCancel: () => void;
  isUnexpected: boolean;
}> = ({ onSave, onCancel, isUnexpected }) => {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState(0);
  const [actual, setActual] = useState(0);

  const handleSave = () => {
    if (!name.trim()) {
      alert('Nama item tidak boleh kosong.');
      return;
    }
    onSave({ name, budget, actual });
  };

  return (
    <div className="bg-slate-800 border-2 border-dashed border-indigo-500/30 rounded-2xl p-4 space-y-4 mt-3 animate-in fade-in duration-300">
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nama Item</label>
        <input
          type="text"
          placeholder={isUnexpected ? "Keperluan apa? (Contoh: Bensin Tambahan)..." : "Nama Item Baru..."}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-200 text-sm w-full outline-none focus:border-indigo-500/50"
          autoFocus
        />
      </div>

      <div className={isUnexpected ? "grid grid-cols-1" : "grid grid-cols-2 gap-3"}>
        {!isUnexpected && (
          <MoneyInput 
            label="Anggaran" 
            value={budget} 
            onChange={setBudget} 
            placeholder="Set Budget..." 
          />
        )}
        <MoneyInput 
          label={isUnexpected ? "Nominal Pengeluaran" : "Realisasi Saat Ini"} 
          value={actual} 
          onChange={setActual} 
          placeholder="Sudah terpakai..."
          textIndigo={!isUnexpected}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700/50">
        <button onClick={onCancel} className="px-4 py-2 text-xs font-bold text-slate-400 rounded-lg hover:bg-slate-700 transition-colors">Batal</button>
        <button onClick={handleSave} className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
          Simpan Item
        </button>
      </div>
    </div>
  );
};

interface ExpenseTableProps {
  items: FinanceItem[];
  categories: string[];
  onUpdate: (id: string, field: 'budget' | 'actual' | 'name', value: number | string) => void;
  onRemoveItem: (id: string) => void;
  onRemoveCategory: (category: string) => void;
  addingItemToCategory: string | null;
  onAddItemClick: (category: string) => void;
  onSaveNewItem: (itemData: { name: string; category: string; budget: number; actual: number }) => void;
  onCancelAddItem: () => void;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({ 
  items, 
  categories, 
  onUpdate, 
  onRemoveItem, 
  onRemoveCategory,
  addingItemToCategory,
  onAddItemClick,
  onSaveNewItem,
  onCancelAddItem
}) => {
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [lastUpdatedId, setLastUpdatedId] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(category)) newSet.delete(category);
    else newSet.add(category);
    setExpandedCategories(newSet);
  };

  const handleUpdate = (id: string, field: 'budget' | 'actual' | 'name', value: number | string) => {
    setLastUpdatedId(id);
    onUpdate(id, field, value);
  };

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const isUnexpectedCategory = category === CategoryType.UNEXPECTED;
        
        const masterAllocationItem = items.find(item => item.category === category && item.name === 'ALOKASI UTAMA');
        const categoryItems = items.filter(item => item.category === category && item.name !== 'ALOKASI UTAMA');

        let categoryTotalBudget = 0;
        let categoryTotalActual = 0;

        if (isUnexpectedCategory) {
          categoryTotalBudget = masterAllocationItem?.budget || 0;
          categoryTotalActual = categoryItems.reduce((sum, item) => sum + item.actual, 0);
        } else {
          categoryTotalBudget = items.filter(i => i.category === category).reduce((sum, item) => sum + item.budget, 0);
          categoryTotalActual = items.filter(i => i.category === category).reduce((sum, item) => sum + item.actual, 0);
        }

        const usageRatio = categoryTotalBudget > 0 ? categoryTotalActual / categoryTotalBudget : 0;
        const remainingBudget = categoryTotalBudget - categoryTotalActual;
        const isCollapsed = !expandedCategories.has(category);

        return (
          <div key={category} className="group">
            {/* Header Kategori */}
            <div 
              onClick={() => toggleCategory(category)}
              className={`flex items-center justify-between p-5 rounded-[24px] cursor-pointer transition-all duration-300 border ${
                isCollapsed 
                  ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800' 
                  : 'bg-indigo-600/10 border-indigo-500/30 rounded-b-none shadow-xl'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl transition-colors ${isCollapsed ? 'bg-slate-700 text-slate-400' : 'bg-indigo-600 text-white'}`}>
                   <Layers size={18} />
                </div>
                <div>
                  <h3 className="font-black text-slate-100 uppercase tracking-tight text-sm">{category}</h3>
                  <div className="flex flex-col mt-0.5 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Alokasi:</span>
                      <span className="text-[10px] font-black text-indigo-400">{formatter.format(categoryTotalBudget)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                        {isUnexpectedCategory ? 'Terpakai:' : 'Realisasi:'}
                      </span>
                      <span className={`text-[10px] font-black ${usageRatio > 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {formatter.format(categoryTotalActual)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${usageRatio > 1 ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                  {isUnexpectedCategory && usageRatio <= 1 ? `Sisa: ${formatter.format(remainingBudget)}` : `${(usageRatio * 100).toFixed(0)}%`}
                </div>
                <div className={`transition-transform duration-300 ${isCollapsed ? '' : 'rotate-90'}`}>
                  <ChevronRight size={20} className="text-slate-600" />
                </div>
              </div>
            </div>

            {/* Content Kategori */}
            {!isCollapsed && (
              <div className="bg-slate-900/50 border-x border-b border-indigo-500/20 rounded-b-[24px] p-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                
                {isUnexpectedCategory && (
                  <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-4 mb-4">
                    <div className="flex items-center gap-3 mb-3 text-indigo-400">
                      <Wallet2 size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Set Alokasi Dana Utama</span>
                    </div>
                    <MoneyInput 
                      label="Dana Anggaran Utama" 
                      value={masterAllocationItem?.budget || 0}
                      onChange={(val) => {
                        if (!masterAllocationItem) {
                          onSaveNewItem({ name: 'ALOKASI UTAMA', category, budget: val, actual: 0 });
                        } else {
                          handleUpdate(masterAllocationItem.id, 'budget', val);
                        }
                      }}
                    />
                    <div className="mt-2 flex justify-between items-center px-1">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Sisa Dana:</span>
                      <span className={`text-xs font-black ${remainingBudget < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {formatter.format(remainingBudget)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mb-2 px-1">
                   <span className="text-[10px] font-black text-indigo-400/60 uppercase tracking-[0.2em]">
                    {isUnexpectedCategory ? 'Daftar Pengeluaran' : 'Detail Alokasi'}
                   </span>
                   <button 
                    onClick={(e) => { e.stopPropagation(); onAddItemClick(category); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 rounded-lg text-white text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-indigo-600/20"
                  >
                    <Plus size={12} /> {isUnexpectedCategory ? 'Input Pengeluaran' : 'Tambah Item'}
                  </button>
                </div>

                {categoryItems.map((item) => (
                  <div 
                    key={item.id} 
                    className={`bg-slate-800/40 border rounded-2xl p-4 space-y-3 transition-all duration-300 border-slate-700/50 ${lastUpdatedId === item.id ? 'animate-flash-update' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdate(item.id, 'name', e.target.value)}
                        className="bg-transparent border-none focus:ring-0 font-bold text-sm text-slate-200 flex-1 min-w-0"
                      />
                      <button onClick={() => onRemoveItem(item.id)} className="p-1.5 text-slate-600 hover:text-rose-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className={isUnexpectedCategory ? "grid grid-cols-1" : "grid grid-cols-2 gap-3"}>
                      {!isUnexpectedCategory && (
                        <MoneyInput 
                          label="Anggaran" 
                          value={item.budget} 
                          onChange={(v) => handleUpdate(item.id, 'budget', v)} 
                        />
                      )}
                      <MoneyInput 
                        label={isUnexpectedCategory ? "Nominal Pengeluaran" : "Realisasi"} 
                        value={item.actual} 
                        onChange={(v) => handleUpdate(item.id, 'actual', v)} 
                        textIndigo={!isUnexpectedCategory}
                      />
                    </div>
                  </div>
                ))}
                
                {addingItemToCategory === category && (
                  <NewItemForm
                    onCancel={onCancelAddItem}
                    onSave={(data) => onSaveNewItem({ ...data, category })}
                    isUnexpected={isUnexpectedCategory}
                  />
                )}

                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between px-2">
                   <div className="flex flex-col">
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Terpakai</span>
                     <span className="text-sm font-black text-white">{formatter.format(categoryTotalActual)}</span>
                   </div>
                   <button 
                    onClick={() => onRemoveCategory(category)}
                    className="text-[9px] font-black text-rose-500/60 uppercase tracking-widest hover:text-rose-500 transition-colors"
                   >
                     Hapus Kategori
                   </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ExpenseTable;
