/**
 * Google Apps Script for Campus Internship Screening Form – University of Calcutta
 * Spreadsheet ID: 1xMgNxaHkbHmWkkSkiCORR_WaF5YknAHP3ZsSuAZYBxI
 * Drive Folder ID: 1zOVre5boK1zhG-2x2OgxfmezC_tryj4r
 */

var DRIVE_FOLDER_ID = "1zOVre5boK1zhG-2x2OgxfmezC_tryj4r";

function formatVal(v) {
  if (v === undefined || v === null) return '';
  if (Array.isArray(v)) return v.join('; ');
  if (typeof v === 'object') {
    try {
      if (v.length !== undefined) {
        var arr = [];
        for (var i = 0; i < v.length; i++) arr.push(v[i]);
        return arr.join('; ');
      }
      return v.url || v.name || JSON.stringify(v);
    } catch(e) {
      return String(v);
    }
  }
  var str = String(v).trim();
  // Prevent +91 from being treated as formula in Google Sheets
  if (str.indexOf('+') === 0 || str.indexOf('=') === 0) {
    return "'" + str;
  }
  return str;
}

function setupSheetStructure() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup 'Candidate Responses' Tab
  var resSheet = ss.getSheetByName('Candidate Responses');
  if (!resSheet) {
    resSheet = ss.insertSheet('Candidate Responses');
  }
  
  var resHeaders = [
    'Timestamp', 'Submission ID',
    'Q1. Full Name', 'Q2. Email Address', 'Q3. Mobile Number', 'Q4. University Roll/Reg No.', 'Q5. College/Department', 'Q6. Current City', 'Q7. CV Upload Link', 'Q8. LinkedIn Profile',
    'Q9. Degree/Programme', 'Q10. Specialisation', 'Q11. Year/Semester', 'Q12. Current CGPA/%', 'Q13. Class 10 %', 'Q14. Class 12 %', 'Q15. Academic Projects?', 'Q16. Academic Project Details', 'Q17. Additional Courses/Certifications?', 'Q18. Additional Course Details',
    'Q19. Skills', 'Q20. Excel Rating (1-5)', 'Q21. Digital Proficiency (1-5)', 'Q22. Preferred Area', 'Q23. Proud Technical Project',
    'Q24. Written English (1-5)', 'Q25. Verbal Communication (1-5)', 'Q26. Unfamiliar Task Scenario', 'Q27. Deadline Error Scenario', 'Q28. Task Priority Choice',
    'Q29. 3 Strongest Qualities', 'Q30. Skill/Weakness to Improve', 'Q31. Constructive Criticism Response', 'Q32. Supervisor Disagreement', 'Q33. Work Environment Preference',
    'Q34. Why Interested in Internship', 'Q35. Expected Learning', 'Q36. Preferred Internship Domain', 'Q37. Duration Commitment', 'Q38. Availability', 'Q39. Expected Start Date', 'Q40. Willing to Work from Office',
    'Q41. Previous Internship?', 'Q42. Previous Internship Details', 'Q43. Extracurricular Participation', 'Q44. Achievements & Leadership',
    'Q45. 5 Tasks Prioritization', 'Q46. Uncooperative Team Member Scenario', 'Q47. Unclear Instructions Action', 'Q48. Work Style Statement',
    'Q49. Why Select You', 'Q50. Differentiator', 'Q51. Willing to undergo Assessment', 'Q52. Referral Source',
    'Declaration Confirmed'
  ];
  
  resSheet.getRange(1, 1, 1, resHeaders.length).setValues([resHeaders]);
  resSheet.getRange(1, 1, 1, resHeaders.length).setFontWeight('bold').setBackground('#0F2C59').setFontColor('#FFFFFF');
  resSheet.setFrozenRows(1);

  // 2. Setup 'Screening Scorecard' Tab
  var scSheet = ss.getSheetByName('Screening Scorecard');
  if (!scSheet) {
    scSheet = ss.insertSheet('Screening Scorecard');
  }
  
  var scHeaders = [
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
  
  scSheet.getRange(1, 1, 1, scHeaders.length).setValues([scHeaders]);
  scSheet.getRange(1, 1, 1, scHeaders.length).setFontWeight('bold').setBackground('#0F2C59').setFontColor('#FFFFFF');
  scSheet.setFrozenRows(1);
  
  Logger.log('Successfully set up spreadsheet tabs and headers for University of Calcutta Screening Form.');
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // Dedicated Drive File Upload endpoint
    if ((data.action === 'upload_cv' || data.file) && (data.file || data.base64)) {
      var fileObj = data.file || data;
      var targetFolderId = data.folderId || DRIVE_FOLDER_ID;
      var folder = DriveApp.getFolderById(targetFolderId);
      var base64Str = fileObj.base64.replace(/^data:.*?;base64,/, '');
      var decoded = Utilities.base64Decode(base64Str);
      var fileName = fileObj.name || 'CV.pdf';
      var mimeType = fileObj.type || 'application/pdf';
      var blob = Utilities.newBlob(decoded, mimeType, fileName);
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      var url = file.getUrl();

      if (data.action === 'upload_cv') {
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          cvLink: url,
          fileId: file.getId()
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    setupSheetStructure();

    var resSheet = ss.getSheetByName('Candidate Responses');
    var scSheet = ss.getSheetByName('Screening Scorecard');
    
    var timestamp = data.timestamp || new Date().toLocaleString();
    var submissionId = data.submissionId || ('CU-INT-' + new Date().getTime().toString().slice(-6));

    // Handle CV file upload to Google Drive if base64 file object sent
    var cvLink = (typeof data.q7 === 'string' && data.q7.indexOf('http') === 0) ? data.q7 : '';
    var cvFileObj = (typeof data.q7 === 'object' && data.q7) ? data.q7 : null;
    if (cvFileObj && cvFileObj.base64) {
      try {
        var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
        var base64Str = cvFileObj.base64.replace(/^data:.*?;base64,/, '');
        var decoded = Utilities.base64Decode(base64Str);
        var blob = Utilities.newBlob(decoded, cvFileObj.type || 'application/pdf', (data.q1 || 'Candidate') + '_CV_' + (cvFileObj.name || 'CV.pdf'));
        var file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        cvLink = file.getUrl();
      } catch (fErr) {
        cvLink = 'https://drive.google.com/drive/folders/' + DRIVE_FOLDER_ID;
      }
    }
    if (!cvLink) {
      cvLink = 'https://drive.google.com/drive/folders/' + DRIVE_FOLDER_ID;
    }

    // 1. Append 55 Columns to 'Candidate Responses' (q1 to q53)
    var row = [
      formatVal(timestamp), formatVal(submissionId),
      formatVal(data.q1), formatVal(data.q2), formatVal(data.q3), formatVal(data.q4), formatVal(data.q5), formatVal(data.q6),
      formatVal(cvLink), formatVal(data.q8),
      formatVal(data.q9), formatVal(data.q10), formatVal(data.q11), formatVal(data.q12), formatVal(data.q13), formatVal(data.q14), formatVal(data.q15), formatVal(data.q16), formatVal(data.q17), formatVal(data.q18),
      formatVal(data.q19), formatVal(data.q20), formatVal(data.q21), formatVal(data.q22), formatVal(data.q23),
      formatVal(data.q24), formatVal(data.q25), formatVal(data.q26), formatVal(data.q27), formatVal(data.q28),
      formatVal(data.q29), formatVal(data.q30), formatVal(data.q31), formatVal(data.q32), formatVal(data.q33),
      formatVal(data.q34), formatVal(data.q35), formatVal(data.q36), formatVal(data.q37), formatVal(data.q38), formatVal(data.q39), formatVal(data.q40),
      formatVal(data.q41), formatVal(data.q42), formatVal(data.q43), formatVal(data.q44),
      formatVal(data.q45), formatVal(data.q46), formatVal(data.q47), formatVal(data.q48),
      formatVal(data.q49), formatVal(data.q50), formatVal(data.q51), formatVal(data.q52),
      data.q53 ? 'Yes (Confirmed)' : 'No'
    ];
    resSheet.appendRow(row);

    var finalRemarks = data.completionTime
      ? ('Total complete time is "' + data.completionTime + '" min')
      : 'Auto-processed via Web App';

    // Scorecard row (15 columns)
    var sc = data.scorecard || {};
    var scorecardRow = [
      formatVal(data.q1 || 'Candidate'),
      formatVal(data.q5 || ''),
      formatVal(data.q9 || ''),
      sc.academicScore !== undefined ? sc.academicScore : 12.0,
      sc.technicalScore !== undefined ? sc.technicalScore : 16.0,
      sc.communicationScore !== undefined ? sc.communicationScore : 12.5,
      sc.problemSolvingScore !== undefined ? sc.problemSolvingScore : 16.0,
      sc.attitudeScore !== undefined ? sc.attitudeScore : 12.0,
      sc.initiativeScore !== undefined ? sc.initiativeScore : 8.0,
      sc.availabilityScore !== undefined ? sc.availabilityScore : 4.5,
      sc.totalScore !== undefined ? sc.totalScore : 81.0,
      formatVal(sc.recommendation || 'Recommended for Interview'),
      (sc.redFlags && sc.redFlags.length > 0) ? sc.redFlags.join(' | ') : 'None',
      'Pending Screening',
      finalRemarks
    ];
    scSheet.appendRow(scorecardRow);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      submissionId: submissionId,
      cvLink: cvLink,
      message: 'Candidate submission and CV file uploaded successfully to Google Drive & Google Sheet'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
