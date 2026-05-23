import { useTimerStore } from '../../features/timer/store/timerStore';
import { useTaskStore } from '../../features/tasks/store/taskStore';
import { useNotesStore } from '../../features/notes/store/notesStore';
import { useMusicStore } from '../../features/focus/store/musicStore';
import { useWidgetStore } from '../../store/widgetStore';
import { db } from '../../lib/db';

const navigateTo = (path) => {
  const event = new CustomEvent('ai-navigate', { detail: { path } });
  window.dispatchEvent(event);
};

export const dispatchIntent = async (intent) => {
  console.log(`[DISPATCHER] Executing tool: ${intent.tool} with payload:`, intent.payload);
  
  try {
    switch (intent.tool) {
      // --- TIMERS ---
      case "START_TIMER":
        useTimerStore.getState().handleAIEvent({
          event: "TIMER_STARTED",
          payload: intent.payload
        });
        break;

      case "RESET_POMODORO":
        useTimerStore.getState().handleAIEvent({
          event: "TIMER_RESET",
          payload: intent.payload
        });
        break;

      case "STOP_TIMER":
        useTimerStore.getState().pauseTimer();
        break;

      case "START_STOPWATCH":
        useTimerStore.getState().setMode('stopwatch');
        useTimerStore.getState().startTimer();
        break;

      case "STOP_STOPWATCH":
        useTimerStore.getState().pauseTimer();
        break;

      case "RESET_STOPWATCH":
        useTimerStore.getState().resetTimer();
        break;

      case "ENTER_FOCUS_MODE":
        useTimerStore.getState().handleAIEvent({
          event: "FOCUS_MODE_STARTED",
          payload: intent.payload
        });
        break;

      // --- TASKS & DATABASE ---
      case "CREATE_TASK":
        await useTaskStore.getState().handleAIEvent({
          event: "TASK_CREATED",
          payload: intent.payload
        });
        break;

      case "DELETE_ALL_TASKS":
        await db.tasks.clear();
        useTaskStore.setState({ tasks: [] });
        break;

      // --- NOTES ---
      case "CREATE_NOTE":
        await useNotesStore.getState().handleAIEvent({
          event: "NOTE_CREATED",
          payload: intent.payload
        });
        navigateTo('/notes');
        break;

      case "OPEN_NOTES":
        navigateTo('/notes');
        break;

      // --- MEDIA CONTROLS ---
      case "PLAY_MUSIC": {
        const store = useMusicStore.getState();
        if (!store.isPlaying) {
          if (!store.currentTrack) {
            store.setTrack(store.tracks[0]);
          } else {
            store.togglePlay();
          }
        }
        break;
      }

      case "PAUSE_MUSIC": {
        const store = useMusicStore.getState();
        if (store.isPlaying) {
          store.togglePlay();
        }
        break;
      }

      case "NEXT_MUSIC": {
        const store = useMusicStore.getState();
        const currentIndex = store.tracks.findIndex(t => t.id === store.currentTrack?.id);
        const nextIndex = (currentIndex + 1) % store.tracks.length;
        store.setTrack(store.tracks[nextIndex]);
        break;
      }

      // --- FLOATING macOS STUDY WIDGETS ---
      case "TOGGLE_CALCULATOR":
        useWidgetStore.getState().toggleWidget('calculator');
        break;

      case "TOGGLE_WHITEBOARD":
        useWidgetStore.getState().toggleWidget('whiteboard');
        break;

      case "TOGGLE_FLASHCARDS":
        useWidgetStore.getState().toggleWidget('flashcards');
        break;

      case "TOGGLE_PERIODIC_TABLE":
        useWidgetStore.getState().toggleWidget('periodicTable');
        break;

      case "TOGGLE_PHYSICS":
        useWidgetStore.getState().toggleWidget('physics');
        break;

      case "TOGGLE_PLANNER":
        useWidgetStore.getState().toggleWidget('planner');
        break;

      // --- ROUTING / NAVIGATION ---
      case "GO_TO_DASHBOARD":
        navigateTo('/');
        break;

      case "GO_TO_LEADERBOARD":
        navigateTo('/leaderboard');
        break;

      case "GO_TO_ANALYTICS":
        navigateTo('/tools');
        break;

      case "GO_TO_AI_CENTER":
        // AICenter is mounted globally, so we trigger its open state
        window.dispatchEvent(new CustomEvent('ai-center-open'));
        break;

      // --- SYSTEM CONTROLS ---
      case "DARK_MODE": {
        const val = intent.payload.on;
        document.documentElement.classList.toggle('dark', val);
        break;
      }

      case "FULLSCREEN": {
        if (intent.payload.on) {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.error("Fullscreen err:", err));
          }
        } else {
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.error("Exit Fullscreen err:", err));
          }
        }
        break;
      }

      case "NOTIFICATIONS": {
        if (Notification.permission !== 'granted') {
          const status = await Notification.requestPermission();
          if (status === 'granted') {
            new Notification("Study OS", { body: "🎙️ Voice AI alerts are now active!" });
          }
        } else {
          new Notification("Study OS", { body: "🎙️ Voice AI alerts are already active!" });
        }
        break;
      }

      default:
        console.warn(`[DISPATCHER] Unknown tool intent: ${intent.tool}`);
        break;
    }

    // Create a custom event that UI components can listen to for success feedback toast
    const event = new CustomEvent('ai-action', { detail: intent });
    window.dispatchEvent(event);
    
    return true;
  } catch (err) {
    console.error("[DISPATCHER] Failed to execute action", err);
    throw err;
  }
};
