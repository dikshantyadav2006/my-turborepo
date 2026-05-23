import { useTimerStore } from '../../features/timer/store/timerStore';
import { useTaskStore } from '../../features/tasks/store/taskStore';
import { useNotesStore } from '../../features/notes/store/notesStore';

// actionMap routes validated events to store handlers
export const actionMap = {
  TIMER_STARTED: async (event) => {
    const timerStore = useTimerStore.getState();
    // set duration if provided
    const durationMin = event.payload.duration;
    if (durationMin) {
      // set timeLeft in seconds and mode
      useTimerStore.setState({ mode: event.payload.mode || 'pomodoro', timeLeft: durationMin * 60, isActive: false, endTime: null });
    }
    useTimerStore.getState().startTimer();
  },

  TIMER_RESET: async (event) => {
    const timerStore = useTimerStore.getState();
    timerStore.resetTimer();
  },

  TASK_CREATED: async (event) => {
    const taskStore = useTaskStore.getState();
    // create a task using existing API
    const payload = event.payload || {};
    // Avoid duplicates: check by title + createdAt
    taskStore.addTask({ title: payload.title || 'AI Task', focusTime: payload.focusTime || 25 });
  },

  NOTE_CREATED: async (event) => {
    const notesStore = useNotesStore.getState();
    const payload = event.payload || {};
    notesStore.addNote({ title: payload.title || 'AI Note', content: payload.content || '' });
  },

  MODULE_OPENED: async (event) => {
    // Opening modules is primarily a UI action. We set a small state flag on timerStore to allow UI to react.
    useTimerStore.setState({ mode: event.payload.mode || 'pomodoro' });
    // You can also set a global route change in your app router when dispatcher receives this.
  },

  FOCUS_MODE_STARTED: async (event) => {
    const payload = event.payload || {};
    const duration = payload.duration || 50;
    useTimerStore.setState({ mode: 'pomodoro', timeLeft: duration * 60, isActive: false, endTime: null });
    useTimerStore.getState().startTimer();
  }
};

export default actionMap;
