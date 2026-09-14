'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertOctagon } from 'lucide-react';

export const InspectProtection: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // 1. Disable Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setShowWarning(true);
    };

    // 2. Disable Key Combinations for DevTools / View Source (Allowing F5 / Ctrl+R for Reload)
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        setShowWarning(true);
        return;
      }

      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;
      const shiftOrAlt = isMac ? e.altKey : e.shiftKey;

      if (ctrlOrCmd && shiftOrAlt && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
        e.preventDefault();
        setShowWarning(true);
        return;
      }

      if (ctrlOrCmd && ['U', 'u'].includes(e.key)) {
        e.preventDefault();
        setShowWarning(true);
        return;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 transition-all">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center border-4 border-amber-500 animate-in fade-in zoom-in duration-200">
        <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
          <AlertOctagon className="w-12 h-12 text-amber-600" />
        </div>

        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-wide">
          Focus On the Form Fill Up.
        </h2>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Developer tools, right-click, and code inspection are disabled on this campus recruitment portal. Please complete your internship screening form.
        </p>

        <button
          type="button"
          onClick={() => setShowWarning(false)}
          className="w-full py-3.5 px-6 rounded-xl bg-cu-navy hover:bg-cu-darkNavy text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
        >
          Return to Form Fill Up
        </button>
      </div>
    </div>
  );
};
