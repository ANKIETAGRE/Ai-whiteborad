import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Download, 
  History, 
  Activity, 
  User as UserIcon,
  Crown,
  FileJson,
  Image as ImageIcon,
  Share2
} from 'lucide-react';
import type { User, DiagramSchema, RateLimitState } from '../../types/diagram';

interface HeaderProps {
  title: string;
  diagramSchema: DiagramSchema;
  user: User;
  onUserTierToggle: () => void;
  onToggleAuditLogs: () => void;
  onToggleVersions: () => void;
  onExport: (type: 'svg' | 'png' | 'json') => void;
  rateLimitState: RateLimitState;
  auditCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  diagramSchema,
  user,
  onUserTierToggle,
  onToggleAuditLogs,
  onToggleVersions,
  onExport,
  rateLimitState,
  auditCount
}) => {
  return (
    <header className="h-16 glass-panel border-b border-gray-800 px-6 flex items-center justify-between z-30 relative select-none">
      {/* Brand & App Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-wide">{title || 'AI Whiteboard'}</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 capitalize">
                {diagramSchema.diagram_type}
              </span>
            </div>
            <p className="text-xs text-gray-400">Schema-Validated AI Architecture Canvas</p>
          </div>
        </div>
      </div>

      {/* Center Security & Health Indicators */}
      <div className="hidden md:flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>WAF & Prompt Shield Active</span>
        </div>

        <div className="flex items-center gap-2 text-xs bg-gray-800/80 px-3 py-1.5 rounded-lg border border-gray-700">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span className="text-gray-300">Rate Quota:</span>
          <span className="font-semibold text-white">{rateLimitState.remaining}/{rateLimitState.limit} hr</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* User Tier Switcher */}
        <button
          onClick={onUserTierToggle}
          title="Toggle Free / Pro Tier (Test Rate Limits)"
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${
            user.tier === 'pro'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
          }`}
        >
          {user.tier === 'pro' ? <Crown className="w-3.5 h-3.5 text-amber-400" /> : <UserIcon className="w-3.5 h-3.5 text-gray-400" />}
          <span className="capitalize">{user.tier} Tier</span>
        </button>

        {/* Audit Logs Button */}
        <button
          onClick={onToggleAuditLogs}
          className="relative btn-secondary text-xs"
          title="View Security & API Audit Logs"
        >
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span>Security Logs</span>
          {auditCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-indigo-600 text-white">
              {auditCount}
            </span>
          )}
        </button>

        {/* Version History Button */}
        <button
          onClick={onToggleVersions}
          className="btn-secondary text-xs"
          title="View Diagram Version History"
        >
          <History className="w-3.5 h-3.5 text-purple-400" />
          <span>History</span>
        </button>

        {/* Export Dropdown Menu */}
        <div className="relative group">
          <button className="btn-primary text-xs">
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <div className="absolute right-0 top-full mt-2 w-44 glass-panel rounded-xl shadow-2xl border border-gray-700 py-1 hidden group-hover:block z-50">
            <button
              onClick={() => onExport('svg')}
              className="w-full px-4 py-2 text-xs text-left text-gray-200 hover:bg-indigo-600/30 flex items-center gap-2 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export as SVG</span>
            </button>
            <button
              onClick={() => onExport('png')}
              className="w-full px-4 py-2 text-xs text-left text-gray-200 hover:bg-indigo-600/30 flex items-center gap-2 transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export as PNG</span>
            </button>
            <button
              onClick={() => onExport('json')}
              className="w-full px-4 py-2 text-xs text-left text-gray-200 hover:bg-indigo-600/30 flex items-center gap-2 transition-colors border-t border-gray-800"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-400" />
              <span>Download Diagram JSON</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
