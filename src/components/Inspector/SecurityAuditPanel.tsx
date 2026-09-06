import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  X, 
  Trash2, 
  Activity, 
  Lock, 
  Terminal,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import type { SecurityAuditLog, RateLimitState } from '../../types/diagram';

interface SecurityAuditPanelProps {
  isOpen: boolean;
  onClose: () => void;
  logs: SecurityAuditLog[];
  rateLimitState: RateLimitState;
  onClearLogs: () => void;
}

export const SecurityAuditPanel: React.FC<SecurityAuditPanelProps> = ({
  isOpen,
  onClose,
  logs,
  rateLimitState,
  onClearLogs
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md glass-panel z-50 border-l border-gray-800 shadow-2xl flex flex-col select-none animate-in slide-in-from-right duration-300">
      {/* Drawer Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Security & Audit Inspector</h2>
            <p className="text-[10px] text-gray-400">Defense in Depth & Telemetry Log</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Rate Limiting & Defense Overview */}
      <div className="p-4 border-b border-gray-800/80 bg-gray-900/40 grid grid-cols-2 gap-3 text-xs">
        <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span>Rate Limiter Window</span>
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-base font-bold text-white">
            {rateLimitState.remaining} / {rateLimitState.limit}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Resets in {Math.round(rateLimitState.resetSeconds / 60)}m</div>
        </div>

        <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span>Prompt Injection Shield</span>
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-base font-bold text-emerald-400">ACTIVE</div>
          <div className="text-[10px] text-gray-400 mt-0.5">XSS & SQLi Defense Enabled</div>
        </div>
      </div>

      {/* Logs Header */}
      <div className="px-4 py-2 bg-gray-950/60 border-b border-gray-800 flex items-center justify-between text-xs text-gray-400">
        <span className="font-semibold flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-gray-500" /> Audit Log Entries ({logs.length})
        </span>
        <button
          onClick={onClearLogs}
          className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" /> Clear
        </button>
      </div>

      {/* Audit Log Stream */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="text-center text-gray-500 py-12 text-xs">No audit logs recorded yet.</div>
        ) : (
          logs.map(log => (
            <div
              key={log.id}
              className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${
                log.status === 'SECURITY_BLOCKED'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  : log.status === 'WARNING'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : 'bg-gray-900/60 border-gray-800 text-gray-300'
              }`}
            >
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 font-bold">
                  {log.status === 'SECURITY_BLOCKED' ? (
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  ) : log.status === 'WARNING' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>{log.action}</span>
                </div>
                <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>

              <p className="text-[11px] leading-relaxed text-gray-200">{log.details}</p>

              <div className="flex items-center justify-between text-[9px] text-gray-500 border-t border-gray-800/60 pt-1 mt-1">
                <span>ReqID: {log.request_id}</span>
                <span>User: {log.user_id}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
