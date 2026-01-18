
import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Info } from 'lucide-react';

const PWAInstaller: React.FC = () => {
  const [showGuide, setShowGuide] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Cek apakah aplikasi sudah berjalan dalam mode standalone (terinstal)
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
                    || (window.navigator as any).standalone 
                    || document.referrer.includes('android-app://');
    
    setIsStandalone(standalone);

    // Tampilkan panduan jika bukan standalone dan di perangkat mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!standalone && isMobile) {
      const dismissed = localStorage.getItem('pwa_guide_dismissed');
      if (!dismissed) {
        setShowGuide(true);
      }
    }
  }, []);

  if (!showGuide || isStandalone) return null;

  const handleDismiss = () => {
    setShowGuide(false);
    localStorage.setItem('pwa_guide_dismissed', 'true');
  };

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 animate-in slide-in-from-bottom-8 duration-700">
      <div className="bg-indigo-600 rounded-[24px] p-5 shadow-2xl shadow-indigo-500/40 border border-white/20 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="flex items-start gap-4">
          <div className="bg-white/20 p-3 rounded-2xl text-white">
            <Smartphone size={24} />
          </div>
          
          <div className="flex-1 pr-6">
            <h4 className="text-white font-black text-sm uppercase tracking-wider mb-1">Pasang di HP Anda</h4>
            <p className="text-indigo-100 text-xs font-medium leading-relaxed">
              Klik menu browser (titik 3 atau ikon Share) lalu pilih <span className="font-black underline">"Tambahkan ke Layar Utama"</span> untuk akses cepat tanpa browser.
            </p>
          </div>

          <button 
            onClick={handleDismiss}
            className="text-white/60 hover:text-white p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white w-1/3 animate-pulse"></div>
          </div>
          <span className="text-[10px] text-indigo-100 font-black uppercase tracking-widest opacity-60">PWA Ready</span>
        </div>
      </div>
    </div>
  );
};

export default PWAInstaller;
