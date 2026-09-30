import { Course, ScheduleBlock } from '../types';

export const DAY_NAMES_ES = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

export const DAY_SHORT_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/**
 * Returns 1 (Monday) through 7 (Sunday) for a Date object
 */
export function getDayOfWeek1to7(date: Date): number {
  const day = date.getDay(); // 0 is Sunday, 1 is Monday
  return day === 0 ? 7 : day;
}

/**
 * Convert "HH:mm" to minutes from start of day
 */
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Check if two time intervals overlap on the same day
 */
export function doBlocksOverlap(a: ScheduleBlock, b: ScheduleBlock): boolean {
  if (a.dayOfWeek !== b.dayOfWeek) return false;
  const startA = timeToMinutes(a.startTime);
  const endA = timeToMinutes(a.endTime);
  const startB = timeToMinutes(b.startTime);
  const endB = timeToMinutes(b.endTime);

  return startA < endB && startB < endA;
}

/**
 * Detect all conflicts between schedule blocks across all courses
 */
export function findScheduleConflicts(courses: Course[]): {
  blockA: ScheduleBlock;
  courseA: Course;
  blockB: ScheduleBlock;
  courseB: Course;
}[] {
  const allBlocks: { block: ScheduleBlock; course: Course }[] = [];
  for (const course of courses) {
    for (const block of course.schedule || []) {
      allBlocks.push({ block, course });
    }
  }

  const conflicts: {
    blockA: ScheduleBlock;
    courseA: Course;
    blockB: ScheduleBlock;
    courseB: Course;
  }[] = [];

  for (let i = 0; i < allBlocks.length; i++) {
    for (let j = i + 1; j < allBlocks.length; j++) {
      const itemA = allBlocks[i];
      const itemB = allBlocks[j];
      if (itemA.block.id !== itemB.block.id && doBlocksOverlap(itemA.block, itemB.block)) {
        conflicts.push({
          blockA: itemA.block,
          courseA: itemA.course,
          blockB: itemB.block,
          courseB: itemB.course,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Finds the upcoming next class for a specific course or across all courses
 */
export function getNextClass(
  courses: Course[],
  targetCourseId?: string,
  now: Date = new Date()
): {
  course: Course;
  block: ScheduleBlock;
  dayName: string;
  dayShort: string;
  timeStr: string;
  isToday: boolean;
} | null {
  const currentDay = getDayOfWeek1to7(now); // 1-7
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let candidateCourses = courses;
  if (targetCourseId) {
    candidateCourses = courses.filter((c) => c.id === targetCourseId);
  }

  let bestNext: {
    course: Course;
    block: ScheduleBlock;
    daysAhead: number;
    minutesFromNow: number;
  } | null = null;

  for (const course of candidateCourses) {
    for (const block of course.schedule || []) {
      let daysAhead = (block.dayOfWeek - currentDay + 7) % 7;
      const blockStartMinutes = timeToMinutes(block.startTime);

      if (daysAhead === 0 && blockStartMinutes <= currentMinutes) {
        daysAhead = 7;
      }

      const totalMinutesAhead = daysAhead * 24 * 60 + blockStartMinutes;

      if (!bestNext || totalMinutesAhead < bestNext.minutesFromNow) {
        bestNext = {
          course,
          block,
          daysAhead,
          minutesFromNow: totalMinutesAhead,
        };
      }
    }
  }

  if (!bestNext) return null;

  const dayIndex = bestNext.block.dayOfWeek - 1;
  return {
    course: bestNext.course,
    block: bestNext.block,
    dayName: DAY_NAMES_ES[dayIndex] || 'Lunes',
    dayShort: DAY_SHORT_ES[dayIndex] || 'Lun',
    timeStr: bestNext.block.startTime,
    isToday: bestNext.daysAhead === 0,
  };
}
