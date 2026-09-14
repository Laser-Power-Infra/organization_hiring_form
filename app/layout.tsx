import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { InspectProtection } from '@/components/InspectProtection';

export const metadata: Metadata = {
  title: 'Campus Internship Screening System',
  description: '',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const companyLogos = [
    { src: '/company-icons/ceebuild-logo.png', alt: 'Ceebuild Company (P) Ltd.', name: 'CEEBUILD' },
    { src: '/company-icons/lpi-logo.png', alt: 'Laser Power & Infra', name: 'LASER POWER' },
    { src: '/company-icons/header-final-logo.png', alt: 'Dalui Group', name: 'DALUI' },
    { src: '/company-icons/Logo-removebg-preview.png', alt: 'UIC Udyog Limited', name: 'UIC UDYOG' },
  ];

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
        <InspectProtection />
        {children}
        <footer className="bg-slate-900 text-slate-300 border-t-2 border-cu-gold py-8 text-center text-xs">
          <div className="max-w-5xl mx-auto px-4 space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {companyLogos.map((logo, idx) => (
                <div key={idx} className="bg-white p-2 px-3.5 rounded-xl border border-slate-700 flex flex-col items-center justify-center shadow-md hover:bg-slate-50 hover:scale-105 transition-all">
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="max-h-8 max-w-[100px] object-contain mb-0.5"
                  />
                  <span className="text-[9px] font-bold text-slate-800">{logo.name}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-4 text-slate-400 space-y-1">
              <p className="font-bold text-slate-200 text-sm">Campus Internship Assessment Portal</p>
              <p className="text-xs">© {new Date().getFullYear()} All rights reserved. Confidential Recruitment & Screening System for University of Calcutta Applicants.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
