
import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudUpload, 
  CloudDownload, 
  Copy, 
  Check, 
  Loader2, 
  X, 
  AlertTriangle, 
  Database, 
  FileJson, 
  Download, 
  Upload,
  CircleCheck,
  Globe,
  Lock,
  LogOut,
  RefreshCw,
  Settings,
  Save
} from 'lucide-react';

// --- KONFIGURASI GOOGLE DRIVE ---
// Menggunakan safe access untuk menghindari error runtime
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return (import.meta && import.meta.env) ? import.meta.env[key] : '';
  } catch (e) {
    return '';
  }
};

// Helper untuk mendapatkan API Key dari berbagai sumber yang mungkin
const getEnvApiKey = () => {
    const viteKey = getEnv('VITE_GOOGLE_API_KEY') || getEnv('VITE_API_KEY');
    if (viteKey) return viteKey;
    try {
        return process.env.API_KEY || '';
    } catch {
        return '';
    }
};

// Scope 'drive.file' memastikan aplikasi hanya bisa mengakses/edit file yang dibuat oleh aplikasi ini (Aman)
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const TARGET_EMAIL = 'aniqsusilo7@gmail.com';
const BACKUP_FILE_NAME = 'aniq_finance_backup.json';

interface CloudSyncProps {
  data: any;
  onDataLoaded: (newData: any) => void;
}

// Global types declaration for Google API
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const CloudSync: React.FC<CloudSyncProps> = ({ data, onDataLoaded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'drive' | 'cloud' | 'local'>('drive');
  const [loading, setLoading] = useState(false);
  const [syncId, setSyncId] = useState<string>('');
  const [inputSyncId, setInputSyncId] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Google Drive states
  const [gapiInited, setGapiInited] = useState(false);
  const [gisInited, setGisInited] = useState(false);
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [lastDriveSync, setLastDriveSync] = useState<string | null>(null);
  
  // Configuration State
  const [clientId, setClientId] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [showConfig, setShowConfig] = useState(false);

  // Initialize Config from Env or LocalStorage
  useEffect(() => {
    const envClientId = getEnv('VITE_GOOGLE_CLIENT_ID') || getEnv('VITE_CLIENT_ID');
    const envApiKey = getEnvApiKey();
    
    const localClientId = localStorage.getItem('custom_client_id');
    const localApiKey = localStorage.getItem('custom_api_key');

    const finalClientId = envClientId || localClientId || '';
    const finalApiKey = envApiKey || localApiKey || '';

    setClientId(finalClientId);
    setApiKey(finalApiKey);

    // If no keys are found anywhere, show config form by default
    if (!finalClientId || !finalApiKey) {
      setShowConfig(true);
    }
  }, []);

  // Load Google Scripts Dynamically
  useEffect(() => {
    const loadScripts = () => {
      const scriptGapi = document.createElement('script');
      scriptGapi.src = 'https://apis.google.com/js/api.js';
      scriptGapi.async = true;
      scriptGapi.defer = true;
      scriptGapi.onload = () => {
        // Only init if we have keys
        if (apiKey && clientId) {
           initializeGapiClient();
        }
      };
      document.body.appendChild(scriptGapi);

      const scriptGis = document.createElement('script');
      scriptGis.src = 'https://accounts.google.com/gsi/client';
      scriptGis.async = true;
      scriptGis.defer = true;
      scriptGis.onload = () => {
        setGisInited(true);
        if (window.google && clientId) {
           const client = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: SCOPES,
            callback: '', 
            login_hint: TARGET_EMAIL 
          });
          setTokenClient(client);
        }
      };
      document.body.appendChild(scriptGis);
    };

    if (isOpen && !gapiInited && clientId && apiKey) {
      loadScripts();
    }
  }, [isOpen, gapiInited, clientId, apiKey]);

  const initializeGapiClient = async () => {
    if (!apiKey || !clientId) return;

    try {
      await new Promise<void>((resolve) => {
        window.gapi.load('client', resolve);
      });

      await window.gapi.client.init({
        apiKey: apiKey,
        discoveryDocs: [DISCOVERY_DOC],
      });
      
      setGapiInited(true);
      
      const savedToken = localStorage.getItem('gdrive_access_token');
      if (savedToken) {
         window.gapi.client.setToken({ access_token: savedToken });
         setIsDriveConnected(true);
      }
    } catch (err) {
      console.error("GAPI Init Error", err);
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
      if (!errorMessage.includes('missing required fields')) {
         setError(`Gagal memuat library Google: ${errorMessage}`);
      }
    }
  };

  const handleSaveConfig = (newClientId: string, newApiKey: string) => {
    localStorage.setItem('custom_client_id', newClientId);
    localStorage.setItem('custom_api_key', newApiKey);
    setClientId(newClientId);
    setApiKey(newApiKey);
    setShowConfig(false);
    setError(null);
    // Reload page to ensure scripts re-init cleanly or just re-run effect
    window.location.reload();
  };

  // Handle Close with ESC key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // --- GOOGLE DRIVE LOGIC ---

  const handleAuthClick = () => {
    setError(null);
    if (!tokenClient) {
      setError("Inisialisasi Gagal. Silakan refresh halaman atau periksa konfigurasi.");
      return;
    }

    tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        throw (resp);
      }
      setIsDriveConnected(true);
      localStorage.setItem('gdrive_access_token', resp.access_token);
      await syncToDrive(); 
    };

    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
      tokenClient.requestAccessToken({prompt: ''});
    }
  };

  const syncToDrive = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const response = await window.gapi.client.drive.files.list({
        'pageSize': 1,
        'fields': "files(id, name)",
        'q': `name = '${BACKUP_FILE_NAME}' and trashed = false`
      });

      const files = response.result.files;
      const fileContent = JSON.stringify(data, null, 2);
      
      const fileMetadata = {
        'name': BACKUP_FILE_NAME,
        'mimeType': 'application/json'
      };

      if (files && files.length > 0) {
        const fileId = files[0].id;
        await updateFile(fileId, fileContent);
        setSuccessMsg("Backup diperbarui di Google Drive!");
      } else {
        await createFile(fileMetadata, fileContent);
        setSuccessMsg("File backup baru dibuat di Google Drive!");
      }
      setLastDriveSync(new Date().toLocaleString('id-ID'));
    } catch (err: any) {
      console.error(err);
      if (err.status === 401 || (err.result && err.result.error && err.result.error.code === 401)) {
         setError("Sesi kadaluarsa. Silakan Hubungkan Drive kembali.");
         setIsDriveConnected(false);
         localStorage.removeItem('gdrive_access_token');
      } else {
         setError("Gagal menyimpan ke Drive. Periksa koneksi atau API Key.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFromDrive = async () => {
    setLoading(true);
    setError(null);
    try {
       const response = await window.gapi.client.drive.files.list({
        'pageSize': 1,
        'fields': "files(id, name)",
        'q': `name = '${BACKUP_FILE_NAME}' and trashed = false`
      });
      const files = response.result.files;
      
      if (files && files.length > 0) {
        const fileId = files[0].id;
        const result = await window.gapi.client.drive.files.get({
          fileId: fileId,
          alt: 'media'
        });
        
        const parsedData = JSON.parse(result.body);
        if (confirm(`Ditemukan backup dari Drive. Timpa data lokal?`)) {
           onDataLoaded(parsedData);
           setSuccessMsg("Data berhasil dipulihkan dari Drive!");
        }
      } else {
        setError("File backup tidak ditemukan di Drive akun ini.");
      }
    } catch (err) {
      console.error(err);
      setError("Gagal memuat dari Drive.");
    } finally {
      setLoading(false);
    }
  };

  const updateFile = async (fileId: string, content: string) => {
    return window.gapi.client.request({
      path: `/upload/drive/v3/files/${fileId}`,
      method: 'PATCH',
      params: { uploadType: 'media' },
      body: content
    });
  };

  const createFile = async (metadata: any, content: string) => {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        content +
        close_delim;

    return window.gapi.client.request({
      path: '/upload/drive/v3/files',
      method: 'POST',
      params: { uploadType: 'multipart' },
      headers: {
        'Content-Type': 'multipart/related; boundary="' + boundary + '"'
      },
      body: multipartRequestBody
    });
  };

  // --- NPOINT (OLD) LOGIC ---
  const saveToCloud = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://api.npoint.io/bins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          payload: btoa(JSON.stringify(data)), 
          timestamp: new Date().toISOString(),
          app: "FinancePro_Aniq"
        }),
      });
      
      const result = await response.json();
      if (result.binId) {
        setSyncId(result.binId);
        localStorage.setItem('arthaku_last_sync_id', result.binId);
      }
    } catch (err) {
      setError('Gagal sinkronisasi ke server sementara.');
    } finally {
      setLoading(false);
    }
  };

  const loadFromCloud = async () => {
    if (!inputSyncId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.npoint.io/bins/${inputSyncId.trim()}`);
      if (!response.ok) throw new Error('Sync ID tidak ditemukan');
      
      const result = await response.json();
      const decodedData = JSON.parse(atob(result.payload));
      
      if (confirm('⚠️ PERINGATAN: Data saat ini akan ditimpa. Lanjutkan?')) {
        onDataLoaded(decodedData);
        setIsOpen(false);
      }
    } catch (err) {
      setError('ID tidak valid atau data sudah dihapus.');
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

  // --- LOCAL FILE LOGIC ---
  const exportToFile = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `Laporan_Keuangan_Aniq_${new Date().toISOString().slice(0,10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        if (confirm('Impor data dari file? Data saat ini akan diganti.')) {
          onDataLoaded(parsedData);
          setIsOpen(false);
        }
      } catch (err) {
        alert('File tidak valid!');
      }
    };
    reader.readAsText(file);
  };

  // Sub-component for Manual Config Form
  const ConfigForm = () => {
    const [tempClientId, setTempClientId] = useState(clientId);
    const [tempApiKey, setTempApiKey] = useState(apiKey);

    return (
      <div className="space-y-4 w-full max-w-sm mx-auto animate-in fade-in zoom-in-95">
         <div className="text-center mb-4">
            <h4 className="text-white font-black text-sm uppercase tracking-widest">Konfigurasi API</h4>
            <p className="text-[10px] text-slate-500 mt-1">Masukkan Google Drive credentials Anda</p>
         </div>
         
         <div className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Client ID</label>
              <input 
                 type="text" 
                 value={tempClientId}
                 onChange={(e) => setTempClientId(e.target.value)}
                 className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                 placeholder="xxx.apps.googleusercontent.com"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">API Key</label>
              <input 
                 type="text" 
                 value={tempApiKey}
                 onChange={(e) => setTempApiKey(e.target.value)}
                 className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                 placeholder="AIzaSy..."
              />
            </div>
         </div>

         <div className="flex gap-2 pt-2">
            {/* Show Cancel only if we already have some keys and just editing */}
            {(clientId && apiKey) && (
              <button 
                onClick={() => setShowConfig(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-400 font-bold text-xs rounded-xl hover:bg-slate-700"
              >
                Batal
              </button>
            )}
            <button 
              onClick={() => handleSaveConfig(tempClientId, tempApiKey)}
              className="flex-1 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-500 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <Save size={14} /> Simpan
            </button>
         </div>
      </div>
    );
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2.5 px-5 py-2.5 bg-indigo-600/10 text-indigo-400 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-500/20 shadow-lg shadow-black/20 group ring-1 ring-white/5"
      >
        <Database size={18} className="group-hover:rotate-12 transition-transform" />
        <span className="text-sm font-black hidden sm:inline uppercase tracking-widest">Data Vault</span>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)} // Klik di area hitam untuk keluar
        >
          <div 
            className="bg-[#020617] rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-800 ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal ikut menutup
          >
            
            {/* Header */}
            <div className="p-8 border-b border-slate-800/60 flex justify-between items-center bg-gradient-to-br from-indigo-900/10 to-transparent">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="absolute -inset-1 bg-indigo-500 rounded-2xl blur opacity-30 animate-pulse"></div>
                  <div className="relative p-3.5 bg-indigo-600 text-white rounded-2xl shadow-xl">
                    <Database size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="font-black text-white text-xl tracking-tight leading-none">Pusat Data Abadi</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Target: {TARGET_EMAIL}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-slate-500 hover:text-white hover:bg-rose-500/20 p-2.5 rounded-2xl transition-all border border-transparent hover:border-rose-500/30"
                title="Tutup (ESC)"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex px-8 pt-6 gap-2">
              {[
                { id: 'drive', label: 'Google Drive', icon: <Globe size={14} /> },
                { id: 'cloud', label: 'ID Sync', icon: <Cloud size={14} /> },
                { id: 'local', label: 'Offline', icon: <FileJson size={14} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab.id 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                      : 'bg-slate-900/50 text-slate-500 hover:text-slate-300 border border-slate-800/60'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-8 min-h-[360px] flex flex-col justify-center">
              
              {/* Google Drive Tab */}
              {activeTab === 'drive' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 text-center flex flex-col items-center w-full">
                  <div className="w-20 h-20 bg-slate-900 rounded-[24px] flex items-center justify-center border border-slate-800 shadow-inner">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" className="w-10 h-10" alt="Drive" />
                  </div>
                  
                  <div className="space-y-3 max-w-sm w-full">
                    {/* Header Text or Settings Toggle */}
                    <div className="flex justify-center items-center gap-2 relative">
                       <h4 className="text-xl font-black text-white tracking-tight">Akun: {TARGET_EMAIL}</h4>
                       {!showConfig && (
                         <button onClick={() => setShowConfig(true)} className="p-1.5 text-slate-600 hover:text-indigo-400 rounded-lg hover:bg-slate-800/50 transition-colors absolute -right-8" title="Edit Konfigurasi">
                           <Settings size={14} />
                         </button>
                       )}
                    </div>
                    
                    {!showConfig && (
                      <p className="text-sm text-slate-500 leading-relaxed font-medium">
                        Hubungkan akun Google Anda untuk menyimpan data otomatis.
                      </p>
                    )}
                  </div>

                  {showConfig ? (
                    <ConfigForm />
                  ) : (
                    <>
                      {!isDriveConnected ? (
                        <button 
                          onClick={handleAuthClick}
                          disabled={loading || !gapiInited}
                          className="w-full max-w-xs py-4.5 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-400 hover:text-white transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                          {loading ? <Loader2 className="animate-spin" size={20} /> : <Globe size={20} />}
                          {gapiInited ? 'HUBUNGKAN DRIVE' : 'MEMUAT GOOGLE...'}
                        </button>
                      ) : (
                        <div className="w-full space-y-4 mt-4">
                          <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[28px] flex items-center justify-between ring-1 ring-emerald-500/5">
                            <div className="flex items-center gap-4 text-left">
                              <div className="p-2 bg-emerald-500 text-white rounded-lg"><CircleCheck size={18} /></div>
                              <div>
                                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Status: Terhubung</p>
                                <p className="text-xs text-white font-bold mt-0.5">Sinkron Terakhir: {lastDriveSync || 'Belum pernah'}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={loadFromDrive} disabled={loading} title="Ambil dari Drive" className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-all">
                                  <CloudDownload size={16} />
                              </button>
                              <button onClick={syncToDrive} disabled={loading} className="px-5 py-2.5 bg-emerald-500 text-white text-[10px] font-black rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-2">
                                {loading ? <Loader2 className="animate-spin" size={12} /> : <RefreshCw size={12} />}
                                {loading ? 'SYNC...' : 'SIMPAN'}
                              </button>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">File: {BACKUP_FILE_NAME}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ID Sync Tab */}
              {activeTab === 'cloud' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <div className="space-y-4">
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                      Gunakan <b>Sync ID</b> untuk memindahkan data antar perangkat tanpa akun Google.
                    </p>
                    
                    {syncId ? (
                      <div className="flex items-center gap-3 p-5 bg-slate-950/50 border border-indigo-500/30 rounded-[24px] ring-1 ring-indigo-500/10">
                        <div className="flex-1">
                          <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest mb-1">ID Sinkronisasi Aktif</p>
                          <p className="font-mono font-black text-white text-lg tracking-wider">{syncId}</p>
                        </div>
                        <button 
                          onClick={copyToClipboard}
                          className="p-4 bg-indigo-500 text-white rounded-2xl hover:bg-indigo-400 transition-all shadow-xl shadow-indigo-500/20 active:scale-90"
                        >
                          {copied ? <Check size={20} /> : <Copy size={20} />}
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Masukkan ID..."
                          value={inputSyncId}
                          onChange={(e) => setInputSyncId(e.target.value)}
                          className="flex-1 px-6 py-4.5 bg-black border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm text-white placeholder-slate-800"
                        />
                        <button 
                          onClick={loadFromCloud}
                          disabled={loading || !inputSyncId}
                          className="px-6 py-4.5 bg-slate-800 text-white font-black text-xs rounded-2xl hover:bg-slate-700 transition-all"
                        >
                          MUAT
                        </button>
                      </div>
                    )}
                    
                    {!syncId && (
                      <button 
                        onClick={saveToCloud}
                        disabled={loading}
                        className="w-full py-4.5 bg-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-3"
                      >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <CloudUpload size={20} />}
                        BUAT SYNC ID BARU
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Local Storage Tab */}
              {activeTab === 'local' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                  <div className="p-7 bg-slate-950/30 border border-slate-800/60 rounded-[32px] ring-1 ring-white/5 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl"><Lock size={20} /></div>
                      <div>
                        <h4 className="font-black text-white text-sm uppercase tracking-widest">Arsip File Fisik</h4>
                        <p className="text-[10px] text-slate-500 font-bold mt-1">Penyimpanan Offline Mandiri</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={exportToFile}
                        className="flex flex-col items-center gap-3 p-6 bg-slate-900 border border-slate-800 rounded-[24px] hover:bg-slate-800 hover:border-indigo-500/30 transition-all group"
                      >
                        <Download className="text-indigo-400 group-hover:translate-y-1 transition-transform" size={24} />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Simpan File</span>
                      </button>
                      
                      <label className="flex flex-col items-center gap-3 p-6 bg-slate-900 border border-slate-800 rounded-[24px] hover:bg-slate-800 hover:border-emerald-500/30 transition-all cursor-pointer group">
                        <Upload className="text-emerald-400 group-hover:-translate-y-1 transition-transform" size={24} />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Buka File</span>
                        <input type="file" accept=".json" onChange={importFromFile} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-6 flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold animate-shake">
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}
              
              {successMsg && (
                <div className="mt-6 flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-bold animate-in zoom-in">
                  <Check size={16} />
                  {successMsg}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-10 py-8 bg-black/40 border-t border-slate-800/60 flex flex-col items-center gap-6">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-[0.3em] rounded-[20px] transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95 group"
              >
                <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                Selesai & Keluar
              </button>
              <div className="flex justify-between w-full items-center">
                <div className="flex items-center gap-2 text-[10px] text-slate-600 font-black uppercase tracking-widest">
                  <Lock size={12} /> Data Vault Secure
                </div>
                <p className="text-[10px] text-slate-700 font-medium italic">
                  Aniq Susilo Finance System v2.3
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CloudSync;
