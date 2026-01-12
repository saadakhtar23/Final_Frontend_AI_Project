// ============================================
// FILE: src/components/Timer.jsx
// Countdown timer component
// ============================================

import React, { useState, useEffect } from 'react';

const Timer = ({ timeLimit, timeLeft: controlledTimeLeft, onTimeUp }) => {
  const [internalLeft, setInternalLeft] = useState(timeLimit || 0);
  const isControlled = typeof controlledTimeLeft === 'number';

  // keep internalLeft synced when uncontrolled mode (timeLimit changes)
  useEffect(() => {
    if (!isControlled && typeof timeLimit === 'number') setInternalLeft(timeLimit);
  }, [timeLimit, isControlled]);

  // In uncontrolled mode, Timer manages its own countdown
  useEffect(() => {
    if (isControlled) return;
    if (internalLeft <= 0) {
      onTimeUp && onTimeUp();
      return;
    }

    const timer = setInterval(() => setInternalLeft((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [internalLeft, isControlled, onTimeUp]);

  const timeLeft = isControlled ? controlledTimeLeft : internalLeft;

  useEffect(() => {
    if (isControlled && typeof timeLeft === 'number' && timeLeft <= 0) {
      onTimeUp && onTimeUp();
    }
  }, [isControlled, timeLeft, onTimeUp]);

  const minutes = Math.floor((timeLeft || 0) / 60);
  const seconds = (timeLeft || 0) % 60;

  const isLowTime = (timeLeft || 0) <= 30;

  return (
    <div
      className={`px-4 py-2 rounded-lg font-mono text-lg font-bold ${
        isLowTime
          ? 'bg-red-100 text-red-700 animate-pulse'
          : 'bg-blue-100 text-blue-700'
      }`}
    >
      {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
};

export default Timer;
