import { Course, Student, SkillType } from '../types';

/**
 * Calculates the weighted average of a single skill for a student.
 * If some sub-grades are empty/null, they are ignored and remaining weights are normalized.
 * Returns null if no sub-grade has a score.
 */
export function calculateSkillScore(
  student: Student,
  course: Course,
  skill: SkillType
): number | null {
  const configs = course.subGradeConfigs[skill];
  if (!configs || configs.length === 0) return null;

  const grades = student.grades[skill] || {};
  let totalWeightedScore = 0;
  let totalActiveWeight = 0;

  for (const config of configs) {
    const rawVal = grades[config.id];
    if (rawVal !== null && rawVal !== undefined && !isNaN(Number(rawVal))) {
      const weight = Number(config.weightPercent) || 0;
      totalWeightedScore += Number(rawVal) * weight;
      totalActiveWeight += weight;
    }
  }

  if (totalActiveWeight === 0) return null;

  const score = totalWeightedScore / totalActiveWeight;
  return Number(score.toFixed(1));
}

/**
 * Calculates the final grade for a student in a course based on skill weights.
 * Normalizes across skills that have at least one score.
 * Returns null if student has no scores in any skill.
 */
export function calculateFinalGrade(
  student: Student,
  course: Course
): number | null {
  const listeningScore = calculateSkillScore(student, course, 'listening');
  const readingScore = calculateSkillScore(student, course, 'reading');
  const speakingScore = calculateSkillScore(student, course, 'speaking');

  const skills: { score: number | null; weight: number }[] = [
    { score: listeningScore, weight: course.skillWeights.listening || 0 },
    { score: readingScore, weight: course.skillWeights.reading || 0 },
    { score: speakingScore, weight: course.skillWeights.speaking || 0 },
  ];

  let totalWeightedScore = 0;
  let totalActiveWeight = 0;

  for (const item of skills) {
    if (item.score !== null) {
      totalWeightedScore += item.score * item.weight;
      totalActiveWeight += item.weight;
    }
  }

  if (totalActiveWeight === 0) return null;

  const finalScore = totalWeightedScore / totalActiveWeight;
  return Number(finalScore.toFixed(1));
}

/**
 * Calculates the average final grade of all students in a course.
 */
export function calculateCourseAverage(
  students: Student[],
  course: Course
): number | null {
  const courseStudents = students.filter((s) => s.courseId === course.id);
  if (courseStudents.length === 0) return null;

  const validGrades: number[] = [];
  for (const student of courseStudents) {
    const grade = calculateFinalGrade(student, course);
    if (grade !== null) {
      validGrades.push(grade);
    }
  }

  if (validGrades.length === 0) return null;
  const sum = validGrades.reduce((acc, val) => acc + val, 0);
  return Number((sum / validGrades.length).toFixed(1));
}

/**
 * Calculates attendance percentage for a single student.
 */
export function calculateStudentAttendance(student: Student): {
  percentage: number;
  presentCount: number;
  totalSessions: number;
} {
  const records = Object.values(student.attendance || {});
  const totalSessions = records.length;
  if (totalSessions === 0) {
    return { percentage: 100, presentCount: 0, totalSessions: 0 };
  }

  const presentCount = records.filter((r) => r === 'present').length;
  const percentage = Math.round((presentCount / totalSessions) * 100);

  return { percentage, presentCount, totalSessions };
}

/**
 * Calculates overall attendance percentage for a course.
 */
export function calculateCourseAttendanceRate(
  students: Student[],
  courseId: string
): number {
  const courseStudents = students.filter((s) => s.courseId === courseId);
  if (courseStudents.length === 0) return 100;

  let totalRecords = 0;
  let totalPresents = 0;

  for (const student of courseStudents) {
    const records = Object.values(student.attendance || {});
    for (const rec of records) {
      totalRecords++;
      if (rec === 'present') totalPresents++;
    }
  }

  if (totalRecords === 0) return 100;
  return Math.round((totalPresents / totalRecords) * 100);
}
