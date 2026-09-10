'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  subtitle?: string;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  accentColor?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  accentColor = 'indigo',
}) => {
  const colorStyles = {
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
    },
  };

  const style = colorStyles[accentColor];

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{title}</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight tabular-nums">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${style.bg} ${style.text}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
          {trend && (
            <span className={`font-bold ${style.text}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};
