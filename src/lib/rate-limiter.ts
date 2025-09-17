import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Store para rate limiting (em produção, usar Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Limpar entradas expiradas periodicamente
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of Array.from(rateLimitStore.entries())) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Limpar a cada minuto

export function createRateLimiter(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<{ allowed: boolean; remaining: number; resetTime: number }> => {
    const key = getRateLimitKey(request);
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Buscar ou criar entrada
    let entry = rateLimitStore.get(key);
    
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs
      };
    }

    // Incrementar contador
    entry.count++;
    rateLimitStore.set(key, entry);

    const remaining = Math.max(0, config.maxRequests - entry.count);
    const allowed = entry.count <= config.maxRequests;

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime
    };
  };
}

function getRateLimitKey(request: NextRequest): string {
  // Usar IP do cliente como chave principal
  const ip = request.ip || 
             request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  // Incluir user agent para maior precisão
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return `${ip}:${userAgent}`;
}

// Configurações predefinidas
export const rateLimiters = {
  // Rate limiting para login (5 tentativas por 15 minutos)
  login: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  }),

  // Rate limiting para registro (3 tentativas por hora)
  register: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 3,
    message: 'Muitas tentativas de registro. Tente novamente em 1 hora.'
  }),

  // Rate limiting para contato (10 mensagens por hora)
  contact: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 10,
    message: 'Muitas mensagens enviadas. Tente novamente em 1 hora.'
  }),

  // Rate limiting para checkout (5 pedidos por hora)
  checkout: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 5,
    message: 'Muitos pedidos criados. Tente novamente em 1 hora.'
  }),

  // Rate limiting geral para APIs (100 requests por minuto)
  general: createRateLimiter({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 100,
    message: 'Muitas requisições. Tente novamente em 1 minuto.'
  }),

  // Rate limiting para admin (1000 requests por minuto)
  admin: createRateLimiter({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 1000,
    message: 'Limite de requisições administrativas atingido.'
  })
};

export async function applyRateLimit(
  request: NextRequest, 
  limiter: (req: NextRequest) => Promise<{ allowed: boolean; remaining: number; resetTime: number }>
): Promise<Response | null> {
  try {
    const result = await limiter(request);
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          message: 'Muitas requisições. Tente novamente mais tarde.',
          resetTime: result.resetTime
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    return null; // Permitir a requisição
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Em caso de erro, permitir a requisição para não quebrar o sistema
    return null;
  }
}
