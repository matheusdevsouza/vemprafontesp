import { NextRequest } from 'next/server';

// Interface para armazenar informações de rate limiting
interface RateLimitInfo {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockExpiry: number;
}

// Armazenamento em memória para rate limiting (em produção, usar Redis)
const rateLimitStore = new Map<string, RateLimitInfo>();

// Configurações de rate limiting
const RATE_LIMIT_CONFIG = {
  // Limite de tentativas de login por IP
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    blockDuration: 30 * 60 * 1000, // 30 minutos
  },
  
  // Limite de tentativas de registro por IP
  register: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hora
    blockDuration: 60 * 60 * 1000, // 1 hora
  },
  
  // Limite de tentativas de verificação de email por IP
  emailVerification: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hora
    blockDuration: 60 * 60 * 1000, // 1 hora
  },
  
  // Limite de tentativas de redefinição de senha por IP
  passwordReset: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hora
    blockDuration: 60 * 60 * 1000, // 1 hora
  },
  
  // Limite de requisições gerais por IP
  general: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minuto
    blockDuration: 5 * 60 * 1000, // 5 minutos
  },
  
  // Limite de checkout por IP
  checkout: {
    maxAttempts: 10,
    windowMs: 5 * 60 * 1000, // 5 minutos
    blockDuration: 15 * 60 * 1000, // 15 minutos
  },
  
  // Limite de upload de imagens por IP
  imageUpload: {
    maxAttempts: 20,
    windowMs: 60 * 1000, // 1 minuto
    blockDuration: 10 * 60 * 1000, // 10 minutos
  },
};

// Função para obter chave única para rate limiting
function getRateLimitKey(identifier: string, type: keyof typeof RATE_LIMIT_CONFIG): string {
  return `${type}:${identifier}`;
}

// Função para obter IP do cliente
export function getClientIP(request: NextRequest): string {
  // Tentar obter IP real através de headers de proxy
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
  
  // Fallback para IP local
  return '127.0.0.1';
}

// Função para obter user agent
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

// Função principal de rate limiting
export function checkRateLimit(
  identifier: string,
  type: keyof typeof RATE_LIMIT_CONFIG,
  request?: NextRequest
): { allowed: boolean; remaining: number; resetTime: number; blocked: boolean } {
  const config = RATE_LIMIT_CONFIG[type];
  const key = getRateLimitKey(identifier, type);
  const now = Date.now();
  
  // Obter informações atuais do rate limiting
  let info = rateLimitStore.get(key);
  
  if (!info) {
    // Primeira requisição
    info = {
      count: 1,
      resetTime: now + config.windowMs,
      blocked: false,
      blockExpiry: 0,
    };
    rateLimitStore.set(key, info);
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: info.resetTime,
      blocked: false,
    };
  }
  
  // Verificar se está bloqueado
  if (info.blocked) {
    if (now < info.blockExpiry) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: info.blockExpiry,
        blocked: true,
      };
    } else {
      // Bloqueio expirou, resetar
      info.blocked = false;
      info.count = 0;
      info.resetTime = now + config.windowMs;
    }
  }
  
  // Verificar se a janela de tempo expirou
  if (now > info.resetTime) {
    info.count = 1;
    info.resetTime = now + config.windowMs;
  } else {
    info.count++;
  }
  
  // Verificar se excedeu o limite
  if (info.count > config.maxAttempts) {
    info.blocked = true;
    info.blockExpiry = now + config.blockDuration;
    
    // Log de segurança
    if (request) {
      console.warn(`Rate limit exceeded for ${type}:`, {
        identifier,
        ip: getClientIP(request),
        userAgent: getUserAgent(request),
        timestamp: new Date().toISOString(),
      });
    }
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: info.blockExpiry,
      blocked: true,
    };
  }
  
  // Atualizar store
  rateLimitStore.set(key, info);
  
  return {
    allowed: true,
    remaining: Math.max(0, config.maxAttempts - info.count),
    resetTime: info.resetTime,
    blocked: false,
  };
}

// Função para limpar dados expirados (executar periodicamente)
export function cleanupExpiredRateLimits(): void {
  const now = Date.now();
  
  for (const [key, info] of Array.from(rateLimitStore.entries())) {
    // Remover entradas expiradas
    if (now > info.resetTime && !info.blocked) {
      rateLimitStore.delete(key);
    }
    
    // Remover bloqueios expirados
    if (info.blocked && now > info.blockExpiry) {
      rateLimitStore.delete(key);
    }
  }
}

// Função para obter estatísticas de rate limiting
export function getRateLimitStats(): Record<string, number> {
  const stats: Record<string, number> = {};
  
  for (const [key, info] of Array.from(rateLimitStore.entries())) {
    const type = key.split(':')[0];
    if (!stats[type]) {
      stats[type] = 0;
    }
    stats[type]++;
  }
  
  return stats;
}

// Função para resetar rate limiting de um identificador específico
export function resetRateLimit(identifier: string, type: keyof typeof RATE_LIMIT_CONFIG): boolean {
  const key = getRateLimitKey(identifier, type);
  return rateLimitStore.delete(key);
}

// Função para verificar se um IP está bloqueado
export function isIPBlocked(ip: string, type: keyof typeof RATE_LIMIT_CONFIG): boolean {
  const key = getRateLimitKey(ip, type);
  const info = rateLimitStore.get(key);
  
  if (!info) return false;
  
  if (info.blocked && Date.now() < info.blockExpiry) {
    return true;
  }
  
  return false;
}

// Middleware de rate limiting para APIs
export function createRateLimitMiddleware(type: keyof typeof RATE_LIMIT_CONFIG) {
  return function rateLimitMiddleware(request: NextRequest) {
    const ip = getClientIP(request);
    const result = checkRateLimit(ip, type, request);
    
    if (!result.allowed) {
      return {
        success: false,
        error: 'Rate limit exceeded',
        message: `Muitas tentativas. Tente novamente em ${Math.ceil((result.resetTime - Date.now()) / 1000 / 60)} minutos.`,
        resetTime: result.resetTime,
        blocked: result.blocked,
      };
    }
    
    return {
      success: true,
      remaining: result.remaining,
      resetTime: result.resetTime,
    };
  };
}

// Limpar dados expirados a cada 5 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredRateLimits, 5 * 60 * 1000);
}


