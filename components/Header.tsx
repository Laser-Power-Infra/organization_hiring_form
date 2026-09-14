'use client';

import React, { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';

interface HeaderProps {
  initialMinutes?: number;
  onTimeUpdate?: (secondsElapsed: number) => void;
  onTimeExpire?: () => void;
  showTimer?: boolean;
  hasStarted?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  initialMinutes = 10,
  onTimeUpdate,
  onTimeExpire,
  showTimer = true,
  hasStarted = false,
}) => {
  const companyLogos = [
    { src: '/company-icons/ceebuild-logo.png', alt: 'Ceebuild Company (P) Ltd.' },
    { src: '/company-icons/lpi-logo.png', alt: 'Laser Power & Infra' },
    { src: '/company-icons/header-final-logo.png', alt: 'Dalui Group' },
    { src: '/company-icons/Logo-removebg-preview.png', alt: 'UIC Udyog Limited' },
  ];

  const totalSeconds = initialMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    if (!showTimer || !hasStarted) {
      setSecondsRemaining(totalSeconds);
      setSecondsElapsed(0);
      return;
    }

    // Retrieve or initialize start timestamp in localStorage
    let startTime = localStorage.getItem('cu_assessment_start_timestamp');
    if (!startTime) {
      startTime = Date.now().toString();
      localStorage.setItem('cu_assessment_start_timestamp', startTime);
    }

    const startTimestamp = parseInt(startTime, 10);

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.max(0, Math.floor((now - startTimestamp) / 1000));
      const remaining = Math.max(0, totalSeconds - elapsed);

      setSecondsElapsed(elapsed);
      if (onTimeUpdate) onTimeUpdate(elapsed);

      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        if (!hasExpired) {
          setHasExpired(true);
          if (onTimeExpire) {
            onTimeExpire();
          }
        }
      }
    };

    // Immediate initial update
    updateTimer();

    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [showTimer, hasStarted, hasExpired, totalSeconds, onTimeUpdate, onTimeExpire]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = secondsRemaining <= 180 && secondsRemaining > 60;
  const isCriticalTime = secondsRemaining <= 60;

  return (
    <header className="bg-gradient-to-r from-cu-darkNavy via-cu-navy to-slate-950 text-white shadow-xl border-b-4 border-cu-gold sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          
          {/* LEFT: Branding Title & Badge */}
          <div className="text-center md:text-left shrink-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight text-white whitespace-nowrap">
              Campus Internship <span className="text-cu-gold">Screening Form</span>
            </h1>
            <div className="inline-flex items-center space-x-1.5 bg-cu-gold/15 border border-cu-gold/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-cu-gold mt-0.5">
              <GraduationCap className="w-3 h-3 text-cu-gold" />
              <span>Campus Recruitment Portal</span>
            </div>
          </div>

          {/* CENTER: Integrated Animated Live Timer */}
          {showTimer && (
            <div className="flex items-center gap-3 bg-slate-900/90 border border-cu-gold/40 p-2 px-3.5 rounded-2xl shadow-inner backdrop-blur-md">
              {/* Rotating SVG Clock Animation */}
              <div className="relative w-9 h-9 rounded-full bg-white/10 border border-cu-gold flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-cu-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" className="stroke-cu-gold/40" />
                  <path d="M12 7v5l3 3" className="origin-center animate-[spin_4s_linear_infinite]" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full animate-ping"></span>
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
              </div>

              {/* Time Remaining & Elapsed in sleek compact format */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block leading-tight">
                    Time Remaining
                  </span>
                  <div className="flex items-baseline space-x-1">
                    <span className={`text-xl sm:text-2xl font-mono font-black tracking-tight leading-none ${
                      isCriticalTime
                        ? 'text-red-400 animate-pulse'
                        : isLowTime
                        ? 'text-amber-400'
                        : 'text-white'
                    }`}>
                      {formatTime(secondsRemaining)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">min</span>
                  </div>
                </div>

                <div className="h-7 w-px bg-white/20"></div>

                <div className="text-left">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block leading-tight">
                    Elapsed
                  </span>
                  <span className="text-xs font-bold text-cu-gold font-mono block leading-tight mt-0.5">
                    {formatTime(secondsElapsed)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* RIGHT: Polished Company Logos Showcase */}
          <div className="flex items-center gap-2 bg-white p-1.5 px-3 rounded-2xl border border-cu-gold/40 shadow-md shrink-0">
            {companyLogos.map((logo, idx) => (
              <div
                key={idx}
                className="h-8 sm:h-9 px-2 sm:px-2.5 bg-slate-50/80 rounded-lg flex items-center justify-center border border-slate-200/90 shadow-2xs hover:bg-white hover:scale-105 transition-all"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="max-h-6 sm:max-h-7 max-w-[70px] sm:max-w-[80px] object-contain"
                />
              </div>
            ))}
          </div>

        </div>
      </div>
    </header>
  );
};
