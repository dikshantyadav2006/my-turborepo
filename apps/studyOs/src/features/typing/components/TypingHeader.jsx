import { useTypingStore } from '../store/typingStore';
import { 
  Clock, 
  Hash, 
  Quote, 
  Code2, 
  Keyboard, 
  FileText,
  EyeOff,
  Eye
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const TypingHeader = () => {
  const { 
    mode, duration, wordCount, codingLanguage, rowTarget,
    setMode, setDuration, setWordCount, setCodingLanguage, setRowTarget,
    zenMode, setZenMode, isActive
  } = useTypingStore();

  const mainModes = [
    { id: 'time', label: 'Time', icon: Clock },
    { id: 'words', label: 'Words', icon: Hash },
    { id: 'quote', label: 'Quote', icon: Quote },
    { id: 'coding', label: 'Coding', icon: Code2 },
    { id: 'row', label: 'Rows', icon: Keyboard },
    { id: 'custom', label: 'Custom', icon: FileText },
  ];

  const durations = [15, 30, 60, 180, 300];
  const wordCounts = [10, 25, 50, 100];
  const languages = ['javascript', 'python', 'html', 'css', 'json', 'terminal'];
  const rows = ['home', 'top', 'bottom', 'numbers', 'symbols'];

  return (
    <div className={cn(
      "flex flex-col items-center gap-6 mb-8 transition-all duration-500",
      (zenMode && isActive) ? "opacity-0 -translate-y-4" : "opacity-100",
      "hover:opacity-100 hover:translate-y-0" // Reveal on hover
    )}>
      {/* Mode Switcher */}
      <div className="flex flex-wrap justify-center bg-secondary/30 backdrop-blur-md p-1.5 rounded-[2rem] border border-border/50 shadow-xl">
        {mainModes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300",
              mode === m.id 
                ? 'bg-card text-primary shadow-lg ring-1 ring-border/50' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            )}
          >
            <m.icon size={18} />
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Sub-Options */}
      <div className="flex flex-wrap items-center justify-center gap-6">
        {mode === 'time' && (
          <div className="flex gap-2 bg-secondary/20 p-1 rounded-xl">
            {durations.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-black transition-all",
                  duration === d ? 'text-primary bg-primary/10 shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {d}s
              </button>
            ))}
          </div>
        )}

        {mode === 'words' && (
          <div className="flex gap-2 bg-secondary/20 p-1 rounded-xl">
            {wordCounts.map((w) => (
              <button
                key={w}
                onClick={() => setWordCount(w)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-black transition-all",
                  wordCount === w ? 'text-primary bg-primary/10 shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {w}
              </button>
            ))}
          </div>
        )}

        {mode === 'coding' && (
          <div className="flex gap-2 bg-secondary/20 p-1 rounded-xl">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setCodingLanguage(lang)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                  codingLanguage === lang ? 'text-primary bg-primary/10 shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {lang}
              </button>
            ))}
          </div>
        )}

        {mode === 'row' && (
          <div className="flex gap-2 bg-secondary/20 p-1 rounded-xl">
            {rows.map((r) => (
              <button
                key={r}
                onClick={() => setRowTarget(r)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-black capitalize transition-all",
                  rowTarget === r ? 'text-primary bg-primary/10 shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        )}

        <div className="h-4 w-px bg-border/50 hidden md:block" />

        {/* Global Controls */}
        <button
          onClick={() => setZenMode(!zenMode)}
          className={cn(
            "p-2.5 rounded-xl transition-all border border-transparent",
            zenMode ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-secondary/50 hover:border-border/50"
          )}
          title="Zen Mode (hides UI while typing)"
        >
          {zenMode ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
};

export default TypingHeader;
