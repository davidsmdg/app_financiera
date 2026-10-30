import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'flat' | 'gradient' | 'subtle';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'elevated',
  interactive = false,
  ...props
}) => {
  const baseStyles = "rounded-squircle-xl transition-all duration-200 overflow-hidden relative";

  const variantStyles = {
    elevated: "bg-surface shadow-soft-md border border-slate-100/80 p-5",
    flat: "bg-surface-subtle p-5 border border-slate-100",
    gradient: "bg-gradient-hero text-white p-6 shadow-glow",
    subtle: "bg-white/70 backdrop-blur-md p-5 border border-white/50 shadow-soft",
  };

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        interactive && "cursor-pointer hover:-translate-y-0.5 active:scale-[0.99] hover:shadow-soft-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
