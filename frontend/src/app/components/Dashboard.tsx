import { House, Gift, User, LogOut, ArrowLeft, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect } from 'react';
import avatarImage from '@/assets/6c810de1bdbd8e10d005127c0af3c4614babe691.png';
import passwordCastleImg from '@/assets/f65661615d0e1439a58025efab287d16f50b5711.png';
import scamSafariImg from '@/assets/c4d7ee60145199229a244522c27f860e9962c82f.png';
import privacyVillageImg from '@/assets/58d283f95655d8f985aa21fb53550deed6380c88.png';
import cyberbullyBattleImg from '@/assets/fb30a8c0ec9ab0f2fb4d3e4ac835a0d2151b6243.png';
import { PasswordCastle } from './PasswordCastle';
import { ScamSafari } from './ScamSafari';
import { PrivacyVillage } from './PrivacyVillage';
import { CyberbullyBattle } from './CyberbullyBattle';
import { RewardsPage, loadProgress } from './RewardsPage';
import { ProfilePage } from './ProfilePage';
import { BugStarfieldBackground } from './BugStarfieldBackground';
import { MAIN_DASHBOARD_BGM } from './gameAudioUrls';
import { useBackgroundMusic } from './useBackgroundMusic';

interface DashboardProps {
  childData?: any;
  onSignOut?: () => void;
  onGoBack?: () => void;
  showBackButton?: boolean;
}

export default function Dashboard({ childData, onSignOut, onGoBack, showBackButton = false }: DashboardProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPasswordCastle, setShowPasswordCastle] = useState(false);
  const [showScamSafari, setShowScamSafari] = useState(false);
  const [showPrivacyVillage, setShowPrivacyVillage] = useState(false);
  const [showCyberbullyBattle, setShowCyberbullyBattle] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [currentModule, setCurrentModule] = useState('Password Castle');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [musicMuted, setMusicMuted] = useState(false);

  // Load progress from API
  useEffect(() => {
    loadProgress().then((progress) => {
      if (progress) {
        setCompletedLevels(progress.completedLevels || []);
        const completedCount = progress.completedLevels?.length || 0;
        if (completedCount < 5) {
          setCurrentLevel(completedCount + 1);
          setCurrentModule('Password Castle');
        } else {
          setCurrentLevel(5);
          setCurrentModule('Password Castle');
        }
      }
    });
  }, [showPasswordCastle, showScamSafari, showPrivacyVillage, showCyberbullyBattle, showRewards]);

  /** Same main BGM as home grid, while not inside a full-screen game. */
  const playMainHubBackgroundMusic =
    !showPasswordCastle &&
    !showScamSafari &&
    !showPrivacyVillage &&
    !showCyberbullyBattle;

  useBackgroundMusic(MAIN_DASHBOARD_BGM, {
    volume: 0.18,
    enabled: playMainHubBackgroundMusic && !musicMuted,
  });

  // Calculate progress percentage
  const progressPercentage = (completedLevels.length / 5) * 100;

  if (showPasswordCastle) {
    return <PasswordCastle onClose={() => setShowPasswordCastle(false)} />;
  }

  if (showScamSafari) {
    return <ScamSafari onClose={() => setShowScamSafari(false)} />;
  }

  if (showPrivacyVillage) {
    return <PrivacyVillage onClose={() => setShowPrivacyVillage(false)} />;
  }

  if (showCyberbullyBattle) {
    return <CyberbullyBattle onClose={() => setShowCyberbullyBattle(false)} />;
  }

  if (showRewards) {
    return <RewardsPage onBack={() => setShowRewards(false)} />;
  }

  if (showProfile) {
    return <ProfilePage childData={childData} onBack={() => setShowProfile(false)} />;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#1e3a5f] via-[#2d5a8a] to-[#1e3a5f] flex flex-col overflow-x-hidden relative">
      <BugStarfieldBackground />
      {/* Main Content */}
      <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden pb-20 sm:pb-24">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6 sm:mb-8">
            <div className="flex-1">
              <h1 className="text-white text-2xl sm:text-3xl md:text-4xl mb-2">
                Dashboard
              </h1>
              <div className="flex items-center gap-3 sm:gap-4 mb-2 mt-2">
                <span className="text-white/90 text-sm sm:text-base">
                  {currentModule} - Level {currentLevel}
                </span>
                <div className="flex-1 max-w-[150px] sm:max-w-[200px]">
                  <div className="h-2 sm:h-3 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3">
              <button
                type="button"
                title={musicMuted ? 'Unmute music' : 'Mute music'}
                aria-label={musicMuted ? 'Unmute music' : 'Mute music'}
                onClick={() => setMusicMuted((prev) => !prev)}
                className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                {musicMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full p-2 pr-3 transition-colors"
              >
                <img 
                  src={avatarImage} 
                  alt="Profile" 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                />
                <ChevronDown className="w-4 h-4 text-white" />
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-20">
                    {showBackButton && onGoBack && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onGoBack();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-gray-700"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Go Back</span>
                      </button>
                    )}
                    {onSignOut && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onSignOut();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Sign Out</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
            </div>
          </div>

          {/* Last Played */}
          <p className="text-white/80 text-sm sm:text-base mb-4 sm:mb-6">
            Last Played: Privacy Village
          </p>

          {/* Game Cards Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-6 sm:mb-8">
            {/* Password Castle */}
            <button
              onClick={() => setShowPasswordCastle(true)}
              className="bg-gradient-to-br from-[#4a9fd8] to-[#3d7ba8] rounded-2xl sm:rounded-3xl p-0 aspect-square flex flex-col items-center justify-center hover:scale-105 transition-transform shadow-lg overflow-hidden relative"
            >
              <img 
                src={passwordCastleImg} 
                alt="Password Castle" 
                className="w-full h-full object-cover"
              />
            </button>

            {/* Scam Safari */}
            <button
              onClick={() => setShowScamSafari(true)}
              className="bg-gradient-to-br from-[#e07a7a] to-[#d85555] rounded-2xl sm:rounded-3xl p-0 aspect-square flex flex-col items-center justify-center hover:scale-105 transition-transform shadow-lg overflow-hidden relative"
            >
              <img 
                src={scamSafariImg} 
                alt="Scam Safari" 
                className="w-full h-full object-cover"
              />
            </button>

            {/* Cyberbully Battle */}
            <button
              onClick={() => setShowCyberbullyBattle(true)}
              className="bg-gradient-to-br from-[#e07a9f] to-[#d85580] rounded-2xl sm:rounded-3xl p-0 aspect-square flex flex-col items-center justify-center hover:scale-105 transition-transform shadow-lg overflow-hidden relative"
            >
              <img 
                src={cyberbullyBattleImg} 
                alt="Cyberbully Battle" 
                className="w-full h-full object-cover"
              />
            </button>

            {/* Privacy Village */}
            <button
              onClick={() => setShowPrivacyVillage(true)}
              className="bg-gradient-to-br from-[#5fc88f] to-[#3da870] rounded-2xl sm:rounded-3xl p-0 aspect-square flex flex-col items-center justify-center hover:scale-105 transition-transform shadow-lg overflow-hidden relative"
            >
              <img 
                src={privacyVillageImg} 
                alt="Privacy Village" 
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - hidden on lg when more space, or keep for consistency; keep for both */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#1a2f4a]/95 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-4xl mx-auto flex items-center justify-around py-3 sm:py-4 lg:py-4 px-4">
          <button className="flex flex-col items-center gap-1 sm:gap-2 text-white hover:text-white/80 active:opacity-80 transition-colors min-w-[64px] sm:min-w-[80px] min-h-[56px] justify-center">
            <House className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={2} />
            <span className="text-xs sm:text-sm">Home</span>
          </button>
          <button
            onClick={() => setShowRewards(true)}
            className="flex flex-col items-center gap-1 sm:gap-2 text-white/60 hover:text-white active:opacity-80 transition-colors min-w-[64px] sm:min-w-[80px] min-h-[56px] justify-center"
          >
            <Gift className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={2} />
            <span className="text-xs sm:text-sm">Rewards</span>
          </button>
          <button
            onClick={() => setShowProfile(true)}
            className="flex flex-col items-center gap-1 sm:gap-2 text-white/60 hover:text-white active:opacity-80 transition-colors min-w-[64px] sm:min-w-[80px] min-h-[56px] justify-center"
          >
            <User className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={2} />
            <span className="text-xs sm:text-sm">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}