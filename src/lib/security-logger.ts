import { NextRequest } from 'next/server';

// Tipos de eventos de segurança
export enum SecurityEventType {
  // Autenticação
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  
  // Autorização
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  ADMIN_ACCESS = 'ADMIN_ACCESS',
  UNAUTHORIZED_ADMIN_ACCESS = 'UNAUTHORIZED_ADMIN_ACCESS',
  
  // Sessões
  SESSION_CREATED = 'SESSION_CREATED',
  SESSION_INVALIDATED = 'SESSION_INVALIDATED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Ataques
  BRUTE_FORCE_ATTEMPT = 'BRUTE_FORCE_ATTEMPT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  PATH_TRAVERSAL_ATTEMPT = 'PATH_TRAVERSAL_ATTEMPT',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  IP_BLOCKED = 'IP_BLOCKED',
  
  // Atividades suspeitas
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  UNUSUAL_PATTERN = 'UNUSUAL_PATTERN',
  
  // Dados sensíveis
  SENSITIVE_DATA_ACCESS = 'SENSITIVE_DATA_ACCESS',
  DATA_EXPORT = 'DATA_EXPORT',
  
  // Sistema
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  CONFIGURATION_CHANGE = 'CONFIGURATION_CHANGE',
  
  // Validação
  VALIDATION_SUCCESS = 'VALIDATION_SUCCESS',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  
  // Usuários
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  
  // Produtos e Pedidos
  PRODUCT_CREATED = 'PRODUCT_CREATED',
  PRODUCT_UPDATED = 'PRODUCT_UPDATED',
  PRODUCT_DELETED = 'PRODUCT_DELETED',
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_UPDATED = 'ORDER_UPDATED',
  ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED',
  
  // Pagamentos
  PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  REFUND_PROCESSED = 'REFUND_PROCESSED',
  
  // Uploads
  FILE_UPLOAD_SUCCESS = 'FILE_UPLOAD_SUCCESS',
  FILE_UPLOAD_REJECTED = 'FILE_UPLOAD_REJECTED',
  FILE_UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',
  
  // API
  API_ACCESS = 'API_ACCESS',
  API_ERROR = 'API_ERROR',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
}

// Níveis de severidade
export enum SecurityLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

// Interface para eventos de segurança
export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  level: SecurityLevel;
  timestamp: Date;
  ip: string;
  userId?: number;
  userEmail?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  method?: string;
  details: Record<string, any>;
  metadata: {
    requestId: string;
    correlationId?: string;
    source: string;
    version: string;
  };
}

// Interface para configuração do logger
export interface SecurityLoggerConfig {
  enableConsole: boolean;
  enableFile: boolean;
  enableDatabase: boolean;
  enableExternal: boolean;
  logLevel: SecurityLevel;
  maxLogSize: number;
  retentionDays: number;
  externalEndpoint?: string;
  externalApiKey?: string;
}

// Configuração padrão
const DEFAULT_CONFIG: SecurityLoggerConfig = {
  enableConsole: true,
  enableFile: false,
  enableDatabase: false,
  enableExternal: false,
  logLevel: SecurityLevel.INFO,
  maxLogSize: 1000,
  retentionDays: 90,
};

// Classe principal do logger de segurança
class SecurityLogger {
  private config: SecurityLoggerConfig;
  private logs: SecurityEvent[] = [];
  private alertThresholds: Map<SecurityEventType, number> = new Map();

  constructor(config: Partial<SecurityLoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupAlertThresholds();
  }
  
  // Configurar limiares de alerta
  private setupAlertThresholds(): void {
    this.alertThresholds.set(SecurityEventType.LOGIN_FAILED, 5);
    this.alertThresholds.set(SecurityEventType.BRUTE_FORCE_ATTEMPT, 3);
    this.alertThresholds.set(SecurityEventType.SQL_INJECTION_ATTEMPT, 1);
    this.alertThresholds.set(SecurityEventType.XSS_ATTEMPT, 1);
    this.alertThresholds.set(SecurityEventType.PATH_TRAVERSAL_ATTEMPT, 1);
    this.alertThresholds.set(SecurityEventType.UNAUTHORIZED_ADMIN_ACCESS, 1);
  }
  
  // Gerar ID único para evento
  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Gerar ID de correlação
  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Verificar se deve logar baseado no nível
  private shouldLog(level: SecurityLevel): boolean {
    const levelOrder = {
      [SecurityLevel.INFO]: 0,
      [SecurityLevel.WARNING]: 1,
      [SecurityLevel.ERROR]: 2,
      [SecurityLevel.CRITICAL]: 3,
    };
    
    return levelOrder[level] >= levelOrder[this.config.logLevel];
  }
  
  // Log principal
  public log(
    type: SecurityEventType,
    level: SecurityLevel,
    request: NextRequest,
    details: Record<string, any> = {},
    userId?: number,
    userEmail?: string,
    sessionId?: string
  ): void {
    if (!this.shouldLog(level)) return;

    const event: SecurityEvent = {
      id: this.generateEventId(),
      type,
      level,
      timestamp: new Date(),
      ip: this.getClientIP(request),
      userId,
      userEmail,
      sessionId,
      userAgent: request.headers.get('user-agent') || undefined,
      url: request.url,
      method: request.method,
      details,
      metadata: {
        requestId: this.generateEventId(),
        correlationId: this.generateCorrelationId(),
        source: 'security-logger',
        version: '1.0.0',
      },
    };

    // Adicionar ao array de logs
    this.logs.push(event);

    // Manter tamanho máximo
    if (this.logs.length > this.config.maxLogSize) {
      this.logs.shift();
    }

    // Executar logging baseado na configuração
    this.executeLogging(event);
    
    // Verificar alertas
    this.checkAlerts(event);
  }
  
  // Executar logging baseado na configuração
  private executeLogging(event: SecurityEvent): void {
    if (this.config.enableConsole) {
      this.logToConsole(event);
    }

    if (this.config.enableFile) {
      this.logToFile(event);
    }

    if (this.config.enableDatabase) {
      this.logToDatabase(event);
    }

    if (this.config.enableExternal) {
      this.logToExternal(event);
    }
  }
  
  // Log para console
  private logToConsole(event: SecurityEvent): void {
    const emoji = this.getLevelEmoji(event.level);
    const timestamp = event.timestamp.toISOString();
    
    console.log(`${emoji} [${event.level}] ${event.type} - ${timestamp}`);
    console.log(`  IP: ${event.ip}`);
    if (event.userId) console.log(`  User ID: ${event.userId}`);
    if (event.userEmail) console.log(`  User Email: ${event.userEmail}`);
    if (event.url) console.log(`  URL: ${event.url}`);
    if (event.method) console.log(`  Method: ${event.method}`);
    if (Object.keys(event.details).length > 0) {
      console.log(`  Details:`, event.details);
    }
    console.log(`  Event ID: ${event.id}`);
    console.log(`  Correlation ID: ${event.metadata.correlationId}`);
    console.log('---');
  }
  
  // Obter emoji para nível
  private getLevelEmoji(level: SecurityLevel): string {
    switch (level) {
      case SecurityLevel.INFO: return 'ℹ️';
      case SecurityLevel.WARNING: return '⚠️';
      case SecurityLevel.ERROR: return '❌';
      case SecurityLevel.CRITICAL: return '🚨';
      default: return '📝';
    }
  }
  
  // Log para arquivo (simulado)
  private logToFile(event: SecurityEvent): void {
    // Em produção, implementar logging para arquivo
    // Usar bibliotecas como winston ou pino
  }
  
  // Log para banco de dados (simulado)
  private logToDatabase(event: SecurityEvent): void {
    // Em produção, implementar logging para banco de dados
    // Usar Prisma ou outra ORM
  }
  
  // Log para sistema externo (simulado)
  private logToExternal(event: SecurityEvent): void {
    // Em produção, implementar logging para sistemas externos
    // Como SIEM, Splunk, etc.
  }
  
  // Verificar alertas
  private checkAlerts(event: SecurityEvent): void {
    const threshold = this.alertThresholds.get(event.type);
    if (!threshold) return;
    
    const recentEvents = this.logs.filter(log => 
      log.type === event.type && 
      log.timestamp > new Date(Date.now() - 60 * 60 * 1000) // Última hora
    );
    
    if (recentEvents.length >= threshold) {
      this.triggerAlert(event, recentEvents);
    }
  }
  
  // Disparar alerta
  private triggerAlert(event: SecurityEvent, recentEvents: SecurityEvent[]): void {
    const alert = {
      type: 'SECURITY_ALERT',
      level: SecurityLevel.CRITICAL,
      message: `Threshold exceeded for ${event.type}`,
      eventType: event.type,
      threshold: this.alertThresholds.get(event.type),
      actualCount: recentEvents.length,
      recentEvents: recentEvents.map(e => ({
        id: e.id,
        timestamp: e.timestamp,
        ip: e.ip,
        userId: e.userId,
        details: e.details
      })),
      timestamp: new Date(),
    };
    
    console.log('🚨 SECURITY ALERT 🚨');
    console.log(JSON.stringify(alert, null, 2));
    
    // Em produção, enviar para sistema de alertas
    // Como email, Slack, webhook, etc.
  }
  
  // Obter IP do cliente
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    if (cfConnectingIP) {
      return cfConnectingIP;
    }
    
    return '127.0.0.1';
  }
  
  // Métodos públicos para facilitar o uso
  
  // Log de sucesso de login
  public logLoginSuccess(request: NextRequest, userId: number, userEmail: string, sessionId: string): void {
    this.log(
      SecurityEventType.LOGIN_SUCCESS,
      SecurityLevel.INFO,
      request,
      { sessionId },
      userId,
      userEmail,
      sessionId
    );
  }
  
  // Log de falha de login
  public logLoginFailed(request: NextRequest, email: string, reason: string): void {
    this.log(
      SecurityEventType.LOGIN_FAILED,
      SecurityLevel.WARNING,
      request,
      { email, reason },
      undefined,
      email
    );
  }

  // Log de acesso não autorizado
  public logUnauthorizedAccess(request: NextRequest, pathname: string, userId?: number): void {
    this.log(
      SecurityEventType.UNAUTHORIZED_ACCESS,
      SecurityLevel.WARNING,
      request,
      { pathname },
      userId
    );
  }
  
  // Log de acesso admin
  public logAdminAccess(request: NextRequest, userId: number, userEmail: string, pathname: string): void {
    this.log(
      SecurityEventType.ADMIN_ACCESS,
      SecurityLevel.INFO,
      request,
      { pathname },
      userId,
      userEmail
    );
  }

  // Log de tentativa de acesso admin não autorizado
  public logUnauthorizedAdminAccess(request: NextRequest, userId: number, userEmail: string, pathname: string): void {
    this.log(
      SecurityEventType.UNAUTHORIZED_ADMIN_ACCESS,
      SecurityLevel.ERROR,
      request,
      { pathname },
      userId,
      userEmail
    );
  }
  
  // Log de atividade suspeita
  public logSuspiciousActivity(request: NextRequest, reason: string, details: Record<string, any> = {}): void {
    this.log(
      SecurityEventType.SUSPICIOUS_ACTIVITY,
      SecurityLevel.WARNING,
      request,
      { reason, ...details }
    );
  }
  
  // Log de tentativa de ataque
  public logAttackAttempt(request: NextRequest, attackType: SecurityEventType, details: Record<string, any> = {}): void {
    this.log(
      attackType,
      SecurityLevel.ERROR,
      request,
      details
    );
  }
  
  // Obter estatísticas
  public getStats(): {
    totalEvents: number;
    eventsByType: Partial<Record<SecurityEventType, number>>;
    eventsByLevel: Partial<Record<SecurityLevel, number>>;
    recentActivity: SecurityEvent[];
  } {
    const eventsByType: Partial<Record<SecurityEventType, number>> = {};
    const eventsByLevel: Partial<Record<SecurityLevel, number>> = {};
    
    this.logs.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsByLevel[event.level] = (eventsByLevel[event.level] || 0) + 1;
    });
    
    return {
      totalEvents: this.logs.length,
      eventsByType,
      eventsByLevel,
      recentActivity: this.logs.slice(-10), // Últimos 10 eventos
    };
  }

  // Limpar logs antigos
  public cleanupOldLogs(): void {
    const cutoffDate = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
    this.logs = this.logs.filter(log => log.timestamp > cutoffDate);
  }
}

// Instância global do logger
export const securityLogger = new SecurityLogger();

// Função de conveniência para logging
export function logSecurityEvent(
  type: SecurityEventType,
  level: SecurityLevel,
  request: NextRequest,
  details: Record<string, any> = {},
  userId?: number,
  userEmail?: string,
  sessionId?: string
): void {
  securityLogger.log(type, level, request, details, userId, userEmail, sessionId);
}

// Configurar limpeza automática
if (typeof setInterval !== 'undefined') {
  setInterval(() => securityLogger.cleanupOldLogs(), 24 * 60 * 60 * 1000); // Diariamente
}


