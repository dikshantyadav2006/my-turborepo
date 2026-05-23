// Advanced Local Intent Engine (Fuzzy Weighted Token Matcher with Hinglish & Synonym Support)

const SYNONYM_GROUPS = {
  // Verbs (Actions)
  ACTIVATE: ["start", "chalu", "shuru", "open", "kholo", "chalao", "launch", "play", "run", "enable", "on", "dikhao", "show", "activate", "aana"],
  DEACTIVATE: ["stop", "pause", "band", "rok", "off", "disable", "close", "shut", "deactivate", "pause"],
  RESET: ["reset", "restart", "clear", "khali", "mitao", "saf", "delete", "remove", "next", "badal"],
  CREATE: ["add", "create", "write", "banao", "banaye", "likho", "likh", "new", "naya", "make", "remind"],
  COMPLETE: ["complete", "done", "finish", "khatam", "ho", "mark", "tick"],
  
  // Targets (Nouns)
  STOPWATCH: ["stopwatch", "watch", "ghadi"],
  TIMER: ["timer", "pomodoro", "pomo", "focus", "break"],
  TASK: ["task", "tasks", "todo", "todos", "remind", "reminder", "kam", "kaam"],
  NOTE: ["note", "notes", "writeup", "memo", "copy", "diary"],
  CALCULATOR: ["calculator", "calc", "hisab"],
  WHITEBOARD: ["whiteboard", "board", "canvas", "draw", "painting"],
  FLASHCARDS: ["flashcard", "flashcards", "card", "cards", "deck"],
  QUIZ: ["quiz", "quizzes", "test", "sawal", "question"],
  PHYSICS: ["physics", "chemistry", "solver", "formula", "weight", "mass", "molar", "density", "force"],
  PLANNER: ["planner", "schedule", "plan", "planner", "goals"],
  SIDEBAR: ["sidebar", "menu", "panel", "navigation"],
  DASHBOARD: ["dashboard", "home", "main", "front"],
  LEADERBOARD: ["leaderboard", "rank", "ranking", "topper"],
  ANALYTICS: ["analytics", "chart", "report", "stats", "graph", "progress"],
  AI_CENTER: ["ai", "chat", "assistant", "bot", "center"],
  MUSIC: ["music", "song", "gaana", "audio", "media", "player"],
  DARK_MODE: ["dark", "light", "theme", "mode", "color", "black", "white"],
  FULLSCREEN: ["fullscreen", "screen", "parda"],
  NOTIFICATIONS: ["notification", "notifications", "alert", "alerts"],
};

// Simple Levenshtein distance for typo tolerance
const stringDistance = (s1, s2) => {
  const track = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
  for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;
  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  return track[s2.length][s1.length];
};

const fuzzyMatch = (word, list) => {
  for (const item of list) {
    if (word === item) return true;
    if (word.length >= 4 && item.length >= 4) {
      const dist = stringDistance(word, item);
      if (dist <= 1) return true; // Allow 1 character typo
    }
  }
  return false;
};

export const parseIntent = (rawInput) => {
  try {
    const rawCleaned = (rawInput || "").toLowerCase().trim();
    if (!rawCleaned) {
      return { tool: "UNKNOWN", payload: {}, confidence: 0.0 };
    }

    // 1. Command Grammar Phonetic Correction Layer
    const words = rawCleaned.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/).filter(Boolean);
    
    const GRAMMAR_CORRECTIONS = {
      // stops/pauses
      "shop": "stop",
      "top": "stop",
      "stap": "stop",
      "sop": "stop",
      "stopp": "stop",
      "paws": "pause",
      "pose": "pause",
      
      // starts/opens
      "star": "start",
      "stark": "start",
      "stat": "start",
      "stard": "start",
      "shuru": "start",
      "chalu": "start",
      "kholo": "open",
      
      // tasks
      "tax": "task",
      "tusk": "task",
      "todo": "task",
      "todos": "task",
      
      // pomodoro / timer
      "promo": "pomodoro",
      "pomo": "pomodoro",
      "timer": "timer",
      "timr": "timer",
      
      // notes
      "node": "note",
      "not": "note",
      "noat": "note",
      "note-pad": "note",
      
      // dashboard/home
      "dash": "dashboard",
      "board": "dashboard",
      
      // dark/light theme
      "theme": "theme",
      "darkmode": "dark",
      "lightmode": "light"
    };

    const correctedWords = words.map(w => GRAMMAR_CORRECTIONS[w] || w);
    const text = correctedWords.join(" ");
    const tokens = correctedWords;
    
    // Check matched categories
    const matches = {};
    for (const [category, synonyms] of Object.entries(SYNONYM_GROUPS)) {
      matches[category] = tokens.some(tok => fuzzyMatch(tok, synonyms));
    }

    let tool = "UNKNOWN";
    let payload = {};
    let confidence = 0.0;

    // --- DECISION MATRIX ---

    // 1. TIMERS (Stopwatch & Pomodoro)
    if (matches.STOPWATCH) {
      confidence = 0.95;
      if (matches.DEACTIVATE) {
        tool = "STOP_STOPWATCH";
      } else if (matches.RESET) {
        tool = "RESET_STOPWATCH";
      } else {
        tool = "START_STOPWATCH"; // Defaults to start
      }
    } 
    else if (matches.TIMER) {
      confidence = 0.95;
      if (matches.DEACTIVATE) {
        tool = "STOP_TIMER";
      } else if (matches.RESET) {
        tool = "RESET_POMODORO";
      } else {
        tool = "START_TIMER";
        // Extract duration: check for digits in string
        const numMatch = text.match(/(\d+)/);
        payload.duration = numMatch ? parseInt(numMatch[1], 10) : 25; // default 25 min
        
        // Custom break check
        if (text.includes("break") || text.includes("chutti") || text.includes("aaram")) {
          payload.mode = payload.duration > 10 ? "longBreak" : "shortBreak";
        } else {
          payload.mode = "pomodoro";
        }
      }
    }

    // 2. TASKS
    else if (matches.TASK) {
      confidence = 0.90;
      if (matches.RESET || matches.DEACTIVATE || text.includes("clear") || text.includes("delete")) {
        tool = "DELETE_ALL_TASKS"; // Destructive action (requires approval)
        confidence = 0.99;
      } else {
        tool = "CREATE_TASK";
        // Extract Task Title
        let title = text;
        const wordsToRemove = [
          "add", "create", "write", "banao", "banaye", "likho", "likh", "new", "naya",
          "remind me to", "remind me", "task", "tasks", "todo", "todos", "remind", "reminder",
          "ka task", "ki note", "add kro", "banao", "banaye", "likho", "please", "plz", "karo", "kro"
        ];
        for (const w of wordsToRemove) {
          title = title.replace(new RegExp(`\\b${w}\\b`, 'gi'), '');
        }
        title = title.replace(/\s+/g, ' ').trim();
        payload.title = title ? title.charAt(0).toUpperCase() + title.slice(1) : "New Study Task";
        payload.focusTime = 25;
      }
    }

    // 3. NOTES
    else if (matches.NOTE) {
      confidence = 0.90;
      if (matches.ACTIVATE && !matches.CREATE) {
        tool = "OPEN_NOTES";
      } else {
        tool = "CREATE_NOTE";
        let content = text;
        const wordsToRemove = [
          "add", "create", "write", "banao", "banaye", "likho", "likh", "new", "naya", "make",
          "note", "notes", "writeup", "memo", "copy", "diary", "ki note", "ka note", "add kro", "karo", "kro"
        ];
        for (const w of wordsToRemove) {
          content = content.replace(new RegExp(`\\b${w}\\b`, 'gi'), '');
        }
        content = content.replace(/\s+/g, ' ').trim();
        payload.title = "Voice Note";
        payload.content = content ? content.charAt(0).toUpperCase() + content.slice(1) : "Blank voice dictation note.";
      }
    }

    // 4. FOCUS MODE
    else if (matches.FOCUS_MODE || text.includes("focus mode")) {
      tool = "ENTER_FOCUS_MODE";
      payload.duration = 50; // default 50 mins
      confidence = 0.95;
    }

    // 5. SIDEBAR CONTROL
    else if (matches.SIDEBAR) {
      confidence = 0.95;
      if (matches.DEACTIVATE) {
        tool = "CLOSE_SIDEBAR";
      } else {
        tool = "OPEN_SIDEBAR";
      }
    }

    // 6. MEDIA CONTROLS
    else if (matches.MUSIC) {
      confidence = 0.95;
      if (matches.DEACTIVATE) {
        tool = "PAUSE_MUSIC";
      } else if (matches.RESET || text.includes("next") || text.includes("change")) {
        tool = "NEXT_MUSIC";
      } else {
        tool = "PLAY_MUSIC";
      }
    }

    // 7. FLOATING STUDY TOOLS
    else if (matches.CALCULATOR) {
      tool = "TOGGLE_CALCULATOR";
      confidence = 0.99;
    }
    else if (matches.WHITEBOARD) {
      tool = "TOGGLE_WHITEBOARD";
      confidence = 0.99;
    }
    else if (matches.FLASHCARDS) {
      tool = "TOGGLE_FLASHCARDS";
      confidence = 0.99;
    }
    else if (matches.PERIODIC_TABLE) {
      tool = "TOGGLE_PERIODIC_TABLE";
      confidence = 0.99;
    }
    else if (matches.PHYSICS) {
      tool = "TOGGLE_PHYSICS";
      confidence = 0.99;
    }
    else if (matches.PLANNER) {
      tool = "TOGGLE_PLANNER";
      confidence = 0.99;
    }

    // 8. PAGE NAVIGATION (Dashboard, Leaderboard, Analytics, AI Chat)
    else if (matches.DASHBOARD) {
      tool = "GO_TO_DASHBOARD";
      confidence = 0.95;
    }
    else if (matches.LEADERBOARD) {
      tool = "GO_TO_LEADERBOARD";
      confidence = 0.95;
    }
    else if (matches.ANALYTICS) {
      tool = "GO_TO_ANALYTICS";
      confidence = 0.95;
    }
    else if (matches.AI_CENTER) {
      tool = "GO_TO_AI_CENTER";
      confidence = 0.95;
    }

    // 9. SYSTEM SETTINGS (Dark Mode, Fullscreen, Notifications)
    else if (matches.DARK_MODE) {
      tool = "DARK_MODE";
      confidence = 0.95;
      payload.on = !matches.DEACTIVATE && (matches.ACTIVATE || text.includes("dark") || text.includes("on") || !text.includes("light"));
    }
    else if (matches.FULLSCREEN) {
      tool = "FULLSCREEN";
      confidence = 0.95;
      payload.on = !matches.DEACTIVATE;
    }
    else if (matches.NOTIFICATIONS) {
      tool = "NOTIFICATIONS";
      confidence = 0.95;
    }

    // fallback check
    if (tool === "UNKNOWN" && tokens.length > 0) {
      // If we couldn't match a specific tool, look for direct text fits to fallback or return UNKNOWN
      if (text.includes("gaana") || text.includes("sound")) {
        tool = "PLAY_MUSIC";
        confidence = 0.80;
      }
    }

    return {
      tool,
      payload,
      confidence
    };
  } catch (err) {
    console.error("Local intent parser error:", err);
    return {
      tool: "ERROR",
      payload: { error: err.message },
      confidence: 0.0
    };
  }
};
