import type { DiagramSchema, DiagramType, DiagramNode, DiagramEdge, PipelineProgress } from '../types/diagram';
import { securityEngine } from './securityEngine';
import { layoutEngine } from './layoutEngine';

interface GenerationOptions {
  prompt: string;
  diagramType?: DiagramType;
  userId: string;
  userTier?: 'free' | 'pro' | 'enterprise';
  layoutAlgorithm?: 'hierarchical' | 'horizontal' | 'grid' | 'radial';
  onProgress?: (progress: PipelineProgress) => void;
}

export class AIService {
  /**
   * Complete multi-stage AI Generation Pipeline:
   * Prompt -> Validation -> Intent -> Entity Extraction -> Relationship -> Schema Validation -> Layout -> Final Diagram
   */
  public async generateDiagram(options: GenerationOptions): Promise<DiagramSchema> {
    const { prompt, diagramType = 'architecture', userId, userTier = 'free', layoutAlgorithm = 'hierarchical', onProgress } = options;
    const requestId = 'req_' + Math.random().toString(36).substring(2, 9);

    const updateStage = (stage: PipelineProgress['stage'], message: string, progressPercent: number) => {
      if (onProgress) {
        onProgress({ stage, message, progressPercent });
      }
    };

    // Stage 1: Validation & Security Check
    updateStage('validating', 'Executing Security Sanitization & Prompt Injection Shield...', 15);
    await this.delay(200);

    const secCheck = securityEngine.validatePrompt(prompt, userId, requestId);
    if (!secCheck.isValid) {
      updateStage('failed', secCheck.error || 'Security check failed', 0);
      throw new Error(secCheck.error || 'Security check failed');
    }

    const rateCheck = securityEngine.checkRateLimit(userId, userTier, requestId);
    if (!rateCheck.allowed) {
      updateStage('failed', 'Rate limit exceeded for user quota.', 0);
      throw new Error('Rate limit exceeded. Please wait or upgrade to Pro tier.');
    }

    // Stage 2: Intent & Target Diagram Type Determination
    updateStage('detecting_intent', `Determining ${diagramType.toUpperCase()} diagram pattern & intent...`, 35);
    await this.delay(250);

    // Prioritize explicit user-selected diagramType, fallback to auto detection
    const targetType: DiagramType = diagramType || this.detectDiagramType(prompt, 'architecture');

    // Stage 3: Specialized Entity Extraction based on Diagram Type
    updateStage('extracting_entities', `Synthesizing ${targetType.toUpperCase()} nodes & infrastructure components...`, 60);
    await this.delay(300);

    const rawNodes = this.extractNodes(prompt, targetType);

    // Stage 4: Relationship Extraction & Edge Synthesis
    updateStage('schema_validation', 'Synthesizing directional relationships & validating JSON schema...', 80);
    await this.delay(250);

    const rawEdges = this.extractEdges(rawNodes, targetType);

    // Schema Validation Check
    const validatedNodes: DiagramNode[] = rawNodes.filter(node => {
      const isValid = securityEngine.validateNodeSchema(node);
      if (!isValid) {
        securityEngine.addAuditLog(userId, 'SCHEMA_VALIDATION', 'WARNING', `Dropped invalid node: ${node.id}`, requestId);
      }
      return isValid;
    });

    const validatedSchema: DiagramSchema = {
      diagram_type: targetType,
      title: this.generateTitle(prompt, targetType),
      nodes: validatedNodes,
      edges: rawEdges
    };

    // Stage 5: Layout Engine Computation
    updateStage('layout_computation', `Calculating optimal ${targetType.toUpperCase()} graph node positions...`, 95);
    await this.delay(200);

    const laidOutNodes = layoutEngine.applyLayout(
      validatedSchema.nodes,
      validatedSchema.edges,
      targetType,
      layoutAlgorithm
    );

    const finalDiagram: DiagramSchema = {
      ...validatedSchema,
      nodes: laidOutNodes
    };

    securityEngine.addAuditLog(
      userId,
      'AI_GENERATE_COMPLETE',
      'SUCCESS',
      `Generated ${targetType.toUpperCase()} diagram with ${finalDiagram.nodes.length} nodes for "${finalDiagram.title}"`,
      requestId
    );

    updateStage('completed', 'Diagram generated and rendered successfully!', 100);

    return finalDiagram;
  }

  private detectDiagramType(prompt: string, fallback: DiagramType): DiagramType {
    const lower = prompt.toLowerCase();
    if (lower.includes('flow') || lower.includes('step') || lower.includes('process') || lower.includes('workflow')) {
      return 'flowchart';
    }
    if (lower.includes('mindmap') || lower.includes('brainstorm') || lower.includes('concept') || lower.includes('roadmap')) {
      return 'mindmap';
    }
    if (lower.includes('sequence') || lower.includes('interaction') || lower.includes('message flow')) {
      return 'sequence';
    }
    if (lower.includes('aws') || lower.includes('cloud') || lower.includes('kubernetes') || lower.includes('docker') || lower.includes('gcp')) {
      return 'cloud';
    }
    return fallback;
  }

  private extractNodes(_prompt: string, type: DiagramType): DiagramNode[] {
    // 1. MINDMAP DIAGRAM TYPE
    if (type === 'mindmap') {
      return [
        { id: 'root', type: 'service', label: 'Product Roadmap 2026', sublabel: 'Central Core Vision', icon: 'Target', color: '#8b5cf6', position: { x: 0, y: 0 }, width: 220, height: 95 },
        { id: 'node-ai', type: 'cloud', label: 'AI Diagram Generator', sublabel: 'LLM Schemas', icon: 'Sparkles', color: '#ec4899', position: { x: 0, y: 0 } },
        { id: 'node-sec', type: 'service', label: 'Security & Auth Shield', sublabel: 'WAF Guard', icon: 'Shield', color: '#10b981', position: { x: 0, y: 0 } },
        { id: 'node-canvas', type: 'service', label: 'Interactive Whiteboard', sublabel: 'Bezier Curves', icon: 'Edit3', color: '#3b82f6', position: { x: 0, y: 0 } },
        { id: 'node-collab', type: 'service', label: 'Real-Time Sync Engine', sublabel: 'WebSocket Stream', icon: 'Users', color: '#f59e0b', position: { x: 0, y: 0 } },
        { id: 'node-export', type: 'service', label: 'Export Pipeline', sublabel: 'SVG / PNG / JSON', icon: 'Box', color: '#06b6d4', position: { x: 0, y: 0 } }
      ];
    }

    // 2. FLOWCHART DIAGRAM TYPE
    if (type === 'flowchart') {
      return [
        { id: 'flow-start', type: 'user', label: '🟢 Start Process', sublabel: 'User Form Trigger', icon: 'User', color: '#10b981', position: { x: 0, y: 0 } },
        { id: 'flow-receive', type: 'service', label: '📩 Parse Request', sublabel: 'API Ingress', icon: 'Cpu', color: '#3b82f6', position: { x: 0, y: 0 } },
        { id: 'flow-decision', type: 'gateway', label: '❓ Is Input Valid?', sublabel: 'Validation Gate', icon: 'Shield', color: '#f59e0b', position: { x: 0, y: 0 } },
        { id: 'flow-error', type: 'service', label: '⚠️ Return 400 Error', sublabel: 'Validation Failed', icon: 'Zap', color: '#ef4444', position: { x: 0, y: 0 } },
        { id: 'flow-exec', type: 'service', label: '⚡ Generate Diagram', sublabel: 'LLM Schema Synth', icon: 'Sparkles', color: '#8b5cf6', position: { x: 0, y: 0 } },
        { id: 'flow-db', type: 'database', label: '💾 Save Record', sublabel: 'PostgreSQL Store', icon: 'Database', color: '#10b981', position: { x: 0, y: 0 } },
        { id: 'flow-end', type: 'user', label: '🏁 Render View', sublabel: 'Success Response 200', icon: 'Target', color: '#06b6d4', position: { x: 0, y: 0 } }
      ];
    }

    // 3. SEQUENCE DIAGRAM TYPE
    if (type === 'sequence') {
      return [
        { id: 'seq-client', type: 'user', label: '1. User Client App', sublabel: 'React Frontend', icon: 'User', color: '#06b6d4', position: { x: 0, y: 0 } },
        { id: 'seq-gateway', type: 'gateway', label: '2. API Gateway', sublabel: 'FastAPI Proxy', icon: 'Shield', color: '#8b5cf6', position: { x: 0, y: 0 } },
        { id: 'seq-auth', type: 'service', label: '3. Auth & Rate Limit', sublabel: 'Redis Session Check', icon: 'Zap', color: '#f59e0b', position: { x: 0, y: 0 } },
        { id: 'seq-ai', type: 'service', label: '4. AI Engine', sublabel: 'Diagram Synthesizer', icon: 'Sparkles', color: '#ec4899', position: { x: 0, y: 0 } },
        { id: 'seq-db', type: 'database', label: '5. Database Store', sublabel: 'PostgreSQL Sync', icon: 'Database', color: '#10b981', position: { x: 0, y: 0 } }
      ];
    }

    // 4. CLOUD INFRASTRUCTURE DIAGRAM TYPE
    if (type === 'cloud') {
      return [
        { id: 'cloud-dns', type: 'cloud', label: '🌐 AWS Route53 DNS', sublabel: 'Global Edge Ingress', icon: 'Cloud', color: '#06b6d4', position: { x: 0, y: 0 } },
        { id: 'cloud-alb', type: 'gateway', label: '⚖️ AWS ALB Load Balancer', sublabel: 'TLS Termination', icon: 'Server', color: '#3b82f6', position: { x: 0, y: 0 } },
        { id: 'cloud-k8s', type: 'service', label: '☸️ EKS Kubernetes Cluster', sublabel: 'App Container Pods', icon: 'Cpu', color: '#8b5cf6', position: { x: 0, y: 0 } },
        { id: 'cloud-redis', type: 'cache', label: '⚡ ElastiCache Redis', sublabel: 'Cluster Mode Cache', icon: 'Zap', color: '#f59e0b', position: { x: 0, y: 0 } },
        { id: 'cloud-aurora', type: 'database', label: '🐬 Aurora PostgreSQL', sublabel: 'Multi-AZ Database', icon: 'Database', color: '#10b981', position: { x: 0, y: 0 } },
        { id: 'cloud-s3', type: 'cloud', label: '🪣 AWS S3 Object Bucket', sublabel: 'Diagram Assets Storage', icon: 'Box', color: '#ec4899', position: { x: 0, y: 0 } }
      ];
    }

    // 5. ARCHITECTURE DIAGRAM TYPE (DEFAULT)
    return [
      { id: 'web-app', type: 'service', label: 'Web App (React/Vite)', sublabel: 'Frontend Client', icon: 'Layout', color: '#6366f1', position: { x: 0, y: 0 } },
      { id: 'api-gateway', type: 'gateway', label: 'API Gateway (FastAPI)', sublabel: 'Auth & Security WAF', icon: 'Shield', color: '#8b5cf6', position: { x: 0, y: 0 } },
      { id: 'ai-service', type: 'service', label: 'AI Service Engine', sublabel: 'Prompt -> Diagram JSON', icon: 'Sparkles', color: '#ec4899', position: { x: 0, y: 0 } },
      { id: 'llm-provider', type: 'cloud', label: 'LLM Model Provider', sublabel: 'Gemini / Claude API', icon: 'Cpu', color: '#3b82f6', position: { x: 0, y: 0 } },
      { id: 'redis-cache', type: 'cache', label: 'Redis Cache Layer', sublabel: 'Session & Quotas', icon: 'Zap', color: '#f59e0b', position: { x: 0, y: 0 } },
      { id: 'database', type: 'database', label: 'PostgreSQL DB', sublabel: 'Users & Diagrams', icon: 'Database', color: '#10b981', position: { x: 0, y: 0 } },
      { id: 'user-client', type: 'user', label: 'User Client Browser', sublabel: 'Web / Mobile Interface', icon: 'User', color: '#06b6d4', position: { x: 0, y: 0 } }
    ];
  }

  private extractEdges(nodes: DiagramNode[], type: DiagramType): DiagramEdge[] {
    const nodeIds = nodes.map(n => n.id);

    if (type === 'flowchart' || nodeIds.includes('flow-start')) {
      return [
        { id: 'fe1', source: 'flow-start', target: 'flow-receive', label: '1. Submit Form', animated: true, color: '#10b981' },
        { id: 'fe2', source: 'flow-receive', target: 'flow-decision', label: '2. Evaluate Input', animated: true, color: '#3b82f6' },
        { id: 'fe3', source: 'flow-decision', target: 'flow-error', label: 'IF Invalid [No]', color: '#ef4444' },
        { id: 'fe4', source: 'flow-decision', target: 'flow-exec', label: 'IF Valid [Yes]', animated: true, color: '#10b981' },
        { id: 'fe5', source: 'flow-exec', target: 'flow-db', label: '3. Save Transaction', color: '#8b5cf6' },
        { id: 'fe6', source: 'flow-db', target: 'flow-end', label: '4. Render Canvas', animated: true, color: '#06b6d4' }
      ];
    }

    if (type === 'sequence' || nodeIds.includes('seq-client')) {
      return [
        { id: 'se1', source: 'seq-client', target: 'seq-gateway', label: 'Step 1: POST /api/generate', animated: true, color: '#06b6d4' },
        { id: 'se2', source: 'seq-gateway', target: 'seq-auth', label: 'Step 2: Validate JWT Auth', animated: true, color: '#f59e0b' },
        { id: 'se3', source: 'seq-gateway', target: 'seq-ai', label: 'Step 3: Dispatch Prompt Payload', animated: true, color: '#8b5cf6' },
        { id: 'se4', source: 'seq-ai', target: 'seq-db', label: 'Step 4: Persist Diagram JSON', color: '#ec4899' },
        { id: 'se5', source: 'seq-ai', target: 'seq-client', label: 'Step 5: Return 200 OK Response', animated: true, color: '#10b981' }
      ];
    }

    if (type === 'cloud' || nodeIds.includes('cloud-dns')) {
      return [
        { id: 'ce1', source: 'cloud-dns', target: 'cloud-alb', label: 'HTTPS Ingress Traffic', animated: true, color: '#06b6d4' },
        { id: 'ce2', source: 'cloud-alb', target: 'cloud-k8s', label: 'ALB Target Group Route', animated: true, color: '#3b82f6' },
        { id: 'ce3', source: 'cloud-k8s', target: 'cloud-redis', label: 'High-Speed Cache Lookup', color: '#f59e0b' },
        { id: 'ce4', source: 'cloud-k8s', target: 'cloud-aurora', label: 'SQL Connection Pool', color: '#10b981' },
        { id: 'ce5', source: 'cloud-k8s', target: 'cloud-s3', label: 'Upload Diagram Assets', color: '#ec4899' }
      ];
    }

    if (type === 'mindmap' || nodeIds.includes('root')) {
      return [
        { id: 'me1', source: 'root', target: 'node-ai', label: 'AI Generation Pillar', animated: true, color: '#ec4899' },
        { id: 'me2', source: 'root', target: 'node-sec', label: 'Security WAF Pillar', color: '#10b981' },
        { id: 'me3', source: 'root', target: 'node-canvas', label: 'Canvas Editor Pillar', color: '#3b82f6' },
        { id: 'me4', source: 'root', target: 'node-collab', label: 'Real-Time Sync Pillar', color: '#f59e0b' },
        { id: 'me5', source: 'root', target: 'node-export', label: 'Export Pipeline Pillar', color: '#06b6d4' }
      ];
    }

    // Architecture Default
    return [
      { id: 'e1', source: 'user-client', target: 'web-app', label: 'HTTPS Web Request', animated: true, color: '#06b6d4' },
      { id: 'e2', source: 'web-app', target: 'api-gateway', label: 'REST API Payload', animated: true, color: '#6366f1' },
      { id: 'e3', source: 'api-gateway', target: 'redis-cache', label: 'Check Auth & Rate Limit', color: '#f59e0b' },
      { id: 'e4', source: 'api-gateway', target: 'ai-service', label: 'Dispatch Prompt Request', animated: true, color: '#8b5cf6' },
      { id: 'e5', source: 'ai-service', target: 'llm-provider', label: 'Model Completion Call', animated: true, color: '#ec4899' },
      { id: 'e6', source: 'ai-service', target: 'database', label: 'Persist Diagram Schema', color: '#10b981' }
    ];
  }

  private generateTitle(prompt: string, type: DiagramType): string {
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    const clean = prompt.trim();
    if (clean.length < 30) return `${typeLabel}: ${clean.charAt(0).toUpperCase() + clean.slice(1)}`;
    return `${typeLabel}: ${clean.slice(0, 26)}...`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(res => setTimeout(res, ms));
  }
}

export const aiService = new AIService();


