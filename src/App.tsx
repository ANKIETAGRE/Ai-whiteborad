import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Header } from './components/Header/Header';
import { Canvas } from './components/Whiteboard/Canvas';

import { Toolbar } from './components/Whiteboard/Toolbar';
import { PromptInput } from './components/AIPromptPanel/PromptInput';
import { PipelineVisualizer } from './components/AIPromptPanel/PipelineVisualizer';
import { SecurityAuditPanel } from './components/Inspector/SecurityAuditPanel';
import { VersionHistoryModal } from './components/Versions/VersionHistoryModal';

import type { 
  DiagramSchema, 
  DiagramType, 
  DiagramNode, 
  User, 
  RateLimitState, 
  DiagramVersion, 
  PipelineProgress,
  NodeType 
} from './types/diagram';
import { aiService } from './services/aiService';
import { securityEngine } from './services/securityEngine';
import { layoutEngine } from './services/layoutEngine';

const INITIAL_DIAGRAM: DiagramSchema = {
  diagram_type: 'architecture',
  title: 'AI SaaS Platform Architecture',
  nodes: [
    { id: 'web-app', type: 'service', label: 'Web App (React/Vite)', sublabel: 'Frontend Client', icon: 'Layout', color: '#6366f1', position: { x: 400, y: 100 }, width: 210, height: 90 },
    { id: 'api-gateway', type: 'gateway', label: 'API Gateway (FastAPI)', sublabel: 'Auth & Security WAF', icon: 'Shield', color: '#8b5cf6', position: { x: 400, y: 260 }, width: 210, height: 90 },
    { id: 'ai-service', type: 'service', label: 'AI Service Engine', sublabel: 'Prompt -> Diagram JSON', icon: 'Sparkles', color: '#ec4899', position: { x: 220, y: 440 }, width: 210, height: 90 },
    { id: 'database', type: 'database', label: 'PostgreSQL DB', sublabel: 'Users & Diagrams', icon: 'Database', color: '#10b981', position: { x: 580, y: 440 }, width: 210, height: 90 }
  ],
  edges: [
    { id: 'e1', source: 'web-app', target: 'api-gateway', label: 'HTTPS Request', animated: true, color: '#6366f1' },
    { id: 'e2', source: 'api-gateway', target: 'ai-service', label: 'Generate Diagram', animated: true, color: '#8b5cf6' },
    { id: 'e3', source: 'api-gateway', target: 'database', label: 'Persist State', color: '#10b981' },
    { id: 'e4', source: 'ai-service', target: 'database', label: 'Save AI Schema', color: '#ec4899' }
  ]
};

export function App() {
  const [diagram, setDiagram] = useState<DiagramSchema>(INITIAL_DIAGRAM);
  const [user, setUser] = useState<User>({
    id: 'usr_agrea99',
    email: 'architect@aiwhiteboard.dev',
    name: 'Lead AI Architect',
    tier: 'free',
    token_usage: 1250
  });

  const [rateLimitState] = useState<RateLimitState>({
    remaining: 10,
    limit: 10,
    resetSeconds: 3600
  });

  const [activeTool, setActiveTool] = useState<'select' | 'node' | 'connector' | 'sticky' | 'draw' | 'text'>('select');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Canvas Pan & Zoom (100% scale)
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 100, y: 40 });

  // AI Pipeline Execution State
  const [isGenerating, setIsGenerating] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState<PipelineProgress | null>(null);

  // Version Control History
  const [versions, setVersions] = useState<DiagramVersion[]>([
    {
      id: 'ver_1',
      diagram_id: 'diag_initial',
      version_number: 1,
      diagram_json: INITIAL_DIAGRAM,
      prompt: 'Initial AI SaaS Architecture',
      created_at: new Date().toISOString()
    }
  ]);
  const [currentVersionNumber, setCurrentVersionNumber] = useState(1);

  // Security Panel & Modal States
  const [isAuditPanelOpen, setIsAuditPanelOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState(securityEngine.getAuditLogs());

  // Toast Alerts
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const refreshAuditLogs = () => {
    setAuditLogs([...securityEngine.getAuditLogs()]);
  };

  // Auto-fit diagram to screen at 100% scale (1:1 full size)
  const handleFitDiagramToView = (nodesList: DiagramNode[]) => {
    if (nodesList.length === 0) {
      setZoom(1.0);
      setPan({ x: 100, y: 40 });
      return;
    }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodesList.forEach(n => {
      const w = n.width || 190;
      const h = n.height || 85;
      if (n.position.x < minX) minX = n.position.x;
      if (n.position.x + w > maxX) maxX = n.position.x + w;
      if (n.position.y < minY) minY = n.position.y;
      if (n.position.y + h > maxY) maxY = n.position.y + h;
    });

    const screenW = window.innerWidth || 1200;
    const screenH = window.innerHeight || 800;

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const targetPanX = screenW / 2 - centerX * 1.0;
    const targetPanY = screenH / 2 - centerY * 1.0 + 30;

    setZoom(1.0);
    setPan({ x: Math.round(targetPanX), y: Math.round(targetPanY) });
  };

  // Automatically fit initial diagram on page load at 100% scale
  useEffect(() => {
    handleFitDiagramToView(INITIAL_DIAGRAM.nodes);
  }, []);

  // Toggle User Tier for Rate Limit Testing
  const handleToggleUserTier = () => {
    const newTier = user.tier === 'free' ? 'pro' : 'free';
    setUser({ ...user, tier: newTier });
    showToast(`Switched to ${newTier.toUpperCase()} User Tier (Updated Rate Quota)`, 'info');
    securityEngine.addAuditLog(user.id, 'USER_TIER_SWITCH', 'SUCCESS', `User switched to ${newTier} tier`);
    refreshAuditLogs();
  };

  // Generate AI Diagram Trigger
  const handleGenerateAIDiagram = async (
    prompt: string,
    diagramType: DiagramType,
    layoutAlgorithm: 'hierarchical' | 'horizontal' | 'grid' | 'radial'
  ) => {
    setIsGenerating(true);
    setPipelineProgress({ stage: 'validating', message: 'Starting AI Pipeline...', progressPercent: 5 });

    try {
      const generatedSchema = await aiService.generateDiagram({
        prompt,
        diagramType,
        userId: user.id,
        userTier: user.tier,
        layoutAlgorithm,
        onProgress: progress => {
          setPipelineProgress(progress);
        }
      });

      // Update Diagram
      setDiagram(generatedSchema);

      // Auto-fit newly generated diagram to viewport
      handleFitDiagramToView(generatedSchema.nodes);

      // Add to Version Control History
      const nextVerNum = versions.length + 1;
      const newVer: DiagramVersion = {
        id: 'ver_' + Math.random().toString(36).substr(2, 9),
        diagram_id: 'diag_1',
        version_number: nextVerNum,
        diagram_json: generatedSchema,
        prompt,
        created_at: new Date().toISOString()
      };
      setVersions([newVer, ...versions]);
      setCurrentVersionNumber(nextVerNum);

      // Trigger Confetti Celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.8 }
      });

      showToast(`Successfully generated "${generatedSchema.title}"!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'AI Generation Failed', 'error');
    } finally {
      setIsGenerating(false);
      refreshAuditLogs();
      setTimeout(() => setPipelineProgress(null), 5000);
    }
  };

  // Manual Node Add
  const handleAddNode = (type: NodeType) => {
    const newId = 'node_' + Math.random().toString(36).substr(2, 7);
    const newNode: DiagramNode = {
      id: newId,
      type,
      label: type === 'sticky-note' ? 'New Sticky Note' : `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      sublabel: 'Manual Element',
      position: { x: 350 - pan.x, y: 200 - pan.y },
      color: type === 'database' ? '#10b981' : type === 'cloud' ? '#3b82f6' : '#6366f1',
      width: type === 'sticky-note' ? 160 : 190,
      height: type === 'sticky-note' ? 160 : 85
    };

    setDiagram({
      ...diagram,
      nodes: [...diagram.nodes, newNode]
    });
    setSelectedNodeId(newId);
    showToast(`Added new ${type} element to whiteboard`, 'info');
  };

  // Apply Layout Algorithm
  const handleApplyLayout = (algorithm: 'hierarchical' | 'horizontal' | 'grid' | 'radial') => {
    const updatedNodes = layoutEngine.applyLayout(
      diagram.nodes,
      diagram.edges,
      diagram.diagram_type,
      algorithm
    );
    setDiagram({
      ...diagram,
      nodes: updatedNodes
    });
    handleFitDiagramToView(updatedNodes);
    showToast(`Applied ${algorithm} graph layout algorithm`, 'info');
  };

  // Delete Selected Node
  const handleDeleteSelected = () => {
    if (!selectedNodeId) return;
    setDiagram({
      ...diagram,
      nodes: diagram.nodes.filter(n => n.id !== selectedNodeId),
      edges: diagram.edges.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId)
    });
    setSelectedNodeId(null);
    showToast('Deleted selected node and connected edges', 'info');
  };

  // Export File (SVG, PNG, JSON)
  const handleExport = (exportType: 'svg' | 'png' | 'json') => {
    if (exportType === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(diagram, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `${diagram.title.toLowerCase().replace(/\s+/g, '_')}_diagram.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Downloaded JSON Diagram Schema', 'success');
      return;
    }

    showToast(`Exported diagram as ${exportType.toUpperCase()}`, 'success');
  };

  // Restore Previous Version
  const handleRestoreVersion = (ver: DiagramVersion) => {
    setDiagram(ver.diagram_json);
    setCurrentVersionNumber(ver.version_number);
    handleFitDiagramToView(ver.diagram_json.nodes);
    showToast(`Restored version v${ver.version_number}`, 'success');
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-gray-950 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        title={diagram.title}
        diagramSchema={diagram}
        user={user}
        onUserTierToggle={handleToggleUserTier}
        onToggleAuditLogs={() => setIsAuditPanelOpen(!isAuditPanelOpen)}
        onToggleVersions={() => setIsVersionModalOpen(true)}
        onExport={handleExport}
        rateLimitState={rateLimitState}
        auditCount={auditLogs.length}
      />

      {/* Main Interactive Whiteboard Canvas Workspace */}
      <main className="flex-1 relative w-full h-full overflow-hidden">
        {/* Floating Tool Bar */}
        <Toolbar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          onAddNode={handleAddNode}
          onApplyLayout={handleApplyLayout}
          zoom={zoom}
          onZoomIn={() => setZoom(prev => Math.min(prev + 0.15, 2.5))}
          onZoomOut={() => setZoom(prev => Math.max(prev - 0.15, 0.4))}
          onResetZoom={() => handleFitDiagramToView(diagram.nodes)}
          selectedNodeId={selectedNodeId}
          onDeleteSelected={handleDeleteSelected}
        />

        {/* SVG/Canvas Engine */}
        <Canvas
          nodes={diagram.nodes}
          edges={diagram.edges}
          onNodesChange={nodes => setDiagram({ ...diagram, nodes })}
          onEdgesChange={edges => setDiagram({ ...diagram, edges })}
          zoom={zoom}
          pan={pan}
          onPanChange={setPan}
          activeTool={activeTool}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
        />

        {/* Bottom AI Prompt Bar */}
        <PromptInput
          onGenerate={handleGenerateAIDiagram}
          isGenerating={isGenerating}
        />

        {/* AI Service Pipeline Visualizer Overlay */}
        <PipelineVisualizer progress={pipelineProgress} />
      </main>

      {/* Security & Telemetry Drawer */}
      <SecurityAuditPanel
        isOpen={isAuditPanelOpen}
        onClose={() => setIsAuditPanelOpen(false)}
        logs={auditLogs}
        rateLimitState={rateLimitState}
        onClearLogs={() => {
          securityEngine.clearLogs();
          refreshAuditLogs();
        }}
      />

      {/* Version Control History Modal */}
      <VersionHistoryModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        versions={versions}
        onRestoreVersion={handleRestoreVersion}
        currentVersion={currentVersionNumber}
      />

      {/* Floating Toast Notification - Positioned right below the AI Prompt Generate Bar */}
      {toast && (
        <div className={`fixed top-[185px] left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full backdrop-blur-2xl text-xs font-semibold shadow-[0_10px_30px_rgba(0,0,0,0.5)] border flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 transition-all duration-300 ${
          toast.type === 'success'
            ? 'border-emerald-500/50 text-emerald-300 bg-slate-900/90 shadow-emerald-500/20'
            : toast.type === 'error'
            ? 'border-rose-500/50 text-rose-300 bg-slate-900/90 shadow-rose-500/20'
            : 'border-indigo-500/50 text-indigo-300 bg-slate-900/90 shadow-indigo-500/20'
        }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

