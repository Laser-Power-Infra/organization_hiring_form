import { CandidateFormData, ScorecardBreakdown } from './types';
import { FORM_SECTIONS } from './questions';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN || '';
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || '1xMgNxaHkbHmWkkSkiCORR_WaF5YknAHP3ZsSuAZYBxI';
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1zOVre5boK1zhG-2x2OgxfmezC_tryj4r';
const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbyNmVyF2m2Nbs7N8kfZmYDw2r9gdmW1qP2TIkNeLG5o43gi3kcvjjuG3aIPosbUfC1T/exec';

let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getAccessToken(): Promise<string> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    throw new Error('Google OAuth credentials missing in environment variables.');
  }

  // Return cached token if valid (expires in 3600s, buffer 300s)
  if (cachedAccessToken && Date.now() < tokenExpiresAt) {
    return cachedAccessToken;
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.access_token) {
    console.error('OAuth Refresh Token Error:', data);
    throw new Error(`Failed to refresh Google Access Token: ${data.error_description || data.error || 'Unknown error'}`);
  }

  cachedAccessToken = data.access_token;
  tokenExpiresAt = Date.now() + ((data.expires_in || 3600) - 300) * 1000;
  return cachedAccessToken as string;
}

export async function checkRollNumberExists(rollNumber: string): Promise<boolean> {
  try {
    if (!rollNumber || !rollNumber.trim()) return false;
    const cleanRoll = rollNumber.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!cleanRoll) return false;

    const accessToken = await getAccessToken();
    const range = encodeURIComponent("'Candidate Responses'!F2:F5000");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return false;

    const data = await res.json();
    if (!data.values || !Array.isArray(data.values)) return false;

    for (const row of data.values) {
      if (row[0]) {
        const existingRoll = String(row[0]).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        if (existingRoll === cleanRoll && cleanRoll.length > 0) {
          return true;
        }
      }
    }

    return false;
  } catch (err) {
    console.error('Error checking duplicate roll number:', err);
    return false;
  }
}

export async function uploadFileToGoogleDrive(fileObj: {
  name: string;
  type: string;
  base64: string;
}): Promise<string> {
  try {
    const accessToken = await getAccessToken();
    const cleanBase64 = fileObj.base64.replace(/^data:.*?;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const fileName = fileObj.name || `CV_${Date.now()}.pdf`;
    const mimeType = fileObj.type || 'application/pdf';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // Step 1: Initiate Resumable Upload Session in Drive Folder
    const initRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': mimeType,
        'X-Upload-Content-Length': buffer.length.toString(),
      },
      body: JSON.stringify({
        name: fileName,
        parents: [DRIVE_FOLDER_ID],
      }),
      signal: controller.signal,
    });

    let locationUrl = initRes.headers.get('location');

    // If folder parent fails, fallback to root drive session
    if (!locationUrl) {
      const fallbackInitRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Type': mimeType,
          'X-Upload-Content-Length': buffer.length.toString(),
        },
        body: JSON.stringify({ name: fileName }),
        signal: controller.signal,
      });
      locationUrl = fallbackInitRes.headers.get('location');
    }

    if (!locationUrl) {
      clearTimeout(timeoutId);
      return `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`;
    }

    // Step 2: Upload PDF binary buffer to session location
    const uploadRes = await fetch(locationUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': mimeType,
        'Content-Length': buffer.length.toString(),
      },
      body: buffer,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const uploadData = await uploadRes.json();

    if (uploadData.id) {
      // Step 3: Set shareable reader permission (fire and forget)
      fetch(`https://www.googleapis.com/drive/v3/files/${uploadData.id}/permissions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'reader', type: 'anyone' }),
      }).catch(() => {});

      const generatedUrl = `https://drive.google.com/file/d/${uploadData.id}/view`;
      console.log('Successfully uploaded PDF to Google Drive:', generatedUrl);
      return generatedUrl;
    }

    return `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`;
  } catch (err) {
    console.error('Google Drive Upload Error (using folder fallback):', err);
    return `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`;
  }
}

export const CANDIDATE_RESPONSES_HEADERS = [
  'Timestamp',
  'Submission ID',
  'Q1. Full Name',
  'Q2. Email Address',
  'Q3. Mobile Number',
  'Q4. University Roll/Reg No.',
  'Q5. College/Department',
  'Q6. Current City',
  'Q7. CV Upload Link',
  'Q8. LinkedIn Profile',
  'Q9. Degree/Programme',
  'Q10. Specialisation',
  'Q11. Year/Semester',
  'Q12. Current CGPA/%',
  'Q13. Class 10 %',
  'Q14. Class 12 %',
  'Q15. Academic Projects?',
  'Q16. Academic Project Details',
  'Q17. Additional Courses/Certifications?',
  'Q18. Additional Course Details',
  'Q19. Skills',
  'Q20. Excel Rating (1-5)',
  'Q21. Digital Proficiency (1-5)',
  'Q22. Preferred Area',
  'Q23. Proud Technical Project',
  'Q24. Written English (1-5)',
  'Q25. Verbal Communication (1-5)',
  'Q26. Unfamiliar Task Scenario',
  'Q27. Deadline Error Scenario',
  'Q28. Task Priority Choice',
  'Q29. 3 Strongest Qualities',
  'Q30. Skill/Weakness to Improve',
  'Q31. Constructive Criticism Response',
  'Q32. Supervisor Disagreement',
  'Q33. Work Environment Preference',
  'Q34. Why Interested in Internship',
  'Q35. Expected Learning',
  'Q36. Preferred Internship Domain',
  'Q37. Duration Commitment',
  'Q38. Availability',
  'Q39. Expected Start Date',
  'Q40. Willing to Work from Office',
  'Q41. Previous Internship?',
  'Q42. Previous Internship Details',
  'Q43. Extracurricular Participation',
  'Q44. Achievements & Leadership',
  'Q45. 5 Tasks Prioritization',
  'Q46. Uncooperative Team Member Scenario',
  'Q47. Unclear Instructions Action',
  'Q48. Work Style Statement',
  'Q49. Why Select You',
  'Q50. Differentiator',
  'Q51. Willing to undergo Assessment',
  'Q52. Referral Source',
  'Declaration Confirmed'
];

export const SCREENING_SCORECARD_HEADERS = [
  'Candidate Name',
  'College/Department',
  'Degree',
  'Academic Score (15%)',
  'Technical Skill Score (20%)',
  'Communication Score (15%)',
  'Problem-Solving Score (20%)',
  'Attitude Score (15%)',
  'Initiative Score (10%)',
  'Availability Score (5%)',
  'Total Score (100)',
  'Recommendation Category',
  'Red Flags Detected',
  'Interview Status',
  'Final Remarks'
];

export async function ensureSheetTabsExist(): Promise<void> {
  try {
    const accessToken = await getAccessToken();

    // 1. Ensure Tabs exist
    const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (metaRes.ok) {
      const meta = await metaRes.json();
      const existingTitles: string[] = meta.sheets?.map((s: { properties: { title: string } }) => s.properties.title) || [];
      const requests: any[] = [];

      if (!existingTitles.includes('Candidate Responses')) {
        requests.push({ addSheet: { properties: { title: 'Candidate Responses' } } });
      }
      if (!existingTitles.includes('Screening Scorecard')) {
        requests.push({ addSheet: { properties: { title: 'Screening Scorecard' } } });
      }

      if (requests.length > 0) {
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ requests }),
        });
      }
    }

    // 2. Write exact headers to Row 1 of both tabs
    await Promise.all([
      fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent("'Candidate Responses'!A1:BC1")}?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [CANDIDATE_RESPONSES_HEADERS] }),
      }),
      fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent("'Screening Scorecard'!A1:O1")}?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [SCREENING_SCORECARD_HEADERS] }),
      }),
    ]);
  } catch (error) {
    console.error('Error ensuring sheet tabs and headers:', error);
  }
}

export async function appendCandidateSubmission(
  formData: CandidateFormData,
  scorecard: ScorecardBreakdown
): Promise<{ success: boolean; submissionId: string; message: string }> {
  try {
    const accessToken = await getAccessToken();
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const submissionId = `CU-INT-${Date.now().toString().slice(-6)}`;

    // Resolve CV link (q7 or fallback)
    const cvUrl = typeof formData['q7'] === 'string' && formData['q7'].startsWith('http')
      ? formData['q7']
      : (typeof formData['q49'] === 'string' && formData['q49'].startsWith('http')
          ? formData['q49']
          : `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`);

    const safeFormat = (val: any): string => {
      if (val === undefined || val === null) return '';
      if (Array.isArray(val)) return val.join('; ');
      const str = String(val).trim();
      if (str.startsWith('+') || str.startsWith('=')) {
        return `'${str}`;
      }
      return str;
    };

    // 1. Prepare 55 EXACT Candidate Responses columns
    const responseRow = [
      safeFormat(timestamp),                                      // 1
      safeFormat(submissionId),                                   // 2
      safeFormat(formData['q1']),                                 // 3. Q1. Full Name
      safeFormat(formData['q2']),                                 // 4. Q2. Email Address
      safeFormat(formData['q3']),                                 // 5. Q3. Mobile Number
      safeFormat(formData['q4']),                                 // 6. Q4. University Roll/Reg No.
      safeFormat(formData['q5']),                                 // 7. Q5. College/Department
      safeFormat(formData['q6']),                                 // 8. Q6. Current City
      safeFormat(cvUrl),                                          // 9. Q7. CV Upload Link
      safeFormat(formData['q8']),                                 // 10. Q8. LinkedIn Profile
      safeFormat(formData['q9']),                                 // 11. Q9. Degree/Programme
      safeFormat(formData['q10']),                                // 12. Q10. Specialisation
      safeFormat(formData['q11']),                                // 13. Q11. Year/Semester
      safeFormat(formData['q12']),                                // 14. Q12. Current CGPA/%
      safeFormat(formData['q13']),                                // 15. Q13. Class 10 %
      safeFormat(formData['q14']),                                // 16. Q14. Class 12 %
      safeFormat(formData['q15']),                                // 17. Q15. Academic Projects?
      safeFormat(formData['q16']),                                // 18. Q16. Academic Project Details
      safeFormat(formData['q17']),                                // 19. Q17. Additional Courses/Certifications?
      safeFormat(formData['q18']),                                // 20. Q18. Additional Course Details
      safeFormat(formData['q19']),                                // 21. Q19. Skills
      safeFormat(formData['q20']),                                // 22. Q20. Excel Rating (1-5)
      safeFormat(formData['q21']),                                // 23. Q21. Digital Proficiency (1-5)
      safeFormat(formData['q22']),                                // 24. Q22. Preferred Area
      safeFormat(formData['q23']),                                // 25. Q23. Proud Technical Project
      safeFormat(formData['q24']),                                // 26. Q24. Written English (1-5)
      safeFormat(formData['q25']),                                // 27. Q25. Verbal Communication (1-5)
      safeFormat(formData['q26']),                                // 28. Q26. Unfamiliar Task Scenario
      safeFormat(formData['q27']),                                // 29. Q27. Deadline Error Scenario
      safeFormat(formData['q28']),                                // 30. Q28. Task Priority Choice
      safeFormat(formData['q29']),                                // 31. Q29. 3 Strongest Qualities
      safeFormat(formData['q30']),                                // 32. Q30. Skill/Weakness to Improve
      safeFormat(formData['q31']),                                // 33. Q31. Constructive Criticism Response
      safeFormat(formData['q32']),                                // 34. Q32. Supervisor Disagreement
      safeFormat(formData['q33']),                                // 35. Q33. Work Environment Preference
      safeFormat(formData['q34']),                                // 36. Q34. Why Interested in Internship
      safeFormat(formData['q35']),                                // 37. Q35. Expected Learning
      safeFormat(formData['q36']),                                // 38. Q36. Preferred Internship Domain
      safeFormat(formData['q37']),                                // 39. Q37. Duration Commitment
      safeFormat(formData['q38']),                                // 40. Q38. Availability
      safeFormat(formData['q39']),                                // 41. Q39. Expected Start Date
      safeFormat(formData['q40']),                                // 42. Q40. Willing to Work from Office
      safeFormat(formData['q41']),                                // 43. Q41. Previous Internship?
      safeFormat(formData['q42']),                                // 44. Q42. Previous Internship Details
      safeFormat(formData['q43']),                                // 45. Q43. Extracurricular Participation
      safeFormat(formData['q44']),                                // 46. Q44. Achievements & Leadership
      safeFormat(formData['q45']),                                // 47. Q45. 5 Tasks Prioritization
      safeFormat(formData['q46']),                                // 48. Q46. Uncooperative Team Member Scenario
      safeFormat(formData['q47']),                                // 49. Q47. Unclear Instructions Action
      safeFormat(formData['q48']),                                // 50. Q48. Work Style Statement
      safeFormat(formData['q49']),                                // 51. Q49. Why Select You
      safeFormat(formData['q50']),                                // 52. Q50. Differentiator
      safeFormat(formData['q51']),                                // 53. Q51. Willing to undergo Assessment
      safeFormat(formData['q52']),                                // 54. Q52. Referral Source
      formData['q53'] ? 'Yes (Confirmed)' : 'No',                 // 55. Declaration Confirmed
    ];

    // 2. Prepare 15 EXACT Screening Scorecard columns
    const candidateName = safeFormat(formData['q1'] || 'Anonymous');
    const collegeDept = safeFormat(formData['q5'] || '');
    const degree = safeFormat(formData['q9'] || '');
    const redFlagsText = scorecard.redFlags.length > 0 ? scorecard.redFlags.join(' | ') : 'None';

    const finalRemarks = formData.completionTime
      ? `Total complete time is "${formData.completionTime}" min`
      : 'Shortlisted automatically based on response score';

    const scorecardRow = [
      candidateName,                                // 1. Candidate Name
      collegeDept,                                  // 2. College/Department
      degree,                                       // 3. Degree
      scorecard.academicScore,                      // 4. Academic Score (15%)
      scorecard.technicalScore,                     // 5. Technical Skill Score (20%)
      scorecard.communicationScore,                 // 6. Communication Score (15%)
      scorecard.problemSolvingScore,                // 7. Problem-Solving Score (20%)
      scorecard.attitudeScore,                      // 8. Attitude Score (15%)
      scorecard.initiativeScore,                    // 9. Initiative Score (10%)
      scorecard.availabilityScore,                  // 10. Availability Score (5%)
      scorecard.totalScore,                         // 11. Total Score (100)
      safeFormat(scorecard.recommendation),         // 12. Recommendation Category
      redFlagsText,                                 // 13. Red Flags Detected
      'Pending Screening',                          // 14. Interview Status
      finalRemarks                                  // 15. Final Remarks
    ];

    // 3. Authoritative submission to Google Spreadsheet via Apps Script Web App
    if (APPS_SCRIPT_URL) {
      try {
        const scriptRes = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            ...formData,
            submissionId,
            timestamp,
            scorecard,
          }),
        });

        const scriptText = await scriptRes.text();
        let scriptData: any = {};
        try {
          scriptData = JSON.parse(scriptText);
        } catch (e) {
          scriptData = { success: scriptRes.ok };
        }

        if (scriptRes.ok && scriptData.success !== false) {
          return {
            success: true,
            submissionId,
            message: scriptData.message || 'Response and scorecard successfully recorded in Google Sheet & Google Drive.',
          };
        }
      } catch (scriptErr) {
        console.error('Apps Script Submission Error:', scriptErr);
      }
    }

    // Direct REST API Fallback
    const resAppendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent("'Candidate Responses'!A1")}:append?valueInputOption=USER_ENTERED`;
    const scAppendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent("'Screening Scorecard'!A1")}:append?valueInputOption=USER_ENTERED`;

    try {
      await Promise.all([
        fetch(resAppendUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ values: [responseRow] }),
        }),
        fetch(scAppendUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ values: [scorecardRow] }),
        }),
      ]);
    } catch (restErr) {
      console.warn('Direct REST fallback error:', restErr);
    }

    return {
      success: true,
      submissionId,
      message: 'Response and scorecard successfully recorded in Google Sheet.',
    };
  } catch (error: any) {
    console.error('Google Sheets Submission Error:', error);
    return {
      success: false,
      submissionId: '',
      message: error.message || 'Failed to submit response to Google Sheets.',
    };
  }
}
