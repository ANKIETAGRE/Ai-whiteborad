import type { DiagramSchema, DiagramNode } from '../types/diagram';

// Helper to escape XML special characters
function escapeXml(unsafe: string = ''): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Generate self-contained SVG string from diagram schema
export function generateSVGString(diagram: DiagramSchema): string {
  const nodes = diagram.nodes || [];
  const edges = diagram.edges || [];

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

  if (nodes.length === 0) {
    minX = 0; maxX = 800; minY = 0; maxY = 600;
  } else {
    nodes.forEach(n => {
      const w = n.width || 190;
      const h = n.height || 85;
      if (n.position.x < minX) minX = n.position.x;
      if (n.position.x + w > maxX) maxX = n.position.x + w;
      if (n.position.y < minY) minY = n.position.y;
      if (n.position.y + h > maxY) maxY = n.position.y + h;
    });
  }

  const padding = 70;
  const startX = minX - padding;
  const startY = minY - padding;
  const width = Math.max(400, (maxX - minX) + padding * 2);
  const height = Math.max(300, (maxY - minY) + padding * 2);

  // Map nodes by ID for fast connector coordinate calculation
  const nodeMap = new Map<string, DiagramNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  // Render Edges
  const edgeSvgElements = edges.map(edge => {
    const srcNode = nodeMap.get(edge.source);
    const tgtNode = nodeMap.get(edge.target);
    if (!srcNode || !tgtNode) return '';

    const srcW = srcNode.width || 190;
    const srcH = srcNode.height || 85;
    const tgtW = tgtNode.width || 190;
    const tgtH = tgtNode.height || 85;

    const srcX = srcNode.position.x + srcW / 2;
    const srcY = srcNode.position.y + srcH / 2;
    const tgtX = tgtNode.position.x + tgtW / 2;
    const tgtY = tgtNode.position.y + tgtH / 2;

    const dx = tgtX - srcX;
    const dy = tgtY - srcY;

    // Bezier control offset
    const ctrlOffsetX = Math.min(120, Math.max(40, Math.abs(dx) * 0.4));
    const ctrlOffsetY = Math.min(120, Math.max(40, Math.abs(dy) * 0.4));

    let pathD = '';
    if (Math.abs(dx) > Math.abs(dy)) {
      const c1x = srcX + (dx > 0 ? ctrlOffsetX : -ctrlOffsetX);
      const c2x = tgtX - (dx > 0 ? ctrlOffsetX : -ctrlOffsetX);
      pathD = `M ${srcX} ${srcY} C ${c1x} ${srcY}, ${c2x} ${tgtY}, ${tgtX} ${tgtY}`;
    } else {
      const c1y = srcY + (dy > 0 ? ctrlOffsetY : -ctrlOffsetY);
      const c2y = tgtY - (dy > 0 ? ctrlOffsetY : -ctrlOffsetY);
      pathD = `M ${srcX} ${srcY} C ${srcX} ${c1y}, ${tgtX} ${c2y}, ${tgtX} ${tgtY}`;
    }

    const color = edge.color || '#6366f1';
    const midX = (srcX + tgtX) / 2;
    const midY = (srcY + tgtY) / 2;

    const isDashed = edge.style === 'dashed';
    const isDotted = edge.style === 'dotted';
    const strokeDasharray = isDashed ? '6 4' : isDotted ? '2 4' : 'none';

    let labelSvg = '';
    if (edge.label) {
      const labelText = escapeXml(edge.label);
      const labelWidth = labelText.length * 6.5 + 16;
      labelSvg = `
        <g transform="translate(${midX - labelWidth / 2}, ${midY - 10})">
          <rect width="${labelWidth}" height="20" rx="10" fill="#0f172a" stroke="${color}" stroke-opacity="0.5" stroke-width="1" />
          <text x="${labelWidth / 2}" y="13" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#cbd5e1" text-anchor="middle">${labelText}</text>
        </g>
      `;
    }

    return `
      <g class="diagram-edge">
        <path d="${pathD}" stroke="${color}" stroke-width="2" stroke-dasharray="${strokeDasharray}" fill="none" marker-end="url(#arrow-${color.replace('#', '')})" opacity="0.85" />
        ${labelSvg}
      </g>
    `;
  }).join('\n');

  // Collect distinct edge colors for marker definitions
  const edgeColors = Array.from(new Set(edges.map(e => e.color || '#6366f1')));
  if (edgeColors.length === 0) edgeColors.push('#6366f1');

  const markerDefs = edgeColors.map(c => `
    <marker id="arrow-${c.replace('#', '')}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="${c}" />
    </marker>
  `).join('\n');

  // Render Nodes
  const nodeSvgElements = nodes.map(node => {
    const x = node.position.x;
    const y = node.position.y;
    const w = node.width || 190;
    const h = node.height || 85;
    const color = node.color || '#6366f1';
    const label = escapeXml(node.label || 'Node');
    const sublabel = escapeXml(node.sublabel || '');
    const nodeType = (node.type || 'service').toUpperCase();

    if (node.type === 'sticky-note') {
      return `
        <g transform="translate(${x}, ${y})" class="diagram-node">
          <rect width="${w}" height="${h}" rx="8" fill="#fef08a" stroke="#eab308" stroke-width="1.5" />
          <text x="12" y="24" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#854d0e">${label}</text>
          ${sublabel ? `<text x="12" y="44" font-family="system-ui, sans-serif" font-size="11" fill="#a16207">${sublabel}</text>` : ''}
        </g>
      `;
    }

    if (node.type === 'text') {
      return `
        <g transform="translate(${x}, ${y})" class="diagram-node">
          <text x="0" y="20" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#f1f5f9">${label}</text>
        </g>
      `;
    }

    // Standard dark glassmorphic architecture node card
    const tagWidth = nodeType.length * 6 + 12;

    return `
      <g transform="translate(${x}, ${y})" class="diagram-node">
        <!-- Glow Shadow -->
        <rect width="${w}" height="${h}" rx="12" fill="${color}" fill-opacity="0.05" />
        <!-- Node Card Base -->
        <rect width="${w}" height="${h}" rx="12" fill="#0f172a" stroke="${color}" stroke-opacity="0.6" stroke-width="1.5" />
        <!-- Top Accent Bar -->
        <rect width="${w}" height="4" rx="2" fill="${color}" />
        <!-- Icon Container Badge -->
        <rect x="12" y="14" width="28" height="28" rx="8" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-opacity="0.4" stroke-width="1" />
        <circle cx="26" cy="28" r="4" fill="${color}" />
        
        <!-- Node Titles -->
        <text x="48" y="27" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#f8fafc">${label}</text>
        ${sublabel ? `<text x="48" y="39" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">${sublabel}</text>` : ''}
        
        <!-- Category Badge Tag -->
        <rect x="12" y="${h - 22}" width="${tagWidth}" height="14" rx="4" fill="${color}" fill-opacity="0.15" />
        <text x="18" y="${h - 11}" font-family="system-ui, sans-serif" font-size="8" font-weight="800" fill="${color}">${nodeType}</text>
      </g>
    `;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${startX} ${startY} ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <pattern id="grid-dots" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="#334155" fill-opacity="0.3" />
    </pattern>
    ${markerDefs}
  </defs>

  <!-- Background Layer -->
  <rect x="${startX}" y="${startY}" width="${width}" height="${height}" fill="#090d16" />
  <rect x="${startX}" y="${startY}" width="${width}" height="${height}" fill="url(#grid-dots)" />

  <!-- Diagram Title Header -->
  <text x="${startX + 24}" y="${startY + 36}" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#6366f1">${escapeXml(diagram.title || 'AI Architecture Diagram')}</text>
  <text x="${startX + 24}" y="${startY + 52}" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#64748b">Generated with AI Whiteboard Canvas</text>

  <!-- Edges Group -->
  <g class="edges-layer">
    ${edgeSvgElements}
  </g>

  <!-- Nodes Group -->
  <g class="nodes-layer">
    ${nodeSvgElements}
  </g>
</svg>`;
}

// 1. Export JSON Schema
export function exportToJSON(diagram: DiagramSchema) {
  const jsonStr = JSON.stringify(diagram, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const fileName = `${(diagram.title || 'diagram').toLowerCase().replace(/[^a-z0-9]+/g, '_')}_schema.json`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 2. Export SVG Vector Image
export function exportToSVG(diagram: DiagramSchema) {
  const svgString = generateSVGString(diagram);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  const fileName = `${(diagram.title || 'diagram').toLowerCase().replace(/[^a-z0-9]+/g, '_')}_diagram.svg`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 3. Export High-Resolution PNG Image
export function exportToPNG(diagram: DiagramSchema, onSuccess?: () => void, onError?: (err: any) => void) {
  try {
    const svgString = generateSVGString(diagram);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const scale = 2; // High-DPI crisp export
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          if (onError) onError('Could not initialize canvas context');
          return;
        }

        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        canvas.toBlob((pngBlob) => {
          if (!pngBlob) {
            if (onError) onError('Could not generate PNG blob');
            return;
          }
          const pngUrl = URL.createObjectURL(pngBlob);
          const link = document.createElement('a');
          link.href = pngUrl;
          const fileName = `${(diagram.title || 'diagram').toLowerCase().replace(/[^a-z0-9]+/g, '_')}_diagram.png`;
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(pngUrl);
          if (onSuccess) onSuccess();
        }, 'image/png');
      } catch (err) {
        if (onError) onError(err);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      if (onError) onError(err);
    };

    img.src = url;
  } catch (err) {
    if (onError) onError(err);
  }
}
