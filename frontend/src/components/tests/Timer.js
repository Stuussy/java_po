import React, { useState, useEffect, useCallback } from 'react';

const Timer = ({ durationMinutes, startedAt, onTimeUp }) => {
  const calculateTimeLeft = useCallback(() => {
    if (startedAt) {
      const startTime = new Date(startedAt).getTime();
      const endTime = startTime + durationMinutes * 60 * 1000;
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      return remaining;
    }
    return durationMinutes * 60;
  }, [durationMinutes, startedAt]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft <= 0, calculateTimeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isWarning = timeLeft < 60;

  return (
    <div className="timer" style={{ color: isWarning ? '#e74c3c' : '#2c3e50' }}>
      {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
};

export default Timer;
