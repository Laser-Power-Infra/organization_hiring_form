export type QuestionType =
  | 'text'
  | 'email'
  | 'tel'
  | 'paragraph'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'scale'
  | 'date'
  | 'file';

export interface FormQuestion {
  id: string;
  number: number;
  label: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  maxWords?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  placeholder?: string;
  helpText?: string;
  condition?: {
    field: string;
    value: any;
  };
}

export interface FormSection {
  id: number;
  title: string;
  description?: string;
  questions: FormQuestion[];
}

export interface CandidateFormData {
  [key: string]: any;
}

export interface ScorecardBreakdown {
  academicScore: number;       // Max 15
  technicalScore: number;      // Max 20
  communicationScore: number;  // Max 15
  problemSolvingScore: number; // Max 20
  attitudeScore: number;       // Max 15
  initiativeScore: number;     // Max 10
  availabilityScore: number;   // Max 5
  totalScore: number;          // Max 100
  recommendation: 'Strongly Recommended' | 'Recommended for Interview' | 'Consider / Further Screening' | 'Not Shortlisted';
  redFlags: string[];
}
