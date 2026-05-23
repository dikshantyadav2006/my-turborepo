// Validates the parsed intent

const VALID_TOOLS = [
  "START_TIMER",
  "RESET_POMODORO",
  "STOP_TIMER",
  "START_STOPWATCH",
  "STOP_STOPWATCH",
  "RESET_STOPWATCH",
  "CREATE_TASK",
  "CREATE_NOTE",
  "OPEN_NOTES",
  "ENTER_FOCUS_MODE",
  "DELETE_ALL_TASKS",
  "DELETE_NOTE",
  
  // Media Controls
  "PLAY_MUSIC",
  "PAUSE_MUSIC",
  "NEXT_MUSIC",

  // Floating Widgets
  "TOGGLE_CALCULATOR",
  "TOGGLE_WHITEBOARD",
  "TOGGLE_FLASHCARDS",
  "TOGGLE_PERIODIC_TABLE",
  "TOGGLE_PHYSICS",
  "TOGGLE_PLANNER",

  // Navigation
  "GO_TO_DASHBOARD",
  "GO_TO_LEADERBOARD",
  "GO_TO_ANALYTICS",
  "GO_TO_AI_CENTER",

  // System Controls
  "DARK_MODE",
  "FULLSCREEN",
  "NOTIFICATIONS",
  "OPEN_SIDEBAR",
  "CLOSE_SIDEBAR",

  "UNKNOWN"
];

const DESTRUCTIVE_TOOLS = [
  "DELETE_ALL_TASKS",
  "DELETE_NOTE"
];

export const validateIntent = (intent) => {
  if (!VALID_TOOLS.includes(intent.tool)) {
    return { valid: false, error: `Invalid tool: ${intent.tool}`, requiresApproval: false };
  }

  // Allow fallbacks or default triggers with slightly lower thresholds
  if (intent.confidence < 0.6) {
    return { valid: false, error: "Confidence too low, please clarify.", requiresApproval: false };
  }

  const requiresApproval = DESTRUCTIVE_TOOLS.includes(intent.tool);

  return { valid: true, intent, requiresApproval };
};
