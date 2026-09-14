import { FormSection } from './types';

export const FORM_TITLE = "Campus Internship Screening Form – University of Calcutta";
export const FORM_DESCRIPTION = "Thank you for your interest in our internship opportunity. This form is designed to help us understand your academic background, skills, interests, communication ability, problem-solving approach, and internship expectations. Please provide accurate information. Shortlisted candidates may be invited for a personal/virtual interview and further assessment.\nEstimated completion time: 8–10 minutes.";

export const FORM_SECTIONS: FormSection[] = [
  {
    id: 1,
    title: "SECTION 1 – PERSONAL & CONTACT INFORMATION",
    description: "Please provide your primary contact, university details, CV/Resume, and professional profile.",
    questions: [
      { id: "q1", number: 1, label: "Full Name", type: "text", required: true, placeholder: "e.g. Sourav Mukhopadhyay" },
      { id: "q2", number: 2, label: "Email Address", type: "email", required: true, placeholder: "e.g. candidate@example.com", helpText: "Valid email address required for interview communication" },
      { id: "q3", number: 3, label: "Mobile Number", type: "tel", required: true, placeholder: "e.g. +91 98765 43210" },
      { id: "q4", number: 4, label: "University Roll / Registration Number", type: "text", required: true, placeholder: "e.g. CU-104-2024 / 123-1111-0456-22" },
      { id: "q5", number: 5, label: "College / Department / Institute", type: "text", required: true, placeholder: "e.g. Department of Computer Science & Engineering, Rajabazar Science College" },
      { id: "q6", number: 6, label: "Current City", type: "text", required: true, placeholder: "e.g. Kolkata" },
      { id: "q7", number: 7, label: "Upload your latest CV/Resume", type: "file", required: true, helpText: "Accepted formats: PDF, DOC, DOCX (Max size 10MB)" },
      { id: "q8", number: 8, label: "LinkedIn Profile", type: "text", required: false, placeholder: "e.g. https://www.linkedin.com/in/yourprofile" }
    ]
  },
  {
    id: 2,
    title: "SECTION 2 – ACADEMIC PROFILE",
    description: "Details regarding your degree, specialization, academic records, and certifications.",
    questions: [
      {
        id: "q9", number: 9, label: "Degree / Programme", type: "radio", required: true,
        options: ["B.Tech / B.E.", "B.Com", "BBA", "B.Sc.", "B.A.", "M.Tech / M.E.", "M.Com", "MBA", "M.Sc.", "Other"]
      },
      { id: "q10", number: 10, label: "Specialisation / Major", type: "text", required: true, placeholder: "e.g. Chemical Engineering, Computer Science, Finance" },
      {
        id: "q11", number: 11, label: "Current Year / Semester", type: "radio", required: true,
        options: ["1st Year", "2nd Year", "3rd Year", "4th Year", "Final Year", "Postgraduate"]
      },
      { id: "q12", number: 12, label: "Current CGPA / Percentage", type: "text", required: true, placeholder: "e.g. 8.64 CGPA or 84.5%" },
      { id: "q13", number: 13, label: "Class 10 Percentage", type: "text", required: false, placeholder: "e.g. 88.4%" },
      { id: "q14", number: 14, label: "Class 12 Percentage", type: "text", required: false, placeholder: "e.g. 86.2%" },
      {
        id: "q15", number: 15, label: "Have you completed any relevant academic projects?", type: "radio", required: true,
        options: ["Yes", "No"]
      },
      {
        id: "q16", number: 16, label: "If yes, briefly describe your most relevant project.", type: "paragraph", required: false,
        condition: { field: "q15", value: "Yes" },
        maxWords: 150, placeholder: "Describe project scope, tools used, and key outcome..."
      },
      {
        id: "q17", number: 17, label: "Have you completed any additional courses or certifications?", type: "radio", required: true,
        options: ["Yes", "No"]
      },
      {
        id: "q18", number: 18, label: "If yes, please list the course name(s), institute/platform, and key skills learned.", type: "paragraph", required: false,
        condition: { field: "q17", value: "Yes" },
        maxWords: 150, placeholder: "e.g. Full Stack Web Development (Coursera), Advanced Financial Modeling (Udemy), Data Analytics with Python..."
      }
    ]
  },
  {
    id: 3,
    title: "SECTION 3 – SKILLS & TECHNICAL APTITUDE",
    description: "Assessment of technical, analytical, and functional competencies.",
    questions: [
      {
        id: "q19", number: 19, label: "Which skills do you currently possess?", type: "checkbox", required: true,
        options: ["MS Excel", "MS Word", "PowerPoint", "Data Analysis", "AutoCAD", "SolidWorks", "Python", "SQL", "Digital Marketing", "Social Media Management", "Accounting", "Business Research", "Communication", "Presentation", "Project Management", "Other"]
      },
      {
        id: "q20", number: 20, label: "Rate your proficiency in Microsoft Excel.", type: "scale", required: true,
        scaleMinLabel: "Beginner", scaleMaxLabel: "Advanced"
      },
      {
        id: "q21", number: 21, label: "Rate your overall computer/digital proficiency.", type: "scale", required: true,
        scaleMinLabel: "Basic", scaleMaxLabel: "Expert"
      },
      {
        id: "q22", number: 22, label: "Which area interests you most?", type: "radio", required: true,
        options: ["Engineering / Manufacturing", "Sales & Marketing", "Finance & Accounts", "Human Resources", "Business Development", "Procurement", "Operations", "Research & Analysis", "Digital Marketing", "Administration", "Other"]
      },
      {
        id: "q23", number: 23, label: "Describe one technical, academic, or personal project that you are particularly proud of.", type: "paragraph", required: true,
        maxWords: 200, placeholder: "Detail the problem solved, methodology, personal contribution, and results achieved..."
      }
    ]
  },
  {
    id: 4,
    title: "SECTION 4 – COMMUNICATION & PROBLEM SOLVING",
    description: "Evaluation of articulation skills and analytical problem-solving approach.",
    questions: [
      {
        id: "q24", number: 24, label: "How would you rate your written English communication?", type: "scale", required: true,
        scaleMinLabel: "Needs Improvement", scaleMaxLabel: "Fluent / Professional"
      },
      {
        id: "q25", number: 25, label: "How would you rate your verbal communication?", type: "scale", required: true,
        scaleMinLabel: "Needs Improvement", scaleMaxLabel: "Fluent / Professional"
      },
      {
        id: "q26", number: 26, label: "Write a short response: \"You are given a task that you have never performed before and nobody is immediately available to guide you. What would you do?\"", type: "paragraph", required: true,
        maxWords: 150, placeholder: "Explain your initial steps, research process, resourcefulness, and execution plan..."
      },
      {
        id: "q27", number: 27, label: "A project deadline is tomorrow, but you realise that an important part of your work contains an error. What would you do?", type: "paragraph", required: true,
        maxWords: 150, placeholder: "Explain how you handle pressure, correct mistakes, communicate with team/supervisor..."
      },
      {
        id: "q28", number: 28, label: "What is more important to you when completing an assigned task?", type: "radio", required: true,
        options: [
          "Completing it as quickly as possible",
          "Completing it accurately",
          "Understanding the task thoroughly",
          "Meeting expectations while maintaining quality",
          "Asking for help whenever there is uncertainty"
        ]
      }
    ]
  },
  {
    id: 5,
    title: "SECTION 5 – ATTITUDE & WORKPLACE BEHAVIOUR",
    description: "Understanding your work ethic, adaptability, self-awareness, and team dynamics.",
    questions: [
      { id: "q29", number: 29, label: "What are your three strongest qualities?", type: "paragraph", required: true, placeholder: "e.g. 1. Attention to detail, 2. Fast learner, 3. Team collaboration" },
      { id: "q30", number: 30, label: "What is one skill or weakness you are currently working to improve?", type: "paragraph", required: true, placeholder: "Describe the area of growth and steps you are actively taking..." },
      {
        id: "q31", number: 31, label: "How do you respond to constructive criticism?", type: "radio", required: true,
        options: [
          "I appreciate it and try to improve",
          "I listen but may need time to process it",
          "I prefer feedback only when necessary",
          "I find criticism difficult to accept"
        ]
      },
      {
        id: "q32", number: 32, label: "If you disagree with your supervisor’s approach to a task, what would you do?", type: "paragraph", required: true,
        maxWords: 150, placeholder: "Explain your communication approach, respect for hierarchy, and professional discussion style..."
      },
      {
        id: "q33", number: 33, label: "What type of work environment helps you perform at your best?", type: "radio", required: true,
        options: [
          "Highly structured",
          "Fast-paced",
          "Collaborative",
          "Independent",
          "Learning-oriented",
          "A combination of the above"
        ]
      }
    ]
  },
  {
    id: 6,
    title: "SECTION 6 – INTERNSHIP INTEREST & AVAILABILITY",
    description: "Assessing motivation, alignment, and logistics.",
    questions: [
      { id: "q34", number: 34, label: "Why are you interested in this internship?", type: "paragraph", required: true, maxWords: 200, placeholder: "Share your career aspirations and interest in engineering/manufacturing/business..." },
      { id: "q35", number: 35, label: "What do you expect to learn during this internship?", type: "paragraph", required: true, maxWords: 150, placeholder: "Mention specific skills or domain knowledge you aim to acquire..." },
      {
        id: "q36", number: 36, label: "Preferred internship area", type: "radio", required: true,
        options: ["Technical", "Commercial", "Marketing", "Finance", "HR", "Operations", "Business Development", "Research", "Open to any suitable opportunity"]
      },
      {
        id: "q37", number: 37, label: "Internship duration you can commit to:", type: "radio", required: true,
        options: ["4 weeks", "6 weeks", "8 weeks", "3 months", "6 months", "Other"]
      },
      {
        id: "q38", number: 38, label: "Availability:", type: "radio", required: true,
        options: ["Full-time", "Part-time", "Flexible"]
      },
      { id: "q39", number: 39, label: "Expected internship start date", type: "date", required: true },
      {
        id: "q40", number: 40, label: "Are you willing to work from the office if required?", type: "radio", required: true,
        options: ["Yes", "No", "Depends on location/timing"]
      }
    ]
  },
  {
    id: 7,
    title: "SECTION 7 – EXPERIENCE & ACHIEVEMENTS",
    description: "Past exposure, student leadership, and extracurricular initiatives.",
    questions: [
      {
        id: "q41", number: 41, label: "Have you previously completed an internship?", type: "radio", required: true,
        options: ["Yes", "No"]
      },
      {
        id: "q42", number: 42, label: "If yes, provide details of your previous internship.", type: "paragraph", required: false,
        condition: { field: "q41", value: "Yes" },
        placeholder: "Company name, role, duration, and key deliverables..."
      },
      {
        id: "q43", number: 43, label: "Have you participated in any of the following?", type: "checkbox", required: true,
        options: ["College societies", "Student leadership", "Entrepreneurship", "Sports", "Cultural activities", "Technical competitions", "Case competitions", "Hackathons", "Volunteering", "Events/Organising committees", "None"]
      },
      { id: "q44", number: 44, label: "Mention any achievement, certification, competition, leadership role, or extracurricular activity that demonstrates your initiative.", type: "paragraph", required: true, maxWords: 200, placeholder: "Highlight leadership roles, awards, professional certifications, or organized events..." }
    ]
  },
  {
    id: 8,
    title: "SECTION 8 – SITUATIONAL SCREENING QUESTIONS",
    description: "Evaluating real-world decision making and adaptability under realistic workplace constraints.",
    questions: [
      { id: "q45", number: 45, label: "You are assigned five tasks with the same deadline. How would you prioritise them?", type: "paragraph", required: true, placeholder: "Describe your framework (e.g. urgency vs impact, consulting supervisor, creating a checklist)..." },
      { id: "q46", number: 46, label: "Your team member is not completing their portion of a project and the deadline is approaching. What would you do?", type: "paragraph", required: true, placeholder: "Explain how you communicate with peers, offer support, reallocate tasks, or escalate constructively..." },
      {
        id: "q47", number: 47, label: "You receive an assignment with unclear instructions. What is your first step?", type: "radio", required: true,
        options: [
          "Start working based on assumptions",
          "Ask for clarification",
          "Wait until someone explains it",
          "Search online and complete it independently",
          "Ask for clarification and simultaneously research the topic"
        ]
      },
      {
        id: "q48", number: 48, label: "Which statement best describes you?", type: "radio", required: true,
        options: [
          "I prefer clear instructions",
          "I can work independently once objectives are clear",
          "I enjoy solving problems without being told exactly how",
          "I prefer working closely with a team",
          "I can adapt to different working styles"
        ]
      }
    ]
  },
  {
    id: 9,
    title: "SECTION 9 – FINAL SCREENING",
    description: "Value proposition, uniqueness, and referral reference source.",
    questions: [
      { id: "q49", number: 49, label: "Why should we select you for this internship?", type: "paragraph", required: true, maxWords: 150, placeholder: "Summarize your strengths, enthusiasm, and potential contribution..." },
      { id: "q50", number: 50, label: "What differentiates you from other students applying for this opportunity?", type: "paragraph", required: true, maxWords: 150, placeholder: "Highlight your unique blend of academic background, skills, or attitude..." },
      {
        id: "q51", number: 51, label: "Are you willing to undergo an interview and/or skill assessment as part of the selection process?", type: "radio", required: true,
        options: ["Yes", "No"]
      },
      {
        id: "q52", number: 52, label: "How did you hear about this internship?", type: "radio", required: true,
        options: ["University/College placement cell", "Campus interaction", "Faculty", "LinkedIn", "Friend/Peer", "Other"]
      }
    ]
  },
  {
    id: 10,
    title: "DECLARATION",
    description: "Final verification and confirmation.",
    questions: [
      {
        id: "q53", number: 53,
        label: "I confirm that the information provided by me is accurate and complete to the best of my knowledge. I understand that providing false or misleading information may result in disqualification from the internship selection process.",
        type: "checkbox", required: true,
        options: ["I agree and confirm"]
      }
    ]
  }
];
