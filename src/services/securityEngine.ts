import type { SecurityAuditLog, RateLimitState, NodeType } from '../types/diagram';

const ALLOWED_NODE_TYPES: Set<NodeType> = new Set([
  'service',
  'database',
  'user',
  'queue',
  'cloud',
  'external-system',
  'cache',
  'gateway',
  'container',
  'sticky-note',
  'text',
  'frame'
]);

// Common Prompt Injection & Malicious Input Signatures
const PROMPT_INJECTION_PATTERNS = [
  /ignore (all )?(previous|above) instructions/i,
  /reveal system (prompt|secrets|keys)/i,
  /bypass (security|filters)/i,
  /delete (database|tables|everything)/i,
  /drop table/i,
  /select \* from/i,
  /<script[\s\S]*?>[\s\S]*?<\/script>/i,
  /javascript:/i,
  /exec\(|eval\(/i
];

export class SecurityEngine {
  private auditLogs: SecurityAuditLog[] = [];
  private rateLimitWindow = 3600; // 1 hour window
  private maxFreeRequests = 10;
  private maxProRequests = 100;
  private userRequestCounts: Map<string, { count: number; resetTime: number }> = new Map();

  constructor() {
    this.addAuditLog('system', 'SYSTEM_INITIALIZE', 'SUCCESS', 'Security engine & rate limiter initialized');
  }

  public validatePrompt(prompt: string, userId: string, requestId: string): { isValid: boolean; error?: string } {
    // 1. Length check
    if (!prompt || prompt.trim().length === 0) {
      this.addAuditLog(userId, 'PROMPT_VALIDATE', 'WARNING', 'Empty prompt received', requestId);
      return { isValid: false, error: 'Prompt cannot be empty.' };
    }

    if (prompt.length > 2000) {
      this.addAuditLog(userId, 'PROMPT_VALIDATE', 'SECURITY_BLOCKED', 'Prompt exceeded 2000 character limit', requestId);
      return { isValid: false, error: 'Prompt exceeds maximum allowed length of 2000 characters.' };
    }

    // 2. Prompt Injection Inspection
    for (const pattern of PROMPT_INJECTION_PATTERNS) {
      if (pattern.test(prompt)) {
        this.addAuditLog(
          userId,
          'PROMPT_INJECTION_SHIELD',
          'SECURITY_BLOCKED',
          `Threat detected matching rule pattern: ${pattern.toString()}`,
          requestId
        );
        return {
          isValid: false,
          error: 'Security Alert: Input contains prohibited system control override instructions or dangerous code payload.'
        };
      }
    }

    this.addAuditLog(userId, 'PROMPT_VALIDATE', 'SUCCESS', 'Prompt passed sanitization & security rules', requestId);
    return { isValid: true };
  }

  public checkRateLimit(userId: string, userTier: 'free' | 'pro' | 'enterprise', requestId: string): { allowed: boolean; rateState: RateLimitState } {
    const now = Math.floor(Date.now() / 1000);
    const limit = userTier === 'free' ? this.maxFreeRequests : this.maxProRequests;
    
    let record = this.userRequestCounts.get(userId);
    if (!record || now >= record.resetTime) {
      record = { count: 0, resetTime: now + this.rateLimitWindow };
      this.userRequestCounts.set(userId, record);
    }

    if (record.count >= limit) {
      this.addAuditLog(
        userId,
        'RATE_LIMITER',
        'SECURITY_BLOCKED',
        `Rate limit exceeded (${record.count}/${limit} requests used)`,
        requestId
      );
      return {
        allowed: false,
        rateState: {
          remaining: 0,
          limit,
          resetSeconds: record.resetTime - now
        }
      };
    }

    record.count++;
    const remaining = limit - record.count;
    
    this.addAuditLog(
      userId,
      'RATE_LIMITER',
      'SUCCESS',
      `Request approved. Remaining quota: ${remaining}/${limit}`,
      requestId
    );

    return {
      allowed: true,
      rateState: {
        remaining,
        limit,
        resetSeconds: record.resetTime - now
      }
    };
  }

  public sanitizeText(input: string): string {
    if (!input) return '';
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  public validateNodeSchema(node: any): boolean {
    if (!node || typeof node !== 'object') return false;
    if (!node.id || typeof node.id !== 'string') return false;
    if (!node.label || typeof node.label !== 'string') return false;
    if (!ALLOWED_NODE_TYPES.has(node.type)) {
      return false;
    }
    return true;
  }

  public addAuditLog(
    userId: string,
    action: string,
    status: 'SUCCESS' | 'WARNING' | 'SECURITY_BLOCKED' | 'ERROR',
    details: string,
    requestId?: string
  ): SecurityAuditLog {
    const log: SecurityAuditLog = {
      id: 'log_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      user_id: userId,
      request_id: requestId || 'req_' + Math.random().toString(36).substr(2, 7),
      action,
      status,
      details,
      client_ip: '192.168.1.100 (WAF Standard)'
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
    return log;
  }

  public getAuditLogs(): SecurityAuditLog[] {
    return this.auditLogs;
  }

  public clearLogs() {
    this.auditLogs = [];
  }
}

export const securityEngine = new SecurityEngine();
