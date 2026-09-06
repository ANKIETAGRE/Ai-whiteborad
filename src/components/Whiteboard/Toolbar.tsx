import React from 'react';
import { 
  MousePointer, 
  PlusSquare, 
  Type, 
  StickyNote, 
  ArrowRight, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  LayoutGrid,
  GitFork,
  Compass,
  Layers,
  Sparkles,
  Database,
  Cloud,
  Cpu,
  User as UserIcon,
  Zap
} from 'lucide-react';
import type { NodeType } from '../../types/diagram';

interface ToolbarProps {
  activeTool: 'select' | 'node' | 'connector' | 'sticky' | 'draw' | 'text';
  onSelectTool: (tool: 'select' | 'node' | 'connector' | 'sticky' | 'draw' | 'text') => void;
  onAddNode: (type: NodeType) => void;
  onApplyLayout: (algorithm: 'hierarchical' | 'horizontal' | 'grid' | 'radial') => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  selectedNodeId: string | null;
  onDeleteSelected: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onSelectTool,
  onAddNode,
  onApplyLayout,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  selectedNodeId,
  onDeleteSelected
}) => {
  return (
    <aside className="absolute left-6 top-20 z-20 flex flex-col gap-4 select-none">
      {/* 1. Primary Interaction Tools Dock (2x Scale) */}
      <div className="glass-panel p-3 rounded-3xl flex flex-col items-center gap-2.5 shadow-2xl border border-white/15 w-20">
        {/* Select & Move */}
        <div className="relative group">
          <button
            onClick={() => onSelectTool('select')}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
              activeTool === 'select'
                ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-xl shadow-indigo-500/50 border border-indigo-400/60 scale-105'
                : 'text-slate-300 hover:text-white hover:bg-white/10 hover:scale-105'
            }`}
          >
            <MousePointer className="w-7 h-7" />
          </button>
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 glass-panel-glow text-xs font-semibold text-white rounded-xl whitespace-nowrap hidden group-hover:block z-50 shadow-2xl border border-white/15 pointer-events-none">
            Select & Move (V)
          </div>
        </div>

        {/* Add Architecture Node */}
        <div className="relative group">
          <button
            onClick={() => onSelectTool('node')}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
              activeTool === 'node'
                ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-xl shadow-indigo-500/50 border border-indigo-400/60 scale-105'
                : 'text-slate-300 hover:text-white hover:bg-white/10 hover:scale-105'
            }`}
          >
            <PlusSquare className="w-7 h-7" />
          </button>

          {/* Node Selector Flyout Menu */}
          <div className="absolute left-full top-0 ml-4 w-72 glass-panel rounded-3xl p-3 shadow-2xl border border-white/15 hidden group-hover:flex flex-col gap-1.5 z-50 animate-in fade-in slide-in-from-left-3 duration-200">
            <span className="px-3 py-1.5 text-xs font-extrabold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 mb-1">
              <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" /> Add Infrastructure Nodes
            </span>
            <button onClick={() => onAddNode('service')} className="px-3.5 py-2 text-sm text-left text-slate-100 hover:bg-indigo-600/40 hover:text-white rounded-xl transition-colors flex items-center gap-3">
              <Cpu className="w-5 h-5 text-indigo-400" /> Microservice Component
            </button>
            <button onClick={() => onAddNode('database')} className="px-3.5 py-2 text-sm text-left text-slate-100 hover:bg-indigo-600/40 hover:text-white rounded-xl transition-colors flex items-center gap-3">
              <Database className="w-5 h-5 text-emerald-400" /> Database Store
            </button>
            <button onClick={() => onAddNode('cloud')} className="px-3.5 py-2 text-sm text-left text-slate-100 hover:bg-indigo-600/40 hover:text-white rounded-xl transition-colors flex items-center gap-3">
              <Cloud className="w-5 h-5 text-sky-400" /> Cloud Provider Service
            </button>
            <button onClick={() => onAddNode('queue')} className="px-3.5 py-2 text-sm text-left text-slate-100 hover:bg-indigo-600/40 hover:text-white rounded-xl transition-colors flex items-center gap-3">
              <Layers className="w-5 h-5 text-amber-400" /> Message Queue Stream
            </button>
            <button onClick={() => onAddNode('cache')} className="px-3.5 py-2 text-sm text-left text-slate-100 hover:bg-indigo-600/40 hover:text-white rounded-xl transition-colors flex items-center gap-3">
              <Zap className="w-5 h-5 text-purple-400" /> Cache In-Memory Layer
            </button>
            <button onClick={() => onAddNode('user')} className="px-3.5 py-2 text-sm text-left text-slate-100 hover:bg-indigo-600/40 hover:text-white rounded-xl transition-colors flex items-center gap-3">
              <UserIcon className="w-5 h-5 text-cyan-400" /> User Client Interface
            </button>
          </div>
        </div>

        {/* Arrow Edge Connector */}
        <div className="relative group">
          <button
            onClick={() => onSelectTool('connector')}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
              activeTool === 'connector'
                ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-xl shadow-indigo-500/50 border border-indigo-400/60 scale-105'
                : 'text-slate-300 hover:text-white hover:bg-white/10 hover:scale-105'
            }`}
          >
            <ArrowRight className="w-7 h-7" />
          </button>
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 glass-panel-glow text-xs font-semibold text-white rounded-xl whitespace-nowrap hidden group-hover:block z-50 shadow-2xl border border-white/15 pointer-events-none">
            Connector Edge (C)
          </div>
        </div>

        {/* Sticky Note */}
        <div className="relative group">
          <button
            onClick={() => onSelectTool('sticky')}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
              activeTool === 'sticky'
                ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-xl shadow-indigo-500/50 border border-indigo-400/60 scale-105'
                : 'text-slate-300 hover:text-white hover:bg-white/10 hover:scale-105'
            }`}
          >
            <StickyNote className="w-7 h-7 text-amber-400" />
          </button>
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 glass-panel-glow text-xs font-semibold text-white rounded-xl whitespace-nowrap hidden group-hover:block z-50 shadow-2xl border border-white/15 pointer-events-none">
            Sticky Note (S)
          </div>
        </div>

        {/* Text Block */}
        <div className="relative group">
          <button
            onClick={() => onSelectTool('text')}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
              activeTool === 'text'
                ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-xl shadow-indigo-500/50 border border-indigo-400/60 scale-105'
                : 'text-slate-300 hover:text-white hover:bg-white/10 hover:scale-105'
            }`}
          >
            <Type className="w-7 h-7" />
          </button>
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 glass-panel-glow text-xs font-semibold text-white rounded-xl whitespace-nowrap hidden group-hover:block z-50 shadow-2xl border border-white/15 pointer-events-none">
            Add Text Block (T)
          </div>
        </div>

        {/* Delete Selection */}
        {selectedNodeId && (
          <div className="relative group w-full pt-1.5 border-t border-white/15 mt-1 flex justify-center">
            <button
              onClick={onDeleteSelected}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-rose-400 hover:text-white hover:bg-rose-600 transition-all border border-rose-500/40 hover:scale-105 shadow-lg shadow-rose-600/30"
            >
              <Trash2 className="w-7 h-7" />
            </button>
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 glass-panel text-xs font-semibold text-rose-300 rounded-xl whitespace-nowrap hidden group-hover:block z-50 shadow-2xl border border-rose-500/40 pointer-events-none">
              Delete Selected
            </div>
          </div>
        )}
      </div>

      {/* 2. Graph Auto-Layout Algorithms Dock (2x Scale) */}
      <div className="glass-panel p-3 rounded-3xl flex flex-col items-center gap-2 shadow-2xl border border-white/15 w-20">
        <div className="w-full text-center pb-1 border-b border-white/15">
          <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase">LAYOUT</span>
        </div>

        {/* Hierarchical DAG Top-Down */}
        <div className="relative group">
          <button
            onClick={() => onApplyLayout('hierarchical')}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-indigo-600/40 transition-all hover:scale-105"
          >
            <GitFork className="w-7 h-7" />
          </button>
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 glass-panel-glow text-xs font-semibold text-white rounded-xl whitespace-nowrap hidden group-hover:block z-50 shadow-2xl border border-white/15 pointer-events-none">
            Top-Down Hierarchical
          </div>
        </div>

        {/* Horizontal Left-Right */}
        <div className="relative group">
          <button
            onClick={() => onApplyLayout('horizontal')}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-indigo-600/40 transition-all rotate-90 hover:scale-105"
          >
            <GitFork className="w-7 h-7" />
          </button>
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 glass-panel-glow text-xs font-semibold text-white rounded-xl whitespace-nowrap hidden group-hover:block z-50 shadow-2xl border border-white/15 pointer-events-none">
            Horizontal Flow
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="relative group">
          <button
            onClick={() => onApplyLayout('grid')}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-indigo-600/40 transition-all hover:scale-105"
          >
            <LayoutGrid className="w-7 h-7" />
          </button>
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 glass-panel-glow text-xs font-semibold text-white rounded-xl whitespace-nowrap hidden group-hover:block z-50 shadow-2xl border border-white/15 pointer-events-none">
            Matrix Grid
          </div>
        </div>

        {/* Radial Mindmap */}
        <div className="relative group">
          <button
            onClick={() => onApplyLayout('radial')}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-indigo-600/40 transition-all hover:scale-105"
          >
            <Compass className="w-7 h-7" />
          </button>
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 glass-panel-glow text-xs font-semibold text-white rounded-xl whitespace-nowrap hidden group-hover:block z-50 shadow-2xl border border-white/15 pointer-events-none">
            Radial Mindmap
          </div>
        </div>
      </div>

      {/* 3. Zoom Navigation Controls Dock (2x Scale) */}
      <div className="glass-panel p-3 rounded-3xl flex flex-col items-center gap-2 shadow-2xl border border-white/15 w-20">
        <div className="relative group">
          <button
            onClick={onZoomIn}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all hover:scale-105"
          >
            <ZoomIn className="w-7 h-7" />
          </button>
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 glass-panel-glow text-xs font-semibold text-white rounded-xl whitespace-nowrap hidden group-hover:block z-50 shadow-2xl border border-white/15 pointer-events-none">
            Zoom In (+)
          </div>
        </div>

        <button
          onClick={onResetZoom}
          className="text-xs font-mono font-bold text-indigo-300 py-1 hover:text-white transition-colors"
          title="Reset Zoom Scale"
        >
          {Math.round(zoom * 100)}%
        </button>

        <div className="relative group">
          <button
            onClick={onZoomOut}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all hover:scale-105"
          >
            <ZoomOut className="w-7 h-7" />
          </button>
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 glass-panel-glow text-xs font-semibold text-white rounded-xl whitespace-nowrap hidden group-hover:block z-50 shadow-2xl border border-white/15 pointer-events-none">
            Zoom Out (-)
          </div>
        </div>

        <div className="relative group pt-1.5 border-t border-white/15 w-full flex justify-center">
          <button
            onClick={onResetZoom}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all hover:scale-105"
          >
            <Maximize2 className="w-7 h-7" />
          </button>
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 glass-panel-glow text-xs font-semibold text-white rounded-xl whitespace-nowrap hidden group-hover:block z-50 shadow-2xl border border-white/15 pointer-events-none">
            Fit Canvas View
          </div>
        </div>
      </div>
    </aside>
  );
};
