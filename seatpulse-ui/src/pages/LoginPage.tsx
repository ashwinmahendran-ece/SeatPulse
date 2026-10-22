import { useState, useEffect } from 'react'; // Add useEffect here
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/seatPulseApi';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/explore', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    try {
      await api.auth.login({ username, password });

      toast.success('Welcome back!');
      navigate('/explore');
    } catch (err: any) {
      toast.error(err.message || 'Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F6F2] px-5 py-24">
      <div className="w-full max-w-md rounded-3xl border border-[#DCD8D2] bg-white p-8 shadow-sm sm:p-10">

        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6735E8]/10 text-[#6735E8] mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="font-display text-3xl font-bold text-[#242224]">
            Log in to <span className="text-[#6735E8]">SeatPulse</span>
          </h1>
          <p className="mt-2 text-sm text-[#726E75]">
            Enter your details to access your account and book tickets.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#242224]">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. john_doe"
              className="w-full rounded-xl border border-[#DCD8D2] bg-[#F8F6F2] px-4 py-3 text-sm text-[#242224] outline-none transition focus:border-[#6735E8] focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#242224]">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#DCD8D2] bg-[#F8F6F2] px-4 py-3 text-sm text-[#242224] outline-none transition focus:border-[#6735E8] focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#242224] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#111011] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Authenticating...</>
            ) : (
              <>Sign In <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#726E75]">
         <p>Don't have an account? <Link to="/register" className="font-semibold text-[#6735E8] hover:underline">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}