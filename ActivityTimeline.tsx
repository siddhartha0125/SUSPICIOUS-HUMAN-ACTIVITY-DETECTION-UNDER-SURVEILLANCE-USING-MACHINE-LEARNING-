import React from 'react';
import { motion } from 'motion/react';
import { Clock, AlertCircle, ShieldAlert, Activity } from 'lucide-react';
import { ActivityEvent } from '../services/geminiService';
import { cn } from '../utils';

interface ActivityTimelineProps {
  events: ActivityEvent[];
  onEventClick?: (timestamp: string) => void;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ events, onEventClick }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Activity size={16} />
          Activity Log
        </h3>
        <span className="text-[10px] font-mono text-slate-500 uppercase">Live Feed Analysis</span>
      </div>

      <div className="relative space-y-3">
        {events.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
            <p className="text-sm text-slate-500">No activities detected yet.</p>
          </div>
        ) : (
          events.map((event, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => onEventClick?.(event.timestamp)}
              className={cn(
                "group relative p-4 rounded-xl border transition-all cursor-pointer",
                event.type === 'critical' 
                  ? "bg-red-500/5 border-red-500/20 hover:border-red-500/40" 
                  : event.type === 'suspicious'
                  ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
                  : "bg-slate-800/30 border-slate-800 hover:border-slate-700"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 flex items-center gap-1">
                      <Clock size={10} />
                      {event.timestamp}
                    </span>
                    <h4 className={cn(
                      "text-sm font-semibold",
                      event.type === 'critical' ? "text-red-400" : event.type === 'suspicious' ? "text-amber-400" : "text-slate-200"
                    )}>
                      {event.activity}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[10px] font-mono text-slate-500">
                    Conf: {(event.confidence * 100).toFixed(0)}%
                  </span>
                  {event.type === 'critical' && <ShieldAlert size={16} className="text-red-500" />}
                  {event.type === 'suspicious' && <AlertCircle size={16} className="text-amber-500" />}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
