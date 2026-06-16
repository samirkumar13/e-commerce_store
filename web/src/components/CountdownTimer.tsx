import React, { useState, useEffect } from 'react';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  days: number;
  expired: boolean;
}

function getTimeLeft(endsAt: string): TimeLeft {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, expired: false };
}

interface CountdownTimerProps {
  endsAt: string;
  size?: 'sm' | 'md';
  onExpire?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ endsAt, size = 'md', onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endsAt));

  useEffect(() => {
    if (timeLeft.expired) { onExpire?.(); return; }
    const id = setInterval(() => {
      const t = getTimeLeft(endsAt);
      setTimeLeft(t);
      if (t.expired) { onExpire?.(); clearInterval(id); }
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt, timeLeft.expired, onExpire]);

  if (timeLeft.expired) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-1 text-xs font-mono font-semibold text-red-600">
        <span className="bg-red-600 text-white rounded px-1 py-0.5">{timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}{pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {timeLeft.days > 0 && (
        <>
          <Segment value={pad(timeLeft.days)} label="Days" />
          <Colon />
        </>
      )}
      <Segment value={pad(timeLeft.hours)} label="Hrs" />
      <Colon />
      <Segment value={pad(timeLeft.minutes)} label="Min" />
      <Colon />
      <Segment value={pad(timeLeft.seconds)} label="Sec" />
    </div>
  );
};

const Segment: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <span className="bg-red-600 text-white text-sm font-bold font-mono rounded px-2 py-1 min-w-[2rem] text-center leading-none tabular-nums">
      {value}
    </span>
    <span className="text-[9px] text-red-500 font-medium mt-0.5 uppercase tracking-wide">{label}</span>
  </div>
);

const Colon: React.FC = () => (
  <span className="text-red-600 font-bold text-sm mb-3 select-none">:</span>
);

export default CountdownTimer;
