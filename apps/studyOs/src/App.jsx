import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/MainLayout';
import { Toaster } from 'sonner';

// Lazy load pages for performance
const Dashboard = lazy(() => import('./features/analytics/pages/DashboardPage'));
const Tasks = lazy(() => import('./features/tasks/pages/TasksPage'));
const HabitsPage = lazy(() => import('./features/habits/pages/HabitsPage'));
const Timer = lazy(() => import('./features/timer/pages/TimerPage'));
const FocusMode = lazy(() => import('./features/focus/pages/FocusPage'));
const Notes = lazy(() => import('./features/notes/pages/NotesPage'));
const Leaderboard = lazy(() => import('./features/leaderboard/pages/LeaderboardPage'));
const AuthPage = lazy(() => import('./pages/Auth'));
const ImageCompressor = lazy(() => import('./features/tools/pages/ImageCompressorPage'));
const ToolsLanding = lazy(() => import('./features/tools/pages/ToolsLandingPage'));
const ImageCrop = lazy(() => import('./features/tools/pages/image/CropPage'));
const ImageResize = lazy(() => import('./features/tools/pages/image/ResizePage'));
const PdfMerge = lazy(() => import('./features/tools/pages/pdf/MergePage'));
const ImageConvert = lazy(() => import('./features/tools/pages/image/ConvertPage'));
const ImageEditor = lazy(() => import('./features/tools/pages/image/EditorPage'));
const BackgroundRemover = lazy(() => import('./features/tools/pages/image/BackgroundRemoverPage'));
const PdfSplit = lazy(() => import('./features/tools/pages/pdf/SplitPage'));
const PdfToImage = lazy(() => import('./features/tools/pages/pdf/PdfToImagePage'));
const ImageToPdf = lazy(() => import('./features/tools/pages/image/ImageToPdfPage'));

const PdfCompress = lazy(() => import('./features/tools/pages/pdf/CompressPage'));
const PdfOrganize = lazy(() => import('./features/tools/pages/pdf/OrganizePage'));
const PdfWatermark = lazy(() => import('./features/tools/pages/pdf/WatermarkPage'));
const PdfSign = lazy(() => import('./features/tools/pages/pdf/SignPage'));











import { ProtectedTypingRoute } from './features/typing/components/TypingRouteWrapper';

import { useAuthStore } from './store/authStore';
import { connectAiSocket, disconnectAiSocket } from './features/ai/socket';
import { aiDispatcher } from './features/ai/dispatcher';

function App() {
  const checkAuth = useAuthStore(state => state.checkAuth);

  React.useEffect(() => {
    checkAuth();

    // Initialize AI socket and dispatcher
    const socket = connectAiSocket({ onEvent: (evt) => aiDispatcher.handle(evt) });

    // Smart UX: Auto-detect auth when user returns to the tab
    const handleFocus = () => {
      checkAuth();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkAuth();
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      // cleanup AI socket
      disconnectAiSocket();
    };
  }, [checkAuth]);

  return (
    <Router>
      <Toaster position="top-center" expand={false} richColors />
      <Suspense fallback={<div className="h-screen flex items-center justify-center bg-background text-muted-foreground">Loading Study OS...</div>}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/focus" element={<FocusMode />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="habits" element={<HabitsPage />} />
            <Route path="timer" element={<Timer />} />
            <Route path="notes" element={<Notes />} />
            <Route path="typing" element={<ProtectedTypingRoute type="test" />} />
            <Route path="typing/learn" element={<ProtectedTypingRoute type="learn" />} />
            <Route path="typing/analytics" element={<ProtectedTypingRoute type="analytics" />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="tools" element={<ToolsLanding />} />
            <Route path="tools/image-compressor" element={<ImageCompressor />} />
            <Route path="tools/image-crop" element={<ImageCrop />} />
            <Route path="tools/image-resize" element={<ImageResize />} />
            <Route path="tools/pdf-merge" element={<PdfMerge />} />
            <Route path="tools/image-to-pdf" element={<ImageToPdf />} />
            <Route path="tools/background-remover" element={<BackgroundRemover />} />
            <Route path="tools/pdf-split" element={<PdfSplit />} />
            <Route path="tools/pdf-to-image" element={<PdfToImage />} />

            <Route path="tools/image-convert" element={<ImageConvert />} />
            <Route path="tools/image-editor" element={<ImageEditor />} />
            <Route path="tools/pdf-compress" element={<PdfCompress />} />
            <Route path="tools/pdf-organize" element={<PdfOrganize />} />
            <Route path="tools/pdf-watermark" element={<PdfWatermark />} />
            <Route path="tools/pdf-sign" element={<PdfSign />} />











          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
