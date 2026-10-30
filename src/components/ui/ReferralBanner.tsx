import React from 'react';
import { Gift, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ReferralBannerProps {
  title?: string;
  description?: string;
  rewardText?: string;
  onInvite?: () => void;
  className?: string;
}

export const ReferralBanner: React.FC<ReferralBannerProps> = ({
  title = "INVITA A TUS AMIGOS",
  rewardText = "Obtén 20€",
  description = "por cada amigo que se una a la plataforma y comience a ahorrar",
  onInvite,
  className,
}) => {
  return (
    <div
      onClick={onInvite}
      className={cn(
        "rounded-squircle-lg p-5 bg-gradient-to-r from-[#c084fc] via-[#a855f7] to-[#6366f1] text-white shadow-card-float flex items-center justify-between cursor-pointer select-none relative overflow-hidden transition-all duration-300 hover:brightness-105 active:scale-[0.99]",
        className
      )}
    >
      {/* Destellos orgánicos de fondo */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/15 blur-lg pointer-events-none" />
      <div className="absolute top-2 left-1/3 w-24 h-24 rounded-full bg-cyan-400/20 blur-xl pointer-events-none" />

      <div className="relative z-10 flex items-center gap-3.5 pr-4">
        <div className="w-11 h-11 rounded-squircle-md bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-sm border border-white/30">
          <Gift className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-white/80 block mb-0.5">
            {title}
          </span>
          <p className="text-xs font-medium text-white/95 leading-relaxed">
            <strong className="font-extrabold text-white underline decoration-cyan-300">{rewardText}</strong> {description}
          </p>
        </div>
      </div>

      <div className="relative z-10 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
        <ChevronRight className="w-4 h-4 text-white" />
      </div>
    </div>
  );
};
