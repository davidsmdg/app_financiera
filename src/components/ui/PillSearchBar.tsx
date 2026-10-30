import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface PillSearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export const PillSearchBar: React.FC<PillSearchBarProps> = ({
  className,
  placeholder = "Search...",
  ...props
}) => {
  return (
    <div className={cn("relative flex items-center w-full shadow-card-soft rounded-full bg-white border border-slate-100/60 overflow-hidden px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-[#7b52c9]/30", className)}>
      <Search className="w-5 h-5 text-[#9f9cb2] shrink-0 mr-3" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-[#2a2542] placeholder-[#9f9cb2] outline-none font-medium"
        {...props}
      />
    </div>
  );
};
