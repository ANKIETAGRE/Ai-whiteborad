import React, { useState, useRef, useEffect } from 'react';
import type { 
  DiagramNode, 
  DiagramEdge, 
  NodeType 
} from '../../types/diagram';
import { 
  Layout, 
  Database, 
  User as UserIcon, 
  Layers, 
  Cpu, 
  Zap, 
  Cloud, 
  Shield, 
  ShoppingCart, 
  Box, 
  CreditCard, 
  Server, 
  Target, 
  Sparkles, 
  Users, 
  Edit3 
} from 'lucide-react';

interface CanvasProps {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  onNodesChange: (nodes: DiagramNode[]) => void;
  onEdgesChange: (edges: DiagramEdge[]) => void;
  zoom: number;
  pan: { x: number; y: number };
  onPanChange: (pan: { x: number; y: number }) => void;
  activeTool: 'select' | 'node' | 'connector' | 'sticky' | 'draw' | 'text';
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  zoom,
  pan,
  onPanChange,
  activeTool,
  selectedNodeId,
  onSelectNode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Connecting Edges drag state
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState({ x: 0, y: 0 });

  // Editing label inline
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');

  // Calculate diagram bounds for scrollbars
  const getBounds = () => {
    if (nodes.length === 0) {
      return { minX: -200, maxX: 1200, minY: -200, maxY: 800 };
    }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach(n => {
      const w = n.width || 190;
      const h = n.height || 85;
      if (n.position.x < minX) minX = n.position.x;
      if (n.position.x + w > maxX) maxX = n.position.x + w;
      if (n.position.y < minY) minY = n.position.y;
      if (n.position.y + h > maxY) maxY = n.position.y + h;
    });

    const screenW = window.innerWidth || 1200;
    const screenH = window.innerHeight || 800;

    return {
      minX: Math.min(minX - 150, -200),
      maxX: Math.max(maxX + 350, screenW + 400),
      minY: Math.min(minY - 150, -200),
      maxY: Math.max(maxY + 350, screenH + 400)
    };
  };

  const bounds = getBounds();
  const totalW = bounds.maxX - bounds.minX;
  const totalH = bounds.maxY - bounds.minY;
  const screenW = window.innerWidth || 1200;
  const screenH = window.innerHeight || 800;

  // Strict Pan Boundary Clamping helper to prevent diagram from being panned off-screen
  const clampPan = (newPan: { x: number; y: number }) => {
    if (nodes.length === 0) return newPan;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach(n => {
      const w = n.width || 190;
      const h = n.height || 85;
      if (n.position.x < minX) minX = n.position.x;
      if (n.position.x + w > maxX) maxX = n.position.x + w;
      if (n.position.y < minY) minY = n.position.y;
      if (n.position.y + h > maxY) maxY = n.position.y + h;
    });

    const sW = window.innerWidth || 1200;
    const sH = window.innerHeight || 800;
    const marginX = 220;
    const marginY = 160;

    const maxPanX = sW - marginX - minX * zoom;
    const minPanX = marginX - maxX * zoom;
    const maxPanY = sH - marginY - minY * zoom;
    const minPanY = marginY - maxY * zoom;

    const limitMinX = Math.min(minPanX, maxPanX);
    const limitMaxX = Math.max(minPanX, maxPanX);
    const limitMinY = Math.min(minPanY, maxPanY);
    const limitMaxY = Math.max(minPanY, maxPanY);

    const clampedX = Math.max(limitMinX, Math.min(limitMaxX, newPan.x));
    const clampedY = Math.max(limitMinY, Math.min(limitMaxY, newPan.y));

    return { x: Math.round(clampedX), y: Math.round(clampedY) };
  };

  // Scrollbar ratios
  const hThumbWidthPct = Math.max(10, Math.min(100, (screenW / (totalW * zoom)) * 100));
  const vThumbHeightPct = Math.max(10, Math.min(100, (screenH / (totalH * zoom)) * 100));

  const hThumbLeftPct = Math.max(0, Math.min(100 - hThumbWidthPct, ((-pan.x - bounds.minX * zoom) / (totalW * zoom)) * 100));
  const vThumbTopPct = Math.max(0, Math.min(100 - vThumbHeightPct, ((-pan.y - bounds.minY * zoom) / (totalH * zoom)) * 100));

  // Handle Wheel Scroll with strict pan boundary clamping
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return;
      e.preventDefault();
      onPanChange(clampPan({
        x: pan.x - e.deltaX,
        y: pan.y - e.deltaY
      }));
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [pan, onPanChange, nodes, zoom]);

  // Click on Horizontal Scrollbar Track
  const handleHScrollClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = clickX / rect.width;
    const targetPanX = -(bounds.minX * zoom + pct * totalW * zoom - screenW / 2);
    onPanChange(clampPan({ ...pan, x: Math.round(targetPanX) }));
  };

  // Click on Vertical Scrollbar Track
  const handleVScrollClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const pct = clickY / rect.height;
    const targetPanY = -(bounds.minY * zoom + pct * totalH * zoom - screenH / 2);
    onPanChange(clampPan({ ...pan, y: Math.round(targetPanY) }));
  };

  // Icon mapping
  const renderNodeIcon = (iconName?: string, type?: NodeType) => {
    const props = { className: "w-5 h-5 text-white/90" };
    switch (iconName || type) {
      case 'Database': case 'database': return <Database {...props} />;
      case 'User': case 'user': return <UserIcon {...props} />;
      case 'Layers': case 'queue': return <Layers {...props} />;
      case 'Cpu': case 'service': return <Cpu {...props} />;
      case 'Zap': case 'cache': return <Zap {...props} />;
      case 'Cloud': case 'cloud': return <Cloud {...props} />;
      case 'Shield': case 'gateway': return <Shield {...props} />;
      case 'ShoppingCart': return <ShoppingCart {...props} />;
      case 'Box': return <Box {...props} />;
      case 'CreditCard': return <CreditCard {...props} />;
      case 'Server': return <Server {...props} />;
      case 'Target': return <Target {...props} />;
      case 'Sparkles': return <Sparkles {...props} />;
      case 'Users': return <Users {...props} />;
      case 'Edit3': return <Edit3 {...props} />;
      default: return <Layout {...props} />;
    }
  };

  const getCanvasCoords = (e: React.MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e);

    // Text block placement tool
    if (activeTool === 'text' && (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg')) {
      const newId = 'text_' + Math.random().toString(36).substr(2, 7);
      const newTextNode: DiagramNode = {
        id: newId,
        type: 'text',
        label: 'New Text Block',
        position: { x: Math.round(coords.x), y: Math.round(coords.y) },
        width: 160,
        height: 40
      };
      onNodesChange([...nodes, newTextNode]);
      onSelectNode(newId);
      setEditingNodeId(newId);
      setEditingLabel('New Text Block');
      return;
    }

    // Sticky note placement tool
    if (activeTool === 'sticky' && (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg')) {
      const newId = 'sticky_' + Math.random().toString(36).substr(2, 7);
      const newStickyNode: DiagramNode = {
        id: newId,
        type: 'sticky-note',
        label: 'New Sticky Note',
        position: { x: Math.round(coords.x), y: Math.round(coords.y) },
        width: 160,
        height: 160
      };
      onNodesChange([...nodes, newStickyNode]);
      onSelectNode(newId);
      setEditingNodeId(newId);
      setEditingLabel('New Sticky Note');
      return;
    }

    // Architecture node placement tool
    if (activeTool === 'node' && (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg')) {
      const newId = 'service_' + Math.random().toString(36).substr(2, 7);
      const newNode: DiagramNode = {
        id: newId,
        type: 'service',
        label: 'New Service',
        sublabel: 'Manual Element',
        icon: 'Cpu',
        color: '#6366f1',
        position: { x: Math.round(coords.x), y: Math.round(coords.y) },
        width: 190,
        height: 85
      };
      onNodesChange([...nodes, newNode]);
      onSelectNode(newId);
      return;
    }

    // STRICT: Pan mode allowed ONLY when middle mouse button (1) OR activeTool === 'select'
    if (e.button === 1 || (activeTool === 'select' && (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg'))) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      onSelectNode(null);
      setEditingNodeId(null);
      return;
    }

    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      onSelectNode(null);
      setEditingNodeId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e);
    setCurrentMousePos(coords);

    if (isPanning) {
      onPanChange(clampPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      }));
      return;
    }

    // STRICT: Dragging nodes allowed ONLY when activeTool === 'select'!
    if (draggingNodeId && activeTool === 'select') {
      const updated = nodes.map(n => {
        if (n.id === draggingNodeId) {
          return {
            ...n,
            position: {
              x: Math.round(coords.x - dragOffset.x),
              y: Math.round(coords.y - dragOffset.y)
            }
          };
        }
        return n;
      });
      onNodesChange(updated);
    }
  };

  const handleMouseUp = () => {
    if (isPanning) setIsPanning(false);
    if (draggingNodeId) setDraggingNodeId(null);

    if (connectingSourceId) {
      setConnectingSourceId(null);
    }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, node: DiagramNode) => {
    e.stopPropagation();
    const coords = getCanvasCoords(e);

    onSelectNode(node.id);

    if (activeTool === 'connector') {
      setConnectingSourceId(node.id);
      return;
    }

    // STRICT REQUIREMENT: Nodes can ONLY be dragged when activeTool === 'select'!
    if (activeTool === 'select') {
      setDraggingNodeId(node.id);
      setDragOffset({
        x: coords.x - node.position.x,
        y: coords.y - node.position.y
      });
    }
  };

  const handleNodeMouseUp = (e: React.MouseEvent, targetNode: DiagramNode) => {
    if (connectingSourceId && connectingSourceId !== targetNode.id) {
      e.stopPropagation();
      const newEdge: DiagramEdge = {
        id: 'edge_' + Math.random().toString(36).substr(2, 9),
        source: connectingSourceId,
        target: targetNode.id,
        label: 'Connection',
        animated: true,
        color: '#6366f1'
      };
      onEdgesChange([...edges, newEdge]);
      setConnectingSourceId(null);
    }
  };

  const handleDoubleClickNode = (node: DiagramNode) => {
    setEditingNodeId(node.id);
    setEditingLabel(node.label);
  };

  const handleSaveLabel = (nodeId: string) => {
    onNodesChange(
      nodes.map(n => (n.id === nodeId ? { ...n, label: editingLabel } : n))
    );
    setEditingNodeId(null);
  };

  // Helper to compute node center & edge connections
  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    const w = node.width || 180;
    const h = node.height || 80;
    return {
      x: node.position.x + w / 2,
      y: node.position.y + h / 2
    };
  };

  // Dynamic cursor based on active tool
  const getCursorClass = () => {
    switch (activeTool) {
      case 'select': return 'cursor-default';
      case 'text': return 'cursor-text';
      case 'sticky': return 'cursor-copy';
      case 'connector': return 'cursor-alias';
      case 'node': return 'cursor-copy';
      default: return 'cursor-default';
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`w-full h-full relative overflow-hidden bg-grid-dots select-none ${getCursorClass()}`}
      style={{
        backgroundColor: '#0d121f'
      }}
    >
      {/* Transformation Pan & Zoom Container */}
      <div
        className="w-full h-full absolute inset-0 origin-top-left transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
        }}
      >
        {/* SVG Overlay for Edges & Connectors */}
        <svg className="w-[10000px] h-[10000px] absolute inset-0 pointer-events-none z-0">
          <defs>
            {/* Arrowhead Markers */}
            <marker id="arrow-indigo" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
            </marker>
            <marker id="arrow-pink" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ec4899" />
            </marker>
            <marker id="arrow-emerald" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
            </marker>
            <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
            </marker>
          </defs>

          {/* Render Persistent Edges */}
          {edges.map(edge => {
            const start = getNodeCenter(edge.source);
            const end = getNodeCenter(edge.target);

            // Bézier Control Points for smooth dynamic curve
            const dx = end.x - start.x;
            const cx1 = start.x + dx * 0.5;
            const cy1 = start.y;
            const cx2 = start.x + dx * 0.5;
            const cy2 = end.y;
            const pathD = `M ${start.x} ${start.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${end.x} ${end.y}`;

            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;

            return (
              <g key={edge.id} className="group">
                {/* Outer halo highlight */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={edge.color || '#6366f1'}
                  strokeWidth="6"
                  strokeOpacity="0.15"
                />
                {/* Core Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={edge.color || '#6366f1'}
                  strokeWidth="2.5"
                  className={edge.animated ? 'animate-flow' : ''}
                  markerEnd="url(#arrow-indigo)"
                />
                {/* Edge Label */}
                {edge.label && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-50"
                      y="-12"
                      width="100"
                      height="22"
                      rx="6"
                      fill="#111827"
                      stroke="#374151"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fill="#9ca3af"
                      fontSize="10"
                      fontWeight="500"
                    >
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Active Connector Rubber-Band Drag */}
          {connectingSourceId && (
            <line
              x1={getNodeCenter(connectingSourceId).x}
              y1={getNodeCenter(connectingSourceId).y}
              x2={currentMousePos.x}
              y2={currentMousePos.y}
              stroke="#ec4899"
              strokeWidth="2.5"
              strokeDasharray="5,5"
            />
          )}
        </svg>

        {/* Nodes Layer */}
        {nodes.map(node => {
          const isSelected = selectedNodeId === node.id;
          const isSticky = node.type === 'sticky-note';
          const isText = node.type === 'text';
          const width = node.width || (isSticky ? 160 : isText ? 240 : 190);
          const height = isText ? undefined : (node.height || (isSticky ? 160 : 85));
          const accentColor = node.color || '#6366f1';

          return (
            <div
              key={node.id}
              onMouseDown={e => handleNodeMouseDown(e, node)}
              onMouseUp={e => handleNodeMouseUp(e, node)}
              onDoubleClick={() => handleDoubleClickNode(node)}
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
                width: `${width}px`,
                height: height ? `${height}px` : 'auto',
                minHeight: isText ? '44px' : undefined
              }}
              className={`absolute transition-all rounded-2xl select-none z-10 ${
                activeTool === 'select'
                  ? 'cursor-grab active:cursor-grabbing hover:scale-[1.02]'
                  : 'cursor-pointer'
              } ${
                isSticky
                  ? 'bg-amber-400/90 text-gray-900 shadow-xl border border-amber-300 p-4 font-sans'
                  : isText
                  ? 'bg-indigo-950/70 backdrop-blur-md text-white p-3 font-mono text-sm border border-indigo-500/40 rounded-2xl shadow-xl shadow-indigo-950/50'
                  : 'glass-card p-3.5 flex flex-col justify-between'
              } ${
                isSelected
                  ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-indigo-500 shadow-2xl shadow-indigo-500/40 border-indigo-400'
                  : ''
              }`}
            >
              {isSticky ? (
                <div className="h-full flex flex-col justify-between">
                  <div className="font-semibold text-xs text-amber-950 uppercase tracking-wide">Sticky Note</div>
                  {editingNodeId === node.id ? (
                    <textarea
                      value={editingLabel}
                      onChange={e => setEditingLabel(e.target.value)}
                      onBlur={() => handleSaveLabel(node.id)}
                      autoFocus
                      className="bg-amber-100 text-amber-950 text-xs p-1 rounded outline-none w-full h-20 resize-none font-medium"
                    />
                  ) : (
                    <p className="text-sm font-medium text-amber-900 leading-snug">{node.label}</p>
                  )}
                  <span className="text-[10px] text-amber-800/60 font-mono">Double click to edit</span>
                </div>
              ) : isText ? (
                <div className="w-full h-full flex flex-col justify-center">
                  {editingNodeId === node.id ? (
                    <textarea
                      value={editingLabel}
                      onChange={e => setEditingLabel(e.target.value)}
                      onBlur={() => handleSaveLabel(node.id)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSaveLabel(node.id);
                        }
                      }}
                      autoFocus
                      className="bg-slate-900 text-white text-xs p-2 rounded-xl border border-indigo-400 outline-none w-full resize-none font-mono min-h-[44px]"
                    />
                  ) : (
                    <div className="text-indigo-100 font-bold text-sm tracking-wide leading-relaxed break-words whitespace-pre-wrap">
                      {node.label}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Card Header & Icon */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shadow-inner"
                        style={{ backgroundColor: accentColor }}
                      >
                        {renderNodeIcon(node.icon, node.type)}
                      </div>
                      <div>
                        {editingNodeId === node.id ? (
                          <input
                            type="text"
                            value={editingLabel}
                            onChange={e => setEditingLabel(e.target.value)}
                            onBlur={() => handleSaveLabel(node.id)}
                            onKeyDown={e => e.key === 'Enter' && handleSaveLabel(node.id)}
                            autoFocus
                            className="bg-gray-800 text-white text-xs px-2 py-1 rounded border border-indigo-500 outline-none w-28"
                          />
                        ) : (
                          <h3 className="text-xs font-bold text-white tracking-wide truncate max-w-[110px]">
                            {node.label}
                          </h3>
                        )}
                        {node.sublabel && (
                          <p className="text-[10px] text-gray-400 font-medium truncate max-w-[110px]">
                            {node.sublabel}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Tag */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-800/80">
                    <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-gray-800/80 text-gray-400 uppercase tracking-wider">
                      {node.type}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Subtle Bottom Horizontal Scrollbar (Does NOT overlap Prompt Input bar) */}
      {hThumbWidthPct < 98 && (
        <div
          onClick={handleHScrollClick}
          title="Click to scroll horizontally"
          className="absolute bottom-1.5 left-28 right-6 z-10 h-2 bg-slate-900/60 backdrop-blur-md rounded-full p-0.5 cursor-pointer border border-white/10 hover:border-indigo-500/40 transition-colors"
        >
          <div
            className="h-full bg-indigo-400/50 hover:bg-indigo-400/90 rounded-full shadow-md transition-all duration-150 relative"
            style={{
              width: `${hThumbWidthPct}%`,
              left: `${hThumbLeftPct}%`
            }}
          />
        </div>
      )}

      {/* Subtle Right Vertical Scrollbar */}
      {vThumbHeightPct < 98 && (
        <div
          onClick={handleVScrollClick}
          title="Click to scroll vertically"
          className="absolute top-20 bottom-4 right-2 z-10 w-2 bg-slate-900/60 backdrop-blur-md rounded-full p-0.5 cursor-pointer border border-white/10 hover:border-indigo-500/40 transition-colors"
        >
          <div
            className="w-full bg-indigo-400/50 hover:bg-indigo-400/90 rounded-full shadow-md transition-all duration-150 relative"
            style={{
              height: `${vThumbHeightPct}%`,
              top: `${vThumbTopPct}%`
            }}
          />
        </div>
      )}
    </div>
  );
};
