import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, AlertCircle, CheckCircle, Crown, Sparkles, Zap, X, ArrowLeft, Eye, EyeOff, Bug, Key, Target } from 'lucide-react';
import Confetti from 'react-confetti';
import guardianImage from '@/assets/3f97aa4ef8e6bd91e6d7a25a4804734483b698fb.png';
import { addCompletedLevel, loadProgress } from './RewardsPage';
import { GAME_BGM } from './gameAudioUrls';
import { HoverHintTrigger } from './HoverHintTrigger';
import { useBackgroundMusic } from './useBackgroundMusic';

type Level = 1 | 2 | 3 | 4 | 5 | 6;

interface PasswordCastleProps {
  onClose?: () => void;
}

export function PasswordCastle({ onClose }: PasswordCastleProps) {
  useBackgroundMusic(GAME_BGM.passwordCastle, { volume: 0.2 });

  const [gameState, setGameState] = useState<'start' | 'playing' | 'level-complete'>('start');
  const [currentLevel, setCurrentLevel] = useState<Level>(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const startLevel = (level: Level) => {
    setCurrentLevel(level);
    setShowInstructions(true);
  };

  const handleStartPlaying = () => {
    setShowInstructions(false);
    setGameState('playing');
  };

  const handleLevelComplete = () => {
    setGameState('level-complete');
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
    addCompletedLevel(currentLevel);
  };

  const goBackToMenu = () => {
    setGameState('start');
    setShowConfetti(false);
    setShowInstructions(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e3a5f] via-[#2d5a8a] to-[#1e3a5f] relative overflow-x-hidden">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      {/* Background animated bugs in different colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => {
          const colors = ['text-red-400', 'text-orange-400', 'text-purple-400', 'text-pink-400', 'text-yellow-400', 'text-blue-400', 'text-green-400', 'text-indigo-400'];
          const randomX = Math.random() * 80 + 10; // 10-90%
          const randomY = Math.random() * 80 + 10; // 10-90%
          const duration = 3 + Math.random() * 4; // 3-7 seconds
          
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${randomX}%`,
                top: `${randomY}%`,
              }}
              animate={{
                x: [0, Math.random() * 100 - 50, 0],
                y: [0, Math.random() * 100 - 50, 0],
                rotate: [0, 360],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeInOut',
              }}
            >
              <Bug className={`w-6 h-6 ${colors[i % colors.length]}`} />
            </motion.div>
          );
        })}
        
        {/* Background animated stars */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {showInstructions && (
        <GuardianInstructions
          level={currentLevel}
          onStartLevel={handleStartPlaying}
          onBack={goBackToMenu}
        />
      )}

      {gameState === 'start' && (
        <StartScreen onStartLevel={startLevel} onClose={onClose} />
      )}

      {gameState === 'playing' && (
        <>
          {currentLevel === 1 && <Level1 onComplete={handleLevelComplete} onBack={goBackToMenu} />}
          {currentLevel === 2 && <Level2 onComplete={handleLevelComplete} onBack={goBackToMenu} />}
          {currentLevel === 3 && <Level3 onComplete={handleLevelComplete} onBack={goBackToMenu} />}
          {currentLevel === 4 && <Level4 onComplete={handleLevelComplete} onBack={goBackToMenu} />}
          {currentLevel === 5 && <Level5 onComplete={handleLevelComplete} onBack={goBackToMenu} />}
          {currentLevel === 6 && <Level6 onComplete={handleLevelComplete} onBack={goBackToMenu} />}
        </>
      )}

      {gameState === 'level-complete' && (
        <LevelComplete
          level={currentLevel}
          onNextLevel={() => {
            if (currentLevel < 6) {
              startLevel((currentLevel + 1) as Level);
            } else {
              goBackToMenu();
            }
          }}
          onBackToMenu={goBackToMenu}
        />
      )}
    </div>
  );
}

function GuardianInstructions({ level, onStartLevel, onBack }: { level: Level; onStartLevel: () => void; onBack: () => void }) {
  const levelInstructions = {
    1: {
      title: 'Pattern Detective Challenge!',
      topic: 'Topic: Weak Password Patterns - A weak pattern is something attackers can guess quickly, like short passwords, common words, or personal names.',
      message: 'The castle gates are showing broken passwords! Your mission is to spot the PATTERN - what makes each password weak? Look for clues like too short, simple words, or names. Can you help protect the castle?',
      tips: ['Compare the passwords carefully', 'Look for what they have in common', 'Think: "Would this be easy to guess?"'],
      ageGroup: '6-8 years',
    },
    2: {
      title: 'Password Power Ranking!',
      topic: 'Topic: Password Strength Comparison - Password strength means how hard a password is to crack. More character variety and longer length usually make it stronger.',
      message: 'Now the castle needs YOU to be a security expert! Compare three passwords and find the STRONGEST one. Remember: MIX of uppercase, lowercase, numbers, and symbols makes passwords unbreakable!',
      tips: ['Look for uppercase AND lowercase', 'Numbers make passwords stronger', 'Symbols like !@#$ are super powerful'],
      ageGroup: '7-9 years',
    },
    3: {
      title: 'Build Your Own Fortress!',
      topic: 'Topic: Password Construction Rules - A strong password is built by combining length, uppercase, lowercase, numbers, and symbols in one password.',
      message: 'You\'re now a Master Builder! Create your OWN super-strong password by following ALL the safety rules. Watch as your password grows stronger with each rule you follow!',
      tips: ['Think of a fun phrase you\'ll remember', 'Replace letters with numbers (3 for E)', 'Add special symbols for extra power'],
      ageGroup: '8-10 years',
    },
    4: {
      title: 'Speed Defense Challenge!',
      topic: 'Topic: Fast Risk Response - In real life, weak passwords can be attacked quickly, so recognizing and fixing them fast is an important defense skill.',
      message: 'RED ALERT! Hackers are attacking the castle walls! You have 60 seconds to strengthen ALL the weak passwords before the defenses fail. Work FAST but SMART - each strong password repairs the wall!',
      tips: ['Speed matters - work quickly!', 'Don\'t panic, follow the patterns', 'Keep the wall health above 0%'],
      ageGroup: '9-11 years',
    },
    5: {
      title: 'Ultimate Security Mastermind!',
      topic: 'Topic: Social Guessing and Predictable Choices - Attackers test birthdays, names, and keyboard patterns first because they are common and easy to predict.',
      message: 'Welcome to the FINAL TEST! The Royal Vault needs THREE uncrackable passwords. But watch out - hackers know common tricks! Avoid birthdates, names, and patterns. Show your CRITICAL THINKING skills!',
      tips: ['Think like a hacker - what would THEY try?', 'Avoid obvious patterns (abc, 123)', 'Random + complex = SECURE!'],
      ageGroup: '10-12 years',
    },
    6: {
      title: 'Brute Force Storm!',
      topic: 'Topic: Brute Force Attack - A brute force attack is when a computer keeps trying many password guesses automatically until one works.',
      message: 'In this level you will compare real password choices and see estimated crack time against a high-speed attacker. Your goal is to pick the password that survives the longest against brute force.',
      tips: ['Length increases guessing combinations the most', 'Mixing character types boosts complexity', 'Choose the password with the longest crack time'],
      ageGroup: '10-12 years',
    },
  };

  const instructions = levelInstructions[level];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="max-w-2xl w-full bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden my-auto"
      >
        {/* Decorative animated elements */}
        <motion.div 
          className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Age group badge */}
        <div className="flex justify-center mb-4">
          <div className="bg-yellow-400/20 px-4 py-2 rounded-full">
            <span className="text-yellow-300 text-xs sm:text-sm font-bold">
              👶 Age Group: {instructions.ageGroup}
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center mb-4 sm:mb-6 relative z-10">
          <span className="text-blue-300">Level {level}:</span> {instructions.title}
        </h2>

        {/* Message */}
        <div className="bg-blue-500/15 border border-blue-300/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 mb-3 sm:mb-4 relative z-10">
          <p className="text-blue-100 text-sm sm:text-base md:text-lg leading-relaxed font-semibold">
            {instructions.topic}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-6 relative z-10">
          <p className="text-white text-sm sm:text-base md:text-lg leading-relaxed">
            {instructions.message}
          </p>
        </div>

        {/* Tips */}
        <div className="bg-yellow-400/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 mb-6 sm:mb-8 relative z-10">
          <h3 className="text-yellow-300 font-bold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            Quick Tips:
          </h3>
          <ul className="space-y-1.5 sm:space-y-2">
            {instructions.tips.map((tip, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-white text-sm sm:text-base flex items-start gap-2"
              >
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>{tip}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 relative z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartLevel}
            className="flex-1 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-lg sm:text-xl shadow-lg hover:shadow-xl transition-all"
          >
            Start Level! 🚀
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-white/20 text-white font-bold text-base sm:text-lg hover:bg-white/30 transition-all"
          >
            Go Back
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StartScreen({ onStartLevel, onClose }: { onStartLevel: (level: Level) => void; onClose?: () => void }) {
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);

  useEffect(() => {
    loadProgress().then((progress) => {
      if (progress) setCompletedLevels(progress.completedLevels || []);
    });
  }, []);

  const isLevelUnlocked = (level: number) => {
    if (level === 1) return true;
    return completedLevels.includes(level - 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative"
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors p-2"
        >
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
            <Shield className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-400" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Sparkles className="w-8 h-8 text-yellow-300" />
          </motion.div>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
          Password Castle
        </h1>
        <p className="text-white/90 text-lg sm:text-xl max-w-2xl">
          Protect the kingdom by mastering the art of strong passwords!
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
        {[
          { level: 1, title: 'Pattern Detective', description: 'Spot weak password patterns', icon: Target, color: 'from-blue-500 to-blue-600' },
          { level: 2, title: 'Power Ranking', description: 'Find the strongest password', icon: Zap, color: 'from-purple-500 to-purple-600' },
          { level: 3, title: 'Fortress Builder', description: 'Create your own password', icon: Shield, color: 'from-green-500 to-green-600' },
          { level: 4, title: 'Speed Defense', description: 'Race against hackers', icon: AlertCircle, color: 'from-red-500 to-red-600' },
          { level: 5, title: 'Security Mastermind', description: 'Master critical thinking', icon: Crown, color: 'from-yellow-500 to-yellow-600' },
          { level: 6, title: 'Brute Force Storm', description: 'Defend the castle gate', icon: AlertCircle, color: 'from-pink-500 to-rose-600' },
        ].map(({ level, title, description, icon: Icon, color }) => {
          const unlocked = isLevelUnlocked(level);
          const completed = completedLevels.includes(level);

          return (
            <motion.button
              key={level}
              whileHover={unlocked ? { scale: 1.05, y: -5 } : {}}
              whileTap={unlocked ? { scale: 0.95 } : {}}
              onClick={() => unlocked && onStartLevel(level as Level)}
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

              {completed && (
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

// Level 1: Pattern Detective (Ages 6-8) - Enhanced pattern recognition
function Level1({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [currentPasswordIndex, setCurrentPasswordIndex] = useState(0);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHackerAnimation, setShowHackerAnimation] = useState(true);

  const passwords = [
    { 
      password: '123', 
      correctReason: 'Too short (needs 8+ characters)', 
      reasons: ['Too short (needs 8+ characters)', 'Has numbers (that\'s good!)', 'Missing uppercase letters'],
      hint: 'Count the characters - is it long enough?'
    },
    { 
      password: 'password', 
      correctReason: 'Common word (easy to guess)', 
      reasons: ['Has lowercase letters (good!)', 'Common word (easy to guess)', 'All numbers'],
      hint: 'This is a word everyone knows and uses!'
    },
    { 
      password: 'john', 
      correctReason: 'Personal name (not safe)', 
      reasons: ['Contains symbols', 'Personal name (not safe)', 'Has uppercase letters'],
      hint: 'This looks like someone\'s first name!'
    },
  ];

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);
    const correct = reason === passwords[currentPasswordIndex].correctReason;
    setIsCorrect(correct);
    
    if (correct) {
      setFeedback('Correct! You stopped the hacker! 🎉');
      setShowHackerAnimation(false);
      setTimeout(() => {
        if (currentPasswordIndex < passwords.length - 1) {
          setCurrentPasswordIndex(currentPasswordIndex + 1);
          setSelectedReason(null);
          setFeedback('');
          setIsCorrect(false);
          setShowHackerAnimation(true);
        } else {
          onComplete();
        }
      }, 2000);
    } else {
      setFeedback('Not quite! Try again! 💭');
      setTimeout(() => {
        setSelectedReason(null);
        setFeedback('');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors p-2 z-10"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
          Level 1: Pattern Detective
        </h2>
        <p className="text-white/80 text-center mb-4">
          🕵️ Spot the pattern! Why is this password weak?
        </p>

        <HoverHintTrigger key={currentPasswordIndex} hint={passwords[currentPasswordIndex].hint} />

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
          {/* Hacker animation */}
          <AnimatePresence>
            {showHackerAnimation && (
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                className="absolute top-4 right-4"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Bug className="w-8 h-8 text-red-400" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password display with shield animation */}
          <div className="flex items-center justify-center mb-8 relative">
            <motion.div
              animate={{ 
                rotate: showHackerAnimation ? [0, -5, 5, -5, 0] : 0,
                scale: isCorrect ? [1, 1.1, 1] : 1
              }}
              transition={{ repeat: showHackerAnimation ? Infinity : 0, duration: 2 }}
              className={`border-4 rounded-xl px-8 py-6 relative ${
                isCorrect 
                  ? 'bg-green-500/20 border-green-500' 
                  : 'bg-red-500/20 border-red-500'
              }`}
            >
              <p className="text-3xl sm:text-4xl font-mono text-white font-bold">
                {passwords[currentPasswordIndex].password}
              </p>
              
              {/* Shield overlay when correct */}
              {isCorrect && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute -top-6 -right-6"
                >
                  <Shield className="w-12 h-12 text-green-400 fill-green-400/20" />
                </motion.div>
              )}
            </motion.div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {passwords[currentPasswordIndex].reasons.map((reason) => (
              <motion.button
                key={reason}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleReasonSelect(reason)}
                disabled={selectedReason !== null}
                className={`w-full p-4 rounded-xl font-semibold text-base sm:text-lg transition-all relative overflow-hidden ${
                  selectedReason === reason
                    ? isCorrect
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-red-500 text-white shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {selectedReason === reason && (
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                )}
                {reason}
              </motion.button>
            ))}
          </div>
        </div>

        {feedback && (
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className={`text-center text-xl sm:text-2xl font-bold mb-4 ${isCorrect ? 'text-green-400' : 'text-yellow-400'}`}
          >
            {feedback}
          </motion.div>
        )}

        <div className="flex justify-center gap-2">
          {passwords.map((_, i) => (
            <motion.div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < currentPasswordIndex ? 'bg-green-400' : i === currentPasswordIndex ? 'bg-blue-400' : 'bg-white/30'
              }`}
              animate={i === currentPasswordIndex ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Level 2: Power Ranking (Ages 7-9) - Enhanced comparison skills
function Level2({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [currentRound, setCurrentRound] = useState(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedPassword, setSelectedPassword] = useState<string | null>(null);

  const rounds = [
    { 
      passwords: ['hello', 'Hello123', 'abc'], 
      strongest: 'Hello123',
      explanation: 'Has uppercase, lowercase, AND numbers!'
    },
    { 
      passwords: ['password', 'Pass1234', 'mypass'], 
      strongest: 'Pass1234',
      explanation: 'Combines letters and numbers for extra strength!'
    },
    { 
      passwords: ['test', 'T3st!ng', '12345'], 
      strongest: 'T3st!ng',
      explanation: 'Has everything: uppercase, numbers, AND a symbol!'
    },
  ];

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordSelect = (password: string) => {
    setSelectedPassword(password);
    const correct = password === rounds[currentRound].strongest;
    setIsCorrect(correct);
    
    if (correct) {
      setFeedback('Excellent choice! 🎉 ' + rounds[currentRound].explanation);
      setTimeout(() => {
        if (currentRound < rounds.length - 1) {
          setCurrentRound(currentRound + 1);
          setFeedback('');
          setSelectedPassword(null);
        } else {
          onComplete();
        }
      }, 3000);
    } else {
      setFeedback('Not the strongest! Look for MORE security features! 💭');
      setTimeout(() => {
        setFeedback('');
        setSelectedPassword(null);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors p-2 z-10"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
          Level 2: Power Ranking
        </h2>
        <p className="text-white/80 text-center mb-8">
          ⚡ Which password has the MOST security power?
        </p>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 mb-8">
          <div className="space-y-4">
            {rounds[currentRound].passwords.map((password) => {
              const strength = getPasswordStrength(password);
              const isSelected = selectedPassword === password;
              const isStrongest = password === rounds[currentRound].strongest;
              
              return (
                <motion.button
                  key={password}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !selectedPassword && handlePasswordSelect(password)}
                  disabled={selectedPassword !== null}
                  className={`w-full p-6 rounded-xl text-white font-mono text-xl transition-all border-2 relative overflow-hidden ${
                    isSelected
                      ? isCorrect
                        ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-400'
                        : 'bg-gradient-to-r from-red-500 to-red-600 border-red-400'
                      : 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 border-white/20 hover:from-blue-500/50 hover:to-purple-500/50'
                  }`}
                >
                  <span className="font-bold">{password}</span>
                  
                  {/* Shield icon for strongest password when revealed */}
                  {isSelected && isCorrect && (
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute top-2 right-2"
                    >
                      <Shield className="w-8 h-8 text-yellow-300" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {feedback && (
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className={`text-center text-lg sm:text-xl font-bold mb-4 ${isCorrect ? 'text-green-400' : 'text-yellow-400'}`}
          >
            {feedback}
          </motion.div>
        )}

        <div className="flex justify-center gap-2 mt-4">
          {rounds.map((_, i) => (
            <motion.div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < currentRound ? 'bg-purple-400' : i === currentRound ? 'bg-blue-400' : 'bg-white/30'
              }`}
              animate={i === currentRound ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Level 3: Fortress Builder (Ages 8-10) - Multi-step problem solving
function Level3({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [strength, setStrength] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSymbol: false,
  });

  useEffect(() => {
    setStrength({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    });
  }, [password]);

  const allCriteriaMet = Object.values(strength).every(Boolean);
  const strengthPercentage = (Object.values(strength).filter(Boolean).length / 5) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors p-2 z-10"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
          Level 3: Fortress Builder
        </h2>
        <p className="text-white/80 text-center mb-8">
          🏰 Build your OWN super-strong password fortress!
        </p>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 mb-8">
          {/* Password input with show/hide */}
          <div className="relative mb-6">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Type your password here..."
              className="w-full p-4 pr-12 rounded-xl bg-white/20 text-white placeholder-white/50 text-xl font-mono focus:outline-none focus:ring-4 focus:ring-blue-500/50"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Animated strength bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-white/80 text-sm font-semibold">Fortress Strength</span>
              <span className="text-white font-bold text-lg">{Math.round(strengthPercentage)}%</span>
            </div>
            <div className="h-6 bg-white/20 rounded-full overflow-hidden relative">
              <motion.div
                className={`h-full transition-all flex items-center justify-end pr-2 ${
                  strengthPercentage < 40
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : strengthPercentage < 80
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-r from-green-500 to-blue-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${strengthPercentage}%` }}
              >
                {strengthPercentage === 100 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <Shield className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Requirements with animations */}
          <div className="space-y-3">
            {[
              { key: 'minLength', text: 'At least 8 characters long', icon: Key },
              { key: 'hasUppercase', text: 'One UPPERCASE letter (A-Z)', icon: Zap },
              { key: 'hasLowercase', text: 'One lowercase letter (a-z)', icon: Zap },
              { key: 'hasNumber', text: 'One number (0-9)', icon: Target },
              { key: 'hasSymbol', text: 'One symbol (!@#$%^&*)', icon: Shield },
            ].map(({ key, text, icon: Icon }) => {
              const met = strength[key as keyof typeof strength];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    met ? 'bg-green-500/20' : 'bg-white/5'
                  }`}
                >
                  <motion.div
                    animate={met ? { rotate: 360, scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {met ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <Icon className="w-6 h-6 text-white/40" />
                    )}
                  </motion.div>
                  <span className={`text-sm sm:text-base ${met ? 'text-green-400 font-semibold' : 'text-white/60'}`}>
                    {text}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {allCriteriaMet && (
            <motion.button
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="w-full mt-6 p-4 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-xl hover:from-green-600 hover:to-blue-600 transition-all shadow-lg relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-white/20"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="relative z-10">🔓 Unlock Fortress!</span>
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Level 4: Speed Defense (Ages 9-11) - Time management and quick thinking
function Level4({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentPassword, setCurrentPassword] = useState(0);
  const [wallHealth, setWallHealth] = useState(100);
  const [inputPassword, setInputPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [hackerAttacks, setHackerAttacks] = useState(0);

  const weakPasswords = [
    { weak: 'hello', hint: 'Add uppercase, numbers & symbols!' },
    { weak: 'test123', hint: 'Add uppercase & symbols!' },
    { weak: 'abc', hint: 'Much longer + uppercase + numbers + symbols!' },
    { weak: 'password', hint: 'Add uppercase, numbers & symbols!' },
    { weak: 'qwerty', hint: 'Add uppercase, numbers & symbols!' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (wallHealth > 0 && currentPassword >= 3) {
            onComplete();
          }
          return 0;
        }
        
        // Hackers attack every 10 seconds
        if (prev % 10 === 0 && wallHealth > 0) {
          setWallHealth(h => Math.max(0, h - 5));
          setHackerAttacks(a => a + 1);
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = () => {
    const isStrong =
      inputPassword.length >= 8 &&
      /[A-Z]/.test(inputPassword) &&
      /[a-z]/.test(inputPassword) &&
      /[0-9]/.test(inputPassword) &&
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(inputPassword);

    if (isStrong) {
      setFeedback('🛡️ Perfect! Wall repaired!');
      setWallHealth(Math.min(100, wallHealth + 25));
      setTimeout(() => {
        if (currentPassword < weakPasswords.length - 1) {
          setCurrentPassword(currentPassword + 1);
          setInputPassword('');
          setFeedback('');
        } else {
          onComplete();
        }
      }, 1000);
    } else {
      setFeedback('⚠️ Not strong enough!');
      setWallHealth(Math.max(0, wallHealth - 10));
      setTimeout(() => setFeedback(''), 1000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Hacker attack animations */}
      <AnimatePresence>
        {hackerAttacks > 0 && (
          <motion.div
            key={hackerAttacks}
            initial={{ x: '100%', y: '-50%' }}
            animate={{ x: '-100%', y: '-50%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute top-1/2 z-0"
          >
            <Bug className="w-12 h-12 text-red-500" />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={onBack}
        className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors p-2 z-10"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full relative z-10"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
          Level 4: Speed Defense
        </h2>
        
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg sm:rounded-xl px-2 sm:px-4 py-2 sm:py-3 text-center min-w-0">
            <span className="text-white/80 text-xs sm:text-sm block">⏱️ Time</span>
            <motion.span 
              className={`font-bold text-lg sm:text-2xl block ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}
              animate={timeLeft <= 10 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {timeLeft}s
            </motion.span>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-lg sm:rounded-xl px-2 sm:px-4 py-2 sm:py-3 text-center min-w-0">
            <span className="text-white/80 text-xs sm:text-sm block">🏰 Health</span>
            <motion.span 
              className={`font-bold text-lg sm:text-2xl block ${wallHealth > 50 ? 'text-green-400' : 'text-red-400'}`}
              animate={wallHealth <= 25 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {wallHealth}%
            </motion.span>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-lg sm:rounded-xl px-2 sm:px-4 py-2 sm:py-3 text-center min-w-0">
            <span className="text-white/80 text-xs sm:text-sm block">✅ Fixed</span>
            <span className="text-blue-400 font-bold text-lg sm:text-2xl block">{currentPassword}/5</span>
          </div>
        </div>

        {/* Wall health visual */}
        <div className="mb-6">
          <div className="h-4 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className={`h-full transition-all ${
                wallHealth > 50 ? 'bg-green-500' : 'bg-red-500'
              }`}
              animate={{ width: `${wallHealth}%` }}
            />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 mb-6">
          <div className="mb-6">
            <p className="text-white/80 mb-2 font-semibold">⚠️ Weak password under attack:</p>
            <motion.div 
              className="bg-red-500/20 border-2 border-red-500 rounded-xl p-4 mb-2"
              animate={{ boxShadow: ['0 0 0 0 rgba(239, 68, 68, 0)', '0 0 0 10px rgba(239, 68, 68, 0)'] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <p className="text-red-400 font-mono text-xl font-bold">{weakPasswords[currentPassword].weak}</p>
            </motion.div>
            <p className="text-yellow-400 text-sm italic">💡 {weakPasswords[currentPassword].hint}</p>
          </div>

          <div className="mb-4">
            <input
              type="text"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Create a STRONG password fast!"
              className="w-full p-4 rounded-xl bg-white/20 text-white placeholder-white/50 text-xl font-mono focus:outline-none focus:ring-4 focus:ring-blue-500/50"
              autoFocus
            />
          </div>

          <motion.button
            onClick={handleSubmit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-xl hover:from-orange-600 hover:to-red-600 transition-all"
          >
            🔨 Repair Wall NOW!
          </motion.button>
        </div>

        {feedback && (
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="text-center text-xl sm:text-2xl font-bold text-yellow-400"
          >
            {feedback}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// Level 5: Security Mastermind (Ages 10-12) - Critical thinking and scenario-based challenges
function Level5({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [currentGate, setCurrentGate] = useState(0);
  const [inputPassword, setInputPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [attempts, setAttempts] = useState(0);

  const gates = [
    { 
      hint: '🎂 Gate 1: No birthdates! Hackers check social media for these!',
      scenario: 'Imagine a hacker looking at your profile - would they guess this?'
    },
    { 
      hint: '👤 Gate 2: Avoid common names! Even your pet\'s name isn\'t safe!',
      scenario: 'Think: Could someone who knows you guess this password?'
    },
    { 
      hint: '🔄 Gate 3: No patterns! (like aaa, 123, or qwerty)',
      scenario: 'Hackers use pattern-breaking tools - be totally random!'
    },
  ];

  const validatePassword = () => {
    setAttempts(attempts + 1);
    
    // Check for birthdates (4 consecutive digits that look like years)
    if (/\d{4}/.test(inputPassword)) {
      setErrorMessage('🚫 Birthdate detected! Hackers can find this on social media!');
      setFeedback('');
      setTimeout(() => setErrorMessage(''), 3000);
      return false;
    }

    // Check for common names
    const commonNames = ['john', 'mary', 'david', 'sarah', 'mike', 'emma', 'james', 'lisa', 'alex', 'anna', 'max', 'lucy'];
    if (commonNames.some(name => inputPassword.toLowerCase().includes(name))) {
      setErrorMessage('🚫 Common name found! Try something more unique!');
      setFeedback('');
      setTimeout(() => setErrorMessage(''), 3000);
      return false;
    }

    // Check for repeating characters (3+ in a row)
    if (/(.)\1{2,}/.test(inputPassword)) {
      setErrorMessage('🚫 Repeating pattern detected! Mix it up!');
      setFeedback('');
      setTimeout(() => setErrorMessage(''), 3000);
      return false;
    }

    // Check for sequential patterns
    if (/abc|bcd|cde|123|234|345|456|567|678|789/i.test(inputPassword)) {
      setErrorMessage('🚫 Sequential pattern found! Be more random!');
      setFeedback('');
      setTimeout(() => setErrorMessage(''), 3000);
      return false;
    }

    // Check if it's strong enough
    const isStrong =
      inputPassword.length >= 8 &&
      /[A-Z]/.test(inputPassword) &&
      /[a-z]/.test(inputPassword) &&
      /[0-9]/.test(inputPassword) &&
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(inputPassword);

    if (!isStrong) {
      setErrorMessage('🚫 Not strong enough! Check all requirements!');
      setFeedback('');
      setTimeout(() => setErrorMessage(''), 3000);
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (validatePassword()) {
      setFeedback('🎉 Gate unlocked! Excellent security thinking!');
      setErrorMessage('');
      setAttempts(0);
      setTimeout(() => {
        if (currentGate < gates.length - 1) {
          setCurrentGate(currentGate + 1);
          setInputPassword('');
          setFeedback('');
        } else {
          onComplete();
        }
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors p-2 z-10"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
          Level 5: Security Mastermind
        </h2>
        <p className="text-white/80 text-center mb-8">
          🧠 Think like a hacker to defend like a hero!
        </p>

        {/* Gate visual */}
        <div className="flex justify-center gap-4 mb-8">
          {gates.map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: i === currentGate ? 1.2 : 1,
                rotateY: i < currentGate ? 90 : 0
              }}
              transition={{ type: 'spring' }}
              className={`w-20 h-24 rounded-lg flex items-center justify-center relative ${
                i < currentGate
                  ? 'bg-green-500'
                  : i === currentGate
                  ? 'bg-yellow-500'
                  : 'bg-gray-500'
              }`}
            >
              <Lock className="w-10 h-10 text-white" />
              {i < currentGate && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2"
                >
                  <CheckCircle className="w-6 h-6 text-white bg-green-600 rounded-full" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 mb-6">
          {/* Scenario-based hint */}
          <div className="bg-blue-500/20 border-l-4 border-blue-500 p-4 mb-6 rounded">
            <p className="text-white font-semibold mb-2">{gates[currentGate].hint}</p>
            <p className="text-blue-200 text-sm italic">💭 {gates[currentGate].scenario}</p>
          </div>

          <input
            type="text"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Think carefully and create..."
            className="w-full p-4 rounded-xl bg-white/20 text-white placeholder-white/50 text-xl font-mono mb-4 focus:outline-none focus:ring-4 focus:ring-yellow-500/50"
          />

          {attempts > 0 && (
            <p className="text-white/60 text-sm mb-4">
              Attempts: {attempts} - Think smarter, not harder!
            </p>
          )}

          <motion.button
            onClick={handleSubmit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-xl hover:from-yellow-600 hover:to-orange-600 transition-all"
          >
            🔑 Unlock Gate!
          </motion.button>
        </div>

        {errorMessage && (
          <motion.div
            initial={{ scale: 0, x: -20 }}
            animate={{ scale: 1, x: 0 }}
            className="bg-red-500/20 border-2 border-red-400 rounded-xl p-4 mb-4"
          >
            <p className="text-red-400 font-bold text-center">{errorMessage}</p>
          </motion.div>
        )}

        {feedback && (
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="text-center text-xl sm:text-2xl font-bold text-green-400"
          >
            {feedback}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// Level 6: Brute Force Storm - realistic brute-force simulation
function Level6({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  type CandidatePassword = {
    value: string;
    description: string;
  };

  const [currentRound, setCurrentRound] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedPassword, setSelectedPassword] = useState<string | null>(null);
  const [attackProgress, setAttackProgress] = useState(0);
  const guessesPerSecond = 1_000_000;

  const rounds: CandidatePassword[][] = [
    [
      { value: 'Tiger12', description: 'Short and simple pattern' },
      { value: 'T!g3r#Moon92', description: 'Longer with mixed characters' },
      { value: '12345678', description: 'Only numbers' },
    ],
    [
      { value: 'Password@1', description: 'Common base word with minor changes' },
      { value: 'R7!mQ2#vLp9$', description: 'High randomness and full character mix' },
      { value: 'Qwerty2025', description: 'Keyboard pattern with year' },
    ],
    [
      { value: 'Sunshine7!', description: 'Dictionary-like word with suffix' },
      { value: 'M9$kP2!dT4@x', description: 'Random and long' },
      { value: 'Areeb2008', description: 'Name + year pattern' },
    ],
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setAttackProgress((prev) => (prev >= 100 ? 0 : prev + 3));
    }, 120);
    return () => clearInterval(timer);
  }, []);

  const estimatePoolSize = (password: string) => {
    let pool = 0;
    if (/[a-z]/.test(password)) pool += 26;
    if (/[A-Z]/.test(password)) pool += 26;
    if (/[0-9]/.test(password)) pool += 10;
    if (/[^A-Za-z0-9]/.test(password)) pool += 33;
    return Math.max(pool, 1);
  };

  const estimateCrackSeconds = (password: string) => {
    const pool = estimatePoolSize(password);
    const combinations = Math.pow(pool, password.length);
    return combinations / guessesPerSecond;
  };

  const formatDuration = (seconds: number) => {
    if (!Number.isFinite(seconds)) return 'Very long time';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    const minutes = seconds / 60;
    if (minutes < 60) return `${Math.round(minutes)} minutes`;
    const hours = minutes / 60;
    if (hours < 24) return `${Math.round(hours)} hours`;
    const days = hours / 24;
    if (days < 365) return `${Math.round(days)} days`;
    const years = days / 365;
    if (years < 1_000_000) return `${Math.round(years)} years`;
    return 'Millions of years';
  };

  const getStrongestPassword = (candidates: CandidatePassword[]) => {
    return [...candidates].sort(
      (a, b) => estimateCrackSeconds(b.value) - estimateCrackSeconds(a.value)
    )[0].value;
  };

  useEffect(() => {
    if (!selectedPassword) return;

    const strongest = getStrongestPassword(rounds[currentRound]);
    const correct = selectedPassword === strongest;

    if (correct) {
      setFeedback('Correct! This password has the highest brute-force resistance.');
      setTimeout(() => {
        if (currentRound < rounds.length - 1) {
          setCurrentRound((prev) => prev + 1);
          setSelectedPassword(null);
          setFeedback('');
        } else {
          onComplete();
        }
      }, 1800);
    } else {
      const crackTime = formatDuration(estimateCrackSeconds(selectedPassword));
      setFeedback(`Not the strongest choice. Estimated crack time: ${crackTime}.`);
      setTimeout(() => {
        setSelectedPassword(null);
        setFeedback('');
      }, 1800);
    }
  }, [selectedPassword]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors p-2 z-10"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl w-full relative z-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-3">
          Level 6: Brute Force Storm
        </h2>
        <p className="text-white/80 text-center mb-6">
          Pick the password that takes the longest to crack in a brute-force attack.
        </p>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div className="bg-blue-500/20 rounded-xl p-4">
              <p className="text-blue-100 text-sm">Attacker Speed</p>
              <p className="text-white font-bold text-xl">{guessesPerSecond.toLocaleString()} guesses/sec</p>
            </div>
            <div className="bg-purple-500/20 rounded-xl p-4">
              <p className="text-purple-100 text-sm">Round</p>
              <p className="text-white font-bold text-xl">{currentRound + 1}/{rounds.length}</p>
            </div>
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/80 text-sm">Live Attack Pressure</span>
              <span className="text-white font-semibold">{attackProgress}%</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                animate={{ width: `${attackProgress}%` }}
              />
            </div>
          </div>

          <div className="space-y-3 mb-5">
            {rounds[currentRound].map((candidate) => {
              const crackSeconds = estimateCrackSeconds(candidate.value);
              const isSelected = selectedPassword === candidate.value;
              return (
                <button
                  key={candidate.value}
                  onClick={() => !selectedPassword && setSelectedPassword(candidate.value)}
                  disabled={selectedPassword !== null}
                  className={`w-full p-4 rounded-xl text-left transition-all border ${
                    isSelected
                      ? 'bg-blue-500 text-white border-blue-300'
                      : 'bg-white/20 text-white border-white/20 hover:bg-white/30'
                  }`}
                >
                  <p className="font-mono text-lg font-bold">{candidate.value}</p>
                  <p className="text-sm opacity-90">{candidate.description}</p>
                  <p className="text-sm mt-1 font-semibold">
                    Estimated crack time: {formatDuration(crackSeconds)}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="bg-yellow-500/15 border border-yellow-400/40 rounded-xl p-4">
            <p className="text-yellow-200 text-sm">
              Tip: Brute force tries many guesses automatically. Longer passwords with mixed character sets create a much larger search space.
            </p>
          </div>
        </div>

        <div className="relative h-20 mb-4 overflow-hidden">
          {['123456', 'password', 'qwerty', 'admin123', 'letmein', 'welcome1'].map((pwd, i) => (
            <motion.div
              key={`${pwd}-${currentRound}-${i}`}
              className="absolute right-0 bg-red-500/30 border border-red-400 text-red-200 px-3 py-1 rounded-md font-mono text-sm"
              style={{ top: `${(i % 3) * 26}px` }}
              animate={{ x: [150, -420] }}
              transition={{ duration: 2.8 + i * 0.3, repeat: Infinity, ease: 'linear', delay: i * 0.2 }}
            >
              {pwd}
            </motion.div>
          ))}
        </div>

        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-4 text-center font-bold ${
              feedback.startsWith('Correct')
                ? 'bg-green-500/20 text-green-300'
                : 'bg-yellow-500/20 text-yellow-300'
            }`}
          >
            {feedback}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function LevelComplete({ level, onNextLevel, onBackToMenu }: { level: Level; onNextLevel: () => void; onBackToMenu: () => void }) {
  const rewards = [
    { level: 1, reward: 'Pattern Detective Badge', icon: Target, color: 'text-blue-400' },
    { level: 2, reward: 'Power Ranking Star', icon: Sparkles, color: 'text-purple-400' },
    { level: 3, reward: 'Master Builder Shield', icon: Shield, color: 'text-green-400' },
    { level: 4, reward: 'Speed Defense Medal', icon: Zap, color: 'text-orange-400' },
    { level: 5, reward: 'Security Mastermind Crown', icon: Crown, color: 'text-yellow-400' },
    { level: 6, reward: 'Brute Force Blocker Badge', icon: AlertCircle, color: 'text-pink-400' },
  ];

  const { reward, icon: Icon, color } = rewards[level - 1];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8"
    >
      <motion.div
        animate={{ rotate: [0, 5, -5, 0], y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="mb-8"
      >
        <Icon className={`w-32 h-32 ${color}`} />
      </motion.div>

      <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-4">
        Level Complete! 🎉
      </h2>
      <p className="text-white/80 text-xl text-center mb-4">
        You earned:
      </p>
      <motion.p
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className={`text-2xl font-bold text-center mb-8 ${color}`}
      >
        {reward}
      </motion.p>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-sm sm:max-w-none sm:w-auto">
        {level < 6 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNextLevel}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-base sm:text-xl hover:from-green-600 hover:to-blue-600 transition-all shadow-lg min-h-[48px]"
          >
            Next Level →
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBackToMenu}
          className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-white/20 text-white font-bold text-base sm:text-xl hover:bg-white/30 transition-all min-h-[48px]"
        >
          {level === 6 ? 'Complete Game 🏆' : 'Back to Menu'}
        </motion.button>
      </div>
    </motion.div>
  );
}