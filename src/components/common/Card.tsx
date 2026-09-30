import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'outlined' | 'dashed';
  colorBorder?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  colorBorder,
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const variants = {
    default: 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm',
    flat: 'bg-slate-50 dark:bg-slate-800/60 border border-transparent',
    outlined: 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-750',
    dashed: 'bg-white/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-700',
  };

  return (
    <div
      className={`rounded-3xl transition-colors duration-150 ${variants[variant]} ${paddings[padding]} ${
        colorBorder ? `border-l-4 ${colorBorder}` : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
