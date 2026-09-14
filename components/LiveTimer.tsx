'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Hourglass } from 'lucide-react';

interface LiveTimerProps {
  initialMinutes?: number;
  onTimeUpdate?: (secondsElapsed: number) => void;
}

export const LiveTimer: React.FC<LiveTimerProps> = ({
  initialMinutes = 10,
  onTimeUpdate,
}) => {
  const totalSeconds = initialMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => {
        const next = prev + 1;
        if (onTimeUpdate) onTimeUpdate(next);
        return next;
      });

      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeUpdate]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = secondsRemaining <= 180 && secondsRemaining > 60;
  const isCriticalTime = secondsRemaining <= 60;
  const progressPercent = Math.max(0, Math.min(100, (secondsRemaining / totalSeconds) * 100));

  return (
    <div className="bg-gradient-to-r from-slate-900 via-cu-navy to-slate-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg border-2 border-cu-gold/40 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cu-gold/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* LEFT: Animated Clock Graphic & Status */}
      <div className="flex items-center space-x-3.5">
        <div className="relative w-12 h-12 rounded-full bg-white/10 border-2 border-cu-gold flex items-center justify-center shadow-inner shrink-0">
          {/* Animated SVG Clock with Rotating Hand */}
          <svg className="w-8 h-8 text-cu-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" className="stroke-cu-gold/40" />
            <path d="M12 7v5l3 3" className="origin-center animate-[spin_4s_linear_infinite]" strokeLinecap="round" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </svg>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-ping"></span>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-cu-gold">
              Live Assessment Timer
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.2 rounded-full border border-emerald-500/30">
              Active Session
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Time elapsed is recorded automatically upon form submission.
          </p>
        </div>
      </div>

      {/* RIGHT: Countdown Clock Counter & Elapsed Display */}
      <div className="flex items-center space-x-4 bg-white/10 p-2.5 px-4 rounded-xl border border-white/15 backdrop-blur-md">
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
            Time Remaining
          </span>
          <div className="flex items-baseline space-x-1">
            <span className={`text-2xl sm:text-3xl font-mono font-black tracking-tight ${
              isCriticalTime
                ? 'text-red-400 animate-pulse'
                : isLowTime
                ? 'text-amber-400'
                : 'text-white'
            }`}>
              {formatTime(secondsRemaining)}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">min</span>
          </div>
        </div>

        <div className="h-8 w-px bg-white/20"></div>

        <div className="text-left">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
            Elapsed Time
          </span>
          <span className="text-sm font-bold text-cu-gold font-mono block">
            {formatTime(secondsElapsed)}
          </span>
        </div>
      </div>
    </div>
  );
};
