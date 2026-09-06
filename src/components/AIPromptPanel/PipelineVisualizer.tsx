import React from 'react';
import { 
  ShieldCheck, 
  Target, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  GitFork,
  Sparkles
} from 'lucide-react';
import type { PipelineProgress } from '../../types/diagram';

interface PipelineVisualizerProps {
  progress: PipelineProgress | null;
  onDismiss?: () => void;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({ progress }) => {
  if (!progress || progress.stage === 'idle') return null;

  const stages = [
    { key: 'validating', label: 'Prompt Shield & WAF', icon: ShieldCheck, step: 1 },
    { key: 'detecting_intent', label: 'Intent & Entity Parser', icon: Target, step: 2 },
    { key: 'extracting_entities', label: 'Relationship Extraction', icon: Cpu, step: 3 },
    { key: 'schema_validation', label: 'JSON Schema Validation', icon: CheckCircle2, step: 4 },
    { key: 'layout_computation', label: 'Graph Layout Engine', icon: GitFork, step: 5 }
  ];

  const getStepStatus = (stepKey: string) => {
    if (progress.stage === 'failed') return 'failed';
    if (progress.stage === 'completed') return 'completed';

    const currentStageObj = stages.find(s => s.key === progress.stage);
    const targetStageObj = stages.find(s => s.key === stepKey);

    if (!currentStageObj || !targetStageObj) return 'pending';
    if (targetStageObj.step < currentStageObj.step) return 'completed';
    if (targetStageObj.step === currentStageObj.step) return 'active';
    return 'pending';
  };

  return (
    <div className="absolute top-20 right-6 z-30 w-96 glass-panel rounded-2xl p-4 border border-indigo-500/40 shadow-2xl select-none animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-400 animate-spin" />
          <h3 className="text-xs font-bold text-white tracking-wide uppercase font-heading">
            AI Service Pipeline Execution
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
          {progress.progressPercent}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-800 h-1.5 rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            progress.stage === 'failed'
              ? 'bg-rose-500'
              : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
          }`}
          style={{ width: `${progress.progressPercent}%` }}
        />
      </div>

      {/* Pipeline Stage Steps */}
      <div className="flex flex-col gap-2.5">
        {stages.map(s => {
          const status = getStepStatus(s.key);
          const Icon = s.icon;

          return (
            <div
              key={s.key}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs border transition-all ${
                status === 'active'
                  ? 'bg-indigo-600/20 border-indigo-500/60 text-white font-medium shadow-md shadow-indigo-500/10'
                  : status === 'completed'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : status === 'failed'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-gray-900/40 border-gray-800 text-gray-500'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${
                  status === 'active' ? 'text-pink-400 animate-pulse' : status === 'completed' ? 'text-emerald-400' : 'text-gray-500'
                }`} />
                <span>{s.label}</span>
              </div>

              <div>
                {status === 'active' && (
                  <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping inline-block" />
                )}
                {status === 'completed' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
                {status === 'failed' && (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Stage Status Message */}
      <div className="mt-3 pt-2 border-t border-gray-800/80 text-[11px] text-gray-300 font-mono leading-tight">
        {progress.message}
      </div>
    </div>
  );
};
