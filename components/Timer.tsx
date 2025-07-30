import { useEffect, useState } from 'react';

interface TimerProps {
  initialTime: number;
  onTimeUp: () => void;
  isActive: boolean;
}

export function Timer({ initialTime, onTimeUp, isActive }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (!isActive) return;

    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isActive, onTimeUp]);

  const getTimerColor = () => {
    if (timeLeft <= 5) return 'text-red-500';
    if (timeLeft <= 10) return 'text-orange-500';
    return 'text-green-500';
  };

  return (
    <div className="absolute top-4 right-4 bg-white rounded-full px-6 py-3 shadow-lg border-2 border-gray-200">
      <div className="flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
        <span className={`text-xl font-bold ${getTimerColor()}`}>
          {timeLeft}
        </span>
      </div>
    </div>
  );
}