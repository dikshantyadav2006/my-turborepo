# ⚡ Study OS | SHAI Library Ecosystem

Study OS is a premium, high-performance productivity workspace designed for modern scholars. It integrates advanced task management, focus tools, and analytics into a seamless, macOS-inspired interface with a "Local-First, Cloud-Synced" approach.

## 🚀 Vision
To provide a distraction-free environment where students can manage their entire academic lifecycle with real-time gamified progression, offline-first capability, and seamless cloud synchronization.

---

## 📋 How the App Works: Complete User Journey

### **1. Authentication & Entry Flow**
When you first visit Study OS (`study.sailibrary.online`):

1. **Session Detection**: The app checks if you have an active session via `checkAuth()` in `App.jsx`
2. **Shared Auth Cookie**: If you've logged in on `www.sailibrary.online`, an `httpOnly` cookie exists on the `.sailibrary.online` domain
3. **Profile Sync**: Your user profile is automatically fetched from `api.sailibrary.online`
4. **Store Initialization**: Zustand stores load persisted data from IndexedDB
5. **Offline Ready**: If offline, cached data is served immediately from local storage

**What you see**: Dashboard with your tasks, XP progress, and focus stats

### **2. Task Management Workflow**
Study OS uses a **Virtual List** architecture for blazing-fast task rendering:

**Creating a Task:**
1. Click "New Task" → Opens modal with title, description, subject, deadline, priority
2. Task is created locally in Zustand store AND IndexedDB
3. Changes are debounced (500ms) before syncing to backend
4. Optimistic UI updates immediately while sync happens in background

**Task States:**
- **Pending**: Not started
- **In Progress**: Active work session
- **Completed**: Task finished (earns XP)
- **Archived**: Old tasks moved away

**Task Sync to Backend:**
- Every 30 seconds, pending changes are batched
- If backend sync fails, local data is retained (offline-safe)
- When online again, changes auto-sync silently

**Virtual List Performance:**
- Only visible tasks are rendered in the DOM
- Scrolling through 1000+ tasks remains smooth at 60 FPS
- Powered by `@tanstack/react-virtual`

### **3. Focus Mode & Timer System**
Study OS offers two timer experiences:

**Pomodoro Timer:**
1. Start a 25-minute focus session
2. All notifications are muted
3. During break, stretch/hydrate notifications appear
4. Upon completion: XP awarded + analytics updated

**Custom Study Timer:**
1. Set any duration (e.g., 1 hour, 2.5 hours)
2. Music/ambient sounds play automatically (if enabled)
3. Real-time elapsed time displayed
4. Timer data syncs to analytics immediately

**How XP is Earned:**
- Each minute of focused study = configurable XP points
- Longer streaks unlock multipliers (2x after 5 consecutive days)
- XP data is stored locally and synced to leaderboard

### **4. Analytics & Heatmap System**
Study OS tracks your academic performance in real-time:

**What Gets Tracked:**
- Total study hours
- Tasks completed
- XP earned per day
- Subject-wise breakdown
- Focus session duration
- Most productive hours

**Heatmap Visualization:**
- GitHub-style calendar showing daily activity
- Green intensity = productivity level
- Clicking a day shows detailed breakdown
- Data is computed from local IndexedDB and synced with backend

**Stats Dashboard:**
- Week/Month/Year view
- Productivity trends
- Subject performance comparison
- Personal goals vs. achievements

### **5. Notes Feature**
Markdown-based note-taking integrated with tasks:

**Note Creation:**
1. Click task → "Add Notes" button
2. Rich markdown editor opens
3. Types supported: Headers, lists, code blocks, tables
4. Real-time preview on right side

**Auto-Save:**
- Every keystroke is debounced (1 second)
- Drafts saved to IndexedDB immediately
- Backend sync happens periodically

**Linking:**
- Notes auto-link to tasks by relationship
- Search across all notes in real-time
- Tag-based organization

### **6. Leaderboard System**
Global rankings with real-time XP sync:

**How Rankings Work:**
1. Your XP is calculated from all completed tasks
2. Every sync event updates your leaderboard position
3. Rankings are fetched from backend API (cached for 5 minutes)
4. You see where you rank among global users

**Leaderboard Features:**
- Top 100 Global Leaderboard
- Subject-specific rankings
- Friend Rankings (if following enabled)
- Weekly reset option

### **7. Local-First Sync Architecture**
Study OS prioritizes offline-first experience:

**Data Flow:**
```
User Action → Local Zustand Store → IndexedDB (Dexie) → UI Updates
                                 ↓ (Debounced after 30s)
                         Backend API Sync
```

**Conflict Resolution:**
- Local timestamp always takes precedence
- If backend has newer data, UI merges changes
- Manual conflict resolution available in settings

**Sync Status Indicator:**
- Green dot = fully synced
- Yellow dot = pending sync
- Red dot = sync error (will retry)

---

## 🛠️ Technology Stack
- **Frontend**: React 19 + Vite (fast module bundling)
- **Styling**: Tailwind CSS v4 (utility-first, tree-shaken)
- **State Management**: Zustand (lightweight atomic stores with persist middleware)
- **Local Database**: Dexie.js (IndexedDB wrapper for offline-first capability)
- **Animations**: Framer Motion (smooth transitions & micro-interactions)
- **Icons**: Lucide React (SVG icons)
- **API Client**: Axios (with shared subdomain auth interceptors)
- **Virtualization**: @tanstack/react-virtual (60FPS scrolling)

---

## 📂 Architecture (Feature-Based)
The project follows an industry-standard, feature-based modular architecture to ensure scalability and maintainability.

```text
src/
├── features/                 # Independent feature modules
│   ├── analytics/            # XP Tracking, Heatmaps, Stats Dashboard
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/           # Analytics-specific Zustand store
│   │   └── utils/
│   ├── focus/               # Focus Mode, Music Player, AI Ambient Sounds
│   │   ├── components/
│   │   ├── services/        # Timer logic, audio player
│   │   └── store/
│   ├── leaderboard/         # Global Rankings (Backend Integrated)
│   │   ├── components/
│   │   ├── hooks/
│   │   └── api/
│   ├── notes/               # Markdown-based Note taking
│   │   ├── components/
│   │   ├── editor/
│   │   └── store/
│   ├── tasks/               # Task Management (Virtual List)
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/           # Task CRUD, filtering, sorting
│   │   └── db/              # Dexie table definitions
│   └── timer/               # Pomodoro & Custom Study Timers
│       ├── components/
│       ├── hooks/
│       └── store/
├── store/                   # Global Zustand Stores
│   ├── authStore.js         # User session & profile
│   ├── uiStore.js           # UI state (modals, sidebars)
│   └── syncStore.js         # Sync status & conflicts
├── components/              # Reusable Shared UI Components
│   ├── Button/
│   ├── Modal/
│   ├── Card/
│   └── Sidebar/
├── layouts/                 # Page Wrappers & Navigation
│   ├── MainLayout.jsx
│   └── AuthLayout.jsx
├── lib/                     # Third-party configurations
│   ├── dexie.js            # Local database setup
│   ├── axios.js            # API client with interceptors
│   └── constants.js
├── hooks/                   # Custom React Hooks
│   ├── useAuth.js
│   ├── useTasks.js
│   └── useSync.js
└── styles/                  # Global CSS & Tailwind
    ├── globals.css
    └── tailwind.config.js
```

---

## 🔐 Shared Authentication System
Study OS uses a **Multi-Subdomain Shared Auth** system with automatic session detection:

**Subdomain Architecture:**
- **Main Website**: `www.sailibrary.online` (login page)
- **Study Platform**: `study.sailibrary.online` (this app)
- **Backend API**: `api.sailibrary.online` (REST endpoints)

**Authentication Flow:**
1. User logs in on main website
2. Backend sets `httpOnly` cookie on `.sailibrary.online` domain (parent domain)
3. When visiting Study OS, `checkAuth()` runs automatically
4. Cookie is sent with every API request (browser automatically includes it)
5. User profile is fetched and stored in Zustand + IndexedDB
6. If offline, cached profile is used immediately

**Security Features:**
- `httpOnly` cookies prevent JavaScript theft
- `sameSite=Strict` prevents CSRF attacks
- CORS configured for trusted subdomains only
- Auth interceptor refreshes token automatically

---

## 💾 Data Persistence Strategy

### **IndexedDB Structure (Dexie.js):**
```javascript
db.tasks.put({ id, title, description, status, xp, createdAt, syncStatus })
db.notes.put({ id, content, taskId, lastModified, syncStatus })
db.analytics.put({ date, xpEarned, hoursStudied, tasksCompleted })
db.syncQueue.put({ id, action, payload, timestamp }) // Offline changes
```

### **Sync Workflow:**
1. **Optimistic Updates**: Local change → UI updates immediately
2. **Debounced Batch**: Collect changes for 30 seconds
3. **Background Sync**: POST to backend with timestamps
4. **Conflict Resolution**: If backend is newer, merge changes
5. **Cleanup**: Remove from sync queue on success

---

## 🤝 Development Guidelines

### **1. Feature Isolation**
Never write feature-specific logic in global components. If building a new feature:
- Create `src/features/featureName/`
- Keep logic, components, and stores isolated
- Export only public APIs from `index.js`

### **2. State Management Rules**
- **Local State** (`useState`): UI toggles, form inputs
- **Zustand Store**: Data that persists, shared across components, or synced to backend
- **Persist Middleware**: Use for tasks, timer settings, user preferences
- **Example**: 
  ```javascript
  const useTaskStore = create(
    persist(
      (set) => ({
        tasks: [],
        addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] }))
      }),
      { name: 'task-store', storage: localStorage }
    )
  )
  ```

### **3. API Integration**
- Use `axios` instance from `lib/axios.js` (auth interceptors included)
- Debounce requests: `import { debounce } from 'lodash-es'`
- Always handle offline: wrap in try-catch with fallback to local data
- Example:
  ```javascript
  const syncTasks = debounce(async (tasks) => {
    try {
      await api.post('/tasks/sync', tasks)
    } catch (err) {
      console.warn('Sync failed, will retry later')
    }
  }, 500)
  ```

### **4. Performance Best Practices**
- Use `React.lazy()` for route components
- Virtualize lists > 100 items
- Memoize callbacks with `useCallback`
- Avoid inline object creation in renders
- Profile with Chrome DevTools

### **5. Styling Standards**
- Use **Tailwind v4** utility classes
- Color palette: Zinc (neutrals), Emerald (accents)
- Glassmorphism for overlays: `backdrop-blur-md bg-white/20`
- Responsive design: mobile-first approach
- Example: `<div className="rounded-lg bg-zinc-900/50 backdrop-blur-md p-4 text-white">`

### **6. Git Workflow**
- **main**: Production-ready, tested code
- **dev**: Staging/integration branch
- **feature/xyz**: Individual feature branches
- Commit message: `feat: add task priority filter` + Co-authored-by trailer

---

## ⚙️ Development Setup

### **Prerequisites:**
- Node.js 18+ (LTS recommended)
- npm or yarn
- Git

### **Installation:**

1. **Clone Repository**:
   ```bash
   git clone <repo-url>
   cd LIBRARY__STUDY
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create `.env.local` file in root:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_APP_NAME=Study OS
   VITE_ENV=development
   ```

4. **Initialize Dexie (One-time)**:
   Dexie auto-initializes on first app launch. No manual setup needed.

5. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   App opens at `http://localhost:5173`

### **Building for Production:**
```bash
npm run build
npm run preview  # Test production build locally
```

---

## 📈 Performance Features & Optimizations

### **1. Code Splitting**
- Routes lazy-loaded with `React.lazy()` + Suspense
- Each feature bundle ~50-100KB (gzipped)
- Initial bundle: ~250KB (gzipped)
- Load time: < 1.5s on 4G

### **2. List Virtualization**
- Tasks list uses `@tanstack/react-virtual`
- Only visible rows rendered (5-10 at a time)
- 1000+ tasks scroll at 60 FPS
- Memory footprint: constant regardless of list size

### **3. Debounced Syncing**
- Task updates batched for 500ms before sync
- Prevents individual network requests
- Reduces backend load by 90%
- User sees changes immediately (optimistic)

### **4. Image & Asset Optimization**
- SVG icons only (Lucide React)
- No large images in app core
- Tailwind CSS tree-shaken (only used utilities)

### **5. Service Worker Ready**
- App can run offline (with local data)
- Future: Service Worker for background sync
- Progressive Web App (PWA) capable

---

## 🔄 Real-Time Data Flow Example

### **Completing a Task:**
```
User clicks "Mark Complete"
    ↓
Zustand store updates: task.status = 'completed'
    ↓
IndexedDB writes immediately (optimistic)
    ↓
UI re-renders with new state (instant feedback)
    ↓
Task turns green ✓
    ↓
[500ms delay - debounce]
    ↓
POST /api/tasks/{id}/complete sent
    ↓
Backend records completion, calculates XP
    ↓
Response includes updated XP + leaderboard position
    ↓
Zustand updates with new XP
    ↓
Analytics updated
    ↓
Leaderboard syncs (if app in focus)
    ↓
User sees XP counter increase on dashboard
```

**Key Point**: User sees completion instantly. Sync happens in background.

---

## 🐛 Debugging Tips

### **Check Local Storage:**
```javascript
// In browser console:
localStorage.getItem('task-store') // View persisted tasks
localStorage.getItem('analytics-store')
```

### **Monitor Network:**
1. Open DevTools → Network tab
2. Look for `/api/tasks/sync` requests
3. Check `Sync Status Indicator` in UI (top-right)

### **View IndexedDB:**
1. DevTools → Application → IndexedDB
2. Expand `study-os` database
3. Browse `tasks`, `notes`, `analytics` tables

### **Enable Debug Logs:**
```javascript
// In stores, add:
console.log('[Sync]', 'Syncing tasks...', tasks)
```

---

## 📚 Feature Documentation

- **Tasks**: See `src/features/tasks/README.md`
- **Analytics**: See `src/features/analytics/README.md`
- **Focus Mode**: See `src/features/focus/README.md`
- **Leaderboard**: See `src/features/leaderboard/README.md`

---

## 🎙️ Offline Voice AI & Draggable macOS Widgets

Study OS features a cutting-edge **100% offline local Voice AI Layer** and a glassmorphic **Draggable Widget system** designed to mimic high-end macOS desktop workspaces:

### **1. Push-to-Talk (PTT) UX**
- **Trigger**: Click and hold the microphone icon in the AI Command Center.
- **Audio Capture**: Captures stream chunks via the standard browser `MediaRecorder` API and converts them into a compact binary WAV blob on pointer release.
- **Vibrant Waveforms**: Renders dynamic, real-time audio frequencies onto a canvas element using HTML5's `AnalyserNode` thread without sound latency loops.
- **Service Request**: Automatically POSTs the compiled blob to `http://localhost:8001/transcribe` for CPU-quantized Faster-Whisper transcription.

### **2. Local Intent classification & Dispatcher**
- **Hinglish Token Matcher**: Employs fuzzy-matching matrix formulas and synonym registries inside [parser.js](file:///d:/2026/DEVELOPER%20MERN/1/SHAI%20LIBRARY/apps/study-web/src/services/ai/parser.js) to tolerate common typos and phonetics (e.g., `"whiteboard kholo"`, `"pomodoro chalu kro"`, `"start stopwatch"`).
- **Zustand Dispatcher mapping**: Directly binds canonical intents into mutations of global state stores (timer, stopwatch, tasks db, focus music play/pause, dark mode toggle, and notification banners).

### **3. Draggable Glassmorphic Widgets Manager**
- Connected via a unified `widgetStore.js` Zustand controller, the platform renders 6 productivity tools globally:
  1. *HTML5 whiteboard*: Premium color draw pad with customizable pixel sizes.
  2. *Interactive Periodic table*: High-yield element grid (Atomic 1 to 20) with atomic mass card details on click.
  3. *3D science flashcards*: Flipping card animations with new cards insertion forms.
  4. *Math calculator*: Clean keypad math solver.
  5. *Formula solver*: Multi-variable force and kinetic energy solver coupled with a chemistry molecular weight parser (like `H2O`, `CO2`).
  6. *Goal planner*: Custom checklists linked to dynamic circular SVG percentage markers.

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Follow the Feature Isolation rules above
3. Test locally: `npm run dev`
4. Commit with clear messages: `git commit -m "feat: add my feature"`
5. Push and create a Pull Request

---

Built with ❤️ by the **DK AND TEAM**.

