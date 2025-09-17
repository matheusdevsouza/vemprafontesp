import { NextRequest, NextResponse } from 'next/server';

// Cache simples para rate limiting
const rateLimitCache = new Map<string, { count: number; resetTime: number; blocked: boolean }>();

// Configurações de rate limiting por rota
const RATE_LIMITS = {
  login: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    blockDuration: 30 * 60 * 1000, // 30 minutos de bloqueio
    message: 'Muitas tentativas de login. Tente novamente em 30 minutos.'
  },
  contact: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hora
    blockDuration: 60 * 60 * 1000, // 1 hora de bloqueio
    message: 'Muitas mensagens enviadas. Tente novamente em 1 hora.'
  },
  checkout: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hora
    blockDuration: 60 * 60 * 1000, // 1 hora de bloqueio
    message: 'Muitos pedidos criados. Tente novamente em 1 hora.'
  },
  general: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutos
    blockDuration: 15 * 60 * 1000, // 15 minutos de bloqueio
    message: 'Muitas requisições. Tente novamente em 15 minutos.'
  }
};

// Função para obter IP do cliente
function getClientIP(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  const xri = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (xff) return xff.split(',')[0].trim();
  if (xri) return xri;
  
  return '127.0.0.1';
}

// Função para limpar cache expirado
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, data] of Array.from(rateLimitCache.entries())) {
    if (now > data.resetTime) {
      rateLimitCache.delete(key);
    }
  }
}

// Função principal de rate limiting
export function checkRateLimit(
  request: NextRequest, 
  routeType: keyof typeof RATE_LIMITS = 'general'
): { allowed: boolean; remaining: number; resetTime: number; blocked: boolean } {
  
  // Limpar cache expirado periodicamente
  if (Math.random() < 0.1) { // 10% de chance de limpar
    cleanExpiredCache();
  }
  
  const ip = getClientIP(request);
  const now = Date.now();
  const limit = RATE_LIMITS[routeType];
  const key = `${ip}:${routeType}`;
  
  const current = rateLimitCache.get(key);
  
  // Se não existe entrada, criar nova
  if (!current) {
    rateLimitCache.set(key, {
      count: 1,
      resetTime: now + limit.windowMs,
      blocked: false
    });
    
    return {
      allowed: true,
      remaining: limit.maxRequests - 1,
      resetTime: now + limit.windowMs,
      blocked: false
    };
  }
  
  // Se a janela expirou, resetar
  if (now > current.resetTime) {
    rateLimitCache.set(key, {
      count: 1,
      resetTime: now + limit.windowMs,
      blocked: false
    });
    
    return {
      allowed: true,
      remaining: limit.maxRequests - 1,
      resetTime: now + limit.windowMs,
      blocked: false
    };
  }
  
  // Se está bloqueado, verificar se o bloqueio expirou
  if (current.blocked) {
    if (now > current.resetTime + limit.blockDuration) {
      // Bloqueio expirou, resetar
      rateLimitCache.set(key, {
        count: 1,
        resetTime: now + limit.windowMs,
        blocked: false
      });
      
      return {
        allowed: true,
        remaining: limit.maxRequests - 1,
        resetTime: now + limit.windowMs,
        blocked: false
      };
    } else {
      // Ainda bloqueado
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime + limit.blockDuration,
        blocked: true
      };
    }
  }
  
  // Incrementar contador
  current.count++;
  
  // Verificar se excedeu o limite
  if (current.count > limit.maxRequests) {
    // Bloquear por tempo adicional
    current.blocked = true;
    current.resetTime = now + limit.blockDuration;
    
    rateLimitCache.set(key, current);
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
      blocked: true
    };
  }
  
  rateLimitCache.set(key, current);
  
  return {
    allowed: true,
    remaining: limit.maxRequests - current.count,
    resetTime: current.resetTime,
    blocked: false
  };
}

// Middleware para aplicar rate limiting
export function applyAdvancedRateLimit(
  request: NextRequest, 
  routeType: keyof typeof RATE_LIMITS = 'general'
): NextResponse | null {
  
  const result = checkRateLimit(request, routeType);
  const limit = RATE_LIMITS[routeType];
  
  if (!result.allowed) {
    const response = NextResponse.json(
      { 
        error: 'Rate limit exceeded',
        message: result.blocked ? limit.message : 'Muitas requisições. Tente novamente mais tarde.',
        resetTime: result.resetTime,
        blocked: result.blocked
      },
      { status: 429 }
    );
    
    // Adicionar headers informativos
    response.headers.set('X-RateLimit-Limit', limit.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
    response.headers.set('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000).toString());
    
    if (result.blocked) {
      response.headers.set('X-RateLimit-Blocked', 'true');
    }
    
    // Log de tentativas de rate limiting
    const ip = getClientIP(request);
    console.log(`🚦 RATE LIMIT: IP ${ip} excedeu limite para ${routeType} - Bloqueado: ${result.blocked}`);
    
    return response;
  }
  
  return null; // Permitir requisição
}

// Função para verificar se IP está bloqueado
export function isIPBlocked(request: NextRequest, routeType: keyof typeof RATE_LIMITS = 'general'): boolean {
  const ip = getClientIP(request);
  const key = `${ip}:${routeType}`;
  const current = rateLimitCache.get(key);
  
  if (!current) return false;
  
  const now = Date.now();
  
  // Se não está bloqueado ou o bloqueio expirou
  if (!current.blocked || now > current.resetTime + RATE_LIMITS[routeType].blockDuration) {
    return false;
  }
  
  return true;
}

// Função para obter estatísticas de rate limiting
export function getRateLimitStats(): { totalIPs: number; blockedIPs: number; cacheSize: number } {
  const now = Date.now();
  let blockedIPs = 0;
  
  for (const [key, data] of Array.from(rateLimitCache.entries())) {
    if (data.blocked && now < data.resetTime + RATE_LIMITS.general.blockDuration) {
      blockedIPs++;
    }
  }
  
  return {
    totalIPs: rateLimitCache.size,
    blockedIPs,
    cacheSize: rateLimitCache.size
  };
}

