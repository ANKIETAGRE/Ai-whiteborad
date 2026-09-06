export type DiagramType = 'architecture' | 'flowchart' | 'mindmap' | 'sequence' | 'cloud';

export type NodeType = 
  | 'service'
  | 'database'
  | 'user'
  | 'queue'
  | 'cloud'
  | 'external-system'
  | 'cache'
  | 'gateway'
  | 'container'
  | 'sticky-note'
  | 'text'
  | 'frame';

export interface NodePosition {
  x: number;
  y: number;
}

export interface DiagramNode {
  id: string;
  type: NodeType;
  label: string;
  sublabel?: string;
  icon?: string;
  position: NodePosition;
  width?: number;
  height?: number;
  color?: string;
  bgOpacity?: number;
  content?: string; // For sticky notes / text
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  style?: 'solid' | 'dashed' | 'dotted';
  animated?: boolean;
  color?: string;
}

export interface DiagramSchema {
  diagram_type: DiagramType;
  title: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface Diagram {
  id: string;
  title: string;
  diagram_type: DiagramType;
  diagram_json: DiagramSchema;
  user_id: string;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface DiagramVersion {
  id: string;
  diagram_id: string;
  version_number: number;
  diagram_json: DiagramSchema;
  prompt: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  tier: 'free' | 'pro' | 'enterprise';
  token_usage: number;
}

export interface RateLimitState {
  remaining: number;
  limit: number;
  resetSeconds: number;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  request_id: string;
  action: string;
  status: 'SUCCESS' | 'WARNING' | 'SECURITY_BLOCKED' | 'ERROR';
  details: string;
  client_ip: string;
}

export type PipelineStage = 
  | 'idle'
  | 'validating'
  | 'detecting_intent'
  | 'extracting_entities'
  | 'schema_validation'
  | 'layout_computation'
  | 'completed'
  | 'failed';

export interface PipelineProgress {
  stage: PipelineStage;
  message: string;
  progressPercent: number;
}
