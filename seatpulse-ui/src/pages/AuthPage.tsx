import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { api } from '../api/seatPulseApi';
import { useAuthStore } from '../store/useAuthStore';

const SoundwaveLogo = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#e8d5b5]">
    <path d="M12 3v18M8 7v10M16 6v12M4 10v4M20 9v6M2 11v2M22 11v2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both fields.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const token = await api.auth.login({ emailId: email, password });

      login(token);

      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role || payload.roles || payload.authorities || 'USER';

      if (role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/explore');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#07090e] font-sans text-[#f4f2ee] selection:bg-[#E8D5B5]/30 selection:text-white">

      <style>{`
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes slide-up { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }

        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        .animate-slide-up { animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }

        /* Thin grid background for the right panel */
        .grid-glow {
          background-image: linear-gradient(rgba(232,213,181,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(232,213,181,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      {/* LEFT SIDE: HERO BANNER (Hidden on mobile/tablet) */}
      <div className="relative hidden lg:flex w-1/2 flex-col justify-end p-16 overflow-hidden bg-[#11131a]">

        {/* Background Image - KNOWN WORKING URL */}
        <div className="absolute inset-0 z-0 bg-[#07090e]">
          <img
            src="https://images6.alphacoders.com/478/thumb-1920-478918.jpg"
            alt="Live Concert Crowd"
            className="h-full w-full object-cover object-center opacity-60 mix-blend-screen"
          />
        </div>

        {/* Gradients to blend the image into the dark UI */}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/60 to-transparent"></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-transparent to-[#07090e]"></div>

        {/* Content over image */}
        <div className="relative z-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h1 className="font-display text-[64px] font-extrabold tracking-tight text-white mb-4 leading-none shadow-black drop-shadow-2xl">
            Access, Elevated.
          </h1>
          <div className="flex items-center gap-3 opacity-80">
            <SoundwaveLogo />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: LOGIN FORM */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center items-center p-6 sm:p-12 lg:p-20 relative grid-glow">

        <div className="w-full max-w-[420px] animate-fade-in relative z-10">

          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3 mb-10 cursor-pointer" onClick={() => navigate('/')}>
            <SoundwaveLogo />
            <span className="font-display text-xl font-bold tracking-tight text-[#f4f2ee]">
              Seat<span className="text-[#e8d5b5]">Pulse</span>
            </span>
          </div>

          <h2 className="font-display text-4xl font-extrabold tracking-tight text-white mb-10">
            Welcome Back
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">

            {/* Error Message Display */}
            {error && (
              <div className="animate-fade-in rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm font-medium text-red-400">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <label className="text-xs font-medium text-[#e8d5b5]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-[#e8d5b5]/30 bg-[#11131a]/50 px-4 py-3.5 text-base text-[#f4f2ee] placeholder-white/20 outline-none transition-colors focus:border-[#e8d5b5] focus:bg-[#11131a]"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <label className="text-xs font-medium text-[#e8d5b5]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-[#e8d5b5]/30 bg-[#11131a]/50 px-4 py-3.5 text-base text-[#f4f2ee] placeholder-white/20 outline-none transition-colors focus:border-[#e8d5b5] focus:bg-[#11131a]"
                placeholder="••••••••"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-6 space-y-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-full bg-[#e8d5b5] py-4 text-sm font-bold text-[#07090e] transition-all hover:bg-white hover:shadow-[0_0_30px_rgba(232,213,181,0.3)] disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
              </button>

              <Link
                to="/register"
                className="flex w-full items-center justify-center rounded-full border border-[#e8d5b5]/40 bg-transparent py-4 text-sm font-bold text-[#e8d5b5] transition-colors hover:bg-[#e8d5b5]/10"
              >
                Create an Account
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}