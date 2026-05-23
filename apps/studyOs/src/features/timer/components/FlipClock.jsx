import React, { memo, useState, useEffect } from 'react';
import './FlipClock.css';

const FlipUnit = memo(({ value }) => {
  const [frontVal, setFrontVal] = useState(value);
  const [backVal, setBackVal] = useState(value);
  const [isGo, setIsGo] = useState(false);

  useEffect(() => {
    if (value !== frontVal) {
      setBackVal(value);
      setIsGo(true);
      
      const timer = setTimeout(() => {
        setIsGo(false);
        setFrontVal(value);
      }, 600); // 600ms matching CSS animation
      
      return () => clearTimeout(timer);
    }
  }, [value, frontVal]);

  return (
    <div className={`flip-clock down ${isGo ? 'go' : ''}`}>
      <div className="digital front" data-number={frontVal}></div>
      <div className="digital back" data-number={backVal}></div>
    </div>
  );
});

FlipUnit.displayName = 'FlipUnit';

export const FlipClock = memo(({ seconds }) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const showHours = h > 0;

  const pad = (num) => num.toString().padStart(2, '0');

  return (
    <div className="flip-clock-container">
      {showHours && (
        <>
          <FlipUnit value={pad(h)} />
          <div className="flip-separator">:</div>
        </>
      )}
      <FlipUnit value={pad(m)} />
      <div className="flip-separator">:</div>
      <FlipUnit value={pad(s)} />
    </div>
  );
});

FlipClock.displayName = 'FlipClock';

