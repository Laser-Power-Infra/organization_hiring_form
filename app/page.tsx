'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FORM_SECTIONS, FORM_TITLE, FORM_DESCRIPTION } from '@/lib/questions';
import { CandidateFormData } from '@/lib/types';
import { ProgressBar } from '@/components/ProgressBar';
import { QuestionInput } from '@/components/QuestionInput';
import { Header } from '@/components/Header';
import { ArrowLeft, ArrowRight, Send, Loader2, Save, FileCheck, AlertCircle, ShieldAlert, AlertTriangle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ScreeningFormPage() {
  const router = useRouter();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [formData, setFormData] = useState<CandidateFormData>({});
  const formDataRef = useRef<CandidateFormData>({});
  const secondsElapsedRef = useRef(0);

  const [hasStarted, setHasStarted] = useState(false);
  const [isClientLoaded, setIsClientLoaded] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
  const [isCheckingRoll, setIsCheckingRoll] = useState(false);
  const [duplicateRollModal, setDuplicateRollModal] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  // Keep refs synchronized
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    secondsElapsedRef.current = secondsElapsed;
  }, [secondsElapsed]);

  // Load saved draft and started state on mount
  useEffect(() => {
    setIsClientLoaded(true);
    try {
      const started = localStorage.getItem('cu_assessment_has_started') === 'true';
      const savedStartTime = localStorage.getItem('cu_assessment_start_timestamp');

      if (started && savedStartTime) {
        const startTs = parseInt(savedStartTime, 10);
        const elapsed = Math.floor((Date.now() - startTs) / 1000);

        // If started previously but elapsed > 10 mins without submission, auto-reset stale session
        if (elapsed >= 600) {
          localStorage.removeItem('cu_assessment_has_started');
          localStorage.removeItem('cu_assessment_start_timestamp');
          localStorage.removeItem('cu_internship_form_draft');
          setHasStarted(false);
          setFormData({});
          formDataRef.current = {};
        } else {
          setHasStarted(true);
          const saved = localStorage.getItem('cu_internship_form_draft');
          if (saved) {
            const parsed = JSON.parse(saved);
            setFormData(parsed);
            formDataRef.current = parsed;
          }
        }
      } else {
        // Not started yet - clear any old leftover timestamps
        localStorage.removeItem('cu_assessment_has_started');
        localStorage.removeItem('cu_assessment_start_timestamp');
        setHasStarted(false);
      }
    } catch (e) {
      console.error('Failed to load initial state:', e);
    }
  }, []);

  const startAssessment = () => {
    try {
      localStorage.setItem('cu_assessment_has_started', 'true');
      localStorage.setItem('cu_assessment_start_timestamp', Date.now().toString());
    } catch (e) {}
    setHasStarted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back button exit warning protection
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      window.history.pushState(null, '', window.location.href);
      setShowExitModal(true);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const saveDraft = () => {
    try {
      localStorage.setItem('cu_internship_form_draft', JSON.stringify(formData));
      setSaveStatus('Draft saved automatically');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e) {
      console.error('Save draft error:', e);
    }
  };

  const currentSection = FORM_SECTIONS[currentSectionIndex];

  const handleFieldChange = (qId: string, val: any) => {
    const updated = { ...formData, [qId]: val };
    setFormData(updated);
    formDataRef.current = updated;
    if (errors[qId]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[qId];
        return copy;
      });
    }
    try {
      localStorage.setItem('cu_internship_form_draft', JSON.stringify(updated));
    } catch (e) {}
  };

  // Production-grade section validation
  const validateCurrentSection = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    const section = FORM_SECTIONS[currentSectionIndex];

    section.questions.forEach((q) => {
      // Check conditional visibility
      if (q.condition && formData[q.condition.field] !== q.condition.value) {
        return;
      }

      const val = formData[q.id];

      // 1. Required field check
      if (q.required) {
        if (val === undefined || val === null || val === '') {
          newErrors[q.id] = `${q.label} is required.`;
          return;
        }
        if (Array.isArray(val) && val.length === 0) {
          newErrors[q.id] = `Please select at least one option.`;
          return;
        }
        if (q.type === 'file' && typeof val === 'object' && !val.base64 && !val.name) {
          newErrors[q.id] = `Please upload your CV/Resume file.`;
          return;
        }
      }

      // 2. Email validation
      if (q.type === 'email' && val) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(val).trim())) {
          newErrors[q.id] = 'Please enter a valid email address (e.g. name@domain.com).';
        }
      }

      // 3. Mobile phone number validation
      if (q.type === 'tel' && val) {
        const cleanPhone = String(val).replace(/[^0-9]/g, '');
        if (cleanPhone.length < 10) {
          newErrors[q.id] = 'Please enter a valid 10-digit mobile number.';
        }
      }

      // 4. Word limit validation on paragraphs
      if (q.type === 'paragraph' && q.maxWords && val && typeof val === 'string') {
        const words = val.trim().split(/\s+/).filter(Boolean).length;
        if (words > q.maxWords) {
          newErrors[q.id] = `Response exceeds the maximum limit of ${q.maxWords} words (currently ${words} words).`;
        }
      }

      // 5. File size validation (Max 10MB)
      if (q.type === 'file' && val && typeof val === 'object' && val.size) {
        if (val.size > 10 * 1024 * 1024) {
          newErrors[q.id] = 'File size exceeds 10MB limit. Please upload a smaller document.';
        }
      }
    });

    setErrors(newErrors);

    // If invalid, scroll to the first error
    if (Object.keys(newErrors).length > 0) {
      window.scrollTo({ top: 150, behavior: 'smooth' });
      return false;
    }

    return true;
  };

  const checkRollDuplicate = async (roll: string): Promise<boolean> => {
    if (!roll || !roll.trim()) return false;
    setIsCheckingRoll(true);
    try {
      const res = await fetch('/api/check-roll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNumber: roll }),
      });
      const data = await res.json();
      if (data.exists) {
        setDuplicateRollModal(data.message || 'This University Roll Number already exists. You cannot apply again. Please contact the University.');
        return true;
      }
    } catch (e) {
      console.error('Error checking roll duplicate:', e);
    } finally {
      setIsCheckingRoll(false);
    }
    return false;
  };

  const handleNextSection = async () => {
    // Validate current section before moving forward
    const isValid = validateCurrentSection();
    if (!isValid) return;

    // Pre-check Roll Number duplicate if on Section 1
    if (currentSectionIndex === 0 && formData['q4']) {
      const isDup = await checkRollDuplicate(String(formData['q4']));
      if (isDup) return;
    }

    if (currentSectionIndex < FORM_SECTIONS.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowSummary(true);
    }
  };

  const handlePrevSection = () => {
    if (showSummary) {
      setShowSummary(false);
      return;
    }
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (isAutoTriggered = false) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const activeData = formDataRef.current;

    // Enforce declaration confirmation for manual user submissions
    if (!isAutoTriggered && !activeData['q53']) {
      setSubmitError('Please ensure the final declaration is confirmed before submitting.');
      setIsSubmitting(false);
      return;
    }

    const elapsedSecs = secondsElapsedRef.current;
    const completionMinutes = isAutoTriggered ? '10.0' : (elapsedSecs > 0 ? (elapsedSecs / 60).toFixed(1) : '10.0');

    const submissionPayload: CandidateFormData = {
      ...activeData,
      completionTime: completionMinutes,
      q53: activeData['q53'] !== undefined ? activeData['q53'] : true,
    };

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.removeItem('cu_internship_form_draft');
        localStorage.removeItem('cu_assessment_start_timestamp');
        localStorage.removeItem('cu_assessment_has_started');
        sessionStorage.setItem('cu_submission_result', JSON.stringify(data));
        router.push('/thank-you');
      } else {
        if (data.isDuplicate) {
          setDuplicateRollModal(data.error);
        } else {
          setSubmitError(data.error || 'Failed to submit form.');
        }
      }
    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected connection error occurred.');
    } finally {
      setIsSubmitting(false);
      setIsAutoSubmitting(false);
    }
  };

  // Handler for timer expiry -> auto submit
  const handleTimeExpire = useCallback(() => {
    setIsAutoSubmitting(true);
    setTimeout(() => {
      handleSubmit(true);
    }, 1500);
  }, []);

  const formatSummaryAnswer = (answer: any): React.ReactNode => {
    if (answer === undefined || answer === null || answer === '') {
      return <em className="text-slate-400 font-normal">Not specified</em>;
    }
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    if (typeof answer === 'object') {
      const obj = answer as any;
      return obj.name ? `File: ${obj.name}` : JSON.stringify(obj);
    }
    return String(answer);
  };

  return (
    <>
      {/* SINGLE UNIFIED TOP HEADER WITH BRAND, LIVE TIMER & LOGOS */}
      <Header
        initialMinutes={10}
        onTimeUpdate={(secs) => setSecondsElapsed(secs)}
        onTimeExpire={handleTimeExpire}
        showTimer={true}
        hasStarted={hasStarted}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* TIME EXPIRED AUTO-SUBMITTING OVERLAY BANNER */}
        {isAutoSubmitting && (
          <div className="fixed inset-0 z-[10000] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border-4 border-cu-gold shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <Clock className="w-10 h-10 animate-spin" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Time's Up!</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Your 10-minute assessment window has ended. We are submitting your application automatically...
              </p>
              <div className="flex items-center justify-center space-x-2 text-cu-navy font-bold text-sm pt-2">
                <Loader2 className="w-5 h-5 animate-spin text-cu-gold" />
                <span>Recording responses & uploading CV...</span>
              </div>
            </div>
          </div>
        )}

        {/* ACCIDENTAL EXIT / BACK WARNING MODAL */}
        {showExitModal && (
          <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center border-4 border-amber-500 animate-in fade-in zoom-in duration-200">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-10 h-10 text-amber-600" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Warning: Exit Assessment?
              </h3>

              <p className="text-sm text-slate-700 leading-relaxed mb-6 font-semibold bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-900">
                Are you sure you want to exit from this assessment? After this, you cannot apply again.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowExitModal(false)}
                  className="w-full py-3 px-5 rounded-xl bg-cu-navy hover:bg-cu-darkNavy text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Stay & Continue Assessment</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitModal(false);
                    window.location.href = 'https://www.google.com';
                  }}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-100 hover:bg-red-50 text-red-600 font-semibold text-xs border border-slate-200 hover:border-red-300 transition-all shrink-0"
                >
                  Exit Anyway
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DUPLICATE ROLL NUMBER MODAL POPUP */}
        {duplicateRollModal && (
          <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center border-4 border-red-500 animate-in fade-in zoom-in duration-200">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-10 h-10 text-red-600" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Application Duplicate Notice
              </h3>

              <p className="text-sm text-slate-700 leading-relaxed mb-6 font-medium bg-red-50 p-4 rounded-xl border border-red-200">
                {duplicateRollModal}
              </p>

              <button
                type="button"
                onClick={() => setDuplicateRollModal(null)}
                className="w-full py-3 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
              >
                Close & Contact University
              </button>
            </div>
          </div>
        )}

        {/* INITIAL SCREEN: INSTRUCTIONS & START BUTTON (BEFORE STARTING) */}
        {!hasStarted ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* WELCOME HERO CARD */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 border-l-8 border-l-cu-navy space-y-4">
              <div className="inline-flex items-center space-x-2 bg-cu-navy text-cu-gold px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <span>Campus Recruitment 2026</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
                {FORM_TITLE}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
                Welcome to the official online screening assessment for campus internship placements across partner industry leaders: <strong>Ceebuild Company (P) Ltd.</strong>, <strong>Laser Power & Infra</strong>, <strong>Dalui Group</strong>, and <strong>UIC Udyog Limited</strong>.
              </p>
            </div>

            {/* KEY ASSESSMENT HIGHLIGHTS (4 CARDS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-cu-gold flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5 text-cu-gold" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">10 Minutes Window</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Strictly timed 10-minute assessment. A live countdown clock will run throughout.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-cu-navy flex items-center justify-center font-bold">
                  <FileCheck className="w-5 h-5 text-cu-navy" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">10 Sections</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Covers Personal Info, Academics, Technical & Soft Skills, Problem Solving & Availability.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Save className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">CV / Resume Upload</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Keep your PDF/DOCX CV file ready to upload in Section 1 (Max 10MB).
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Send className="w-5 h-5 text-emerald-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Auto-Submission</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  When the timer hits 00:00, all answered responses are automatically recorded and submitted.
                </p>
              </div>
            </div>

            {/* INSTRUCTIONS GUIDELINES */}
            <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-cu-navy uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-cu-gold" />
                Important Instructions Before You Begin
              </h3>
              <ul className="text-xs sm:text-sm text-slate-600 space-y-2.5 list-disc list-inside leading-relaxed">
                <li>Please ensure you have a stable internet connection before clicking <strong>Start Assessment</strong>.</li>
                <li>Do not refresh or close the browser tab during the test. Your timer will continue running.</li>
                <li>You can freely navigate between completed sections and review your answers before submitting.</li>
                <li>Only one application submission is allowed per University Roll Number.</li>
              </ul>
            </div>

            {/* START CTA BUTTON CARD */}
            <div className="bg-white rounded-3xl p-8 shadow-md border-2 border-cu-gold text-center space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Ready to Start Your Assessment?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Clicking the button below will immediately start your 10-minute timer and open Section 1.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={startAssessment}
                  className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-cu-navy via-cu-darkNavy to-slate-900 hover:from-cu-darkNavy hover:to-cu-navy text-white text-base sm:text-lg font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center mx-auto space-x-3 border-2 border-cu-gold"
                >
                  <span>Start Assessment Now</span>
                  <ArrowRight className="w-5 h-5 text-cu-gold" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ACTIVE ASSESSMENT CONTENT (WHEN STARTED) */
          <>
            {/* FORM TITLE CARD */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 border-l-8 border-l-cu-navy">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 leading-tight">
                {FORM_TITLE}
              </h2>
              <div className="prose prose-slate text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-4">
                {FORM_DESCRIPTION}
              </div>
              {saveStatus && (
                <div className="flex items-center justify-end text-xs text-emerald-600 font-semibold pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Save className="w-3.5 h-3.5" /> {saveStatus}
                  </span>
                </div>
              )}
            </div>

      {/* PROGRESS TRACKER */}
      <ProgressBar
        currentSectionIndex={showSummary ? FORM_SECTIONS.length - 1 : currentSectionIndex}
        onSectionClick={(idx) => {
          setShowSummary(false);
          setCurrentSectionIndex(idx);
        }}
      />

      {/* SUMMARY REVIEW SCREEN */}
      {showSummary ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-cu-navy flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-cu-gold" />
              Review Your Application Responses
            </h3>
            <p className="text-xs text-slate-500">
              Please review all entries below before final submission. Click "Back" to edit any section.
            </p>
          </div>

          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {FORM_SECTIONS.map((sec) => (
              <div key={sec.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cu-navy border-b pb-1">
                  {sec.title}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {sec.questions.map((q) => {
                    if (q.condition && formData[q.condition.field] !== q.condition.value) {
                      return null;
                    }
                    const answer = formData[q.id];
                    return (
                      <div key={q.id} className={q.type === 'paragraph' ? 'sm:col-span-2' : ''}>
                        <span className="font-semibold text-slate-700 block">{q.number}. {q.label}:</span>
                        <span className="text-slate-900 font-medium block mt-0.5 bg-white p-2 rounded border border-slate-200">
                          {formatSummaryAnswer(answer)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 gap-4">
            <button
              type="button"
              onClick={handlePrevSection}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold flex items-center space-x-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Edit</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md hover:shadow-lg flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Confirm & Submit Application</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE SECTION QUESTIONS */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-cu-gold bg-cu-navy px-3 py-1 rounded-md inline-block mb-2">
              Section {currentSection.id} of {FORM_SECTIONS.length}
            </span>
            <h3 className="text-lg font-bold text-slate-900">{currentSection.title}</h3>
            {currentSection.description && (
              <p className="text-xs text-slate-500 mt-1">{currentSection.description}</p>
            )}
          </div>

          <div className="space-y-5">
            {currentSection.questions.map((q) => {
              if (q.condition && formData[q.condition.field] !== q.condition.value) {
                return null;
              }
              return (
                <QuestionInput
                  key={q.id}
                  question={q}
                  value={formData[q.id]}
                  onChange={(val) => handleFieldChange(q.id, val)}
                  error={errors[q.id]}
                />
              );
            })}
          </div>

          {/* SECTION NAVIGATION BUTTONS */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 gap-4">
            <button
              type="button"
              onClick={handlePrevSection}
              disabled={currentSectionIndex === 0}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold flex items-center space-x-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={saveDraft}
                className="hidden sm:flex px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium items-center space-x-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                onClick={handleNextSection}
                disabled={isCheckingRoll}
                className="px-6 py-2.5 rounded-xl bg-cu-navy hover:bg-cu-darkNavy text-white text-sm font-bold shadow-sm hover:shadow-md flex items-center space-x-2 transition-all disabled:opacity-50"
              >
                {isCheckingRoll ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>{currentSectionIndex === FORM_SECTIONS.length - 1 ? 'Review Application' : 'Next Section'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </>
    )}
    </main>
  </>
);
}
