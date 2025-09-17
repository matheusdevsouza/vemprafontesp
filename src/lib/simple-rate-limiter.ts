// Rate Limiter simples em memória
import { NextRequest } from 'next/server';

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function applySimpleRateLimit(request: NextRequest, limit: number = 5, windowMs: number = 60000): Response | null {
  try {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const key = `${ip}`;

    // Limpar entradas expiradas
    for (const [k, v] of Array.from(requestCounts.entries())) {
      if (now > v.resetTime) {
        requestCounts.delete(k);
      }
    }

    // Verificar limite atual
    const current = requestCounts.get(key);
    
    if (!current || now > current.resetTime) {
      // Primeira requisição ou janela expirada
      requestCounts.set(key, { count: 1, resetTime: now + windowMs });
      return null; // Permitir
    }

    if (current.count >= limit) {
      // Limite excedido
      return new Response(
        JSON.stringify({ 
          error: 'Muitas tentativas. Tente novamente em alguns minutos.',
          retryAfter: Math.ceil((current.resetTime - now) / 1000)
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(current.resetTime).toISOString()
          }
        }
      );
    }

    // Incrementar contador
    current.count++;
    requestCounts.set(key, current);

    return null; // Permitir
  } catch (error) {
    console.error('Erro no rate limiter:', error);
    return null; // Em caso de erro, permitir
  }
}


