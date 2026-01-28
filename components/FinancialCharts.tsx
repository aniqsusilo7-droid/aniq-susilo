
import React, { useMemo } from 'react';
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
import { FinanceItem, CategoryType } from '../types';

interface FinancialChartsProps {
  items: FinanceItem[];
  categories: string[];
}

const FinancialCharts: React.FC<FinancialChartsProps> = ({ items, categories }) => {
  // Aggregation logic for "Unexpected" category to keep charts clean
  const chartItems = useMemo(() => {
    const unexpectedItems = items.filter(i => i.category === CategoryType.UNEXPECTED);
    const mainUnexpected = unexpectedItems.find(i => i.name === 'Pengeluaran Tak Terduga');

    if (!mainUnexpected) return items;

    // Calculate total actuals from children
    const childActuals = unexpectedItems
      .filter(i => i.id !== mainUnexpected.id)
      .reduce((sum, i) => sum + i.actual, 0);

    // Create a new list where main item has summed actuals, and children are removed
    return items.map(item => {
      if (item.category === CategoryType.UNEXPECTED) {
        if (item.id === mainUnexpected.id) {
          return { ...item, actual: childActuals };
        }
        return null; // Filter out children for chart view
      }
      return item;
    }).filter((item): item is FinanceItem => item !== null);
  }, [items]);

  const categorySummary = useMemo(() => {
    return categories.map(category => {
      const catItems = items.filter(item => item.category === category);
      const budgetSum = catItems.reduce((sum, item) => sum + item.budget, 0);
      const actualSum = catItems.reduce((sum, item) => sum + item.actual, 0);
      return {
        name: category,
        Anggaran: budgetSum,
        Realisasi: actualSum
      };
    });
  }, [items, categories]);

  const itemBarData = chartItems
    .filter(i => i.budget > 0 || i.actual > 0)
    .map(item => ({
      name: item.name,
      Anggaran: item.budget,
      Aktual: item.actual,
    }));

  const budgetPieData = categorySummary.filter(d => d.Anggaran > 0);
  const actualPieData = categorySummary.filter(d => d.Realisasi > 0);

  const PIE_COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6', '#22d3ee', '#94a3b8'];

  const formatAxisCurrency = (value: number) => {
    if (value >= 1000000) return `Rp${(value / 1000000).toFixed(1).replace('.0', '')}jt`;
    if (value >= 1000) return `Rp${(value / 1000).toFixed(0)}rb`;
    return `Rp${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const formatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      });
      return (
        <div className="bg-slate-900/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-slate-700/60 ring-1 ring-white/10 animate-in zoom-in-95 z-50">
          <p className="font-black text-white mb-3 tracking-tight border-b border-slate-800 pb-2 text-sm">{label || payload[0].name}</p>
          <div className="space-y-2">
            {payload.map((p: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: p.color || p.fill }}></div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{p.name}</span>
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
  
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent === 0) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="800" style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };


  return (
    <div className="space-y-12">
      {/* 1. Category Performance Comparison (New Chart) */}
      <div className="bg-slate-900/40 backdrop-blur-md p-6 sm:p-10 rounded-[32px] shadow-2xl border border-slate-800/60 ring-1 ring-white/5">
        <div className="mb-10">
          <h3 className="text-xl font-black text-white tracking-tight">Performa per Kategori</h3>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Total Anggaran vs Total Realisasi</p>
        </div>
        <div className="h-[400px] w-full min-h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categorySummary} margin={{ top: 20, right: 10, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }} 
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} 
                axisLine={false}
                tickLine={false}
                tickFormatter={formatAxisCurrency}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }} />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '30px', color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
              
              <Bar 
                name="Anggaran" 
                dataKey="Anggaran" 
                fill="#475569" /* Slate-600 */
                radius={[6, 6, 0, 0]} 
                barSize={32} 
              />
              <Bar 
                name="Realisasi" 
                dataKey="Realisasi" 
                fill="#818cf8" /* Indigo-400 */
                radius={[6, 6, 0, 0]} 
                barSize={32} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Individual Item Performance */}
      <div className="bg-slate-900/40 backdrop-blur-md p-6 sm:p-10 rounded-[32px] shadow-2xl border border-slate-800/60 ring-1 ring-white/5">
        <div className="mb-10">
          <h3 className="text-xl font-black text-white tracking-tight">Kinerja Item Anggaran</h3>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Analisis Detail Unit Pengeluaran</p>
        </div>
        <div className="h-[450px] w-full min-h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={itemBarData.slice(0, 15)} margin={{ top: 20, right: 10, left: 0, bottom: 60 }}>
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
                tickFormatter={formatAxisCurrency}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }} />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '30px', color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
              
              <Bar 
                name="Anggaran" 
                dataKey="Anggaran" 
                fill="#cbd5e1" 
                radius={[4, 4, 0, 0]} 
                barSize={16} 
              />
              <Bar 
                name="Aktual" 
                dataKey="Aktual" 
                fill="#6366f1" 
                radius={[4, 4, 0, 0]} 
                barSize={16} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-slate-900/40 backdrop-blur-md p-10 rounded-[32px] shadow-2xl border border-slate-800/60 flex flex-col ring-1 ring-white/5">
          <div className="w-full mb-8 text-center">
            <h3 className="text-xl font-black text-white tracking-tight">Alokasi Rencana</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Komposisi Budget</p>
          </div>
          <div className="h-[400px] w-full min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="Anggaran"
                  stroke="none"
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {budgetPieData.map((entry, index) => (
                    <Cell key={`cell-budget-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px', color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md p-10 rounded-[32px] shadow-2xl border border-slate-800/60 flex flex-col ring-1 ring-white/5">
          <div className="w-full mb-8 text-center">
            <h3 className="text-xl font-black text-white tracking-tight">Realisasi Pengeluaran</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Struktur Aktual</p>
          </div>
          <div className="h-[400px] w-full min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={actualPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="Realisasi"
                  stroke="none"
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {actualPieData.map((entry, index) => (
                    <Cell key={`cell-actual-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px', color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialCharts;
