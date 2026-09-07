import React from 'react';
import { CheckCircle2, Clock, FileEdit, AlertTriangle } from 'lucide-react';

export type InvoiceStatusType = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';

interface StatusBadgeProps {
  status: InvoiceStatusType | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase();

  const configs: Record<string, { label: string; bg: string; text: string; border: string; icon: any }> = {
    DRAFT: {
      label: 'Draft',
      bg: 'bg-slate-500/10',
      text: 'text-slate-300',
      border: 'border-slate-500/20',
      icon: FileEdit,
    },
    SENT: {
      label: 'Sent',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      icon: Clock,
    },
    PAID: {
      label: 'Paid',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      icon: CheckCircle2,
    },
    OVERDUE: {
      label: 'Overdue',
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/20',
      icon: AlertTriangle,
    },
  };

  const config = configs[normalized] || configs.DRAFT;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-medium',
    lg: 'px-3 py-1.5 text-sm gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]} backdrop-blur-md shadow-sm transition-all duration-200`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
};
