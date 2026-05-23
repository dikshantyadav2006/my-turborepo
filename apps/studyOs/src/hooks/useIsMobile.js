import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Check screen width (Tailwind lg breakpoint is 1024px)
      const isNarrow = window.innerWidth < 1024;
      
      // Basic touch detection
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setIsMobile(isNarrow || (isTouch && window.innerWidth < 1280));
    };

    checkIsMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}
