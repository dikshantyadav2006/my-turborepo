import { useEffect } from 'react';

/**
 * useAutoScroll
 * Automatically scrolls the container to keep the active line centered.
 */
export const useAutoScroll = (containerRef, currentIndex) => {
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const activeChar = container.querySelector('.is-current');
    
    if (activeChar) {
      const containerHeight = container.clientHeight;
      const charTop = activeChar.offsetTop;
      const charHeight = activeChar.clientHeight;
      
      // Calculate ideal scroll position to keep active char in the middle
      const targetScroll = charTop - (containerHeight / 2) + (charHeight / 2);
      
      // We only scroll if we are not already close to the target
      if (Math.abs(container.scrollTop - targetScroll) > 40) {
        container.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }
    }
  }, [currentIndex, containerRef]);
};
