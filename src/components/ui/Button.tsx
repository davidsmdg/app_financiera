import React from 'react';
import { cn } from '../../lib/utils';
import type { ButtonProps } from './Button.types';

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  active = false,
  fullWidth = false,
  icon,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer tracking-wide";

  const sizeStyles = {
    sm: "px-4 py-2 text-xs rounded-full gap-1.5",
    md: "px-6 py-3.5 text-sm rounded-full gap-2",
    lg: "px-8 py-4 text-base font-bold rounded-full gap-2.5 uppercase tracking-wider", // Estilo exacto "CHECKOUT"
    icon: "w-11 h-11 rounded-full p-2.5 flex items-center justify-center",
  };

  const variantStyles = {
    // Botón violeta sólido redondeado con sombra suave (CHECKOUT en Referente 1)
    primary: "bg-[#7b52c9] text-white hover:bg-[#6f47be] shadow-btn-primary hover:shadow-lg",
    // Botón blanco flotante con sombra suave
    secondary: "bg-white text-[#2a2542] hover:bg-slate-50 shadow-card-soft border border-slate-100/60",
    // Cápsula pastel / tag suave
    accent: "bg-[#ede9fe] text-[#7b52c9] hover:bg-[#ddd6fe]",
    // Botón transparente
    ghost: "bg-transparent text-[#5e5977] hover:bg-white/60 active:bg-white/80",
    // Pill tab del referente 1
    'pill-tab': active 
      ? "bg-[#7b52c9] text-white shadow-card-soft font-bold"
      : "bg-white text-[#7c7694] hover:text-[#2a2542] shadow-sm border border-slate-100/50",
  };

  return (
    <button
      className={cn(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
