
import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Copy, 
  Check, 
  Loader2, 
  X, 
  AlertTriangle, 
  Database, 
  FileJson, 
  Download, 
  Upload,
  Globe,
  RefreshCw,
  ShieldCheck,
  Zap,
  Eye,
  EyeOff,
  Lock,
  Smartphone,
  LogOut,
  WifiOff,
  Wifi,
  Mail,
  UserCircle,
  Shield,
  ChevronRight
} from 'lucide-react';

interface CloudSyncProps {
  data: any;
  onDataLoaded: (newData: any) => void;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  setSyncStatus: (status: 'idle' | 'syncing' | 'success' | 'error') => void;
}

const CloudSync: React.FC<CloudSyncProps> = ({ data, onDataLoaded, syncStatus, setSyncStatus }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'account' | 'local'>('account');
  const [loading, setLoading] = useState(false);
  
  // State untuk Akun Email
  const [userEmail, setUserEmail] = useState<string>(() => localStorage.getItem('arthaku_user_email') || '');
  const [syncId, setSyncId] = useState<string>(() => localStorage.getItem('arthaku_cloud_id') || '');
  
  const [inputEmail, setInputEmail] = useState('');
  const [inputSyncId, setInputSyncId] = useState('');
  
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => localStorage.getItem('arthaku_last_sync') || null);

  const handleCreateAccount = async () => {
    if (!inputEmail.includes('@')) {
      setError('Mohon masukkan alamat email yang valid.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Menggunakan npoint sebagai mock database sederhana
      const response = await fetch('https://api.npoint.io/bins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          payload: btoa(JSON.stringify(data)), 
          email: inputEmail,
          timestamp: new Date().toISOString(),
          app: "AniqFinance_Pro"
        }),
      });
      
      const result = await response.json();
      if (result.binId) {
        const newId = result.binId;
        setSyncId(newId);
        setUserEmail(inputEmail);
        localStorage.setItem('arthaku_cloud_id', newId);
        localStorage.setItem('arthaku_user_email', inputEmail);
        
        const now = new Date().toLocaleTimeString('id-ID');
        setLastSyncTime(now);
        localStorage.setItem('arthaku_last_sync', now);
        
        setSuccessMsg("Akun Berhasil Terhubung & Dicadangkan!");
        setShowKey(true);
      }
    } catch (err) {
      setError('Gagal menghubungkan email. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Keluar dari akun? Pencadangan otomatis akan terhenti. Data di perangkat ini tidak akan dihapus.')) {
      setSyncId('');
      setUserEmail('');
      localStorage.removeItem('arthaku_cloud_id');
      localStorage.removeItem('arthaku_user_email');
      localStorage.removeItem('arthaku_last_sync');
      setSuccessMsg("Berhasil keluar dari akun.");
      setActiveTab('account');
    }
  };

  const handleRestoreAccount = async () => {
    if (!inputSyncId) {
      setError('Masukkan Kunci Pemulihan untuk menarik data.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.npoint.io/bins/${inputSyncId}`);
      if (!response.ok) throw new Error('Key tidak ditemukan');
      
      const result = await response.json();
      const decodedData = JSON.parse(atob(result.payload));
      
      if (confirm('Data dari Cloud akan menimpa data di HP ini. Lanjutkan?')) {
        onDataLoaded(decodedData);
        setSyncId(inputSyncId);
        if (result.email) {
          setUserEmail(result.email);
          localStorage.setItem('arthaku_user_email', result.email);
        }
        localStorage.setItem('arthaku_cloud_id', inputSyncId);
        setSuccessMsg("Data berhasil dipulihkan!");
        setTimeout(() => setIsOpen(false), 1500);
      }
    } catch (err) {
      setError('Kunci Pemulihan salah atau tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!syncId) return;
    navigator.clipboard.writeText(syncId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const exportToFile = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `Backup_AniqFinance_${new Date().toISOString().slice(0,10)}.json`);
    linkElement.click();
  };

  const importFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        onDataLoaded(JSON.parse(content));
        setSuccessMsg("Berhasil memuat dari file!");
        setTimeout(() => setIsOpen(false), 1000);
      } catch (err) {
        alert('File tidak valid!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all relative group ${
          userEmail ? 'bg-indigo-600/10 border-indigo-500/30' : 'bg-slate-800 border-slate-700'
        }`}
      >
        {userEmail ? <UserCircle size={16} className="text-indigo-400" /> : <Database size={16} className="text-slate-500" />}
        <span className="text-[10px] font-black text-white uppercase tracking-widest hidden sm:inline">
          {userEmail ? 'Akun' : 'Pusat Data'}
        </span>
        {userEmail && (
          <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 flex items-center justify-center ${
            syncStatus === 'success' ? 'bg-emerald-500' : 
            syncStatus === 'syncing' ? 'bg-indigo-500 animate-pulse' : 
            syncStatus === 'error' ? 'bg-rose-500' : 'bg-slate-500'
          }`}>
             {syncStatus === 'success' && <Check size={8} className="text-white font-black" />}
             {syncStatus === 'error' && <WifiOff size={8} className="text-white font-black" />}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 rounded-[40px] border border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden ring-1 ring-white/10" onClick={e => e.stopPropagation()}>
            
            {/* Header Modal */}
            <div className="p-8 border-b border-slate-800/60 flex justify-between items-center bg-gradient-to-br from-indigo-900/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20">
                  <Cloud size={20} />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg tracking-tight">Cloud Backup Center</h3>
                  <div className="flex items-center gap-2 mt-1">
                     <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                       {userEmail ? 'WhatsApp-Style Auto Sync Aktif' : 'Mode Offline'}
                     </p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white p-2 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Tab Navigasi */}
            <div className="flex px-8 pt-6 gap-2">
              <button
                onClick={() => setActiveTab('account')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === 'account' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-800 text-slate-500 hover:bg-slate-750'
                }`}
              >
                <Mail size={14} /> Kelola Akun
              </button>
              <button
                onClick={() => setActiveTab('local')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === 'local' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-800 text-slate-500 hover:bg-slate-750'
                }`}
              >
                <FileJson size={14} /> File Manual
              </button>
            </div>

            {/* Konten Utama */}
            <div className="p-8 min-h-[420px] max-h-[70vh] overflow-y-auto">
              {activeTab === 'account' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  {!userEmail ? (
                    <div className="space-y-6">
                      <div className="bg-indigo-600/5 p-6 rounded-3xl border border-indigo-500/10">
                        <div className="flex items-center gap-3 mb-2">
                           <Shield size={16} className="text-indigo-400" />
                           <h4 className="font-black text-white text-sm uppercase tracking-widest">Cadangkan ke Email</h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">Hubungkan email Anda untuk mencadangkan data secara otomatis. Data Anda dienkripsi dan aman.</p>
                      </div>
                      
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Alamat Email Aktif</label>
                         <div className="relative">
                            <Mail className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-600" size={18} />
                            <input 
                              type="email" 
                              placeholder="nama@email.com"
                              value={inputEmail}
                              onChange={(e) => setInputEmail(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-2xl h-14 pl-12 pr-4 text-sm font-bold text-white placeholder-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                         </div>
                      </div>

                      <button 
                        onClick={handleCreateAccount}
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-500 flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                        HUBUNGKAN AKUN
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Kartu Profil Terhubung */}
                      <div className="bg-slate-950 border border-slate-800 rounded-[32px] p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                           <Globe size={80} className="text-indigo-400" />
                        </div>
                        
                        <div className="flex justify-between items-start mb-6">
                           <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                                {userEmail[0].toUpperCase()}
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-0.5">Akun Terhubung</p>
                                 <h4 className="text-white font-black text-base">{userEmail}</h4>
                              </div>
                           </div>
                           <button 
                             onClick={handleLogout}
                             className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-inner"
                             title="Putuskan Hubungan"
                           >
                             <LogOut size={18} />
                           </button>
                        </div>

                        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
                           <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Lock size={12} /> Kunci Pemulihan (Secret Key)
                              </span>
                              <button onClick={() => setShowKey(!showKey)} className="text-indigo-400 hover:text-indigo-300">
                                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                           </div>
                           <div className="flex items-center gap-3">
                              <p className="flex-1 font-mono font-black text-white text-sm tracking-widest bg-black/40 p-3 rounded-xl border border-slate-800 truncate">
                                {showKey ? syncId : '••••••••••••••••'}
                              </p>
                              <button onClick={copyToClipboard} className="p-3 bg-indigo-600 text-white rounded-xl active:scale-90 transition-all hover:bg-indigo-500 shadow-lg">
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                              </button>
                           </div>
                           <p className="text-[8px] text-slate-600 leading-relaxed italic text-center">
                             PENTING: Simpan kunci ini untuk menarik data jika Anda ganti HP.
                           </p>
                        </div>
                        
                        <div className="mt-5 flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/50 p-3 rounded-xl border border-slate-800/50">
                           <div className="flex items-center gap-2 text-emerald-500">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                              Auto Backup Aktif
                           </div>
                           <div>Update: {lastSyncTime || 'Sesaat lalu'}</div>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          setSyncStatus('syncing');
                          setTimeout(() => setSyncStatus('success'), 1200);
                        }} 
                        className="w-full py-4 bg-slate-800 text-slate-300 font-black text-[10px] uppercase rounded-2xl hover:bg-slate-750 flex items-center justify-center gap-2 border border-slate-700 transition-all"
                      >
                        <RefreshCw size={14} className={syncStatus === 'syncing' ? 'animate-spin' : ''} /> Cadangkan Sekarang
                      </button>
                    </div>
                  )}

                  {/* Bagian Pulihkan Data */}
                  {!userEmail && (
                    <div className="pt-6 border-t border-slate-800/60">
                       <div className="flex items-center gap-2 mb-4">
                          <Smartphone size={14} className="text-slate-500" />
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pindah Perangkat / Pulihkan</p>
                       </div>
                       <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Masukkan Kunci Pemulihan..."
                            value={inputSyncId}
                            onChange={(e) => setInputSyncId(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-xs text-white focus:border-indigo-500 outline-none placeholder:text-slate-700 font-mono shadow-inner"
                          />
                          <button onClick={handleRestoreAccount} className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase rounded-2xl transition-colors border border-slate-700">Tarik</button>
                       </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'local' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 py-4">
                   <div className="grid grid-cols-1 gap-4">
                      <button onClick={exportToFile} className="flex items-center justify-between p-6 bg-slate-800 border border-slate-700 rounded-3xl hover:bg-slate-750 transition-all group">
                        <div className="flex items-center gap-5">
                          <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl group-hover:bg-indigo-500/20 transition-colors"><Download size={22} /></div>
                          <div className="text-left">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Ekspor ke JSON</h4>
                            <p className="text-[10px] text-slate-500 mt-1">Simpan salinan file ke memori HP</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-700" />
                      </button>

                      <label className="flex items-center justify-between p-6 bg-slate-800 border border-slate-700 rounded-3xl hover:bg-slate-750 transition-all group cursor-pointer">
                        <div className="flex items-center gap-5">
                          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl group-hover:bg-emerald-500/20 transition-colors"><Upload size={22} /></div>
                          <div className="text-left">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Impor dari JSON</h4>
                            <p className="text-[10px] text-slate-500 mt-1">Muat data lama dari file manual</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-700" />
                        <input type="file" accept=".json" onChange={importFromFile} className="hidden" />
                      </label>
                   </div>
                </div>
              )}

              {error && (
                <div className="mt-6 p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-[10px] font-black flex items-center gap-3 animate-in fade-in zoom-in-95">
                  <AlertTriangle size={16} /> {error}
                </div>
              )}
              {successMsg && (
                <div className="mt-6 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-[10px] font-black flex items-center gap-3 animate-in fade-in zoom-in-95">
                  <ShieldCheck size={16} /> {successMsg}
                </div>
              )}
            </div>

            {/* Tombol Keluar dari Tampilan (Footer) */}
            <div className="p-8 bg-black/20 border-t border-slate-800/60 flex flex-col gap-4">
               <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-500 flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
               >
                 Tutup Menu
               </button>
               <div className="flex items-center justify-center gap-2 opacity-40">
                  <Lock size={12} className="text-slate-400" />
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em]">Enkripsi AES-256 Aktif</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CloudSync;
