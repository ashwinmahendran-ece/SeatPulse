import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ArrowLeft, CheckCircle2, XCircle, ScanLine, Loader2 } from 'lucide-react';
import { api } from "../api/seatPulseApi";

export default function AdminScannerPage() {
  const navigate = useNavigate();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const [scanResult, setScanResult] = useState<{ type: 'success' | 'error' | 'loading' | null, message: string }>({ type: null, message: '' });
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      false
    );

    scannerRef.current.render(onScanSuccess, onScanFailure);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const onScanSuccess = async (decodedText: string) => {
    if (decodedText === lastScanned) return;

    setLastScanned(decodedText);
    setScanResult({ type: 'loading', message: 'Verifying ticket...' });

    const response = await api.admin.scanTicket(decodedText);

    if (response.success) {
      setScanResult({ type: 'success', message: response.success });
    } else {
      setScanResult({ type: 'error', message: response.error || 'Invalid ticket.' });
    }

    setTimeout(() => {
      setScanResult({ type: null, message: '' });
      setLastScanned(null);
    }, 3000);
  };

  const onScanFailure = (error: any) => {

  };

  return (
    <div className="min-h-screen bg-[#07090E] text-white font-sans flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: `
        #qr-reader {
          border: none !important;
        }
        #qr-reader button {
          background-color: #ffffff;
          color: #07090e;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.65rem 1.25rem;
          border-radius: 0.75rem;
          border: none;
          cursor: pointer;
          margin: 0.5rem auto;
          transition: background-color 0.2s ease, transform 0.15s ease;
        }
        #qr-reader button:hover {
          background-color: #e5e5e5;
        }
        #qr-reader button:active {
          transform: scale(0.98);
        }
        #qr-reader select {
          max-width: 100%;
          width: 100%;
          background-color: #07090E;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 0.75rem;
          padding: 0.6rem 0.75rem;
          font-size: 16px;
          margin-bottom: 0.5rem;
        }
        #qr-reader a {
          color: #cbd5e1;
          font-size: 0.875rem;
          display: inline-block;
          margin-top: 0.5rem;
        }
      `}} />

      <header className="border-b border-white/10 bg-[#11131A] px-4 sm:px-5 h-16 flex items-center justify-between gap-2 shadow-md z-10">
        <button onClick={() => navigate('/admin')} className="shrink-0 whitespace-nowrap py-2 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Dashboard
        </button>
        <div className="flex items-center gap-2 font-display font-bold truncate">
          <ScanLine className="text-indigo-400 shrink-0" size={20} />
          <span className="truncate">Entry Scanner</span>
        </div>
        <div className="w-12 sm:w-20 shrink-0"></div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-5 relative">
        <div className="w-full max-w-md bg-[#11131A] p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">


          {scanResult.type && (
            <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md transition-all
              ${scanResult.type === 'success' ? 'bg-emerald-950/90' : scanResult.type === 'error' ? 'bg-red-950/90' : 'bg-[#07090E]/90'}
            `}>
              {scanResult.type === 'loading' && <Loader2 className="w-16 h-16 text-indigo-400 animate-spin mb-4" />}
              {scanResult.type === 'success' && <CheckCircle2 className="w-20 h-20 text-emerald-400 mb-4" />}
              {scanResult.type === 'error' && <XCircle className="w-20 h-20 text-red-400 mb-4" />}

              <h2 className={`text-xl font-bold mb-2
                ${scanResult.type === 'success' ? 'text-emerald-400' : scanResult.type === 'error' ? 'text-red-400' : 'text-white'}`}>
                {scanResult.type === 'success' ? 'VALID TICKET' : scanResult.type === 'error' ? 'ACCESS DENIED' : 'Scanning...'}
              </h2>
              <p className="text-sm font-medium text-slate-300">{scanResult.message}</p>
            </div>
          )}

          <div id="qr-reader" className="w-full rounded-2xl overflow-hidden [&>video]:rounded-2xl [&>video]:object-cover border-2 border-dashed border-white/20"></div>

          <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest mt-4">
            Point camera at QR code
          </p>
        </div>
      </main>
    </div>
  );
}