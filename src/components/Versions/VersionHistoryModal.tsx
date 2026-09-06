import React from 'react';
import { History, X, RotateCcw, Calendar, FileText } from 'lucide-react';
import type { DiagramVersion } from '../../types/diagram';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: DiagramVersion[];
  onRestoreVersion: (version: DiagramVersion) => void;
  currentVersion: number;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  versions,
  onRestoreVersion,
  currentVersion
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-xl glass-panel rounded-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Diagram Version History</h2>
              <p className="text-[10px] text-gray-400">Restore previous diagram state snapshots</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline List */}
        <div className="p-4 overflow-y-auto flex flex-col gap-3">
          {versions.length === 0 ? (
            <div className="text-center text-gray-500 py-8 text-xs">No saved history versions yet.</div>
          ) : (
            versions.map(v => {
              const isCurrent = v.version_number === currentVersion;
              return (
                <div
                  key={v.id}
                  className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                    isCurrent
                      ? 'bg-purple-600/15 border-purple-500/50 ring-1 ring-purple-500/30'
                      : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30">
                        v{v.version_number}
                      </span>
                      <h3 className="text-xs font-semibold text-white truncate max-w-xs">{v.diagram_json.title}</h3>
                      {isCurrent && (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-400 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-gray-500" /> Prompt: "{v.prompt || 'Manual Edit'}"
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-500" /> {new Date(v.created_at).toLocaleString()}
                      </span>
                      <span>•</span>
                      <span>{v.diagram_json.nodes.length} Nodes, {v.diagram_json.edges.length} Edges</span>
                    </div>
                  </div>

                  {!isCurrent && (
                    <button
                      onClick={() => {
                        onRestoreVersion(v);
                        onClose();
                      }}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                      <span>Restore</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
