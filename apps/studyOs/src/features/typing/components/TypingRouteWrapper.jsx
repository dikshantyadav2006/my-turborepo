import React, { Suspense, lazy } from 'react';
import { useIsMobile } from '../../../hooks/useIsMobile';
import MobileTypingFallback from './MobileTypingFallback';

// Lazy load the actual typing pages so they are never downloaded on mobile
const TypingTestPage = lazy(() => import('../pages/TypingTestPage'));
const TypingLearnPage = lazy(() => import('../pages/TypingLearnPage'));
const TypingAnalyticsPage = lazy(() => import('../pages/TypingAnalyticsPage'));

export const ProtectedTypingRoute = ({ type }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileTypingFallback />;
  }

  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center text-muted-foreground">Loading Typing Engine...</div>}>
      {type === 'test' && <TypingTestPage />}
      {type === 'learn' && <TypingLearnPage />}
      {type === 'analytics' && <TypingAnalyticsPage />}
    </Suspense>
  );
};
