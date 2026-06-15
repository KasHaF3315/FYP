import { User, Hash, AlertCircle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import boyIllustration from '@/assets/6c810de1bdbd8e10d005127c0af3c4614babe691.png';
import { api } from '@/lib/api';

interface ChildLoginPageProps {
  onBack: () => void;
  onLogin: (childData: any) => void;
}

export function ChildLoginPage({ onBack, onLogin }: ChildLoginPageProps) {
  const [childName, setChildName] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!childName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!loginCode || String(loginCode).length !== 2) {
      setError('Please enter your 2-digit login code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const d = await api.childLogin({ name: childName.trim(), loginCode: String(loginCode) });
      onLogin(d.child);
    } catch (e: any) {
      setError(e?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="w-full max-w-[320px] sm:max-w-[380px] md:max-w-[420px] lg:max-w-[460px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl relative overflow-hidden">
      {/* Decorative clouds */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex gap-1.5 sm:gap-2">
        <div className="w-5 h-2.5 sm:w-6 sm:h-3 bg-white/20 rounded-full"></div>
        <div className="w-3 h-2 sm:w-4 sm:h-2.5 bg-white/20 rounded-full"></div>
      </div>
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex gap-1.5 sm:gap-2">
        <div className="w-3 h-2 sm:w-4 sm:h-2.5 bg-white/20 rounded-full"></div>
        <div className="w-5 h-2.5 sm:w-6 sm:h-3 bg-white/20 rounded-full"></div>
      </div>

      {/* Inner card */}
      <div className="m-4 sm:m-5 bg-white/5 rounded-2xl overflow-hidden relative border border-white/10">
        <div className="flex flex-col">
          <div className="relative w-full flex justify-center">
            <img 
              src={boyIllustration} 
              alt="Login" 
              className="h-32 sm:h-36 md:h-40 object-contain mx-auto"
            />
          </div>
          <div className="flex-1">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 w-10 h-10 bg-white/20 hover:bg-white/30 active:scale-95 rounded-full flex items-center justify-center transition-all min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2.5} />
        </button>

        {/* More decorative elements */}
        <div className="absolute top-20 sm:top-24 left-3 sm:left-4 w-8 h-5 sm:w-10 sm:h-6 bg-[#4a9fd0]/30 rounded-full"></div>
        <div className="absolute top-24 sm:top-28 left-6 sm:left-8 w-6 h-4 sm:w-8 sm:h-5 bg-[#4a9fd0]/30 rounded-full"></div>
        <div className="absolute top-20 sm:top-24 right-3 sm:right-4 w-10 h-5 sm:w-12 sm:h-6 bg-[#4a9fd0]/30 rounded-full"></div>
        <div className="absolute top-24 sm:top-28 right-6 sm:right-8 w-8 h-4 sm:w-10 sm:h-5 bg-[#4a9fd0]/30 rounded-full"></div>

        {/* Cartoon Character */}
        {/* Content */}
        <div className="px-5 sm:px-7 py-6 sm:pb-8 relative z-10">
          <h1 className="text-white text-center text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight mb-2">
            Child Login
          </h1>
          <p className="text-white/80 text-center text-sm sm:text-base mb-5 sm:mb-6">
            Enter your name and the code from your parent
          </p>

          {/* Your Name */}
          <div className="mb-3 sm:mb-4">
            <label className="block text-white/90 text-xs mb-1.5 px-1">Your Name</label>
            <div className="flex items-center bg-white/95 rounded-xl px-4 py-3 gap-3 shadow-sm ring-1 ring-black/5 min-h-[44px]">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" strokeWidth={2} />
              <input
                type="text"
                placeholder="Enter your name"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-400 text-sm"
                autoComplete="name"
              />
            </div>
          </div>

          {/* Login Code */}
          <div className="mb-4">
            <label className="block text-white/90 text-xs mb-1.5 px-1">Your Login Code</label>
            <div className="flex items-center bg-white/95 rounded-xl px-4 py-3 gap-3 shadow-sm ring-1 ring-black/5 min-h-[44px]">
              <Hash className="w-4 h-4 text-gray-400 flex-shrink-0" strokeWidth={2} />
              <input
                type="text"
                inputMode="numeric"
                placeholder="00"
                value={loginCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  if (value.length <= 2) {
                    setLoginCode(value);
                  }
                }}
                onKeyPress={handleKeyPress}
                maxLength={2}
                className="w-14 sm:w-16 bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-300 text-lg sm:text-xl font-bold text-center"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Helper Text */}
          <p className="text-white/70 text-xs mb-4 sm:mb-5 text-center">
            Ask your parent for this code
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-2.5 sm:mb-3 bg-red-500/20 border border-red-400 rounded-lg sm:rounded-xl px-3 py-2 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-200 flex-shrink-0 mt-0.5" />
              <p className="text-red-100 text-xs break-words">{error}</p>
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#f37835] hover:bg-[#e86925] active:scale-[0.98] disabled:opacity-70 text-white rounded-2xl py-3.5 sm:py-4 mb-4 sm:mb-5 transition-all shadow-lg font-medium min-h-[48px] text-base sm:text-lg"
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>

          {/* Register Link */}
          <p className="text-center text-white/80 text-xs sm:text-sm">
            Don't have a code?{' '}
            <span className="text-white font-semibold">
              Ask your parent to register for you!
            </span>
          </p>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
