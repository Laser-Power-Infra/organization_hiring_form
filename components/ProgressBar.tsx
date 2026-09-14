import React from 'react';
import { FORM_SECTIONS } from '@/lib/questions';
import { CheckCircle2 } from 'lucide-react';

interface ProgressBarProps {
  currentSectionIndex: number;
  onSectionClick: (index: number) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentSectionIndex,
  onSectionClick,
}) => {
  const totalSections = FORM_SECTIONS.length;
  const progressPercentage = Math.round(((currentSectionIndex + 1) / totalSections) * 100);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Section {currentSectionIndex + 1} of {totalSections}
        </span>
        <span className="text-xs font-bold text-cu-navy bg-cu-navy/10 px-2.5 py-1 rounded-full">
          {progressPercentage}% Completed
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-cu-navy to-cu-accent h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Section Step Badges */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 pt-1">
        {FORM_SECTIONS.map((sec, idx) => {
          const isCurrent = idx === currentSectionIndex;
          const isCompleted = idx < currentSectionIndex;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onSectionClick(idx)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-xs font-medium transition-all ${
                isCurrent
                  ? 'bg-cu-navy text-white shadow-sm ring-2 ring-cu-gold'
                  : isCompleted
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
              }`}
              title={`Section ${idx + 1}: ${sec.title}`}
            >
              <span className="text-[10px] uppercase font-bold leading-none mb-0.5">
                {idx === 9 ? 'Decl.' : `Sec ${idx + 1}`}
              </span>
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <span className="text-[11px] font-semibold">{idx + 1}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
