import { CandidateFormData, ScorecardBreakdown } from './types';

export function calculateCandidateScorecard(formData: CandidateFormData): ScorecardBreakdown {
  const redFlags: string[] = [];

  // Helper to get string value
  const getStr = (key: string): string => {
    const val = formData[key];
    if (typeof val === 'string') return val.trim();
    if (Array.isArray(val)) return val.join(', ');
    return '';
  };

  // Helper to get array value
  const getArr = (key: string): string[] => {
    const val = formData[key];
    if (Array.isArray(val)) return val as string[];
    if (typeof val === 'string' && val.length > 0) return val.split(', ');
    return [];
  };

  // Helper to convert scale rating 1-5 to percentage 0-100
  const getScaleVal = (key: string): number => {
    const num = parseInt(getStr(key), 10);
    if (isNaN(num)) return 60;
    return (num / 5) * 100;
  };

  // 1. ACADEMIC SCORE (Weight: 15%)
  let academicPct = 70;
  const cgpaStr = getStr('q12');
  const cgpaMatch = cgpaStr.match(/(\d+(\.\d+)?)/);
  if (cgpaMatch) {
    const val = parseFloat(cgpaMatch[1]);
    if (val <= 10) {
      if (val >= 9.0) academicPct = 100;
      else if (val >= 8.0) academicPct = 85;
      else if (val >= 7.0) academicPct = 75;
      else if (val >= 6.0) academicPct = 65;
      else academicPct = 50;
    } else {
      if (val >= 90) academicPct = 100;
      else if (val >= 80) academicPct = 85;
      else if (val >= 70) academicPct = 75;
      else if (val >= 60) academicPct = 65;
      else academicPct = 50;
    }
  }
  const academicProj = getStr('q15');
  const projDesc = getStr('q16');
  if (academicProj.toLowerCase() === 'yes' && projDesc.length > 20) {
    academicPct = Math.min(100, academicPct + 10);
  } else if (academicProj.toLowerCase() === 'yes' && projDesc.length < 15) {
    redFlags.push('Inability to explain academic projects clearly');
  }

  const additionalCourses = getStr('q17');
  const coursesDesc = getStr('q18');
  if (additionalCourses.toLowerCase() === 'yes' && coursesDesc.length > 10) {
    academicPct = Math.min(100, academicPct + 10);
  }
  const academicScore = Math.round((academicPct * 0.15) * 10) / 10;

  // 2. TECHNICAL / FUNCTIONAL SKILLS SCORE (Weight: 20%)
  const selectedSkills = getArr('q19');
  const excelProf = getScaleVal('q20');
  const digitalProf = getScaleVal('q21');
  const proudProj = getStr('q23');
  
  let skillCountBonus = Math.min(100, (selectedSkills.length / 8) * 100);
  let proudProjBonus = proudProj.length >= 30 ? 90 : 40;
  if (proudProj.length < 20) {
    redFlags.push('Inability to explain technical/personal project');
  }
  
  const techPct = (excelProf * 0.3) + (digitalProf * 0.25) + (skillCountBonus * 0.25) + (proudProjBonus * 0.2);
  const technicalScore = Math.round((techPct * 0.20) * 10) / 10;

  // 3. COMMUNICATION SCORE (Weight: 15%)
  const writtenEng = getScaleVal('q24');
  const verbalComm = getScaleVal('q25');
  const unfamiliarTask = getStr('q26');
  const deadlineError = getStr('q27');

  let writtenQuality = (unfamiliarTask.length > 30 && deadlineError.length > 30) ? 90 : 50;
  if (writtenEng < 60 || verbalComm < 60) {
    redFlags.push('Poor self-rated communication skills');
  }
  if (unfamiliarTask.length < 15 || deadlineError.length < 15) {
    redFlags.push('Very generic / sparse answers to communication scenarios');
  }

  const commPct = (writtenEng * 0.35) + (verbalComm * 0.35) + (writtenQuality * 0.3);
  const communicationScore = Math.round((commPct * 0.15) * 10) / 10;

  // 4. PROBLEM SOLVING SCORE (Weight: 20%)
  let psPct = 70;
  const taskPref = getStr('q28');
  if (taskPref.includes('accurately') || taskPref.includes('quality') || taskPref.includes('thoroughly')) {
    psPct += 15;
  }
  const unclearStep = getStr('q47');
  if (unclearStep.includes('simultaneously research') || unclearStep.includes('Ask for clarification')) {
    psPct += 15;
  } else if (unclearStep.includes('assumptions') || unclearStep.includes('Wait until')) {
    psPct -= 20;
    redFlags.push('Poor problem-solving approach (relies on assumptions or waiting)');
  }
  const teamMemberIssue = getStr('q46');
  if (teamMemberIssue.length < 20) {
    psPct -= 10;
  }
  psPct = Math.max(20, Math.min(100, psPct));
  const problemSolvingScore = Math.round((psPct * 0.20) * 10) / 10;

  // 5. LEARNING ATTITUDE SCORE (Weight: 15%)
  let attitudePct = 75;
  const weaknessAns = getStr('q30');
  if (weaknessAns.length > 25) attitudePct += 10;
  else redFlags.push('Lack of self-improvement reflection / weakness awareness');

  const criticismAns = getStr('q31');
  if (criticismAns.includes('appreciate')) attitudePct += 15;
  else if (criticismAns.includes('difficult')) {
    attitudePct -= 25;
    redFlags.push('Finds criticism difficult to accept');
  }

  const expectationsAns = getStr('q35');
  if (expectationsAns.length < 20) {
    redFlags.push('Unrealistic or vague internship learning expectations');
  }
  attitudePct = Math.max(30, Math.min(100, attitudePct));
  const attitudeScore = Math.round((attitudePct * 0.15) * 10) / 10;

  // 6. LEADERSHIP & INITIATIVE SCORE (Weight: 10%)
  const activities = getArr('q43');
  const achievementDesc = getStr('q44');
  let initPct = 50;

  if (activities.length > 0 && !activities.includes('None')) {
    initPct += Math.min(40, activities.length * 15);
  }
  if (achievementDesc.length > 25) initPct += 20;
  
  if ((activities.length === 0 || activities.includes('None')) && achievementDesc.length < 15) {
    redFlags.push('No evidence of leadership or extracurricular initiative');
  }
  initPct = Math.min(100, initPct);
  const initiativeScore = Math.round((initPct * 0.10) * 10) / 10;

  // 7. INTERNSHIP COMMITMENT SCORE (Weight: 5%)
  let commitPct = 80;
  const duration = getStr('q37');
  const availability = getStr('q38');
  const wfo = getStr('q40');

  if (duration.includes('3 months') || duration.includes('6 months') || duration.includes('8 weeks')) {
    commitPct += 15;
  } else if (duration.includes('4 weeks')) {
    commitPct += 5;
  }
  if (availability.includes('Full-time')) commitPct += 10;
  if (wfo.includes('No')) {
    commitPct -= 30;
    redFlags.push('Limited availability / unwilling to work from office');
  }
  commitPct = Math.max(20, Math.min(100, commitPct));
  const availabilityScore = Math.round((commitPct * 0.05) * 10) / 10;

  // TOTAL SCORE
  const totalScore = Math.round((academicScore + technicalScore + communicationScore + problemSolvingScore + attitudeScore + initiativeScore + availabilityScore) * 10) / 10;

  // RECOMMENDATION CATEGORIES:
  // 85-100: Strongly Recommended
  // 70-84: Recommended for Interview
  // 55-69: Consider / Further Screening
  // Below 55: Not Shortlisted
  let recommendation: 'Strongly Recommended' | 'Recommended for Interview' | 'Consider / Further Screening' | 'Not Shortlisted';
  if (totalScore >= 85) {
    recommendation = 'Strongly Recommended';
  } else if (totalScore >= 70) {
    recommendation = 'Recommended for Interview';
  } else if (totalScore >= 55) {
    recommendation = 'Consider / Further Screening';
  } else {
    recommendation = 'Not Shortlisted';
  }

  return {
    academicScore,
    technicalScore,
    communicationScore,
    problemSolvingScore,
    attitudeScore,
    initiativeScore,
    availabilityScore,
    totalScore,
    recommendation,
    redFlags,
  };
}
