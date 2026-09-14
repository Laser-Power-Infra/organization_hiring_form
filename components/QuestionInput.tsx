import React from 'react';
import { FormQuestion } from '@/lib/types';
import { Upload, AlertCircle, FileText, Check } from 'lucide-react';

interface QuestionInputProps {
  question: FormQuestion;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export const QuestionInput: React.FC<QuestionInputProps> = ({
  question,
  value,
  onChange,
  error,
}) => {
  const getWordCount = (str: string): number => {
    if (!str || typeof str !== 'string') return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
  };

  const wordCount = question.type === 'paragraph' && typeof value === 'string' ? getWordCount(value) : 0;
  const isOverWordLimit = question.maxWords ? wordCount > question.maxWords : false;

  const handleCheckboxToggle = (opt: string) => {
    const currentList: string[] = Array.isArray(value) ? [...value] : [];
    if (currentList.includes(opt)) {
      onChange(currentList.filter(item => item !== opt));
    } else {
      onChange([...currentList, opt]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        onChange({
          name: file.name,
          type: file.type || 'application/pdf',
          size: file.size,
          base64: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const getFileNameDisplay = (): string => {
    if (!value) return '';
    if (typeof value === 'object' && value.name) {
      return `${value.name} (${(value.size / 1024 / 1024).toFixed(2)} MB)`;
    }
    if (typeof value === 'string') return value;
    return 'CV File Selected';
  };

  return (
    <div className={`p-5 rounded-xl bg-white border transition-all ${
      error ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200 hover:border-slate-300 shadow-sm'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <label className="block text-sm font-semibold text-slate-900 leading-snug">
          <span className="text-cu-navy font-bold mr-1.5">{question.number}.</span>
          {question.label}
          {question.required && <span className="text-red-500 ml-1 font-bold">*</span>}
        </label>
      </div>

      {question.helpText && (
        <p className="text-xs text-slate-500 mb-3">{question.helpText}</p>
      )}

      {/* QUESTION TYPE: TEXT / EMAIL / TEL / DATE */}
      {['text', 'email', 'tel', 'date'].includes(question.type) && (
        <input
          type={question.type}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder || ''}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-cu-navy focus:ring-2 focus:ring-cu-navy/10 text-sm text-slate-800 transition-all outline-none"
        />
      )}

      {/* QUESTION TYPE: PARAGRAPH WITH LIVE WORD COUNTER */}
      {question.type === 'paragraph' && (
        <div>
          <textarea
            rows={4}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || ''}
            className={`w-full p-4 rounded-lg border text-sm text-slate-800 transition-all outline-none resize-y ${
              isOverWordLimit
                ? 'border-amber-500 focus:ring-amber-200'
                : 'border-slate-300 focus:border-cu-navy focus:ring-2 focus:ring-cu-navy/10'
            }`}
          />
          {question.maxWords && (
            <div className="flex items-center justify-between mt-1.5 text-xs">
              <span className="text-slate-500">
                Limit answer to clear, concise bullet points or paragraph.
              </span>
              <span className={`font-semibold px-2 py-0.5 rounded-full ${
                isOverWordLimit ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {wordCount} / {question.maxWords} words
              </span>
            </div>
          )}
        </div>
      )}

      {/* QUESTION TYPE: RADIO */}
      {question.type === 'radio' && question.options && (
        <div className="space-y-2.5 pt-1">
          {question.options.map((option, idx) => {
            const isChecked = value === option;
            return (
              <label
                key={idx}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                  isChecked
                    ? 'border-cu-navy bg-cu-navy/5 text-cu-navy font-medium shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={isChecked}
                  onChange={() => onChange(option)}
                  className="w-4 h-4 text-cu-navy border-slate-300 focus:ring-cu-navy"
                />
                <span className="ml-3 text-sm">{option}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* QUESTION TYPE: CHECKBOX */}
      {question.type === 'checkbox' && question.options && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {question.options.map((option, idx) => {
            const selectedList: string[] = Array.isArray(value) ? value : [];
            const isChecked = selectedList.includes(option);
            return (
              <label
                key={idx}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                  isChecked
                    ? 'border-cu-navy bg-cu-navy/5 text-cu-navy font-medium shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCheckboxToggle(option)}
                  className="w-4 h-4 text-cu-navy border-slate-300 rounded focus:ring-cu-navy"
                />
                <span className="ml-3 text-sm">{option}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* QUESTION TYPE: LINEAR SCALE 1-5 */}
      {question.type === 'scale' && (
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 px-1 font-medium">
            <span>1 = {question.scaleMinLabel || 'Low'}</span>
            <span>5 = {question.scaleMaxLabel || 'High'}</span>
          </div>
          <div className="flex items-center justify-between gap-2 max-w-md mx-auto bg-slate-50 p-2 rounded-xl border border-slate-200">
            {[1, 2, 3, 4, 5].map((num) => {
              const isSelected = String(value) === String(num);
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => onChange(String(num))}
                  className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-cu-navy text-white shadow-md ring-2 ring-cu-gold'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* QUESTION TYPE: FILE UPLOAD */}
      {question.type === 'file' && (
        <div className="pt-1">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50 hover:bg-slate-100/80 transition-all cursor-pointer relative">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {value ? (
              <div className="flex items-center justify-center space-x-2 text-emerald-700 font-medium text-sm">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>{getFileNameDisplay()}</span>
                <Check className="w-4 h-4 text-emerald-600 ml-2" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-cu-navy/10 text-cu-navy flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-cu-navy">Click to browse</span>
                  <span className="text-sm text-slate-500"> or drag and drop CV/Resume</span>
                </div>
                <span className="text-xs text-slate-400">PDF, DOC, DOCX (Max 10MB)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="flex items-center space-x-1.5 mt-2.5 text-xs text-red-600 font-medium">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
