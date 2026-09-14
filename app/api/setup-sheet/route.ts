import { NextResponse } from 'next/server';
import { ensureSheetTabsExist } from '@/lib/googleSheets';

export async function GET() {
  try {
    await ensureSheetTabsExist();
    return NextResponse.json({
      success: true,
      message: 'Google Sheet tabs ("Candidate Responses" & "Screening Scorecard") and headers successfully verified/created.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to setup sheet.' },
      { status: 500 }
    );
  }
}
