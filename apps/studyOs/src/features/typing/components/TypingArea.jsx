import React, { memo, useRef, useEffect, useMemo } from 'react';
import TypingCaret from './TypingCaret';
import { cn } from '../../../lib/utils';
import { useAutoScroll } from '../hooks/useAutoScroll';

const Character = memo(({ char, status, isCurrent }) => {
  return (
    <span 
      className={cn(
        "relative inline-block transition-colors duration-100",
        status === "correct" && "text-emerald-500",
        status === "incorrect" && "text-red-500 bg-red-500/10",
        status === "default" && "text-zinc-500",
        isCurrent && "text-foreground"
      )}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  );
});

const Word = memo(({ word, startIndex, userInput, currentIndex }) => {
  const chars = word.split('');
  
  return (
    <div className="inline-block mx-1">
      {chars.map((char, i) => {
        const index = startIndex + i;
        let status = "default";
        if (index < currentIndex) {
          status = userInput[index] === char ? "correct" : "incorrect";
        }
        
        return (
          <Character 
            key={i}
            char={char}
            status={status}
            isCurrent={index === currentIndex}
          />
        );
      })}
    </div>
  );
});

const TypingArea = ({ text, userInput, currentIndex, isActive }) => {
  const containerRef = useRef(null);
  const caretRef = useRef(null);

  // Auto-scroll logic
  useAutoScroll(containerRef, currentIndex);

  // Split text into words once
  const words = useMemo(() => {
    const result = [];
    let currentPos = 0;
    const splitText = text.split(' ');
    
    for (let i = 0; i < splitText.length; i++) {
      const word = splitText[i] + (i === splitText.length - 1 ? '' : ' ');
      result.push({
        text: word,
        startIndex: currentPos
      });
      currentPos += word.length;
    }
    return result;
  }, [text]);

  // Handle auto-focus and caret positioning
  useEffect(() => {
    if (isActive && containerRef.current) {
      containerRef.current.focus();
    }
  }, [isActive]);

  // Position caret based on DOM measurement (more reliable than layoutId for speed)
  useEffect(() => {
    const activeChar = containerRef.current?.querySelector('.is-current');
    if (activeChar && caretRef.current) {
      const { offsetLeft, offsetTop } = activeChar;
      caretRef.current.style.transform = `translate3d(${offsetLeft}px, ${offsetTop}px, 0)`;
    }
  }, [currentIndex]);

  return (
    <div 
      ref={containerRef}
      className="relative text-3xl font-mono leading-relaxed tracking-wider select-none outline-none break-words min-h-[200px]"
      tabIndex={0}
      onBlur={(e) => isActive && e.target.focus()} // Force focus
    >
      {/* The Caret */}
      <div 
        ref={caretRef}
        className="absolute transition-transform duration-75 ease-out z-20 pointer-events-none"
        style={{ willChange: 'transform' }}
      >
        <TypingCaret />
      </div>

      {/* The Words */}
      <div className="flex flex-wrap -mx-1 opacity-100">
        {words.map((word, i) => {
          // Only re-render the word if the current index is within its range
          // or was just within its range. This is a manual optimization.
          const isWordActive = currentIndex >= word.startIndex && currentIndex < word.startIndex + word.text.length;
          const wasWordActive = currentIndex === word.startIndex + word.text.length; // Handle spaces
          
          return (
            <div 
              key={i} 
              className={cn(
                "inline-block mx-[2px]",
                isWordActive && "active-word"
              )}
            >
              {word.text.split('').map((char, charIdx) => {
                const index = word.startIndex + charIdx;
                const isCurrent = index === currentIndex;
                
                let status = "default";
                if (index < currentIndex) {
                  status = userInput[index] === char ? "correct" : "incorrect";
                }

                return (
                  <span 
                    key={charIdx}
                    className={cn(
                      "relative inline-block transition-colors duration-100",
                      isCurrent && "text-foreground is-current",
                      status === "correct" && "text-zinc-200", // Done chars
                      status === "incorrect" && "text-red-500 border-b-2 border-red-500",
                      status === "default" && "text-zinc-600"
                    )}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(TypingArea);
