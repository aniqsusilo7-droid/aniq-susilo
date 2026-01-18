
import React from 'react';
import { AlertTriangle, AlertCircle, AlertOctagon, X } from 'lucide-react';

interface Alert {
  category: string;
  ratio: number;
  type: 'warning' | 'critical';
}

interface AlertBannerProps {
  alerts: Alert[];
  onDismiss: (category: string) => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onDismiss }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-4 mb-8 animate-in slide-in-from-top-4 duration-500">
      {alerts.map((alert) => {
        const isCritical = alert.type === 'critical';
        
        return (
          <div 
            key={alert.category}
            className={`group flex items-center justify-between p-5 rounded-[24px] border backdrop-blur-md shadow-2xl ring-1 ring-white/5 transition-all hover:scale-[1.01] ${
              isCritical 
                ? 'bg-rose-600/20 border-rose-500 shadow-rose-500/20 animate-pulse-slow' 
                : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-5">
              <div className={`p-3 rounded-2xl shadow-lg ${
                isCritical 
                  ? 'bg-rose-600 text-white shadow-rose-600/40 rotate-12 group-hover:rotate-0 transition-transform duration-500' 
                  : 'bg-amber-500/20 text-amber-400'
              }`}>
                {isCritical ? <AlertOctagon size={24} /> : <AlertTriangle size={24} />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`uppercase text-[10px] font-black tracking-[0.2em] px-2 py-0.5 rounded-md ${
                    isCritical ? 'bg-rose-600 text-white' : 'opacity-60 text-amber-400'
                  }`}>
                    {isCritical ? 'Status Kritis - Overbudget' : 'Limit Terlampaui'}
                  </span>
                  {isCritical && (
                    <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                  )}
                </div>
                <p className={`text-sm font-bold tracking-tight ${isCritical ? 'text-white' : ''}`}>
                  Anggaran pos <span className={`font-black underline decoration-2 underline-offset-4 ${isCritical ? 'decoration-rose-500' : 'decoration-amber-500'}`}>{alert.category}</span> 
                  {isCritical ? ' TELAH HABIS ' : ' sudah terpakai '} 
                  sebanyak <span className={isCritical ? 'text-rose-400 text-lg font-black' : 'text-white'}>{(alert.ratio * 100).toFixed(0)}%</span>.
                </p>
              </div>
            </div>
            <button 
              onClick={() => onDismiss(alert.category)}
              className={`p-3 rounded-2xl transition-all ${
                isCritical 
                  ? 'hover:bg-rose-600/30 text-rose-300 hover:text-white' 
                  : 'hover:bg-white/10 text-slate-400 hover:text-white'
              }`}
              aria-label="Tutup peringatan"
            >
              <X size={20} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default AlertBanner;
