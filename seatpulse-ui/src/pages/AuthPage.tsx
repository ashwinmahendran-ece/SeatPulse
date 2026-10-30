import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../api/seatPulseApi';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleOAuthSubmit = () => {
    toast('Google Sign-In integration pending', { icon: 'ℹ️' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Execute real backend login
        const actualToken = await api.auth.login({ username, password });

        // Decode the token to get the ACTUAL role
        let realRole = "USER";
        try {
          const payload = JSON.parse(atob(actualToken.split('.')[1]));
          // Spring Boot typically uses 'role', 'roles', or 'authorities'
          realRole = payload.role || payload.roles || payload.authorities || "USER";
        } catch (e) {
          console.error("Could not parse token payload for role", e);
        }

        // Update Zustand store with the dynamic role
        login(actualToken, { username: username, role: realRole });

        toast.success('Welcome back!', {
          style: { background: '#0F172A', color: '#FFFFFF', borderRadius: '4px', fontWeight: 'bold' }
        });
        navigate('/explore');
      } else {
        // Execute real backend registration
        await api.auth.register({ username, emailId, password });

        toast.success('Account created! Please log in.', {
          style: { background: '#0055FF', color: '#FFFFFF', borderRadius: '4px', fontWeight: 'bold' }
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error("Auth Error Details:", error);
      toast.error(error.message || 'Authentication failed. Please check your credentials.', {
        style: { background: '#DC2626', color: '#FFFFFF', borderRadius: '4px', fontWeight: 'bold' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8F9FA] text-[#0F172A]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>

      {/* LEFT PANEL - Branding */}
      <div className="w-full md:w-1/2 bg-[#0055FF] p-8 md:p-16 lg:p-24 flex flex-col justify-between min-h-[40vh] md:min-h-screen">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6">
            Make room for<br />a good night.
          </h1>
          <p className="text-lg text-white/90 font-medium max-w-md">
            Live music, late nights, front-row moments. Your next great plan starts with a seat.
          </p>
        </div>

        <div className="mt-12">
          <p className="font-bold text-white text-sm">SeatPulse Ticketing</p>
        </div>
      </div>

      {/* RIGHT PANEL - Form */}
      <div className="w-full md:w-1/2 p-8 md:p-16 lg:p-24 flex flex-col justify-center bg-white border-l border-[#E2E8F0]">
        <div className="max-w-md w-full mx-auto">

          <div className="mb-10">
            <h2 className="text-3xl font-black tracking-tight mb-2">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="font-medium text-[#64748B] text-sm">
              {isLogin ? 'Log in to find your tickets and your next plan.' : 'Join to secure your seats instantly.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleOAuthSubmit}
            className="w-full border-[2px] border-[#E2E8F0] py-3.5 font-bold text-sm text-[#0F172A] rounded-[4px] hover:border-[#0F172A] transition-none mb-8 flex justify-center items-center gap-3"
          >
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] flex-1 bg-[#E2E8F0]"></div>
            <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wide">or use email</span>
            <div className="h-[1px] flex-1 bg-[#E2E8F0]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="space-y-1.5">
              <label className="block font-bold text-sm text-[#0F172A]">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white text-[#0F172A] px-4 py-3 border-[2px] border-[#E2E8F0] focus:border-[#0055FF] focus:outline-none transition-none font-medium rounded-[4px]"
                placeholder="Enter username"
                required
              />
            </div>

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="block font-bold text-sm text-[#0F172A]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  className="w-full bg-white text-[#0F172A] px-4 py-3 border-[2px] border-[#E2E8F0] focus:border-[#0055FF] focus:outline-none transition-none font-medium rounded-[4px]"
                  placeholder="name@example.com"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block font-bold text-sm text-[#0F172A]">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white text-[#0F172A] px-4 py-3 border-[2px] border-[#E2E8F0] focus:border-[#0055FF] focus:outline-none transition-none font-medium rounded-[4px]"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0055FF] text-white py-3.5 font-bold text-base rounded-[4px] hover:bg-[#0F172A] transition-none disabled:opacity-50 mt-2"
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Log in' : 'Sign up')}
            </button>

          </form>

          <div className="mt-8 text-center pt-6">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setUsername('');
                setPassword('');
                setEmailId('');
              }}
              className="text-sm font-bold text-[#0055FF] hover:text-[#0F172A] transition-none"
            >
              {isLogin ? "New here? Create an account" : "Already have an account? Log in"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}