
import React, { useState } from 'react';
import { Sparkles, Loader2, MessageSquare, BrainCircuit } from 'lucide-react';
import { analyzeFinance } from '../services/geminiService';
import { MonthlyBudget } from '../types';

interface AIAssistantProps {
  budget: MonthlyBudget;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ budget }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeFinance(budget);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="relative group">
      {/* Dynamic AI Glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
      
      <div className="relative bg-slate-900 rounded-[30px] p-8 sm:p-10 text-white shadow-2xl overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] -ml-24 -mb-24"></div>

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-indigo-500/20 rounded-[20px] backdrop-blur-xl border border-white/10 shadow-inner">
              <BrainCircuit size={36} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight mb-2">Asisten Keuangan AI</h2>
              <p className="text-indigo-200/60 text-sm font-medium leading-relaxed max-w-sm">
                Gunakan kecerdasan buatan untuk menganalisis pola pengeluaran dan optimasi tabungan masa depan Anda.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full md:w-auto px-8 py-4 bg-white text-slate-900 font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-indigo-400 hover:text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Sparkles size={18} />
            )}
            {loading ? 'MENGEVALUASI...' : 'MULAI ANALISIS'}
          </button>
        </div>

        {analysis && (
          <div className="mt-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="bg-white/5 rounded-2xl p-8 backdrop-blur-sm border border-white/5 ring-1 ring-white/10">
              <div className="flex items-start gap-4 mb-6 text-indigo-400 font-black uppercase text-[10px] tracking-[0.2em] border-b border-white/5 pb-4">
                <MessageSquare size={14} />
                HASIL EVALUASI CERDAS
              </div>
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-slate-300 leading-8 text-sm sm:text-base font-medium">
                  {analysis}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
