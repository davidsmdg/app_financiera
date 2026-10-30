import React from 'react';
import { cn } from '../../lib/utils';

export interface PastelChipProps {
  label: string;
  icon: React.ReactNode;
  color?: 'pink' | 'blue' | 'amber' | 'purple' | 'coral';
  active?: boolean;
  onClick?: () => void;
}

export const PastelChip: React.FC<PastelChipProps> = ({
  label,
  icon,
  color = 'pink',
  active = false,
  onClick,
}) => {
  const colorMap = {
    pink: {
      bg: "bg-[#fde2e8]",
      text: "text-[#f43f5e]",
      activeRing: "ring-[#f43f5e]/30",
    },
    blue: {
      bg: "bg-[#e0f2fe]",
      text: "text-[#0284c7]",
      activeRing: "ring-[#0284c7]/30",
    },
    amber: {
      bg: "bg-[#fef3c7]",
      text: "text-[#d97706]",
      activeRing: "ring-[#d97706]/30",
    },
    purple: {
      bg: "bg-[#ede9fe]",
      text: "text-[#7c3aed]",
      activeRing: "ring-[#7c3aed]/30",
    },
    coral: {
      bg: "bg-[#ffe4e6]",
      text: "text-[#e11d48]",
      activeRing: "ring-[#e11d48]/30",
    },
  };

  const current = colorMap[color];

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 cursor-pointer select-none transition-all duration-200 active:scale-95 group",
        active && "scale-105"
      )}
    >
      <div
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm group-hover:shadow-card-soft",
          current.bg,
          current.text,
          active && cn("ring-4", current.activeRing)
        )}
      >
        <span className="w-6 h-6 flex items-center justify-center">{icon}</span>
      </div>
      <span className="text-xs font-semibold text-[#5e5977] group-hover:text-[#2a2542]">
        {label}
      </span>
    </div>
  );
};
