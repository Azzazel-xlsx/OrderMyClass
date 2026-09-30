import { CourseColor } from '../types';

export interface ColorScheme {
  bg: string;
  bgLight: string;
  bgLightDark: string;
  border: string;
  text: string;
  badge: string;
  gradientText: string;
  hex: string;
}

export const COURSE_COLORS: Record<CourseColor, ColorScheme> = {
  blue: {
    bg: 'bg-blue-600',
    bgLight: 'bg-blue-50',
    bgLightDark: 'dark:bg-blue-950/40',
    border: 'border-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-500 text-white',
    gradientText: 'from-blue-600 to-blue-500',
    hex: '#2563eb',
  },
  green: {
    bg: 'bg-emerald-600',
    bgLight: 'bg-emerald-50',
    bgLightDark: 'dark:bg-emerald-950/40',
    border: 'border-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-500 text-white',
    gradientText: 'from-emerald-600 to-emerald-500',
    hex: '#059669',
  },
  orange: {
    bg: 'bg-amber-600',
    bgLight: 'bg-amber-50',
    bgLightDark: 'dark:bg-amber-950/40',
    border: 'border-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-500 text-white',
    gradientText: 'from-amber-600 to-amber-500',
    hex: '#d97706',
  },
  purple: {
    bg: 'bg-purple-600',
    bgLight: 'bg-purple-50',
    bgLightDark: 'dark:bg-purple-950/40',
    border: 'border-purple-500',
    text: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-500 text-white',
    gradientText: 'from-purple-600 to-purple-500',
    hex: '#9333ea',
  },
  rose: {
    bg: 'bg-rose-600',
    bgLight: 'bg-rose-50',
    bgLightDark: 'dark:bg-rose-950/40',
    border: 'border-rose-500',
    text: 'text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-500 text-white',
    gradientText: 'from-rose-600 to-rose-500',
    hex: '#e11d48',
  },
  amber: {
    bg: 'bg-yellow-600',
    bgLight: 'bg-yellow-50',
    bgLightDark: 'dark:bg-yellow-950/40',
    border: 'border-yellow-500',
    text: 'text-yellow-600 dark:text-yellow-400',
    badge: 'bg-yellow-500 text-white',
    gradientText: 'from-yellow-600 to-yellow-500',
    hex: '#ca8a04',
  },
};
