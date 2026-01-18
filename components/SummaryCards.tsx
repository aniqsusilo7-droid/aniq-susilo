
import React from 'react';
import { Wallet, TrendingDown, TrendingUp, AlertCircle, Scale } from 'lucide-react';

interface SummaryCardsProps {
  income: number;
  totalBudget: number;
  totalActual: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ income, totalBudget, totalActual }) => {
  const balance = income - totalActual;
  const budgetUtilization = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });

  const cards = [
    {
      title: 'Saldo Sisa',
      value: balance,
      icon: balance < 0 ? <AlertCircle size={18} /> : <TrendingUp size={18} />,
      color: balance < 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500 text-white',
      span: true
    },
    {
      title: 'Pendapatan',
      value: income,
      icon: <Wallet size={16} />,
      color: 'bg-slate-800 text-emerald-400',
    },
    {
      title: 'Pengeluaran',
      value: totalActual,
      icon: <TrendingDown size={16} />,
      color: 'bg-slate-800 text-rose-400',
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map((card, i) => (
        <div 
          key={i} 
          className={`bg-slate-800/40 p-5 rounded-[24px] border border-slate-700/50 shadow-lg ${card.span ? 'col-span-2' : 'col-span-1'}`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-xl ${card.color}`}>
              {card.icon}
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{card.title}</span>
          </div>
          <p className="text-xl font-black text-white tracking-tight">
            {formatter.format(card.value)}
          </p>
          
          {card.span && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
               <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Budget Utilization</span>
                  <span className={`text-[10px] font-black ${budgetUtilization > 100 ? 'text-rose-400' : 'text-indigo-400'}`}>
                    {budgetUtilization.toFixed(0)}%
                  </span>
               </div>
               <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${budgetUtilization > 100 ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                    style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                  />
               </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
