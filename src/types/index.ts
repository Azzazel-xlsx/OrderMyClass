export type CourseColor = 'blue' | 'green' | 'orange' | 'purple' | 'rose' | 'amber';

export interface SubGradeConfig {
  id: string;
  name: string;
  weightPercent: number; // e.g. 50%
}

export interface SkillWeights {
  listening: number; // e.g. 30
  reading: number;   // e.g. 35
  speaking: number;  // e.g. 35
}

export type SkillType = 'listening' | 'reading' | 'speaking';

export interface ScheduleBlock {
  id: string;
  courseId: string;
  dayOfWeek: number; // 1 = Monday, 2 = Tuesday, ..., 7 = Sunday
  startTime: string; // "08:00"
  endTime: string;   // "09:00"
  classroom?: string; // "Aula 204"
}

export interface Course {
  id: string;
  name: string;          // e.g. "English A1"
  level: string;         // e.g. "A1 - Beginner"
  color: CourseColor;    // 'blue' | 'green' | 'orange' | 'purple'
  gradeScale: '10' | '100'; // max grade 10 or 100
  skillWeights: SkillWeights;
  subGradeConfigs: {
    listening: SubGradeConfig[];
    reading: SubGradeConfig[];
    speaking: SubGradeConfig[];
  };
  schedule: ScheduleBlock[];
  createdAt: string;
}

export type AttendanceStatus = 'present' | 'absent';

export interface StudentGradeRecord {
  // skill -> subGradeId -> score (number or null)
  [subGradeId: string]: number | null;
}

export interface GradeHistoryEntry {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  skill: SkillType;
  subGradeName: string;
  oldScore: number | null;
  newScore: number;
  timestamp: string; // ISO string
}

export interface Student {
  id: string;
  courseId: string;
  name: string;
  email?: string;
  avatarSeed?: string;
  // skillType -> subGradeId -> score
  grades: {
    listening: Record<string, number | null>;
    reading: Record<string, number | null>;
    speaking: Record<string, number | null>;
  };
  // date (YYYY-MM-DD) -> status
  attendance: Record<string, AttendanceStatus>;
  notes?: string;
}

export interface CourseAttendanceDay {
  id: string;
  courseId: string;
  date: string; // YYYY-MM-DD
  records: Record<string, AttendanceStatus>; // studentId -> status
  savedAt: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number; // ms
  undoAction?: () => void;
  undoLabel?: string;
}

export type ActiveTab = 'home' | 'courses' | 'schedule' | 'attendance' | 'more';

export type ActiveView = 
  | { type: 'tab'; tab: ActiveTab }
  | { type: 'course-detail'; courseId: string; subTab?: 'students' | 'grades' | 'details' }
  | { type: 'course-grades-config'; courseId: string }
  | { type: 'mass-import'; courseId: string }
  | { type: 'student-profile'; studentId: string; courseId: string }
  | { type: 'attendance-sheet'; courseId: string; date: string }
  | { type: 'attendance-history'; courseId?: string };

export interface TeacherProfile {
  name: string;
  title: string;
  school: string;
  email: string;
}
