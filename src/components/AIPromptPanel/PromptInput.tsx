import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Lightbulb, 
  Layers,
  Settings2
} from 'lucide-react';
import type { DiagramType } from '../../types/diagram';

interface PromptInputProps {
  onGenerate: (
    prompt: string,
    diagramType: DiagramType,
    layoutAlgorithm: 'hierarchical' | 'horizontal' | 'grid' | 'radial'
  ) => void;
  isGenerating: boolean;
}

const SAMPLE_PROMPTS = [
  { label: '🤖 AI SaaS Architecture', prompt: 'Build an AI SaaS architecture with React web app, FastAPI backend, Redis cache, PostgreSQL database, and LLM provider service.', type: 'architecture' as DiagramType },
  { label: '🛒 E-Commerce Microservices', prompt: 'Design an e-commerce checkout flow with order service, payment gateway, Kafka message queue, and database.', type: 'flowchart' as DiagramType },
  { label: '🧠 Product Roadmap Mindmap', prompt: 'Generate a 2026 Product Roadmap mindmap featuring AI diagram engine, Security shields, Canvas editor, and Real-time sync.', type: 'mindmap' as DiagramType }
];

export const PromptInput: React.FC<PromptInputProps> = ({ onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const [diagramType, setDiagramType] = useState<DiagramType>('architecture');
  const [layoutAlgorithm, setLayoutAlgorithm] = useState<'hierarchical' | 'horizontal' | 'grid' | 'radial'>('hierarchical');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate(prompt, diagramType, layoutAlgorithm);
  };

  const handleSelectSample = (sample: typeof SAMPLE_PROMPTS[0]) => {
    setPrompt(sample.prompt);
    setDiagramType(sample.type);
    onGenerate(sample.prompt, sample.type, layoutAlgorithm);
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-11/12 max-w-5xl select-none">
      {/* Quick Prompt Preset Chips */}
      <div className="flex items-center gap-2.5 mb-2.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-extrabold text-indigo-300 uppercase tracking-widest flex items-center gap-1.5 shrink-0 bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 px-3.5 py-1.5 rounded-full shadow-lg">
          <Lightbulb className="w-4 h-4 text-amber-400 animate-pulse" /> Prompts:
        </span>
        {SAMPLE_PROMPTS.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectSample(sample)}
            disabled={isGenerating}
            className="px-4 py-1.5 text-xs font-semibold rounded-full bg-slate-900/80 backdrop-blur-xl text-slate-200 hover:text-white hover:border-indigo-400 hover:bg-indigo-600/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all shrink-0 border border-white/15"
          >
            {sample.label}
          </button>
        ))}
      </div>

      {/* Main Ultra-Glassmorphic AI Prompt Box */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900/85 backdrop-blur-2xl p-3.5 rounded-3xl flex flex-col gap-3 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(99,102,241,0.3)] border border-indigo-500/40 relative overflow-hidden group"
      >
        {/* Ambient background glow accents inside glass panel */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3.5 px-3 py-1 relative z-10">
          <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shrink-0 shadow-inner">
            <Sparkles className="w-6 h-6 animate-pulse text-indigo-300" />
          </div>

          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe your architecture or workflow (e.g., 'Build an AI SaaS backend with Redis cache and DB')..."
            disabled={isGenerating}
            className="w-full bg-transparent text-base text-white placeholder-slate-400 outline-none font-medium px-2 py-1.5 focus:placeholder-slate-500 transition-colors"
          />

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`p-3 rounded-2xl text-slate-300 hover:text-white transition-all duration-200 border ${
              showAdvanced 
                ? 'bg-indigo-600/40 border-indigo-400 text-indigo-200 shadow-lg shadow-indigo-600/30 scale-105' 
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
            }`}
            title="Advanced Controls & Layout Options"
          >
            <Settings2 className="w-5 h-5" />
          </button>

          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="btn-primary text-sm font-bold shrink-0 py-3.5 px-7 rounded-2xl shadow-xl shadow-indigo-600/40 hover:shadow-indigo-500/60 transition-all duration-200 scale-100 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2.5">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>Generate</span>
                <Send className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>

        {/* Bottom Options Bar: Capsule Pill Diagram Type Track & Layout Engine Dropdown */}
        <div className="flex flex-wrap items-center justify-between pt-2.5 border-t border-white/10 px-3 text-xs text-slate-300 relative z-10 gap-3">
          {/* Diagram Type Pill Capsule Track */}
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold text-slate-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-purple-400" /> Type:
            </span>
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-full border border-indigo-500/30 backdrop-blur-xl shadow-inner">
              {(['architecture', 'flowchart', 'mindmap', 'sequence', 'cloud'] as DiagramType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDiagramType(t)}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold capitalize transition-all duration-200 ${
                    diagramType === t 
                      ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.6)] border border-purple-400/50 scale-105 font-bold' 
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Layout Engine Dropdown */}
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold text-slate-300 text-[11px] uppercase tracking-wider">Layout Engine:</span>
            <select
              value={layoutAlgorithm}
              onChange={e => setLayoutAlgorithm(e.target.value as any)}
              className="bg-slate-950/90 text-slate-200 font-semibold text-xs rounded-xl px-3.5 py-1.5 border border-indigo-500/30 outline-none cursor-pointer hover:border-indigo-400 transition-colors shadow-inner backdrop-blur-xl"
            >
              <option value="hierarchical">Hierarchical (DAG)</option>
              <option value="horizontal">Horizontal Flow</option>
              <option value="grid">Matrix Grid</option>
              <option value="radial">Radial Mindmap</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
};


