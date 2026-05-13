import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  Bug,
  CheckCircle,
  Crown,
  Gift,
  Globe,
  Lock,
  PhoneCall,
  Shield,
  Sparkles,
  Trees,
  UserRound,
  XCircle,
} from 'lucide-react';
import Confetti from 'react-confetti';
import { completeModuleLevel, loadGlobalProgress } from './moduleProgress';
import { GAME_BGM } from './gameAudioUrls';
import { HoverHintTrigger } from './HoverHintTrigger';
import { useBackgroundMusic } from './useBackgroundMusic';

type Level = 1 | 2 | 3 | 4 | 5 | 6;
type Choice = 'safe' | 'unsafe';
type Mood = 'happy' | 'alert' | 'thinking';
const POPUP_DISPLAY_MS = 10000;
const SCAM_MODULE_VERSION = 2;

interface ScamSafariProps {
  onClose?: () => void;
}

type MiniScenario = {
  text: string;
  answer: Choice;
  why: string;
};

type LevelData = {
  level: Level;
  title: string;
  popupLabel: string;
  popupExplain: string;
  guide: string;
  hint: string;
  safeLabel: string;
  unsafeLabel: string;
  scenarios: MiniScenario[];
};

const levels: LevelData[] = [
  {
    level: 1,
    title: 'Message Scam',
    popupLabel: 'Message Scam (fake messages sent to many people)',
    popupExplain: 'Strangers may try to trick users with fake rewards.',
    guide: 'Explorer Guide: Big prize messages sent to everyone are often unsafe.',
    hint: 'Free gifts with urgent clicks are warning signs.',
    safeLabel: 'Looks Safe',
    unsafeLabel: 'Scam Alert',
    scenarios: [
      { text: 'You won a giant toy box! Click now in 1 minute!', answer: 'unsafe', why: 'Fake reward with pressure.' },
      { text: 'School newsletter: Sports day schedule attached from your school app.', answer: 'safe', why: 'Normal and expected update.' },
      { text: 'Claim 1000 coins now from unknown sender.', answer: 'unsafe', why: 'Unknown sender + unrealistic prize.' },
      { text: 'Message says: "Free gaming skin! Tap this link before it expires in 30 seconds."', answer: 'unsafe', why: 'Urgency plus prize bait is a common scam trick.' },
      { text: 'Class group message from your teacher shares tomorrow homework reminder.', answer: 'safe', why: 'It is from a trusted class channel with normal school info.' },
      { text: 'Unknown number says you won a phone and must pay delivery fee first.', answer: 'unsafe', why: 'Scammers ask for money before fake prizes.' },
      { text: 'Library app message says your borrowed book is due this Friday.', answer: 'safe', why: 'Expected notice from a known service you use.' },
    ],
  },
  {
    level: 2,
    title: 'Personal Trick Scam',
    popupLabel: 'Personal Trick Scam (messages made just for you)',
    popupExplain: 'Scammers sometimes use your name to look trustworthy.',
    guide: 'Explorer Guide: A message using your name can still be fake.',
    hint: 'Personal details do not always mean safe.',
    safeLabel: 'Trust Message',
    unsafeLabel: 'Verify First',
    scenarios: [
      { text: 'Hi Aisha, we know your class. Open this secret exam file now.', answer: 'unsafe', why: 'Uses personal detail to gain trust.' },
      { text: 'Hi Aisha, your parent sent you a school pickup note in family app.', answer: 'safe', why: 'Expected message in known app.' },
      { text: 'Aisha, your account is in danger. Send your password to fix it.', answer: 'unsafe', why: 'No real service asks for passwords.' },
      { text: 'Aisha, your art competition photo is ready. Download from official school portal.', answer: 'safe', why: 'Trusted source and expected context make this safer.' },
      { text: 'Hi Aisha, we saw your last post. Confirm your birthday and address to get a gift.', answer: 'unsafe', why: 'Scammers use personal details to request more private data.' },
      { text: 'Your coding club mentor sends meetup time in the official club app.', answer: 'safe', why: 'Known mentor and expected update in trusted app.' },
      { text: 'Aisha, friend in trouble! Send OTP now to help me log in.', answer: 'unsafe', why: 'Even if name looks familiar, OTP requests are unsafe.' },
    ],
  },
  {
    level: 3,
    title: 'Important Person Scam',
    popupLabel: 'Important Person Scam (fake authority messages)',
    popupExplain: 'Scammers pretend to be trusted figures like teachers or officials.',
    guide: 'Explorer Guide: Important names can be copied by tricksters.',
    hint: 'Check first, do not rush.',
    safeLabel: 'Approve',
    unsafeLabel: 'Report Fake',
    scenarios: [
      { text: 'Principal says: Send all student IDs to this new email now.', answer: 'unsafe', why: 'Urgent data request from unknown channel.' },
      { text: 'Teacher post in class portal: Tomorrow bring science book.', answer: 'safe', why: 'Normal class instruction in trusted place.' },
      { text: 'Officer message: Pay fine now or your account is closed today.', answer: 'unsafe', why: 'Fear pressure and payment demand.' },
      { text: 'School admin message in verified app asks parents to sign field trip form.', answer: 'safe', why: 'Verified school channel with normal school process.' },
      { text: 'Fake "exam board" account asks students to pay to unlock marks.', answer: 'unsafe', why: 'Real boards do not demand urgent direct payments in chats.' },
      { text: 'Coach sends tournament schedule through official team group.', answer: 'safe', why: 'Expected update in a trusted team communication channel.' },
      { text: 'Message claims to be police and demands card details right away.', answer: 'unsafe', why: 'Authorities do not ask for card details in random messages.' },
    ],
  },
  {
    level: 4,
    title: 'Text Message Scam',
    popupLabel: 'Text Message Scam (fake SMS tricks)',
    popupExplain: 'Some text messages contain unsafe links and tricks.',
    guide: 'Explorer Guide: Text messages can hide dangerous links.',
    hint: 'Unknown links in texts are risky.',
    safeLabel: 'Keep Message',
    unsafeLabel: 'Delete/Block',
    scenarios: [
      { text: 'SMS: Verify account now at short-link99.com', answer: 'unsafe', why: 'Suspicious short link and urgency.' },
      { text: 'SMS from parent: I am outside the gate, come with teacher.', answer: 'safe', why: 'Simple known family message.' },
      { text: 'SMS: You got bonus money. Enter card number now.', answer: 'unsafe', why: 'Requests private financial details.' },
      { text: 'SMS from school bus service: Route delay by 10 minutes today.', answer: 'safe', why: 'Useful update from a known school service.' },
      { text: 'Text says your parcel is stuck, pay now at weird-link.biz.', answer: 'unsafe', why: 'Unknown payment link is a scam warning.' },
      { text: 'Family group text confirms weekend picnic plan at park.', answer: 'safe', why: 'Normal family coordination with no secret request.' },
      { text: 'SMS says "Account blocked! Share PIN to reactivate now."', answer: 'unsafe', why: 'Legitimate services never ask for PIN in text.' },
    ],
  },
  {
    level: 5,
    title: 'Phone Call Scam',
    popupLabel: 'Phone Call Scam (fake caller tricks)',
    popupExplain: 'Real companies never ask for secret information on calls.',
    guide: 'Explorer Guide: A scary voice call can still be fake.',
    hint: 'Never share OTP, PIN, or passwords on calls.',
    safeLabel: 'Continue Call',
    unsafeLabel: 'Hang Up',
    scenarios: [
      { text: 'Caller: I am from bank. Tell your OTP right now.', answer: 'unsafe', why: 'Secret code requests are scam signs.' },
      { text: 'Caller: This is your mom’s friend, she is late today.', answer: 'safe', why: 'No secret request; still verify with family.' },
      { text: 'Caller: Pay quickly to keep your account active.', answer: 'unsafe', why: 'Money pressure through unknown call.' },
      { text: 'Caller says they are from your game app and need password to give rewards.', answer: 'unsafe', why: 'No trusted app asks for password by phone.' },
      { text: 'Your aunt calls from her saved number to remind you about dinner.', answer: 'safe', why: 'Known person and normal conversation topic.' },
      { text: 'Unknown caller threatens to suspend internet unless you share OTP.', answer: 'unsafe', why: 'Threat + OTP demand indicates a scam.' },
      { text: 'School office calls parent number to confirm tomorrow event timing.', answer: 'safe', why: 'Expected event call from known school office.' },
    ],
  },
  {
    level: 6,
    title: 'Fake Website Scam',
    popupLabel: 'Fake Website Scam (trick websites)',
    popupExplain: 'Always check carefully before trusting any site.',
    guide: 'Explorer Guide: Some websites look real but are traps.',
    hint: 'Look for strange spelling and odd page requests.',
    safeLabel: 'Visit Site',
    unsafeLabel: 'Leave Site',
    scenarios: [
      { text: 'Site looks like game store but URL is game-st0re-prize.net', answer: 'unsafe', why: 'Misspelled address and reward bait.' },
      { text: 'Official school portal URL saved in bookmarks opens as usual.', answer: 'safe', why: 'Known trusted address pattern.' },
      { text: 'Website says “urgent verify” and asks full password immediately.', answer: 'unsafe', why: 'Trusted sites do not demand instant secrets.' },
      { text: 'Website has padlock icon and exact trusted URL from your teacher.', answer: 'safe', why: 'Correct URL from trusted source is safer to use.' },
      { text: 'Page design looks official but URL has extra letters and numbers.', answer: 'unsafe', why: 'Look-alike URLs are common fake website signs.' },
      { text: 'You open your bookmarked library website and log in normally.', answer: 'safe', why: 'Bookmarking trusted sites helps avoid fake copies.' },
      { text: 'A pop-up website says virus found and asks card details for cleaning.', answer: 'unsafe', why: 'Scare pop-ups asking payment are scam websites.' },
    ],
  },
];

const rewards = [
  'Jungle Alert Badge',
  'Name Trick Defender',
  'Authority Check Medal',
  'Text Shield Charm',
  'Call Guard Lantern',
  'Scam Safari Master Crown',
];

export function ScamSafari({ onClose }: ScamSafariProps) {
  useBackgroundMusic(GAME_BGM.scamSafari, { volume: 0.2 });

  const [screen, setScreen] = useState<'menu' | 'play' | 'done'>('menu');
  const [level, setLevel] = useState<Level>(1);
  const [completed, setCompleted] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    loadGlobalProgress().then((p) => {
      const module = p.modules?.scamSafari;
      const moduleCompleted = module?.version === SCAM_MODULE_VERSION ? module.completedLevels || [] : [];
      setCompleted(moduleCompleted);
    });
  }, [screen]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e3a5f] via-[#2d5a8a] to-[#1e3a5f] text-white p-4 sm:p-8 relative overflow-hidden">
      {showConfetti && <Confetti recycle={false} numberOfPieces={280} />}

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

      {screen === 'menu' && (
        <MenuView
          completed={completed}
          onBack={onClose}
          onStart={(l) => {
            setLevel(l);
            setShowInstructions(true);
          }}
        />
      )}
      {showInstructions && (
        <ModuleInstructions
          level={level}
          title={levels[level - 1].title}
          conceptName={levels[level - 1].popupLabel}
          message={levels[level - 1].popupExplain}
          tips={[levels[level - 1].hint, 'Read each scenario carefully', 'Pick the safest action']}
          onStart={() => {
            setShowInstructions(false);
            setScreen('play');
          }}
          onBack={() => setShowInstructions(false)}
        />
      )}

      {screen === 'play' && (
        <LevelView
          data={levels[level - 1]}
          onBack={() => setScreen('menu')}
          onComplete={async (stats) => {
            await completeModuleLevel('scamSafari', level, {
              reward: rewards[level - 1],
              scoreDelta: stats.levelScore,
              scam_score: stats.levelScore,
              reaction_time: stats.reactionTime,
              mistake_patterns: stats.mistakes,
              difficulty: Math.min(5, 1 + Math.floor((completed.length + 1) / 2)),
              version: SCAM_MODULE_VERSION,
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
  const levelCards = [
    { level: 1 as Level, title: 'Message Scam', description: 'Spot fake reward messages', icon: Gift, color: 'from-orange-500 to-orange-600' },
    { level: 2 as Level, title: 'Personal Trick Scam', description: 'Catch fake personal messages', icon: UserRound, color: 'from-pink-500 to-pink-600' },
    { level: 3 as Level, title: 'Important Person Scam', description: 'Verify authority requests', icon: Shield, color: 'from-red-500 to-red-600' },
    { level: 4 as Level, title: 'Text Message Scam', description: 'Avoid unsafe SMS links', icon: AlertTriangle, color: 'from-purple-500 to-purple-600' },
    { level: 5 as Level, title: 'Phone Call Scam', description: 'Protect secrets on calls', icon: PhoneCall, color: 'from-blue-500 to-blue-600' },
    { level: 6 as Level, title: 'Fake Website Scam', description: 'Detect trick websites', icon: Globe, color: 'from-yellow-500 to-yellow-600' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative z-10"
    >
      {onBack && (
        <button onClick={onBack} className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors p-2">
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
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Trees className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-400" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Sparkles className="w-8 h-8 text-yellow-300" />
          </motion.div>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">Scam Safari</h1>
        <p className="text-white/90 text-lg sm:text-xl max-w-2xl">
          Explore the jungle and spot common online scams safely.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
        {levelCards.map(({ level, title, description, icon: Icon, color }) => {
          const unlocked = level === 1 || completed.includes(level - 1);
          return (
            <motion.button
              key={level}
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
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Lock className="w-16 h-16 text-white/80" />
                  </motion.div>
                </div>
              )}

              {completed.includes(level) && (
                <motion.div className="absolute bottom-2 right-2 bg-green-500 rounded-full p-1.5 shadow-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </motion.div>
              )}

              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
                <span className="bg-white/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold">
                  Level {level}
                </span>
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
  data: LevelData;
  onBack: () => void;
  onComplete: (stats: { levelScore: number; reactionTime: number; mistakes: string[] }) => void;
}) {
  const [startedAt] = useState(Date.now());
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<Choice | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [mood, setMood] = useState<Mood>('thinking');
  const [shake, setShake] = useState(false);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const current = data.scenarios[index];
  const isCorrect = answer !== null ? answer === current.answer : false;
  const moodFace = mood === 'happy' ? '😊' : mood === 'alert' ? '😮' : '🤔';

  const choose = (picked: Choice) => {
    if (answer !== null) return;
    setAnswer(picked);
    const correct = picked === current.answer;
    setMood(correct ? 'happy' : 'alert');
    setShowFeedback(true);
    if (correct) {
      setScore((s) => s + 35);
    } else {
      setMistakes((m) => [...m, `level${data.level}_scenario${index + 1}`]);
      setShake(true);
      setTimeout(() => setShake(false), 350);
    }

    setTimeout(() => {
      setShowFeedback(false);
      setAnswer(null);
      if (!correct) {
        setMood('thinking');
        return;
      }
      if (index < data.scenarios.length - 1) {
        setIndex((i) => i + 1);
        setMood('thinking');
      } else {
        const reactionTime = Math.round((Date.now() - startedAt) / 1000);
        onComplete({ levelScore: Math.max(40, score + (correct ? 35 : 0)), reactionTime, mistakes });
      }
    }, 1500);
  };

  const progressText = `Scenario ${index + 1} / ${data.scenarios.length}`;
  const progressPct = ((index + 1) / data.scenarios.length) * 100;

  return (
    <div className="max-w-3xl mx-auto relative z-10">
      <button onClick={onBack} className="text-blue-100 hover:text-white p-2">
        <ArrowLeft className="w-6 h-6" />
      </button>
      <motion.div
        className="bg-white/10 rounded-3xl p-7 mt-2 relative overflow-hidden"
        animate={
          shake
            ? { x: [0, -8, 8, -6, 6, 0] }
            : isCorrect
            ? { boxShadow: ['0 0 0px rgba(34,197,94,0)', '0 0 30px rgba(34,197,94,0.35)', '0 0 0px rgba(34,197,94,0)'] }
            : {}
        }
        transition={{ duration: 0.45 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-3xl font-bold">Level {data.level}: {data.title}</h2>
          <span className="text-2xl">{moodFace}</span>
        </div>

        <div className="bg-blue-500/20 text-blue-100 rounded-xl p-3 mb-3">{data.guide}</div>
        <HoverHintTrigger key={`${data.level}-${index}`} hint={data.hint} />
        <p className="text-white/95 mb-6">{current.text}</p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => choose('safe')}
            disabled={answer !== null}
            className="p-4 rounded-xl bg-green-500/90 hover:bg-green-500 font-bold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {data.safeLabel}
          </button>
          <button
            onClick={() => choose('unsafe')}
            disabled={answer !== null}
            className="p-4 rounded-xl bg-red-500/90 hover:bg-red-500 font-bold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {data.unsafeLabel}
          </button>
        </div>

        <div className="mt-5">
          <p className="text-sm text-blue-100 mb-1">{progressText}</p>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400 transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'}`}
          >
            <div className="flex items-center gap-2">
              {isCorrect ? <CheckCircle className="w-4 h-4 text-green-300" /> : <XCircle className="w-4 h-4 text-red-300" />}
              <span className={isCorrect ? 'text-green-200 text-sm' : 'text-red-200 text-sm'}>
                {isCorrect ? 'Great choice!' : 'Good try, keep learning!'}
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
        {level < 6 && (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onNext} className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-base sm:text-xl shadow-lg min-h-[48px]">
            Next Level →
          </motion.button>
        )}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onMenu} className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-white/20 text-white font-bold text-base sm:text-xl min-h-[48px]">
          {level === 6 ? 'Complete Game 🏆' : 'Back to Menu'}
        </motion.button>
      </div>
    </motion.div>
  );
}

function ModuleInstructions({
  level,
  title,
  conceptName,
  message,
  tips,
  onStart,
  onBack,
}: {
  level: Level;
  title: string;
  conceptName: string;
  message: string;
  tips: string[];
  onStart: () => void;
  onBack: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', duration: 0.6 }} className="max-w-2xl w-full bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden my-auto">
        <div className="flex justify-center mb-4">
          <div className="bg-yellow-400/20 px-4 py-2 rounded-full">
            <span className="text-yellow-300 text-xs sm:text-sm font-bold">👶 Age Group: 6-10 years</span>
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center mb-6">
          <span className="text-blue-300">Level {level}:</span> {title}
        </h2>
        <div className="bg-yellow-500/15 rounded-xl p-3 mb-4">
          <p className="text-yellow-200 font-bold text-sm sm:text-base">Concept: {conceptName}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-6">
          <p className="text-white text-sm sm:text-base md:text-lg leading-relaxed">{message}</p>
        </div>
        <div className="bg-yellow-400/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 mb-6 sm:mb-8">
          <h3 className="text-yellow-300 font-bold text-base sm:text-lg mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            Quick Tips:
          </h3>
          <ul className="space-y-2">
            {tips.map((tip) => (
              <li key={tip} className="text-white text-sm sm:text-base flex items-start gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onStart} className="flex-1 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-lg sm:text-xl">
            Start Level! 🚀
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBack} className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-white/20 text-white font-bold text-base sm:text-lg">
            Go Back
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
