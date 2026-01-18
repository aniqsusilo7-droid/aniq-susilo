
import React, { useMemo } from 'react';
import { MonthlyBudget } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Calendar, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface YearlyViewProps {
  year: string;
  allData: Record<string, MonthlyBudget>;
}

const YearlyView: React.FC<YearlyViewProps> = ({ year, allData }) => {
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });

  const yearlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const monthKey = `${year}-${String(i + 1).padStart(2, '0')}`;
      const data = allData[monthKey];
      
      const totalActual = data ? data.items.reduce((sum, item) => sum + item.actual, 0) : 0;
      const totalBudget = data ? data.items.reduce((sum, item) => sum + item.budget, 0) : 0;
      const income = data ? data.income : 0;

      return {
        month: new Date(parseInt(year), i).toLocaleDateString('id-ID', { month: 'short' }),
        monthKey,
        income,
        budget: totalBudget,
        actual: totalActual,
        surplus: income - totalActual,
        hasData: !!data
      };
    });

    const totals = months.reduce((acc, m) => ({
      income: acc.income + m.income,
      budget: acc.budget + m.budget,
      actual: acc.actual + m.actual,
    }), { income: 0, budget: 0, actual: 0 });

    return { months, totals };
  }, [year, allData]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Yearly Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[32px] border border-slate-800/60 shadow-2xl ring-1 ring-white/5 group hover:bg-slate-900/60 transition-all">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Wallet size={24} />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Pendapatan {year}</span>
          </div>
          <p className="text-3xl font-black text-white tracking-tight">{formatter.format(yearlyData.totals.income)}</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[32px] border border-slate-800/60 shadow-2xl ring-1 ring-white/5 group hover:bg-slate-900/60 transition-all">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20 group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Pengeluaran {year}</span>
          </div>
          <p className="text-3xl font-black text-white tracking-tight">{formatter.format(yearlyData.totals.actual)}</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[32px] border border-slate-800/60 shadow-2xl ring-1 ring-white/5 group hover:bg-slate-900/60 transition-all">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <Calendar size={24} />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Net Profit {year}</span>
          </div>
          <p className="text-3xl font-black text-indigo-400 tracking-tight">
            {formatter.format(yearlyData.totals.income - yearlyData.totals.actual)}
          </p>
        </div>
      </div>

      {/* Yearly Chart */}
      <div className="bg-slate-900/40 backdrop-blur-md p-10 rounded-[32px] border border-slate-800/60 shadow-2xl ring-1 ring-white/5">
        <div className="mb-10">
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="h-6 w-1 bg-indigo-500 rounded-full"></div>
            Tren Akumulasi {year}
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 ml-4">Analisis Performa Bulanan</p>
        </div>
        <div className="h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearlyData.months} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={(val) => `Rp${val/1000}k`} />
              <Tooltip 
                contentStyle={{ borderRadius: '24px', backgroundColor: '#0f172a', border: '1px solid #1e293b', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', color: '#fff' }}
                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '800' }}
                cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }}
                formatter={(value: number) => formatter.format(value)}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '40px', color: '#94a3b8', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
              <Bar name="Pendapatan" dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
              <Bar name="Pengeluaran" dataKey="actual" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Summary Table */}
      <div className="bg-slate-900/40 backdrop-blur-md rounded-[32px] border border-slate-800/60 shadow-2xl overflow-hidden ring-1 ring-white/5">
        <div className="px-10 py-8 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between">
          <h3 className="font-black text-white tracking-tight">Ringkasan Periodik {year}</h3>
          <div className="px-4 py-1.5 bg-slate-800 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {yearlyData.months.filter(m => m.hasData).length} Bulan Terisi
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-slate-950/20">
                <th className="px-10 py-5">Periode</th>
                <th className="px-10 py-5">Pendapatan</th>
                <th className="px-10 py-5">Pengeluaran</th>
                <th className="px-10 py-5">Margin Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {yearlyData.months.map((m) => (
                <tr key={m.monthKey} className={m.hasData ? 'hover:bg-slate-800/40 transition-colors' : 'opacity-25'}>
                  <td className="px-10 py-5 font-black text-slate-200">{m.month}</td>
                  <td className="px-10 py-5 text-sm font-bold text-slate-400">{m.hasData ? formatter.format(m.income) : '—'}</td>
                  <td className="px-10 py-5 text-sm font-bold text-slate-400">{m.hasData ? formatter.format(m.actual) : '—'}</td>
                  <td className="px-10 py-5">
                    {m.hasData ? (
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black ring-1 ring-inset ${
                        m.surplus >= 0 ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' : 'bg-rose-500/10 text-rose-400 ring-rose-500/20'
                      }`}>
                        {m.surplus >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {formatter.format(m.surplus)}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-700 font-black uppercase tracking-widest">Belum Ada Data</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            {yearlyData.totals.income > 0 && (
              <tfoot className="bg-slate-950/60 font-black text-white">
                <tr>
                  <td className="px-10 py-6 text-[11px] uppercase tracking-[0.2em] text-slate-500">Total Akumulasi {year}</td>
                  <td className="px-10 py-6 text-base">{formatter.format(yearlyData.totals.income)}</td>
                  <td className="px-10 py-6 text-base text-rose-400">{formatter.format(yearlyData.totals.actual)}</td>
                  <td className="px-10 py-6">
                    <span className="px-5 py-2 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20">
                      {formatter.format(yearlyData.totals.income - yearlyData.totals.actual)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default YearlyView;
