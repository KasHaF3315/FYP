import { useState } from 'react';
import { Shield, ArrowLeft, User, Mail, Hash, AlertCircle, KeyRound } from 'lucide-react';
import { api } from '@/lib/api';
import boyIllustration from '@/assets/6c810de1bdbd8e10d005127c0af3c4614babe691.png';
import { AdminPasswordResetModal } from './AdminPasswordResetModal';

interface AdminLoginPageProps {
  onBack: () => void;
  onLoginSuccess: (admin: any) => void;
}

export function AdminLoginPage({ onBack, onLoginSuccess }: AdminLoginPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = mode === 'login'
        ? await api.adminLogin({ username, password })
        : await api.adminRegister({ username, email, password });
      onLoginSuccess(data.admin);
    } catch (err: any) {
      setError(err?.message || (mode === 'login' ? 'Admin login failed' : 'Admin signup failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="w-full max-w-[320px] sm:max-w-[380px] md:max-w-[420px] lg:max-w-[460px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex gap-1.5 sm:gap-2">
        <div className="w-5 h-2.5 sm:w-6 sm:h-3 bg-white/20 rounded-full"></div>
        <div className="w-3 h-2 sm:w-4 sm:h-2.5 bg-white/20 rounded-full"></div>
      </div>
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex gap-1.5 sm:gap-2">
        <div className="w-3 h-2 sm:w-4 sm:h-2.5 bg-white/20 rounded-full"></div>
        <div className="w-5 h-2.5 sm:w-6 sm:h-3 bg-white/20 rounded-full"></div>
      </div>

      <div className="m-4 sm:m-5 bg-white/5 rounded-2xl overflow-hidden relative border border-white/10">
        <button
          onClick={onBack}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 w-10 h-10 bg-white/20 hover:bg-white/30 active:scale-95 rounded-full flex items-center justify-center transition-all min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2.5} />
        </button>

        <div className="absolute top-20 sm:top-24 left-3 sm:left-4 w-8 h-5 sm:w-10 sm:h-6 bg-[#4a9fd0]/30 rounded-full"></div>
        <div className="absolute top-24 sm:top-28 left-6 sm:left-8 w-6 h-4 sm:w-8 sm:h-5 bg-[#4a9fd0]/30 rounded-full"></div>
        <div className="absolute top-20 sm:top-24 right-3 sm:right-4 w-10 h-5 sm:w-12 sm:h-6 bg-[#4a9fd0]/30 rounded-full"></div>
        <div className="absolute top-24 sm:top-28 right-6 sm:right-8 w-8 h-4 sm:w-10 sm:h-5 bg-[#4a9fd0]/30 rounded-full"></div>

        <div className="flex flex-col">
          <div className="relative w-full flex justify-center">
            <img
              src={boyIllustration}
              alt="Admin Auth"
              className="h-32 sm:h-36 md:h-40 object-contain mx-auto"
            />
          </div>
          <div className="flex-1">
            <div className="px-5 sm:px-7 py-6 sm:py-8 relative z-10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-white" />
                <h1 className="text-white text-center text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
                  {mode === 'login' ? 'Admin Login' : 'Admin Sign Up'}
                </h1>
              </div>
              <p className="text-white/80 text-center text-sm sm:text-base mb-5 sm:mb-6">
                Secure admin access for account management
              </p>

              <div className="mb-4 sm:mb-5 grid grid-cols-2 rounded-xl bg-white/20 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className={`rounded-lg py-2 text-sm transition-colors ${mode === 'login' ? 'bg-white text-[#2f77ac] shadow-sm' : 'text-white/85'}`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                  className={`rounded-lg py-2 text-sm transition-colors ${mode === 'signup' ? 'bg-white text-[#2f77ac] shadow-sm' : 'text-white/85'}`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3 sm:mb-4">
                  <label className="block text-white/90 text-xs mb-1.5 px-1">Username</label>
                  <div className="flex items-center bg-white/95 rounded-xl px-4 py-3 gap-3 shadow-sm ring-1 ring-black/5 min-h-[44px]">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" strokeWidth={2} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      className="flex-1 min-w-0 bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-400 text-sm"
                      required
                    />
                  </div>
                </div>

                {mode === 'signup' && (
                  <div className="mb-3 sm:mb-4">
                    <label className="block text-white/90 text-xs mb-1.5 px-1">Email</label>
                    <div className="flex items-center bg-white/95 rounded-xl px-4 py-3 gap-3 shadow-sm ring-1 ring-black/5 min-h-[44px]">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" strokeWidth={2} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email@example.com"
                        className="flex-1 min-w-0 bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-400 text-sm"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="mb-4 sm:mb-5">
                  <label className="block text-white/90 text-xs mb-1.5 px-1">Password</label>
                  <div className="flex items-center bg-white/95 rounded-xl px-4 py-3 gap-3 shadow-sm ring-1 ring-black/5 min-h-[44px]">
                    <Hash className="w-4 h-4 text-gray-400 flex-shrink-0" strokeWidth={2} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="flex-1 min-w-0 bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-400 text-sm"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="mb-3 sm:mb-4 bg-red-500/20 border border-red-400 rounded-xl px-3 py-2.5 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-200 flex-shrink-0 mt-0.5" />
                    <p className="text-red-100 text-xs break-words">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#f37835] hover:bg-[#e86925] active:scale-[0.98] disabled:opacity-70 text-white rounded-2xl py-3.5 sm:py-4 transition-all shadow-lg font-medium min-h-[48px] text-base sm:text-lg"
                >
                  {loading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : (mode === 'login' ? 'Sign In as Admin' : 'Create Admin Account')}
                </button>
              </form>

              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="mt-3 flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-bold text-[#1e3a5f] shadow-md ring-2 ring-white/80 hover:bg-white/95 active:scale-[0.99] sm:mt-4 sm:py-4 sm:text-base"
                >
                  <KeyRound className="h-5 w-5 shrink-0 text-[#2d5a8a]" aria-hidden />
                  Forgot password
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

    <AdminPasswordResetModal
      open={showForgotModal}
      onClose={() => setShowForgotModal(false)}
      initialAccount={(email.trim() || username.trim())}
    />
    </>
  );
}
