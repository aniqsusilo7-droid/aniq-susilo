
import React, { useEffect, useState, useRef } from 'react';
import { Calculator, Banknote, Clock, Percent, TrendingUp, Wallet } from 'lucide-react';
import { SalaryDetails } from '../types';

interface SalarySlipProps {
  data: SalaryDetails;
  onUpdateData: (details: SalaryDetails) => void;
  onUpdateTHP: (amount: number) => void;
}

const formatInputMoney = (num: number) => {
  if (isNaN(num) || num === 0) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseInputMoney = (str: string) => {
  return Number(str.replace(/\./g, '').replace(/[^0-9]/g, ''));
};

const InputRowMoney = ({ label, value, onChange, prefix = "Rp", readOnly = false }: any) => {
  // FIX: Gunakan local state untuk input agar pengetikan mulus tanpa menunggu render global
  const [localValue, setLocalValue] = useState(formatInputMoney(value));

  useEffect(() => {
    setLocalValue(formatInputMoney(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numeric = parseInputMoney(rawValue);
    setLocalValue(formatInputMoney(numeric));
    onChange(numeric);
  };

  return (
    <div className={`flex items-center justify-between py-3 border-b border-slate-700/50`}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex-1">{label}</label>
      <div className="flex items-center gap-2 w-40 justify-end">
        {prefix && <span className="text-[10px] text-slate-500 font-bold">{prefix}</span>}
        {readOnly ? (
           <span className="text-sm font-black text-slate-200 text-right w-full">{typeof value === 'number' ? formatInputMoney(value) : value}</span>
        ) : (
          <input
            type="text"
            inputMode="numeric"
            value={localValue}
            onChange={handleChange}
            placeholder="0"
            className="bg-transparent border-none text-right text-sm font-black text-white w-full outline-none placeholder-slate-700 focus:text-indigo-400"
          />
        )}
      </div>
    </div>
  );
};

const SalarySlip: React.FC<SalarySlipProps> = ({ data, onUpdateData, onUpdateTHP }) => {
  const [calculations, setCalculations] = useState({
    hourlyRate: 0,
    otRupiah: 0,
    regularIncome: 0,
    totalBonus: 0,
    grossIncome: 0,
    taxAmount: 0,
    totalDeductions: 0,
    takeHomePay: 0
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const parseDecimal = (str: string) => {
    const normalized = str.replace(',', '.');
    const val = parseFloat(normalized);
    return isNaN(val) ? 0 : val;
  };

  const handleChange = (field: keyof SalaryDetails, value: any) => {
    onUpdateData({
      ...data,
      [field]: value
    });
  };

  useEffect(() => {
    const hourlyRate = (data.basicSalary + data.housingAllowance) > 0 
      ? Math.floor((data.basicSalary + data.housingAllowance) / 173) 
      : 0;

    const otHours = parseDecimal(data.otHoursStr);
    const otRupiah = Math.floor(otHours * hourlyRate);
    const regularIncome = data.basicSalary + data.shiftAllowance + data.housingAllowance + otRupiah;
    
    const bonusMultiplier = parseDecimal(data.bonusMultiplierStr);
    const totalBonus = Math.floor((data.basicSalary + data.housingAllowance) * bonusMultiplier);

    const grossIncome = regularIncome + totalBonus;
    const taxAmount = Math.floor(grossIncome * (parseDecimal(data.taxRateStr) / 100));
    const totalDeductions = taxAmount + data.otherDeductions;
    const takeHomePay = grossIncome - totalDeductions;
    
    setCalculations({
      hourlyRate,
      otRupiah,
      regularIncome, 
      totalBonus,
      grossIncome,
      taxAmount,
      totalDeductions,
      takeHomePay
    });

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
       onUpdateTHP(takeHomePay);
    }, 500); // Jeda lebih lama untuk THP agar tidak sering memicu render dashboard

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [data, onUpdateTHP]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-slate-800/50 p-6 rounded-[32px] border border-slate-700/50 flex items-center gap-4">
        <div className="p-3 bg-yellow-500/20 text-yellow-500 rounded-2xl"><Calculator size={24} /></div>
        <div>
          <h2 className="text-lg font-black text-white uppercase tracking-tight">Perhitungan Slip Gaji</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Optimasi Performa Aktif</p>
        </div>
      </div>

      {/* PENDAPATAN TETAP */}
      <div className="bg-slate-900 rounded-[24px] overflow-hidden border border-slate-800 shadow-xl">
        <div className="bg-yellow-500 px-6 py-3 flex justify-between items-center text-black font-black text-xs uppercase tracking-widest">
          <span className="flex items-center gap-2"><Banknote size={14} /> PENDAPATAN TETAP</span>
        </div>
        <div className="p-6 space-y-1">
          <InputRowMoney label="Basic Salary" value={data.basicSalary} onChange={(v:any) => handleChange('basicSalary', v)} />
          <InputRowMoney label="Tunjangan Shift" value={data.shiftAllowance} onChange={(v:any) => handleChange('shiftAllowance', v)} />
          <InputRowMoney label="Tunjangan Rumah" value={data.housingAllowance} onChange={(v:any) => handleChange('housingAllowance', v)} />
          <div className="pt-4 pb-2">
             <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 space-y-3">
                <div className="flex justify-between items-center">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={12} /> Lembur / Overtime
                   </div>
                   <div className="flex items-center gap-2 bg-slate-900 rounded-lg px-2 py-1 border border-slate-700 w-24">
                      <input 
                        type="text"
                        inputMode="decimal"
                        value={data.otHoursStr} 
                        onChange={(e) => handleChange('otHoursStr', e.target.value)}
                        className="w-full bg-transparent text-center font-black text-white text-xs outline-none"
                      />
                      <span className="text-[9px] text-slate-500 font-bold">JAM</span>
                   </div>
                </div>
                <div className="flex justify-between text-xs font-black text-yellow-500 pt-1 border-t border-slate-700/50">
                  <span>Hasil Rupiah OT:</span>
                  <span>{formatCurrency(calculations.otRupiah)}</span>
                </div>
             </div>
          </div>
        </div>
        <div className="bg-yellow-500/10 px-6 py-4 border-t border-yellow-500/20 flex justify-between items-center">
           <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Total Tetap</span>
           <span className="text-lg font-black text-yellow-400">{formatCurrency(calculations.regularIncome)}</span>
        </div>
      </div>

      {/* BONUS TAHUNAN */}
      <div className="bg-slate-900 rounded-[24px] overflow-hidden border border-slate-800 shadow-xl -mt-2">
        <div className="bg-cyan-500 px-6 py-3 flex justify-between items-center text-black font-black text-xs uppercase tracking-widest">
          <span className="flex items-center gap-2"><TrendingUp size={14} /> BONUS TAHUNAN</span>
        </div>
        <div className="p-6 flex items-center justify-between">
           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pengali (x Basic+Rumah)</label>
              <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 border border-slate-700 w-24">
                <span className="text-[10px] text-slate-500 font-bold">x</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={data.bonusMultiplierStr}
                  onChange={(e) => handleChange('bonusMultiplierStr', e.target.value)}
                  className="bg-transparent border-none text-right text-sm font-black text-white w-full outline-none"
                />
              </div>
           </div>
           <div className="text-right space-y-1">
              <label className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Total Bonus</label>
              <p className="text-2xl font-black text-white">{formatCurrency(calculations.totalBonus)}</p>
           </div>
        </div>
      </div>

      {/* GROSS SUMMARY */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-[24px] border border-emerald-500/30 flex items-center justify-between shadow-lg">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400"><Wallet size={20} /></div>
            <div>
               <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Total Gross (Kotor)</p>
               <p className="text-[9px] text-slate-500 font-medium italic">Dasar Pajak PPh</p>
            </div>
         </div>
         <p className="text-2xl font-black text-white">{formatCurrency(calculations.grossIncome)}</p>
      </div>

      {/* POTONGAN */}
      <div className="bg-slate-900 rounded-[24px] overflow-hidden border border-slate-800 shadow-xl">
        <div className="bg-orange-500 px-6 py-3 text-white font-black text-xs uppercase tracking-widest">
          <span className="flex items-center gap-2"><Percent size={14} /> POTONGAN (DARI GROSS)</span>
        </div>
        <div className="p-6 space-y-1">
          <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pajak PPh (% x Gross)</label>
            <div className="flex items-center gap-2 w-24 justify-end bg-slate-800 rounded-lg px-2 py-1 border border-slate-700">
               <input
                type="text"
                inputMode="decimal"
                value={data.taxRateStr}
                onChange={(e) => handleChange('taxRateStr', e.target.value)}
                className="bg-transparent border-none text-right text-xs font-black text-white w-full outline-none"
              />
              <span className="text-[9px] text-slate-500 font-bold">%</span>
            </div>
          </div>
          <InputRowMoney label="Nominal Pajak" value={calculations.taxAmount} readOnly={true} />
          <InputRowMoney label="Potongan Lain" value={data.otherDeductions} onChange={(v:any) => handleChange('otherDeductions', v)} />
        </div>
        <div className="bg-orange-500/10 px-6 py-4 border-t border-orange-500/20 flex justify-between items-center text-orange-500">
           <span className="text-[10px] font-black uppercase tracking-widest">Total Potongan</span>
           <span className="text-lg font-black">{formatCurrency(calculations.totalDeductions)}</span>
        </div>
      </div>

      {/* RESULT */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-1 rounded-[24px] shadow-2xl">
        <div className="bg-slate-900 rounded-[22px] p-8 text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">TAKE HOME PAY</p>
          <h1 className="text-4xl font-black text-white tracking-tighter drop-shadow-lg">
            {formatCurrency(calculations.takeHomePay)}
          </h1>
          <p className="text-[9px] text-slate-400 mt-3 font-medium bg-slate-800/50 inline-block px-3 py-1 rounded-full">
            *Formula: Gross Income - Potongan
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalarySlip;
