'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, ArrowLeft, Building2, FileCheck } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';

export default function ThankYouPage() {
  const [submissionInfo, setSubmissionInfo] = useState<{
    submissionId: string;
  } | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('cu_submission_result');
      if (stored) {
        setSubmissionInfo(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading submission result:', e);
    }
  }, []);

  return (
    <>
      <Header showTimer={false} />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6 py-8">
          {/* SUCCESS CONFIRMATION CARD */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-md border border-slate-200 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200 inline-block mb-3">
                Application Submitted Successfully
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Thank You for Applying!
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto mt-3 leading-relaxed">
                Your screening response and CV document have been successfully submitted.
              </p>
            </div>

            {submissionInfo?.submissionId && (
              <div className="inline-flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-5 py-2.5 text-xs font-mono text-slate-700">
                <span>Submission Reference ID:</span>
                <strong className="text-cu-navy text-sm font-bold">{submissionInfo.submissionId}</strong>
              </div>
            )}

            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 text-left text-xs text-slate-600 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-cu-navy text-sm mb-1">
                <Building2 className="w-4 h-4 text-cu-gold" />
                <span>Next Steps in Selection Process</span>
              </div>
              <p className="leading-relaxed">
                Shortlisted candidates will be contacted directly via email or mobile for personal/virtual interviews and further skill assessment.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                onClick={() => {
                  localStorage.removeItem('cu_assessment_start_timestamp');
                  localStorage.removeItem('cu_assessment_has_started');
                  localStorage.removeItem('cu_internship_form_draft');
                }}
                className="inline-flex items-center space-x-2 text-sm font-bold text-white bg-cu-navy hover:bg-cu-darkNavy px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Submit Another Response</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
