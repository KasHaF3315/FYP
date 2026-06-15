import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  Bug,
  CheckCircle,
  Crown,
  Lock,
  MessageCircleWarning,
  Shield,
  Sparkles,
  UserX,
  XCircle,
} from 'lucide-react';
import Confetti from 'react-confetti';
import { completeModuleLevel, loadGlobalProgress } from './moduleProgress';
import { GAME_BGM } from './gameAudioUrls';
import { HoverHintTrigger } from './HoverHintTrigger';
import { useBackgroundMusic } from './useBackgroundMusic';
import { GameRunnerScene } from './animations/GameRunnerScene';
import type { RunnerState } from './animations/RunnerCharacter';

type Level = 1 | 2 | 3 | 4 | 5 | 6;
type Choice = 'ignore' | 'report' | 'block' | 'support';
type Mood = 'happy' | 'alert' | 'thinking';

interface CyberbullyBattleProps {
  onClose?: () => void;
}

type MiniScenario = {
  prompt: string;
  answer: Choice;
  feedback: string;
};

type Scenario = {
  level: Level;
  title: string;
  popup: string;
  explain: string;
  hint: string;
  actionHint: string;
  scenarios: MiniScenario[];
};

const POPUP_MS = 5000;
const CYBERBULLY_MODULE_VERSION = 2;
const rewards = ['Harassment Shield', 'Identity Protector', 'Truth Defender', 'Privacy Guardian', 'Safety Tracker', 'Troll Tamer Crown'];

const scenarios: Scenario[] = [
  {
    level: 1,
    title: 'Harassment',
    popup: 'Stop sending hurtful messages',
    explain: 'Repeated mean messages can seriously hurt someone.',
    hint: 'If mean words repeat again and again, it is harmful.',
    actionHint: 'Best action: Report repeated abuse.',
    scenarios: [
      { prompt: 'Chat keeps saying: "You are useless. Leave this group!"', answer: 'report', feedback: 'Repeated hurtful messages are harassment.' },
      { prompt: 'A player keeps posting "Nobody likes you" every day in class chat.', answer: 'report', feedback: 'Repeated insults should be reported.' },
      { prompt: 'Someone sends one rude message, then apologizes and stops.', answer: 'support', feedback: 'Support kind resolution and remind respectful behavior.' },
      { prompt: 'A classmate gets dozens of mean memes from the same account.', answer: 'report', feedback: 'Targeted repeated meanness is harassment.' },
      { prompt: 'Friend receives "I will ruin your profile" messages each night.', answer: 'report', feedback: 'Threatening repeated messages need reporting fast.' },
      { prompt: 'Group starts laughing at a child and repeats insulting nicknames daily.', answer: 'report', feedback: 'Group bullying is harassment and should be reported.' },
      { prompt: 'You see a friend feeling sad after nonstop hurtful DMs.', answer: 'support', feedback: 'Support the friend and help them report the abuse.' },
    ],
  },
  {
    level: 2,
    title: 'Impersonation',
    popup: 'Someone is pretending to be you',
    explain: 'Fake accounts copy your identity to trick people.',
    hint: 'Copied profile photo + strange requests = warning.',
    actionHint: 'Best action: Report fake profile immediately.',
    scenarios: [
      { prompt: 'A new account uses your photo and asks friends for private info.', answer: 'report', feedback: 'Pretending to be someone else is dangerous impersonation.' },
      { prompt: 'Fake profile copies your name and asks classmates for money.', answer: 'report', feedback: 'Money requests from copied profiles are a strong warning sign.' },
      { prompt: 'An account says it is your teacher but username spelling is strange.', answer: 'report', feedback: 'Fake authority profiles should be reported.' },
      { prompt: 'Someone clones your friend profile and sends suspicious links.', answer: 'report', feedback: 'Cloned accounts are impersonation scams.' },
      { prompt: 'Real friend loses account and creates new verified profile in class group.', answer: 'support', feedback: 'Supporting and confirming identity helps keep friends safe.' },
      { prompt: 'Profile with your picture posts rude comments as if from you.', answer: 'report', feedback: 'Impersonation that harms reputation must be reported.' },
      { prompt: 'Unknown account claims to be your cousin and asks for passwords.', answer: 'report', feedback: 'Requests for passwords from look-alike accounts are unsafe.' },
    ],
  },
  {
    level: 3,
    title: 'Denigration',
    popup: 'False rumors are spreading',
    explain: 'Spreading lies online can damage someone’s reputation.',
    hint: 'If information is untrue and hurtful, it is unsafe.',
    actionHint: 'Best action: Report rumor spreading and stop sharing.',
    scenarios: [
      { prompt: 'Group post says fake rumors about a classmate with no proof.', answer: 'report', feedback: 'False rumor sharing is denigration.' },
      { prompt: 'A meme page posts "This student cheats" with no evidence.', answer: 'report', feedback: 'Hurtful false claims should be reported.' },
      { prompt: 'Someone edits a photo to make a classmate look bad and shares it.', answer: 'report', feedback: 'Edited lies can damage someone deeply.' },
      { prompt: 'Friend asks you to forward gossip "just for fun."', answer: 'ignore', feedback: 'Do not spread harmful rumors.' },
      { prompt: 'Anonymous post calls a child thief without facts.', answer: 'report', feedback: 'Serious false accusations are unsafe content.' },
      { prompt: 'A post shares verified school award results for students.', answer: 'support', feedback: 'Truthful, respectful information is okay.' },
      { prompt: 'Rumor thread keeps growing and others pile on insults.', answer: 'report', feedback: 'Report rumor chains before they spread further.' },
    ],
  },
  {
    level: 4,
    title: 'Outing',
    popup: 'Private chats shared without permission',
    explain: 'Sharing private messages without permission is harmful.',
    hint: 'Private means private unless permission is given.',
    actionHint: 'Best action: Block and report privacy violation.',
    scenarios: [
      { prompt: 'Someone uploads private chat screenshots to a public group.', answer: 'block', feedback: 'This is outing and a privacy violation.' },
      { prompt: 'A classmate shares your secret voice note without asking.', answer: 'block', feedback: 'Sharing private content without permission is unsafe.' },
      { prompt: 'Friend posts your old private photo to embarrass you.', answer: 'block', feedback: 'Outing can hurt trust and safety.' },
      { prompt: 'You receive leaked private screenshots of another child.', answer: 'report', feedback: 'Report leaked private content instead of sharing it.' },
      { prompt: 'Someone threatens to post your private messages if you do not obey.', answer: 'block', feedback: 'Threat plus outing is serious abuse.' },
      { prompt: 'A friend asks permission before sharing your birthday party photo.', answer: 'support', feedback: 'Asking permission is respectful and safe behavior.' },
      { prompt: 'Private DM details are posted in a meme channel for laughs.', answer: 'report', feedback: 'Publicly exposing private DMs should be reported.' },
    ],
  },
  {
    level: 5,
    title: 'Cyberstalking',
    popup: 'Someone is tracking you online',
    explain: 'Watching and following someone online to scare them is unsafe.',
    hint: 'Tracking behavior + fear messages are serious red flags.',
    actionHint: 'Best action: Block stalker and inform trusted adult.',
    scenarios: [
      { prompt: 'A user keeps sending "I know where you are" messages every day.', answer: 'block', feedback: 'This is cyberstalking behavior.' },
      { prompt: 'Unknown account comments your location minutes after each post.', answer: 'block', feedback: 'Location tracking signs require immediate blocking.' },
      { prompt: 'Someone makes many new accounts after you block them once.', answer: 'report', feedback: 'Repeated stalking through new accounts should be reported.' },
      { prompt: 'A user asks politely for game tips one time and then leaves.', answer: 'ignore', feedback: 'Not every stranger message is stalking; stay cautious.' },
      { prompt: 'Messages say "I watched you leave school today."', answer: 'block', feedback: 'Real-world tracking threats are serious danger signs.' },
      { prompt: 'Account sends daily threats and tries to follow all your friends.', answer: 'report', feedback: 'Escalating behavior must be reported and documented.' },
      { prompt: 'Friend feels scared because a stranger watches every online move.', answer: 'support', feedback: 'Support the friend and involve a trusted adult quickly.' },
    ],
  },
  {
    level: 6,
    title: 'Trolling',
    popup: 'Hurtful comments detected',
    explain: 'Trolling uses hurtful comments to upset others on purpose.',
    hint: 'Intentional provocation and insults are not harmless jokes.',
    actionHint: 'Best action: Do not engage trolls; report if repeated.',
    scenarios: [
      { prompt: 'Comment spam says "Cry more, loser!" under every post.', answer: 'ignore', feedback: 'These are troll comments meant to hurt.' },
      { prompt: 'A troll writes silly insults to make people argue in comments.', answer: 'ignore', feedback: 'Ignoring bait avoids giving trolls attention.' },
      { prompt: 'Troll keeps posting cruel jokes targeting one child repeatedly.', answer: 'report', feedback: 'Repeated targeted trolling should be reported.' },
      { prompt: 'Someone disagrees politely and explains their opinion kindly.', answer: 'support', feedback: 'Respectful disagreement is okay and healthy.' },
      { prompt: 'Account posts rude comments then deletes them to avoid proof.', answer: 'report', feedback: 'Sneaky repeated trolling still needs reporting.' },
      { prompt: 'Friend wants to fight back with mean replies to trolls.', answer: 'support', feedback: 'Support calm choices and suggest report/block instead.' },
      { prompt: 'A post tries to trigger anger with insults and laughing emojis.', answer: 'ignore', feedback: 'Not reacting reduces troll power.' },
    ],
  },
];

export function CyberbullyBattle({ onClose }: CyberbullyBattleProps) {
  useBackgroundMusic(GAME_BGM.cyberbullyBattle, { volume: 0.2 });

  const [screen, setScreen] = useState<'menu' | 'play' | 'done'>('menu');
  const [level, setLevel] = useState<Level>(1);
  const [completed, setCompleted] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    loadGlobalProgress().then((p) => {
      const module = p.modules?.cyberbullyBattle;
      const moduleCompleted = module?.version === CYBERBULLY_MODULE_VERSION ? module.completedLevels || [] : [];
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
          tips={[scenarios[level - 1].hint, 'Pick the best response action', 'Use popup feedback to learn quickly']}
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
            await completeModuleLevel('cyberbullyBattle', level, {
              reward: rewards[level - 1],
              scoreDelta: stats.score,
              behavior_score: stats.score,
              response_accuracy: Math.max(70, 100 - stats.mistakes.length * 5),
              decision_speed: stats.reactionTime,
              mistake_patterns: stats.mistakes,
              difficulty: Math.min(5, 1 + Math.floor((completed.length + 1) / 2)),
              version: CYBERBULLY_MODULE_VERSION,
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
  const cardMeta = [
    { level: 1 as Level, icon: AlertTriangle, color: 'from-rose-500 to-red-600' },
    { level: 2 as Level, icon: UserX, color: 'from-purple-500 to-fuchsia-600' },
    { level: 3 as Level, icon: MessageCircleWarning, color: 'from-indigo-500 to-purple-600' },
    { level: 4 as Level, icon: Lock, color: 'from-blue-500 to-cyan-600' },
    { level: 5 as Level, icon: Shield, color: 'from-orange-500 to-red-600' },
    { level: 6 as Level, icon: Crown, color: 'from-pink-500 to-rose-600' },
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
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <Shield className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-400" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Sparkles className="w-8 h-8 text-yellow-300" />
          </motion.div>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">Cyberbully Battle</h1>
        <p className="text-white/90 text-lg sm:text-xl max-w-2xl">
          Learn how to spot and stop online bullying.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
        {scenarios.map((s, i) => {
          const unlocked = s.level === 1 || completed.includes(s.level - 1);
          const Icon = cardMeta[i].icon;
          return (
            <motion.button
              key={s.level}
              whileHover={unlocked ? { scale: 1.05, y: -5 } : {}}
              whileTap={unlocked ? { scale: 0.95 } : {}}
              onClick={() => unlocked && onStart(s.level)}
              disabled={!unlocked}
              className={`bg-gradient-to-br ${cardMeta[i].color} p-4 sm:p-6 rounded-xl sm:rounded-2xl text-white text-left shadow-lg transition-all relative ${
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

              {completed.includes(s.level) && (
                <motion.div className="absolute bottom-2 right-2 bg-green-500 rounded-full p-1.5 shadow-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </motion.div>
              )}

              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
                <span className="bg-white/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold">
                  Level {s.level}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2">{s.title}</h3>
              <p className="text-white/90 text-xs sm:text-sm">Learn to handle this bullying type safely</p>
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
  const [coinBurstId, setCoinBurstId] = useState(0);
  const [scoreGain, setScoreGain] = useState<number | null>(null);
  const [runnerState, setRunnerState] = useState<RunnerState>('run');
  const current = data.scenarios[index];
  const correct = choice !== null ? choice === current.answer : false;
  const emoji = mood === 'happy' ? '😊' : mood === 'alert' ? '⚠️' : '🤔';

  const layouts = useMemo(
    () => ({
      1: 'from-rose-500/20 to-red-600/20',
      2: 'from-purple-500/20 to-fuchsia-600/20',
      3: 'from-indigo-500/20 to-purple-600/20',
      4: 'from-blue-500/20 to-cyan-600/20',
      5: 'from-orange-500/20 to-red-600/20',
      6: 'from-pink-500/20 to-rose-600/20',
    }),
    [],
  );

  const submit = (picked: Choice) => {
    if (choice !== null) return;
    setChoice(picked);
    const isCorrect = picked === current.answer;
    setMood(isCorrect ? 'happy' : 'alert');
    if (!isCorrect) {
      setMistakes((m) => [...m, `cyberbully_l${data.level}_q${index + 1}`]);
      setShake(true);
      setRunnerState('stumble');
      setTimeout(() => {
        setShake(false);
        setRunnerState('run');
      }, 450);
    } else {
      setScore((s) => s + 15);
      setRunnerState('jump');
      setCoinBurstId((id) => id + 1);
      setScoreGain(15);
      setTimeout(() => setScoreGain(null), 900);
      setTimeout(() => setRunnerState('run'), 600);
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

  const lane = (index % 3) as 0 | 1 | 2;
  const progress = index / data.scenarios.length;

  return (
    <div className="max-w-3xl mx-auto relative z-10 pb-32">
      <button onClick={onBack} className="text-white/80 hover:text-white p-2 relative z-20">
        <ArrowLeft className="w-6 h-6" />
      </button>
      <GameRunnerScene
        progress={progress}
        runnerState={runnerState}
        lane={lane}
        coinBurstId={coinBurstId}
        scoreGain={scoreGain}
        sceneKey={index}
      >
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
        <HoverHintTrigger key={`${data.level}-${index}`} hint={data.hint} subtitle={data.actionHint} />
        <p className="text-blue-100 text-sm mb-2">Scenario {index + 1} / {data.scenarios.length}</p>
        <p className="text-white/95 mb-6">{current.prompt}</p>
        <div className="grid grid-cols-2 gap-3">
          {(['ignore', 'report', 'block', 'support'] as const).map((action) => (
            <motion.button
              key={action}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => submit(action)}
              disabled={choice !== null}
              className={`p-3 rounded-xl font-bold capitalize disabled:opacity-60 shadow-md ${
                action === 'ignore'
                  ? 'bg-slate-500/90 hover:bg-slate-500'
                  : action === 'report'
                  ? 'bg-blue-500/90 hover:bg-blue-500'
                  : action === 'block'
                  ? 'bg-red-500/90 hover:bg-red-500'
                  : 'bg-green-500/90 hover:bg-green-500'
              }`}
            >
              {action}
            </motion.button>
          ))}
        </div>
      </motion.div>
      </GameRunnerScene>

      <AnimatePresence>
        {showPopup && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl bg-[#132846]/95 rounded-2xl border border-white/20 p-4 z-50">
            <p className="text-yellow-200 font-bold mb-1">{data.popup}</p>
            <p className="text-white/95 text-sm mb-1">{current.feedback}</p>
            <p className="text-blue-100 text-sm">{data.explain}</p>
            <div className="mt-2 flex items-center gap-2">
              {correct ? <CheckCircle className="w-4 h-4 text-green-300" /> : <XCircle className="w-4 h-4 text-red-300" />}
              <span className={correct ? 'text-green-200 text-sm' : 'text-red-200 text-sm'}>
                {correct ? 'Great choice!' : 'Try again and stay kind.'}
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
        <Shield className="w-32 h-32 text-yellow-400" />
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
        <div className="flex justify-center mb-4"><div className="bg-yellow-400/20 px-4 py-2 rounded-full"><span className="text-yellow-300 text-xs sm:text-sm font-bold">👶 Age Group: 7-12 years</span></div></div>
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
