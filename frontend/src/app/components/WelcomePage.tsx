import { Users, User } from 'lucide-react';
import boyIllustration from '@/assets/6c810de1bdbd8e10d005127c0af3c4614babe691.png';

interface WelcomePageProps {
  onSelectRole: (role: 'parent' | 'child' | 'admin') => void;
}

export function WelcomePage({ onSelectRole }: WelcomePageProps) {
  return (
    <div className="w-full max-w-[320px] sm:max-w-[380px] md:max-w-[420px] lg:max-w-[460px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl relative overflow-hidden">
      {/* Decorative clouds */}
      <div className="absolute top-4 left-4 sm:top-5 sm:left-5 flex gap-2">
        <div className="w-6 h-3 sm:w-7 sm:h-3.5 bg-white/10 rounded-full"></div>
        <div className="w-4 h-2.5 sm:w-5 sm:h-3 bg-white/10 rounded-full"></div>
      </div>
      <div className="absolute top-4 right-4 sm:top-5 sm:right-5 flex gap-2">
        <div className="w-4 h-2.5 sm:w-5 sm:h-3 bg-white/10 rounded-full"></div>
        <div className="w-6 h-3 sm:w-7 sm:h-3.5 bg-white/10 rounded-full"></div>
      </div>

      {/* Inner card with sideways image panel */}
      <div className="m-4 sm:m-5 bg-white/5 rounded-2xl overflow-hidden relative border border-white/10">
        <div className="flex flex-col">
          <div className="relative w-full flex justify-center">
            <img
              src={boyIllustration}
              alt="Welcome"
              className="h-32 sm:h-36 md:h-40 object-contain mx-auto"
            />
          </div>
          <div className="flex-1">
        {/* More decorative elements */}
        <div className="absolute top-24 sm:top-28 left-4 sm:left-6 w-10 h-6 sm:w-12 sm:h-7 bg-white/10 rounded-full"></div>
        <div className="absolute top-28 sm:top-32 left-8 sm:left-10 w-8 h-5 sm:w-10 sm:h-6 bg-white/10 rounded-full"></div>
        <div className="absolute top-24 sm:top-28 right-4 sm:right-6 w-12 h-6 sm:w-14 sm:h-7 bg-white/10 rounded-full"></div>
        <div className="absolute top-28 sm:top-32 right-8 sm:right-10 w-10 h-5 sm:w-12 sm:h-6 bg-white/10 rounded-full"></div>

        {/* Content */}
        <div className="px-5 sm:px-7 py-6 sm:py-7 relative z-10">
          <h1 className="text-white text-center text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight mb-2">
            Welcome to CyberQuest!
          </h1>
          <p className="text-white/80 text-center text-sm sm:text-base md:text-lg mb-6 sm:mb-7">
            Are you a parent or a child?
          </p>

          {/* I'm a Parent Button */}
          <button
            onClick={() => onSelectRole('parent')}
            className="w-full bg-[#f37835] hover:bg-[#e86925] active:scale-[0.98] text-white rounded-2xl py-3.5 sm:py-4 mb-3 sm:mb-4 transition-all shadow-lg font-medium flex items-center justify-center gap-2 text-base sm:text-lg min-h-[48px]"
          >
            <Users className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
            I'm a Parent
          </button>

          {/* I'm a Child Button */}
          <button
            onClick={() => onSelectRole('child')}
            className="w-full bg-white hover:bg-gray-50 active:scale-[0.98] text-[#5ba3d4] rounded-2xl py-3.5 sm:py-4 mb-5 sm:mb-6 transition-all shadow-lg font-medium flex items-center justify-center gap-2 text-base sm:text-lg min-h-[48px]"
          >
            <User className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
            I'm a Child
          </button>

          {/* Admin Access Link */}
          <button
            onClick={() => onSelectRole('admin')}
            className="w-full text-white/80 hover:text-white text-sm sm:text-base transition-colors underline py-2.5 min-h-[44px] flex items-center justify-center"
          >
            Admin Access
          </button>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
