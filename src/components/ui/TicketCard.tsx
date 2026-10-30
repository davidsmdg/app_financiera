import React from 'react';
import { cn } from '../../lib/utils';

export interface TicketCardProps {
  childrenTop: React.ReactNode;
  childrenBottom: React.ReactNode;
  className?: string;
  badge?: React.ReactNode;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  childrenTop,
  childrenBottom,
  className,
  badge,
}) => {
  return (
    <div className={cn("ticket-container overflow-visible relative border border-slate-100/50", className)}>
      {/* Insignia / Tag opcional estilo "1H" circular */}
      {badge && (
        <div className="absolute -top-3 -left-2 z-10">
          {badge}
        </div>
      )}

      {/* Sección Superior del Ticket */}
      <div className="p-5 pb-4">
        {childrenTop}
      </div>

      {/* Línea Troquelada con hendiduras laterales exactas al Referente 1 */}
      <div className="relative py-1">
        <div className="ticket-notch-left" />
        <div className="ticket-divider mx-4" />
        <div className="ticket-notch-right" />
      </div>

      {/* Sección Inferior del Ticket */}
      <div className="p-5 pt-4">
        {childrenBottom}
      </div>
    </div>
  );
};
