import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { cn } from '../utils';

interface StatusBadgeProps {
  level: 'low' | 'medium' | 'high' | 'critical';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ level, className }) => {
  const config = {
    low: {
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      icon: CheckCircle,
      label: 'Low Risk'
    },
    medium: {
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      icon: Info,
      label: 'Medium Risk'
    },
    high: {
      color: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      icon: AlertTriangle,
      label: 'High Risk'
    },
    critical: {
      color: 'bg-red-500/10 text-red-500 border-red-500/20',
      icon: Shield,
      label: 'Critical Alert'
    }
  };

  const { color, icon: Icon, label } = config[level];

  return (
    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium uppercase tracking-wider", color, className)}>
      <Icon size={14} />
      {label}
    </div>
  );
};
