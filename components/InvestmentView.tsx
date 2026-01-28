
import React from 'react';
import { InvestmentDetails } from '../types';
import { GraduationCap, Landmark, PiggyBank, Target, TrendingUp, ShieldCheck } from 'lucide-react';

interface InvestmentViewProps {
  data: InvestmentDetails;
  onUpdate: (data: InvestmentDetails) => void;
}

const formatMoney = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const parseMoney = (str: string) => Number(str.replace(/[^0-9]/g, ''));

const InvestmentCard = ({ title, icon: Icon, value, target, onValueChange, onTargetChange, colorClass }: any) => {
  const progress = target > 0 ? (value / target) * 100 : 0;
  
  return (
    <div className="bg-slate-800/40 rounded-[32px] p-8 border border-slate-700/50 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${colorClass} shadow-lg`}>
            <Icon size={24} />
          </div>
          <h3 className="font-black text-white text-lg uppercase tracking-tight">{title}</h3>
        </div>
        <Target size={20} className="text-slate-600" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Saldo Saat Ini</label>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 shadow-inner group focus-within:border-indigo-500 transition-all">
            <span className="text-xs font-black text-slate-600">Rp</span>
            <input 
              type="text"
              inputMode="numeric"
              value={formatMoney(value)}
              onChange={(e) => onValueChange(parseMoney(e.target.value))}
              className="w-full bg-transparent border-none outline-none font-black text-white text-lg"
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Target Dana</label>
          <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 shadow-inner group focus-within:border-indigo-500 transition-all">
            <span className="text-xs font-black text-slate-600">Rp</span>
            <input 
              type="text"
              inputMode="numeric"
              value={formatMoney(target)}
              onChange={(e) => onTargetChange(parseMoney(e.target.value))}
              className="w-full bg-transparent border-none outline-none font-black text-slate-400 text-lg"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {target > 0 && (
        <div className="pt-2">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progress Pencapaian</span>
            <span className="text-sm font-black text-indigo-400">{progress.toFixed(1)}%</span>
          </div>
          <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-lg shadow-indigo-500/20 transition-all duration-1000"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const InvestmentView: React.FC<InvestmentViewProps> = ({ data, onUpdate }) => {
  const totalAccumulated = data.educationFund + data.retirementFund + data.generalSavings;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Overview Card */}
      <div className="bg-indigo-600 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-200">Total Portfolio Investasi</p>
            <h2 className="text-4xl font-black tracking-tighter">
              Rp {formatMoney(totalAccumulated)}
            </h2>
          </div>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10">
             <TrendingUp size={32} className="text-indigo-200" />
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Status Aset</p>
               <p className="text-sm font-bold">Terakumulasi Aman</p>
             </div>
          </div>
        </div>
      </div>

      {/* Grid Investasi */}
      <div className="grid grid-cols-1 gap-6">
        <InvestmentCard 
          title="Biaya Pendidikan Anak"
          icon={GraduationCap}
          value={data.educationFund}
          target={data.educationTarget}
          onValueChange={(v: number) => onUpdate({ ...data, educationFund: v })}
          onTargetChange={(v: number) => onUpdate({ ...data, educationTarget: v })}
          colorClass="bg-rose-500/20 text-rose-500"
        />

        <InvestmentCard 
          title="Tabungan Hari Tua"
          icon={Landmark}
          value={data.retirementFund}
          target={data.retirementTarget}
          onValueChange={(v: number) => onUpdate({ ...data, retirementFund: v })}
          onTargetChange={(v: number) => onUpdate({ ...data, retirementTarget: v })}
          colorClass="bg-amber-500/20 text-amber-500"
        />

        <InvestmentCard 
          title="Dana Tabungan"
          icon={PiggyBank}
          value={data.generalSavings}
          target={data.savingsTarget}
          onValueChange={(v: number) => onUpdate({ ...data, generalSavings: v })}
          onTargetChange={(v: number) => onUpdate({ ...data, savingsTarget: v })}
          colorClass="bg-emerald-500/20 text-emerald-500"
        />
      </div>

      <div className="p-8 bg-slate-900 border border-slate-800 rounded-[32px] flex items-center gap-6">
        <div className="p-4 bg-indigo-600/10 text-indigo-400 rounded-2xl"><ShieldCheck size={28} /></div>
        <div>
          <h4 className="font-black text-white text-sm uppercase tracking-widest">Proteksi Masa Depan</h4>
          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
            Data investasi disimpan secara lokal dan akan terakumulasi seiring bertambahnya alokasi bulanan Anda.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvestmentView;
