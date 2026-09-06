import type { DiagramNode, DiagramEdge, DiagramType } from '../types/diagram';

export class LayoutEngine {
  /**
   * Calculates automatic node layout based on diagram type and graph structure
   */
  public applyLayout(
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    diagramType: DiagramType,
    algorithm: 'hierarchical' | 'horizontal' | 'grid' | 'radial' = 'hierarchical'
  ): DiagramNode[] {
    if (nodes.length === 0) return [];

    switch (algorithm) {
      case 'horizontal':
        return this.horizontalLayeredLayout(nodes, edges);
      case 'grid':
        return this.gridLayout(nodes);
      case 'radial':
        return this.radialLayout(nodes);
      case 'hierarchical':
      default:
        if (diagramType === 'mindmap') {
          return this.radialLayout(nodes);
        } else if (diagramType === 'flowchart' || diagramType === 'sequence') {
          return this.horizontalLayeredLayout(nodes, edges);
        } else if (diagramType === 'cloud') {
          return this.topDownLayeredLayout(nodes, edges);
        }
        return this.topDownLayeredLayout(nodes, edges);
    }
  }

  /**
   * Top-Down Layered (DAG) Hierarchical layout algorithm
   */
  private topDownLayeredLayout(nodes: DiagramNode[], edges: DiagramEdge[]): DiagramNode[] {
    const nodeMap = new Map<string, DiagramNode>(nodes.map(n => [n.id, { ...n }]));
    const inDegree = new Map<string, number>();
    const childrenMap = new Map<string, string[]>();

    nodes.forEach(n => {
      inDegree.set(n.id, 0);
      childrenMap.set(n.id, []);
    });

    edges.forEach(e => {
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
      const kids = childrenMap.get(e.source) || [];
      kids.push(e.target);
      childrenMap.set(e.source, kids);
    });

    // Determine layers via BFS topological rank
    const layers: string[][] = [];
    const visited = new Set<string>();

    let currentLayer = nodes.filter(n => (inDegree.get(n.id) || 0) === 0).map(n => n.id);
    if (currentLayer.length === 0 && nodes.length > 0) {
      currentLayer = [nodes[0].id];
    }

    while (currentLayer.length > 0) {
      layers.push(currentLayer);
      currentLayer.forEach(id => visited.add(id));

      const nextLayerSet = new Set<string>();
      currentLayer.forEach(id => {
        const kids = childrenMap.get(id) || [];
        kids.forEach(k => {
          if (!visited.has(k)) {
            nextLayerSet.add(k);
          }
        });
      });

      currentLayer = Array.from(nextLayerSet);
    }

    // Add unvisited nodes to bottom layer
    const remaining = nodes.filter(n => !visited.has(n.id)).map(n => n.id);
    if (remaining.length > 0) {
      layers.push(remaining);
    }

    // Position calculation
    const startY = 100;
    const startX = 350;
    const verticalGap = 160;
    const horizontalGap = 240;

    const result: DiagramNode[] = [];

    layers.forEach((layerIds, layerIndex) => {
      const totalWidth = (layerIds.length - 1) * horizontalGap;
      const layerStartX = startX - totalWidth / 2;

      layerIds.forEach((id, index) => {
        const original = nodeMap.get(id)!;
        const width = original.width || 180;
        const height = original.height || 80;

        result.push({
          ...original,
          position: {
            x: Math.round(layerStartX + index * horizontalGap - width / 2),
            y: Math.round(startY + layerIndex * verticalGap)
          },
          width,
          height
        });
      });
    });

    return result;
  }

  /**
   * Horizontal Left-to-Right Layered Layout
   */
  private horizontalLayeredLayout(nodes: DiagramNode[], edges: DiagramEdge[]): DiagramNode[] {
    const nodeMap = new Map<string, DiagramNode>(nodes.map(n => [n.id, { ...n }]));
    const inDegree = new Map<string, number>();
    const childrenMap = new Map<string, string[]>();

    nodes.forEach(n => {
      inDegree.set(n.id, 0);
      childrenMap.set(n.id, []);
    });

    edges.forEach(e => {
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
      const kids = childrenMap.get(e.source) || [];
      kids.push(e.target);
      childrenMap.set(e.source, kids);
    });

    const layers: string[][] = [];
    const visited = new Set<string>();

    let currentLayer = nodes.filter(n => (inDegree.get(n.id) || 0) === 0).map(n => n.id);
    if (currentLayer.length === 0 && nodes.length > 0) {
      currentLayer = [nodes[0].id];
    }

    while (currentLayer.length > 0) {
      layers.push(currentLayer);
      currentLayer.forEach(id => visited.add(id));

      const nextLayerSet = new Set<string>();
      currentLayer.forEach(id => {
        const kids = childrenMap.get(id) || [];
        kids.forEach(k => {
          if (!visited.has(k)) {
            nextLayerSet.add(k);
          }
        });
      });

      currentLayer = Array.from(nextLayerSet);
    }

    const remaining = nodes.filter(n => !visited.has(n.id)).map(n => n.id);
    if (remaining.length > 0) {
      layers.push(remaining);
    }

    const startX = 120;
    const startY = 250;
    const horizontalGap = 240;
    const verticalGap = 140;

    const result: DiagramNode[] = [];

    layers.forEach((layerIds, layerIndex) => {
      const totalHeight = (layerIds.length - 1) * verticalGap;
      const layerStartY = startY - totalHeight / 2;

      layerIds.forEach((id, index) => {
        const original = nodeMap.get(id)!;
        const width = original.width || 180;
        const height = original.height || 80;

        result.push({
          ...original,
          position: {
            x: Math.round(startX + layerIndex * horizontalGap),
            y: Math.round(layerStartY + index * verticalGap)
          },
          width,
          height
        });
      });
    });

    return result;
  }

  /**
   * Uniform Grid Layout
   */
  private gridLayout(nodes: DiagramNode[]): DiagramNode[] {
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const startX = 150;
    const startY = 120;
    const cellWidth = 240;
    const cellHeight = 160;

    return nodes.map((node, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        ...node,
        position: {
          x: startX + col * cellWidth,
          y: startY + row * cellHeight
        },
        width: node.width || 180,
        height: node.height || 80
      };
    });
  }

  /**
   * Radial / Mindmap Layout
   */
  private radialLayout(nodes: DiagramNode[]): DiagramNode[] {
    if (nodes.length === 0) return [];
    
    const centerX = 400;
    const centerY = 300;
    const radius = 260;

    const root = nodes[0];
    const rest = nodes.slice(1);

    const result: DiagramNode[] = [
      {
        ...root,
        position: { x: centerX, y: centerY },
        width: root.width || 200,
        height: root.height || 90
      }
    ];

    const angleStep = (2 * Math.PI) / (rest.length || 1);

    rest.forEach((node, i) => {
      const angle = i * angleStep;
      const x = Math.round(centerX + radius * Math.cos(angle));
      const y = Math.round(centerY + radius * Math.sin(angle));

      result.push({
        ...node,
        position: { x, y },
        width: node.width || 170,
        height: node.height || 75
      });
    });

    return result;
  }
}

export const layoutEngine = new LayoutEngine();
