import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  Bug,
  CheckCircle,
  Crown,
  Lock,
  Shield,
  Sparkles,
  Wifi,
  XCircle,
} from 'lucide-react';
import Confetti from 'react-confetti';
import { completeModuleLevel, loadGlobalProgress } from './moduleProgress';
import { GAME_BGM } from './gameAudioUrls';
import { HoverHintTrigger } from './HoverHintTrigger';
import { useBackgroundMusic } from './useBackgroundMusic';

type Level = 1 | 2 | 3 | 4 | 5 | 6;
type Choice = number;
type Mood = 'happy' | 'alert' | 'thinking';

interface PrivacyVillageProps {
  onClose?: () => void;
}

type Scenario = {
  level: Level;
  title: string;
  popup: string;
  explain: string;
  hint: string;
  options: string[];
  scenarios: {
    prompt: string;
    answer: number;
    feedback: string;
  }[];
};

const POPUP_MS = 5000;
const PRIVACY_MODULE_VERSION = 2;
const rewards = ['Data Defender', 'Tracker Blocker', 'Identity Shield', 'Password Guardian', 'Safe Sharer Medal', 'Secure WiFi Crown'];

const scenarios: Scenario[] = [
  {
    level: 1,
    title: 'Data Breach',
    popup: 'Your data has been leaked',
    explain: 'When data leaks, strangers may see private details.',
    hint: 'Data leaks mean private details can escape.',
    options: ['Ignore the alert', 'Change password and alert parent/teacher', 'Share account details to verify'],
    scenarios: [
      { prompt: 'A game says your email and age were exposed in a leak report.', answer: 1, feedback: 'This is a data breach warning.' },
      { prompt: 'Your app says login attempts happened from another city.', answer: 1, feedback: 'Unexpected logins mean you should secure your account quickly.' },
      { prompt: 'Friend asks you to post your leaked password "for help."', answer: 0, feedback: 'Never share leaked passwords with anyone.' },
      { prompt: 'Website warns your old password appeared in a breach list.', answer: 1, feedback: 'Changing to a strong new password is the safe action.' },
      { prompt: 'A message says "verify leak" and asks for full card details.', answer: 0, feedback: 'Do not provide sensitive details to random leak messages.' },
      { prompt: 'Teacher suggests telling parents and updating all reused passwords.', answer: 1, feedback: 'Trusted adult help is important after a breach.' },
      { prompt: 'Account breach alert appears but you continue as normal.', answer: 0, feedback: 'Ignoring breach alerts keeps accounts at risk.' },
    ],
  },
  {
    level: 2,
    title: 'Tracking & Surveillance',
    popup: 'Your activity is being tracked',
    explain: 'Some apps or websites watch what you do online.',
    hint: 'Always check app permissions and tracking settings.',
    options: ['Allow all tracking forever', 'Review permissions and disable unnecessary tracking', 'Post more personal data'],
    scenarios: [
      { prompt: 'An app follows every click even when you are not using it.', answer: 1, feedback: 'Hidden tracking is a privacy risk.' },
      { prompt: 'Game app asks for location though it is not needed to play.', answer: 1, feedback: 'Turn off permissions not needed for the app.' },
      { prompt: 'Website asks to enable all cookies without explanation.', answer: 1, feedback: 'Review settings and keep only necessary tracking.' },
      { prompt: 'A trusted maps app needs location only while using it.', answer: 1, feedback: 'Limited permission can be a safer balance.' },
      { prompt: 'An app asks camera, contacts, and mic for a simple puzzle game.', answer: 1, feedback: 'Too many permissions are a warning sign.' },
      { prompt: 'Friend says "just allow everything, it is easier."', answer: 0, feedback: 'Convenience is not safer than privacy control.' },
      { prompt: 'You disable ad tracking and remove apps you do not use.', answer: 1, feedback: 'Reducing unnecessary tracking protects privacy.' },
    ],
  },
  {
    level: 3,
    title: 'Identity Theft',
    popup: 'Someone is using your identity',
    explain: 'Identity theft happens when someone pretends to be you.',
    hint: 'Copied profile + fake messages is a major warning sign.',
    options: ['Report fake account and warn trusted adult', 'Send your ID photo to the account', 'Do nothing'],
    scenarios: [
      { prompt: 'A fake account uses your photo and sends messages as if it is you.', answer: 0, feedback: 'This is identity theft behavior.' },
      { prompt: 'Someone copies your username and asks classmates for money.', answer: 0, feedback: 'Report impersonation and alert trusted adults.' },
      { prompt: 'Fake profile says it is you and asks friends for passwords.', answer: 0, feedback: 'Never ignore fake identity accounts.' },
      { prompt: 'You see a clone account of your friend with strange posts.', answer: 0, feedback: 'Helping report protects your friend too.' },
      { prompt: 'A stranger says send your ID card photo to prove real account.', answer: 0, feedback: 'Report suspicious identity demands and never send ID photos.' },
      { prompt: 'You update privacy settings so only friends can see your photos.', answer: 0, feedback: 'Privacy controls help reduce identity misuse.' },
      { prompt: 'Impersonator account keeps returning with similar names.', answer: 0, feedback: 'Repeated impersonation should be continually reported.' },
    ],
  },
  {
    level: 4,
    title: 'Weak Passwords',
    popup: 'Your password is too easy to guess',
    explain: 'Simple passwords can be guessed quickly by attackers.',
    hint: 'Long and mixed passwords are safer.',
    options: ['Keep same password everywhere', 'Use stronger unique password with symbols', 'Share password with friends'],
    scenarios: [
      { prompt: 'Password is set as: 123456 and reused in many apps.', answer: 1, feedback: 'Weak passwords make accounts easy to break into.' },
      { prompt: 'You use your pet name as password for every account.', answer: 1, feedback: 'Use different strong passwords for each account.' },
      { prompt: 'Friend asks your password to "help with your game level."', answer: 2, feedback: 'Never share passwords, even with friends.' },
      { prompt: 'You create a long passphrase with numbers and symbols.', answer: 1, feedback: 'Long unique passphrases are much safer.' },
      { prompt: 'You save passwords in a trusted password manager with parent help.', answer: 1, feedback: 'Secure storage helps avoid weak reused passwords.' },
      { prompt: 'You keep password as your birthday so it is easy to remember.', answer: 1, feedback: 'Birthdays are easy to guess and unsafe.' },
      { prompt: 'A site asks you to change password after suspicious login.', answer: 1, feedback: 'Changing password quickly can protect the account.' },
    ],
  },
  {
    level: 5,
    title: 'Oversharing Online',
    popup: 'You are sharing too much personal information',
    explain: 'Too much personal detail online can be used against you.',
    hint: 'Share less personal info in public posts.',
    options: ['Delete post and limit personal info', 'Add school and phone to profile bio', 'Keep everything public'],
    scenarios: [
      { prompt: 'Post includes your full name, school, phone number, and home street.', answer: 0, feedback: 'This is unsafe oversharing.' },
      { prompt: 'You share a selfie with your house number visible in background.', answer: 0, feedback: 'Remove location clues before posting.' },
      { prompt: 'A public profile bio includes your daily bus route details.', answer: 0, feedback: 'Travel routine details should stay private.' },
      { prompt: 'You post only hobby art and keep personal details private.', answer: 0, feedback: 'Sharing interests without private data is safer.' },
      { prompt: 'Challenge trend asks for "first pet + birth year" in comments.', answer: 0, feedback: 'These details can be used to guess passwords.' },
      { prompt: 'You ask parent before posting school event photos with name tags.', answer: 0, feedback: 'Checking with trusted adults helps avoid oversharing.' },
      { prompt: 'You make account private and remove phone number from profile.', answer: 0, feedback: 'Limiting public info improves privacy.' },
    ],
  },
  {
    level: 6,
    title: 'Unsecured Public WiFi',
    popup: 'Your connection is not safe',
    explain: 'Open WiFi can let others spy on your data.',
    hint: 'Avoid sensitive logins on unknown WiFi.',
    options: ['Use open WiFi for banking login', 'Use trusted network or avoid sensitive logins', 'Share hotspot password publicly'],
    scenarios: [
      { prompt: 'You connect to free public WiFi with no password and log into bank app.', answer: 1, feedback: 'Unsecured public WiFi is risky.' },
      { prompt: 'Cafe WiFi name looks similar to official one but has extra symbol.', answer: 1, feedback: 'Fake hotspots can steal data; verify network name.' },
      { prompt: 'You wait to log into school portal until back on home WiFi.', answer: 1, feedback: 'Delaying sensitive logins on open networks is safer.' },
      { prompt: 'Friend says to share hotspot password with everyone in the park.', answer: 2, feedback: 'Sharing hotspot publicly can expose your device and data.' },
      { prompt: 'You use mobile data for payment app instead of unknown public WiFi.', answer: 1, feedback: 'Trusted cellular data is safer for sensitive actions.' },
      { prompt: 'Public WiFi asks to install unknown certificate to continue browsing.', answer: 1, feedback: 'Do not trust risky setup prompts on unknown networks.' },
      { prompt: 'You turn off auto-connect so device does not join random networks.', answer: 1, feedback: 'Disabling auto-connect reduces accidental risky connections.' },
    ],
  },
];

export function PrivacyVillage({ onClose }: PrivacyVillageProps) {
  useBackgroundMusic(GAME_BGM.privacyVillage, { volume: 0.2 });

  const [screen, setScreen] = useState<'menu' | 'play' | 'done'>('menu');
  const [level, setLevel] = useState<Level>(1);
  const [completed, setCompleted] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    loadGlobalProgress().then((p) => {
      const module = p.modules?.privacyVillage;
      const moduleCompleted = module?.version === PRIVACY_MODULE_VERSION ? module.completedLevels || [] : [];
      setCompleted(moduleCompleted);
    });
  }, [screen]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e3a5f] via-[#2d5a8a] to-[#1e3a5f] text-white p-4 sm:p-8 relative overflow-hidden">
      {showConfetti && <Confetti recycle={false} numberOfPieces={260} />}

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => {
          const colors = ['text-red-400', 'text-orange-400', 'text-purple-400', 'text-pink-400', 'text-yellow-400', 'text-blue-400', 'text-green-400', 'text-indigo-400'];
          const randomX = Math.random() * 80 + 10;
          const randomY = Math.random() * 80 + 10;
          const duration = 3 + Math.random() * 4;
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: `${randomX}%`, top: `${randomY}%` }}
              animate={{ x: [0, Math.random() * 100 - 50, 0], y: [0, Math.random() * 100 - 50, 0], rotate: [0, 360], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration, repeat: Infinity, delay: Math.random() * 2, ease: 'easeInOut' }}
            >
              <Bug className={`w-6 h-6 ${colors[i % colors.length]}`} />
            </motion.div>
          );
        })}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      {screen === 'menu' && <MenuView completed={completed} onBack={onClose} onStart={(l) => { setLevel(l); setShowInstructions(true); }} />}
      {showInstructions && (
        <ModuleInstructions
          level={level}
          title={scenarios[level - 1].title}
          message={scenarios[level - 1].scenarios[0].prompt}
          tips={[scenarios[level - 1].hint, 'Select the safest action option', 'Read popup feedback before next step']}
          onStart={() => {
            setShowInstructions(false);
            setScreen('play');
          }}
          onBack={() => setShowInstructions(false)}
        />
      )}
      {screen === 'play' && (
        <LevelView
          data={scenarios[level - 1]}
          onBack={() => setScreen('menu')}
          onComplete={async (stats) => {
            await completeModuleLevel('privacyVillage', level, {
              reward: rewards[level - 1],
              scoreDelta: stats.score,
              privacy_score: stats.score,
              reaction_time: stats.reactionTime,
              mistake_patterns: stats.mistakes,
              difficulty: Math.min(5, 1 + Math.floor((completed.length + 1) / 2)),
              version: PRIVACY_MODULE_VERSION,
            });
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2200);
            setScreen('done');
          }}
        />
      )}
      {screen === 'done' && (
        <DoneView
          level={level}
          reward={rewards[level - 1]}
          onMenu={() => setScreen('menu')}
          onNext={() => {
            if (level < 6) {
              setLevel((level + 1) as Level);
              setScreen('play');
            } else {
              setScreen('menu');
            }
          }}
        />
      )}
    </div>
  );
}

function MenuView({ completed, onStart, onBack }: { completed: number[]; onStart: (l: Level) => void; onBack?: () => void }) {
  const levelCards: {
    level: Level;
    title: string;
    description: string;
    icon: typeof AlertTriangle;
    color: string;
  }[] = [
    { level: 1, title: 'Data Breach', description: 'Respond safely to leaked data alerts', icon: AlertTriangle, color: 'from-blue-500 to-blue-600' },
    { level: 2, title: 'Tracking & Surveillance', description: 'Review permissions and hidden tracking', icon: Shield, color: 'from-purple-500 to-purple-600' },
    { level: 3, title: 'Identity Theft', description: 'Stop fake accounts using your identity', icon: Sparkles, color: 'from-green-500 to-green-600' },
    { level: 4, title: 'Weak Passwords', description: 'Build stronger password habits', icon: Lock, color: 'from-red-500 to-red-600' },
    { level: 5, title: 'Oversharing Online', description: 'Share less personal info in public', icon: AlertTriangle, color: 'from-yellow-500 to-yellow-600' },
    { level: 6, title: 'Unsecured Public WiFi', description: 'Stay safe on public networks', icon: Wifi, color: 'from-pink-500 to-rose-600' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative z-10"
    >
      {onBack && (
        <button type="button" onClick={onBack} className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors p-2 z-20">
          <ArrowLeft className="w-6 h-6" />
        </button>
      )}

      <motion.div
        initial={{ scale: 0.8, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center mb-4">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <Shield className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-400" />
          </motion.div>
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <Sparkles className="w-8 h-8 text-yellow-300" />
          </motion.div>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">Privacy Village</h1>
        <p className="text-white/90 text-lg sm:text-xl max-w-2xl mx-auto">
          Protect your personal data with smart choices.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
        {levelCards.map(({ level, title, description, icon: Icon, color }) => {
          const unlocked = level === 1 || completed.includes(level - 1);
          const isDone = completed.includes(level);

          return (
            <motion.button
              key={level}
              type="button"
              whileHover={unlocked ? { scale: 1.05, y: -5 } : {}}
              whileTap={unlocked ? { scale: 0.95 } : {}}
              onClick={() => unlocked && onStart(level)}
              disabled={!unlocked}
              className={`bg-gradient-to-br ${color} p-4 sm:p-6 rounded-xl sm:rounded-2xl text-white text-left shadow-lg transition-all relative ${
                unlocked ? 'hover:shadow-xl cursor-pointer' : 'opacity-40 cursor-not-allowed grayscale'
              }`}
            >
              {!unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl backdrop-blur-sm">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <Lock className="w-16 h-16 text-white/80" />
                  </motion.div>
                </div>
              )}

              {isDone && (
                <motion.div
                  className="absolute bottom-2 right-2 bg-green-500 rounded-full p-1.5 shadow-lg"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircle className="w-5 h-5 text-white" />
                </motion.div>
              )}

              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
                <span className="bg-white/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold">Level {level}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2">{title}</h3>
              <p className="text-white/90 text-xs sm:text-sm">{description}</p>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

function LevelView({
  data,
  onBack,
  onComplete,
}: {
  data: Scenario;
  onBack: () => void;
  onComplete: (stats: { score: number; reactionTime: number; mistakes: string[] }) => void;
}) {
  const [start] = useState(Date.now());
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [mood, setMood] = useState<Mood>('thinking');
  const [shake, setShake] = useState(false);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const current = data.scenarios[index];
  const correct = choice !== null ? choice === current.answer : false;
  const emoji = mood === 'happy' ? '😊' : mood === 'alert' ? '⚠️' : '🤔';

  const layouts = useMemo(
    () => ({
      1: 'from-cyan-500/20 to-blue-600/20',
      2: 'from-blue-500/20 to-indigo-600/20',
      3: 'from-violet-500/20 to-purple-600/20',
      4: 'from-green-500/20 to-emerald-600/20',
      5: 'from-pink-500/20 to-rose-600/20',
      6: 'from-orange-500/20 to-red-600/20',
    }),
    [],
  );

  const submit = (picked: Choice) => {
    if (choice !== null) return;
    setChoice(picked);
    const isCorrect = picked === current.answer;
    setMood(isCorrect ? 'happy' : 'alert');
    if (!isCorrect) {
      setMistakes((m) => [...m, `privacy_l${data.level}_q${index + 1}`]);
      setShake(true);
      setTimeout(() => setShake(false), 350);
    } else {
      setScore((s) => s + 15);
    }
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      if (isCorrect) {
        if (index < data.scenarios.length - 1) {
          setIndex((i) => i + 1);
          setChoice(null);
          setMood('thinking');
        } else {
          onComplete({ score: Math.max(40, score + 15), reactionTime: Math.round((Date.now() - start) / 1000), mistakes });
        }
      } else {
        setChoice(null);
        setMood('thinking');
      }
    }, POPUP_MS);
  };

  return (
    <div className="max-w-3xl mx-auto relative z-10">
      <button onClick={onBack} className="text-white/80 hover:text-white p-2">
        <ArrowLeft className="w-6 h-6" />
      </button>
      <motion.div
        className={`bg-gradient-to-br ${layouts[data.level]} border border-white/20 rounded-3xl p-7 mt-2`}
        animate={
          shake
            ? { x: [0, -8, 8, -6, 6, 0] }
            : correct
            ? { boxShadow: ['0 0 0 rgba(34,197,94,0)', '0 0 35px rgba(34,197,94,0.35)', '0 0 0 rgba(34,197,94,0)'] }
            : {}
        }
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{emoji}</span>
          <h2 className="text-3xl font-bold">Level {data.level}: {data.title}</h2>
        </div>
        <HoverHintTrigger key={`${data.level}-${index}`} hint={data.hint} />
        <p className="text-blue-100 text-sm mb-2">Scenario {index + 1} / {data.scenarios.length}</p>
        <p className="text-white/95 mb-6">{current.prompt}</p>
        <div className="grid grid-cols-1 gap-3">
          {data.options.map((option, idx) => (
            <button
              key={option}
              onClick={() => submit(idx)}
              disabled={choice !== null}
              className={`p-4 rounded-xl text-left font-semibold disabled:opacity-60 ${
                idx === 0
                  ? 'bg-blue-500/90 hover:bg-blue-500'
                  : idx === 1
                  ? 'bg-green-500/90 hover:bg-green-500'
                  : 'bg-red-500/90 hover:bg-red-500'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {showPopup && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl bg-[#132846]/95 rounded-2xl border border-white/20 p-4 z-50">
            <p className="text-yellow-200 font-bold mb-1">{data.popup}</p>
            <p className="text-white/95 text-sm mb-1">{current.feedback}</p>
            <p className="text-blue-100 text-sm">{data.explain}</p>
            <div className="mt-2 flex items-center gap-2">
              {correct ? <CheckCircle className="w-4 h-4 text-green-300" /> : <XCircle className="w-4 h-4 text-red-300" />}
              <span className={correct ? 'text-green-200 text-sm' : 'text-red-200 text-sm'}>
                {correct ? 'Great choice!' : 'Try again and stay private.'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DoneView({ level, reward, onNext, onMenu }: { level: Level; reward: string; onNext: () => void; onMenu: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative z-10">
      <motion.div animate={{ rotate: [0, 5, -5, 0], y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mb-8">
        {level === 6 ? <Crown className="w-32 h-32 text-yellow-400" /> : <Shield className="w-32 h-32 text-yellow-400" />}
      </motion.div>
      <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-4">Level Complete! 🎉</h2>
      <p className="text-white/80 text-xl text-center mb-2">You earned:</p>
      <motion.p animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-2xl font-bold text-center mb-8 text-yellow-300">
        {reward}
      </motion.p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-sm sm:max-w-none sm:w-auto">
        {level < 6 && <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onNext} className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-base sm:text-xl shadow-lg min-h-[48px]">Next Level →</motion.button>}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onMenu} className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-white/20 text-white font-bold text-base sm:text-xl min-h-[48px]">{level === 6 ? 'Complete Game 🏆' : 'Back to Menu'}</motion.button>
      </div>
    </motion.div>
  );
}

function ModuleInstructions({
  level,
  title,
  message,
  tips,
  onStart,
  onBack,
}: {
  level: Level;
  title: string;
  message: string;
  tips: string[];
  onStart: () => void;
  onBack: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', duration: 0.6 }} className="max-w-2xl w-full bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden my-auto">
        <div className="flex justify-center mb-4"><div className="bg-yellow-400/20 px-4 py-2 rounded-full"><span className="text-yellow-300 text-xs sm:text-sm font-bold">👶 Age Group: 7-11 years</span></div></div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center mb-6"><span className="text-blue-300">Level {level}:</span> {title}</h2>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-6"><p className="text-white text-sm sm:text-base md:text-lg leading-relaxed">{message}</p></div>
        <div className="bg-yellow-400/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 mb-6 sm:mb-8">
          <h3 className="text-yellow-300 font-bold text-base sm:text-lg mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />Quick Tips:</h3>
          <ul className="space-y-2">{tips.map((tip) => <li key={tip} className="text-white text-sm sm:text-base flex items-start gap-2"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0 mt-0.5" /><span>{tip}</span></li>)}</ul>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onStart} className="flex-1 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-lg sm:text-xl">Start Level! 🚀</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBack} className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-white/20 text-white font-bold text-base sm:text-lg">Go Back</motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
