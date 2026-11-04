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

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !mobileNumber) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await api.auth.register({ username: name, emailId: email, password, mobileNumber });

      const token = await api.auth.login({ emailId: email, password });
      login(token);

      navigate('/explore');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try a different email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#07090e] font-sans text-[#f4f2ee] selection:bg-[#E8D5B5]/30 selection:text-white">

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes slide-up { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }

        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        .animate-slide-up { animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }

        .grid-glow {
          background-image: linear-gradient(rgba(232,213,181,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(232,213,181,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}} />

      {/* LEFT SIDE: HERO BANNER */}
      <div className="relative hidden lg:flex w-1/2 flex-col justify-end p-16 overflow-hidden bg-[#11131a]">
        <div className="absolute inset-0 z-0 bg-[#07090e]">
          <img
            src="https://images6.alphacoders.com/478/thumb-1920-478918.jpg"
            alt="Live Concert Crowd"
            className="h-full w-full object-cover object-center opacity-60 mix-blend-screen"
          />
        </div>

        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/60 to-transparent"></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-transparent to-[#07090e]"></div>

        <div className="relative z-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h1 className="font-display text-[64px] font-extrabold tracking-tight text-white mb-4 leading-none shadow-black drop-shadow-2xl">
            Join the Pulse.
          </h1>
          <div className="flex items-center gap-3 opacity-80">
            <SoundwaveLogo />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: REGISTER FORM */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center items-center p-6 sm:p-12 lg:p-20 relative grid-glow">

        <div className="w-full max-w-[420px] animate-fade-in relative z-10">

          <div className="flex items-center gap-3 mb-10 cursor-pointer" onClick={() => navigate('/')}>
            <SoundwaveLogo />
            <span className="font-display text-xl font-bold tracking-tight text-[#f4f2ee]">
              Seat<span className="text-[#e8d5b5]">Pulse</span>
            </span>
          </div>

          <h2 className="font-display text-4xl font-extrabold tracking-tight text-white mb-8">
            Create an Account
          </h2>

          <form onSubmit={handleRegister} className="space-y-5">

            {error && (
              <div className="animate-fade-in rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm font-medium text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <label className="text-xs font-medium text-[#e8d5b5]">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-[#e8d5b5]/30 bg-[#11131a]/50 px-4 py-3.5 text-base text-[#f4f2ee] placeholder-white/20 outline-none transition-colors focus:border-[#e8d5b5] focus:bg-[#11131a]"
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.15s' }}>
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

            {/* Mobile Number Field */}
                        <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.17s' }}>
                          <label className="text-xs font-medium text-[#e8d5b5]">Mobile Number</label>
                          <input
                            type="tel"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            required
                            className="w-full rounded-xl border border-[#e8d5b5]/30 bg-[#11131a]/50 px-4 py-3.5 text-base text-[#f4f2ee] placeholder-white/20 outline-none transition-colors focus:border-[#e8d5b5] focus:bg-[#11131a]"
                            placeholder="Enter your mobile number"
                          />
                        </div>

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

            <div className="pt-4 space-y-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-full bg-[#e8d5b5] py-4 text-sm font-bold text-[#07090e] transition-all hover:bg-white hover:shadow-[0_0_30px_rgba(232,213,181,0.3)] disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign Up'}
              </button>

              <Link
                to="/login"
                className="flex w-full items-center justify-center rounded-full border border-[#e8d5b5]/40 bg-transparent py-4 text-sm font-bold text-[#e8d5b5] transition-colors hover:bg-[#e8d5b5]/10"
              >
                Already have an account? Sign In
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}