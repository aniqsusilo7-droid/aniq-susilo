
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { FinanceItem } from '../types';

interface FinancialChartsProps {
  items: FinanceItem[];
  categories: string[];
}

const FinancialCharts: React.FC<FinancialChartsProps> = ({ items, categories }) => {
  const chartData = items
    .filter(i => i.budget > 0 || i.actual > 0)
    .map(item => ({
      name: item.name,
      Anggaran: item.budget,
      Aktual: item.actual,
    }));

  const categorySummary = categories.map(category => {
    const catItems = items.filter(item => item.category === category);
    const budgetSum = catItems.reduce((sum, item) => sum + item.budget, 0);
    const actualSum = catItems.reduce((sum, item) => sum + item.actual, 0);
    return {
      name: category,
      budget: budgetSum,
      actual: actualSum
    };
  });

  const budgetPieData = categorySummary.filter(d => d.budget > 0);
  const actualPieData = categorySummary.filter(d => d.actual > 0);

  const COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6', '#22d3ee', '#94a3b8'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const formatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      });
      return (
        <div className="bg-slate-900/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-slate-700/60 ring-1 ring-white/10 animate-in zoom-in-95">
          <p className="font-black text-white mb-3 tracking-tight border-b border-slate-800 pb-2">{label || payload[0].name}</p>
          <div className="space-y-2">
            {payload.map((p: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || p.fill }}></div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{p.name}</span>
                </div>
                <span className="text-sm font-black text-slate-100">{formatter.format(p.value)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-12">
      <div className="bg-slate-900/40 backdrop-blur-md p-10 rounded-[32px] shadow-2xl border border-slate-800/60 ring-1 ring-white/5">
        <div className="mb-10">
          <h3 className="text-xl font-black text-white tracking-tight">Kinerja Anggaran</h3>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Estimasi vs Realisasi</p>
        </div>
        <div className="h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.slice(0, 15)} margin={{ top: 20, right: 10, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                interval={0} 
                height={100} 
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `Rp${val/1000}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }} />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '30px', color: '#94a3b8' }} />
              <Bar name="Estimasi" dataKey="Anggaran" fill="#1e293b" radius={[6, 6, 0, 0]} barSize={24} />
              <Bar name="Aktual" dataKey="Aktual" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-slate-900/40 backdrop-blur-md p-10 rounded-[32px] shadow-2xl border border-slate-800/60 flex flex-col items-center ring-1 ring-white/5">
          <div className="w-full mb-8">
            <h3 className="text-xl font-black text-white tracking-tight">Alokasi Rencana</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Komposisi Budget</p>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="budget"
                  stroke="none"
                >
                  {budgetPieData.map((entry, index) => (
                    <Cell key={`cell-budget-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md p-10 rounded-[32px] shadow-2xl border border-slate-800/60 flex flex-col items-center ring-1 ring-white/5">
          <div className="w-full mb-8">
            <h3 className="text-xl font-black text-white tracking-tight">Realisasi Pengeluaran</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Struktur Aktual</p>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={actualPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="actual"
                  stroke="none"
                >
                  {actualPieData.map((entry, index) => (
                    <Cell key={`cell-actual-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialCharts;
