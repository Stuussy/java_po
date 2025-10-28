import React, { useState, useEffect } from 'react';

const Timer = ({ durationMinutes, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

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
