import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, PhoneCall } from 'lucide-react';
import { api } from '../api/seatPulseApi';
import { useAuthStore } from '../store/useAuthStore';

const GlowingSoundwave = () => (
  <div className="mx-auto mb-6 sm:mb-10 w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-[#e8d5b5]/25 flex items-center justify-center shadow-[0_0_100px_rgba(232,213,181,.16)]">
    <div className="soundwave" aria-hidden="true">
      <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
    </div>
  </div>
);

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, logout } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your admin credentials.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const token = await api.auth.login({ emailId: email, password });
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role || payload.roles || payload.authorities || 'USER';

      if (role !== 'ADMIN') {
        logout();
        throw new Error('Unauthorized: This portal is restricted to verified Organizers.');
      }

      login(token);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#07090e] font-sans text-[#f2eee8] selection:bg-[#E8D5B5]/30 selection:text-white flex flex-col">

      {/* Embedded Canva CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&display=swap');

        .bg-cinematic {
          background: radial-gradient(ellipse at 80% 7%, rgba(183,137,75,.12), transparent 42%),
                      radial-gradient(ellipse at 10% 82%, rgba(108,88,62,.09), transparent 40%);
        }

        .font-serif-cinematic { font-family: 'Fraunces', serif; }

        .soundwave { display:flex; align-items:center; justify-content:center; gap:5px; filter:drop-shadow(0 0 16px rgba(232,213,181,.65)); }
        .soundwave span { width:3px; border-radius:10px; background:linear-gradient(#fff6e5,#b99158); animation:pulse 1.8s ease-in-out infinite alternate; }
        .soundwave span:nth-child(1),.soundwave span:nth-child(7) { height:15px; animation-delay:.15s; }
        .soundwave span:nth-child(2),.soundwave span:nth-child(6) { height:30px; animation-delay:.35s; }
        .soundwave span:nth-child(3),.soundwave span:nth-child(5) { height:47px; animation-delay:.1s; }
        .soundwave span:nth-child(4) { height:61px; animation-delay:.4s; }
        @keyframes pulse { to { transform:scaleY(.67); opacity:.72; } }

        .admin-field {
          width: 100%; border: 1px solid rgba(232,213,181,.22); background: #11141a; color: #f2eee8;
          border-radius: 12px; padding: 14px 16px; font-size: 16px; outline: none; transition: border-color 0.2s;
        }
        .admin-field:focus { border-color: #e8d5b5; box-shadow: 0 0 10px rgba(232,213,181,.1); }
      `}} />

      <div className="absolute inset-0 z-0 pointer-events-none bg-cinematic"></div>

      <header className="relative z-10 w-full px-4 sm:px-10 lg:px-16 py-5 sm:py-7 flex justify-between items-center gap-3">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="soundwave scale-50 -mx-3" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
          </div>
          <span className="tracking-[.17em] font-bold text-[#e8d5b5] text-sm sm:text-base">SEATPULSE</span>
        </div>
        <span className="shrink-0 whitespace-nowrap text-[10px] sm:text-xs text-[#e8d5b5] border border-[#e8d5b5]/30 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full tracking-[.15em] sm:tracking-[.25em] uppercase">
          Admin Portal
        </span>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-6 sm:py-12">
        <div className="w-full max-w-[420px] text-center">

          <GlowingSoundwave />

          <p className="tracking-[.25em] uppercase mb-3 sm:mb-4 text-[#e8d5b5] text-xs sm:text-sm font-medium">
            Authorized Personnel Only
          </p>
          <h1 className="font-serif-cinematic leading-tight mb-6 sm:mb-8 text-[#f2eee8] text-3xl sm:text-5xl">
            Welcome back.
          </h1>

          <form onSubmit={handleAdminLogin} className="space-y-5 text-left">

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm font-medium text-red-400 text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block mb-2 text-[#e8d5b5] text-sm font-medium">Verified Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="admin-field"
                placeholder="director@seatpulse.com"
              />
            </div>

            <div>
              <label className="block mb-2 text-[#e8d5b5] text-sm font-medium">Security Key</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="admin-field"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-semibold text-[#07090e] shadow-sm transition-all duration-200 hover:bg-neutral-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enter Dashboard ↗'}
            </button>
          </form>

        </div>
      </main>

      <footer className="relative z-10 px-6 pb-9">
        <div className="h-[1px] max-w-6xl mx-auto bg-gradient-to-r from-transparent via-[#e8d5b5]/60 to-transparent"></div>
        <p className="text-center mt-6 text-[#a6a3a0] text-xs">
          SeatPulse Global Administration · All interactions are logged and monitored.
        </p>
      </footer>

    </div>
  );
}