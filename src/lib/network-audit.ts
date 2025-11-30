// Network Audit Log - Local transparency for network requests
// All data stored in memory only, never persisted

export interface NetworkRequest {
  url: string;
  timestamp: number;
  blocked: boolean;
  reason?: string;
  method?: string;
}

class NetworkAuditLog {
  private static instance: NetworkAuditLog;
  private requests: NetworkRequest[] = [];
  private readonly MAX_ENTRIES = 100;

  private constructor() {}

  public static getInstance(): NetworkAuditLog {
    if (!NetworkAuditLog.instance) {
      NetworkAuditLog.instance = new NetworkAuditLog();
    }
    return NetworkAuditLog.instance;
  }

  logRequest(url: string, allowed: boolean, reason?: string, method: string = 'GET'): void {
    this.requests.push({
      url,
      timestamp: Date.now(),
      blocked: !allowed,
      reason,
      method
    });

    // Keep only the last MAX_ENTRIES requests (FIFO)
    if (this.requests.length > this.MAX_ENTRIES) {
      this.requests.shift();
    }
  }

  getRequests(): NetworkRequest[] {
    return [...this.requests];
  }

  getBlockedRequests(): NetworkRequest[] {
    return this.requests.filter(r => r.blocked);
  }

  getAllowedRequests(): NetworkRequest[] {
    return this.requests.filter(r => !r.blocked);
  }

  getStatistics() {
    const total = this.requests.length;
    const blocked = this.requests.filter(r => r.blocked).length;
    const allowed = total - blocked;

    // Group by domain
    const domainCounts: Record<string, number> = {};
    this.requests.forEach(req => {
      try {
        const url = new URL(req.url, window.location.origin);
        const domain = url.hostname;
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      } catch {
        // Ignore invalid URLs
      }
    });

    return {
      total,
      blocked,
      allowed,
      domains: domainCounts
    };
  }

  clear(): void {
    this.requests = [];
  }

  exportLog(): string {
    const stats = this.getStatistics();
    let log = `# OblivAI Network Audit Log\n\n`;
    log += `**Generated**: ${new Date().toISOString()}\n\n`;
    log += `## Summary\n\n`;
    log += `- Total Requests: ${stats.total}\n`;
    log += `- Allowed: ${stats.allowed}\n`;
    log += `- Blocked: ${stats.blocked}\n\n`;
    log += `## Domain Breakdown\n\n`;
    Object.entries(stats.domains).forEach(([domain, count]) => {
      log += `- ${domain}: ${count} requests\n`;
    });
    log += `\n## Detailed Log\n\n`;
    this.requests.forEach((req, idx) => {
      const date = new Date(req.timestamp).toISOString();
      const status = req.blocked ? '❌ BLOCKED' : '✅ ALLOWED';
      log += `${idx + 1}. [${date}] ${status} - ${req.method} ${req.url}\n`;
      if (req.reason) {
        log += `   Reason: ${req.reason}\n`;
      }
    });
    return log;
  }
}

export const networkAudit = NetworkAuditLog.getInstance();
