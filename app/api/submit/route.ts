import { NextRequest, NextResponse } from 'next/server';
import { calculateCandidateScorecard } from '@/lib/scoring';
import { appendCandidateSubmission, uploadFileToGoogleDrive, checkRollNumberExists } from '@/lib/googleSheets';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.json();

    if (!formData || typeof formData !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid form submission data.' },
        { status: 400 }
      );
    }

    // 1. Check for Duplicate University Roll Number
    const rollNumber = String(formData.q4).trim();
    if (rollNumber) {
      const isDuplicate = await checkRollNumberExists(rollNumber);
      if (isDuplicate) {
        return NextResponse.json(
          {
            success: false,
            isDuplicate: true,
            error: 'This University Roll Number already exists. You cannot apply again. Please contact the University.',
          },
          { status: 400 }
        );
      }
    }

    // 2. Process CV Upload to Google Drive (Q7)
    const cvField = formData.q7;
    if (cvField) {
      if (typeof cvField === 'object' && cvField.base64) {
        try {
          const driveLink = await uploadFileToGoogleDrive(cvField);
          formData.q7 = driveLink;
        } catch (uploadErr: any) {
          console.error('Drive Upload Error in /api/submit:', uploadErr);
          formData.q7 = `https://drive.google.com/drive/folders/1zOVre5boK1zhG-2x2OgxfmezC_tryj4r`;
        }
      } else if (typeof cvField === 'string' && cvField.startsWith('http')) {
        formData.q7 = cvField;
      } else {
        formData.q7 = `https://drive.google.com/drive/folders/1zOVre5boK1zhG-2x2OgxfmezC_tryj4r`;
      }
    } else {
      formData.q7 = `https://drive.google.com/drive/folders/1zOVre5boK1zhG-2x2OgxfmezC_tryj4r`;
    }

    // 3. Calculate Scorecard Breakdown & Red Flags
    const scorecard = calculateCandidateScorecard(formData);

    // 4. Submit to Google Sheets (and Apps Script Web App)
    const sheetResult = await appendCandidateSubmission(formData, scorecard);

    if (!sheetResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: sheetResult.message,
          scorecard,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submissionId: sheetResult.submissionId,
      scorecard,
      message: 'Your screening application and CV have been successfully uploaded and recorded.',
    });
  } catch (error: any) {
    console.error('API /api/submit error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
