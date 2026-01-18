
import React, { useState } from 'react';
import { ShieldCheck, User, Lock, ArrowRight, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulasi delay untuk efek loading
    setTimeout(() => {
      if (username === 'aniqsusilo' && password === '210118081996') {
        onLoginSuccess();
      } else {
        setError('Username atau password tidak valid.');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-200 p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[100px] animate-pulse-slow animation-delay-2000"></div>

      <div className="w-full max-w-sm z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800 rounded-[40px] shadow-2xl shadow-black/40 ring-1 ring-white/5">
          <div className="p-10 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="absolute -inset-2 bg-gradient-to-br from-indigo-600 to-rose-500 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-lg">
                <ShieldCheck size={32} className="text-indigo-400" />
              </div>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase">Aniq<span className="text-indigo-400">Finance</span></h1>
            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-[0.2em]">Secure Vault</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-6">
            <div className="relative">
              <User className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-600" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl h-14 pl-12 pr-4 text-sm font-bold text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-600" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl h-14 pl-12 pr-4 text-sm font-bold text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-2.5 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-bold text-rose-400 animate-in fade-in duration-300">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50 group"
            >
              <span>{isLoading ? 'MEMVALIDASI...' : 'Masuk'}</span>
              {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
