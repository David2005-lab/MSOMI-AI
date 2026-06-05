/**
 * types.ts
 * Type definitions for MSOMI AI academic co-pilot.
 */

export interface StudentProfile {
  name: string;
  university: string;
  course: string;
  year: number; // 1 to 5
  preferredLanguage: 'English' | 'Kiswahili' | 'Sheng' | 'Mixed';
  difficultyLevel: number; // 1 to 5
  learningStyle: 'visual' | 'practical' | 'theoretical' | 'mixed';
  strengths: string;
  interests: string;
  email?: string;
  phone?: string;
}

export type CopilotMode = 'EXPLAIN' | 'EXAM_PREP' | 'ASSIGNMENT_HELP' | 'CAREER' | 'INNOVATION_LAB';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: CopilotMode;
  timestamp: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  category: string;
  difficulty: number;
  questions: QuizQuestion[];
}

export interface InnovationProject {
  id: string;
  title: string;
  problem: string;
  solution: string;
  opportunity: string;
  buildPlan: string;
  toolsNeeded: string;
  risks: string;
  impactMetric: string;
  createdAt: string;
}

export interface StudySession {
  id: string;
  topic: string;
  durationMinutes: number;
  date: string;
  activityType: CopilotMode | 'GENERAL';
}

export interface GroupPost {
  id: string;
  authorName: string;
  content: string;
  timestamp: string;
  likesCount: number;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  membersCount: number;
  isJoined: boolean;
  posts: GroupPost[];
  createdBy: string;
}

export interface TopicTrack {
  id: string;
  name: string;
  status: 'Not Started' | 'In Progress' | 'Complete';
}

export interface CourseTrack {
  id: string;
  code: string;
  name: string;
  targetGrade: string;
  grade?: string;
  topics: TopicTrack[];
  notes?: string;
}

// CV Builder Interfaces
export interface StudentCV {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  summary: string;
  education: {
    institution: string;
    degree: string;
    duration: string;
    gpa?: string;
    achievements?: string;
  };
  skills: string[]; // e.g. "React, SQLite, Business Planning"
  projects: {
    title: string;
    description: string;
    role?: string;
  }[];
  experience: {
    role: string;
    organization: string;
    duration: string;
    responsibilities: string;
  }[];
  references: string;
}

// Reminder Interfaces
export interface AcademicReminder {
  id: string;
  type: 'reminder';
  channel: 'sms' | 'whatsapp';
  phone: string;
  message: string;
  datetime: string; // YYYY-MM-DD HH:MM
  title: string;
  category: 'study' | 'assignment' | 'exam' | 'learning_plan';
  status: 'Pending' | 'Sent';
}

// Smart Planner Interfaces
export interface DailyStudyPlan {
  id: string;
  dayName: string; // e.g. "Jumatatu", "Jumanne" or "Monday"
  timeSlot: string; // e.g. "08:00 - 10:00"
  subject: string;
  activity: string;
  completed: boolean;
}

export interface ExamCountdown {
  id: string;
  subjectCode: string;
  subjectName: string;
  examDate: string; // YYYY-MM-DD
  daysRemaining: number;
}

