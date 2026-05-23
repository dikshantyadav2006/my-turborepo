import { useState, useEffect, useCallback, useMemo } from 'react';
import { SEO, schemaBreadcrumb, schemaFAQ } from '../../../components/seo/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Settings2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

// Store & Hooks
import { useTypingStore } from '../store/typingStore';
import { useTypingAnalyticsStore } from '../store/typingAnalyticsStore';
import { useAnalyticsStore } from '../../analytics/store/analyticsStore';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { useTypingSound } from '../hooks/useTypingSound';

// Utils
import { generateStandardWords, generateRowText, generateCodingText } from '../utils/textGenerators';
import { quotes } from '../utils/wordUtils';

// Components
import TypingArea from '../components/TypingArea';
import KeyboardVisualizer from '../components/KeyboardVisualizer';
import TypingHeader from '../components/TypingHeader';
import LiveStats from '../components/LiveStats';
import SessionSummary from '../components/SessionSummary';

const TypingTestPage = () => {
  const { 
    mode, duration, wordCount, codingLanguage, rowTarget, customText,
    isActive, isFinished, startSession, endSession, resetSession, 
    keyboardEnabled, currentLesson, zenMode, setZenMode
  } = useTypingStore();

  const { saveSession, loadLocalData } = useTypingAnalyticsStore();
  const { playSound } = useTypingSound();
  const { addXP } = useAnalyticsStore();
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 1. Generate text based on current mode settings
  const text = useMemo(() => {
    if (currentLesson) return currentLesson.text;
    
    switch (mode) {
      case 'words':
        return generateStandardWords(wordCount);
      case 'quote':
        const q = quotes[Math.floor(Math.random() * quotes.length)];
        return q.text;
      case 'coding':
        return generateCodingText(codingLanguage);
      case 'row':
        return generateRowText(rowTarget, 15);
      case 'custom':
        return customText || "Please enter some custom text in settings to practice...";
      case 'time':
      default:
        return generateStandardWords(50); // Start with enough words for time mode
    }
  }, [mode, wordCount, codingLanguage, rowTarget, customText, currentLesson, refreshTrigger]);

  const [timeLeft, setTimeLeft] = useState(duration);

  // 2. Typing Engine Setup
  const {
    userInput, wpm, rawWpm, accuracy, errors, currentIndex, isFinished: engineFinished,
    handleKeyDown: engineHandleKeyDown, reset: engineReset, keyTimings, startTime
  } = useTypingEngine(text, (finalStats) => {
    endSession();
  });

  // Handle Reset
  const handleReset = useCallback(() => {
    engineReset();
    resetSession();
    setTimeLeft(duration);
    setRefreshTrigger(prev => prev + 1);
  }, [engineReset, resetSession, duration]);

  // Wrap engine handleKeyDown for effects
  const handleKeyDown = useCallback((e) => {
    if (isFinished) return;

    // Start session on first key
    if (!isActive) startSession();
    
    // Play sound effects
    const expectedChar = text[userInput.length];
    if (e.key.length === 1 && e.key !== 'Shift') {
      if (e.key === expectedChar) {
        playSound('keypress');
      } else {
        playSound('error');
      }
    }
    
    engineHandleKeyDown(e);
  }, [isActive, isFinished, startSession, text, userInput, playSound, engineHandleKeyDown]);

  // 3. Effects
  // Handle Session Completion (Save & XP)
  useEffect(() => {
    if (isFinished) {
      saveSession({ wpm, accuracy, mode, duration });
      
      // XP Calculation: Base 10 XP + complexity multiplier
      const earnedXP = Math.round((wpm * (accuracy / 100)) / 2) + 5;
      if (earnedXP > 0) addXP(earnedXP);
    }
  }, [isFinished]);

  // Timer logic for 'time' mode
  useEffect(() => {
    if (isActive && mode === 'time' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            endSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isActive, mode, timeLeft, endSession]);

  // Keyboard Event Management
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (e.key === 'Escape') {
        setZenMode(!zenMode);
      } else {
        handleKeyDown(e);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [handleKeyDown, zenMode, setZenMode]);

  useEffect(() => {
    loadLocalData();
  }, [loadLocalData]);

  // 4. SEO
  const typingFAQ = schemaFAQ([
    { q: 'How do I improve my typing speed?', a: 'Practice daily with structured lessons, focus on accuracy first, then build speed gradually.' },
    { q: 'Is this typing test private?', a: 'Yes. All typing happens locally. Your keystrokes never leave your browser.' },
    { q: 'Can I practice coding?', a: 'Yes! Select "Coding" mode to practice JS, Python, HTML and more.' },
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pt-8 pb-20">
      <SEO
        title="Typing Master – Professional Typing Test & Practice"
        description="High-performance typing test with coding mode, row practice, and detailed analytics. Improve your WPM and accuracy in a distraction-free environment."
        keywords={['typing test', 'coding typing practice', 'WPM test', 'touch typing', 'keyboard speed', 'typing master']}
        canonical="/typing"
        schema={[schemaBreadcrumb([{ name: 'Home', url: '/' }, { name: 'Typing Master', url: '/typing' }]), typingFAQ]}
      />

      <AnimatePresence mode="wait">
        {!isFinished ? (
          <motion.div
            key="active-test"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-12"
          >
            <TypingHeader />

            <LiveStats 
              wpm={wpm}
              accuracy={accuracy}
              timeLeft={timeLeft}
              errors={errors}
              mode={mode}
              isFinished={isFinished}
              zenMode={zenMode && isActive}
            />

            {/* Main Container */}
            <div className="relative group">
              {/* Blur backdrop for Focus feel */}
              <div className="absolute -inset-1 bg-linear-to-r from-primary/20 via-blue-500/20 to-purple-500/20 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
              
              <div className="relative p-12 bg-card/50 backdrop-blur-2xl border border-border/50 rounded-[3rem] shadow-2xl overflow-hidden">
                <TypingArea 
                  text={text}
                  userInput={userInput}
                  currentIndex={currentIndex}
                  isActive={isActive}
                />
                
                {/* Reset Hint */}
                {!isActive && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground/50 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                    Press any key to start or <span className="text-primary/70">TAB</span> to reset
                  </div>
                )}
              </div>
            </div>

            {/* Visualizer */}
            {keyboardEnabled && (
              <div className={cn(
                "transition-all duration-500",
                (zenMode && isActive) ? "opacity-0 translate-y-8" : "opacity-100",
                "hover:opacity-100 hover:translate-y-0"
              )}>
                <KeyboardVisualizer pressedKey={userInput[currentIndex-1] || ''} />
              </div>
            )}
          </motion.div>
        ) : (
          <SessionSummary 
            stats={{ wpm, rawWpm, accuracy, errors, keyTimings, isNewBest: false }}
            onRestart={handleReset}
            onNext={() => {
              // Later: Logic for next lesson
              handleReset();
            }}
          />
        )}
      </AnimatePresence>

      {/* Persistent Zen Toggle (Floating) */}
      {zenMode && !isFinished && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          whileHover={{ opacity: 1, scale: 1.1 }}
          onClick={() => setZenMode(false)}
          className="fixed top-6 right-6 p-3 rounded-full bg-card border border-border shadow-xl z-60 transition-all"
          title="Exit Zen Mode (ESC)"
        >
          <Settings2 size={20} className="text-muted-foreground" />
        </motion.button>
      )}
    </div>
  );
};

export default TypingTestPage;
