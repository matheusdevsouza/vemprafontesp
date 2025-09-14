import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, isAdmin, logSecurityEvent } from '@/lib/auth';

// Configurações de segurança
const MAX_REQUESTS_PER_MINUTE = 100;
const MAX_REQUESTS_PER_HOUR = 1000;
const BLOCKED_IPS = new Set<string>();
const SUSPICIOUS_PATTERNS = [
  /\.\.\//, // Path traversal
  /<script/i, // XSS
  /javascript:/i, // JavaScript injection
  /on\w+\s*=/i, // Event handlers
  /union\s+select/i, // SQL injection
  /drop\s+table/i, // SQL injection
  /exec\s*\(/i, // Command injection
];

// Armazenamento para rate limiting (em produção, usar Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const ipHistory = new Map<string, { requests: number; lastRequest: number; suspicious: number }>();

// Rotas públicas que não precisam de autenticação
const publicRoutes = [
  '/',
  '/login',
  '/criar-conta',
  '/verificar-email',
  '/redefinir-senha',
  '/esqueci-senha',
  '/produtos',
  '/produto',
  '/marcas',
  '/modelos',
  '/sobre',
  '/contato',
  '/faq',
  '/como-comprar',
  '/termos-de-uso',
  '/politica-de-privacidade',
  '/trocas-e-devolucoes',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify-email',
  '/api/auth/resend-verification',
  '/api/auth/reset-password',
  '/api/auth/forgot-password',
  '/api/products',
  '/api/products/[slug]',
  '/api/brands',
  '/api/models',
  '/api/categories',
  '/api/featured-models',
  '/api/shipping/validate-cep',
  '/api/webhooks/mercadopago',
  '/api/test-webhook',
  '/uploads', // Permitir acesso aos arquivos de upload
];

// Rotas que requerem autenticação
const protectedRoutes = [
  '/entregas',
  '/enderecos',
  '/meus-pedidos',
  '/perfil',
  '/configuracoes',
];

// Rotas que requerem permissão de admin
const adminRoutes = [
  '/admin',
  '/api/admin',
];

// Rotas sensíveis que precisam de proteção extra
const sensitiveRoutes = [
  '/api/admin',
  '/api/auth',
  '/perfil',
];

// Verificar se uma rota é pública
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route.includes('[') && route.includes(']')) {
      // Rota dinâmica - verificar padrão
      const pattern = route.replace(/\[.*?\]/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(pathname);
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
}

// Verificar se uma rota requer autenticação
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );
}

// Verificar se uma rota requer permissão de admin
function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );
}

// Verificar se uma rota é sensível
function isSensitiveRoute(pathname: string): boolean {
  return sensitiveRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );
}

// Rate limiting por IP
function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const info = requestCounts.get(ip) || { count: 0, resetTime: now + 60000 };

  // Resetar contador se passou 1 minuto
  if (now > info.resetTime) {
    info.count = 1;
    info.resetTime = now + 60000;
  } else {
    info.count++;
  }

  requestCounts.set(ip, info);

  if (info.count > MAX_REQUESTS_PER_MINUTE) {
    return { allowed: false, remaining: Math.ceil((info.resetTime - now) / 1000) };
  }

  return { allowed: true, remaining: 0 };
}

// Detectar padrões suspeitos
function detectSuspiciousPatterns(request: NextRequest): boolean {
  const url = request.url;
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';

  // Verificar URL
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(url)) {
      return true;
    }
  }

  // Verificar User-Agent suspeito
  const suspiciousUserAgents = [
    'sqlmap', 'nmap', 'nikto', 'dirb', 'gobuster', 'wfuzz',
    'burp', 'zap', 'wireshark', 'metasploit', 'nuclei'
  ];

  if (suspiciousUserAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    return true;
  }

  // Verificar referer suspeito
  if (referer && !referer.startsWith(process.env.NEXTAUTH_URL || 'http://localhost')) {
    return true;
  }

  return false;
}

// Registrar atividade suspeita
function recordSuspiciousActivity(ip: string, reason: string, request: NextRequest): void {
  const info = ipHistory.get(ip) || { requests: 0, lastRequest: Date.now(), suspicious: 0 };
  info.suspicious++;
  info.lastRequest = Date.now();
  ipHistory.set(ip, info);

  // Bloquear IP se muito suspeito
  if (info.suspicious > 10) {
    BLOCKED_IPS.add(ip);
    logSecurityEvent('IP_BLOCKED', { ip, reason, suspiciousCount: info.suspicious });
  }

  logSecurityEvent('SUSPICIOUS_ACTIVITY', {
    ip,
    reason,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    referer: request.headers.get('referer')
  });
}

// Verificar se IP está bloqueado
function isIPBlocked(ip: string): boolean {
  return BLOCKED_IPS.has(ip);
}

// Headers de segurança avançados
function setSecurityHeaders(response: NextResponse): NextResponse {
  // Headers básicos de segurança
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  // Content Security Policy rigoroso
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.mercadopago.com https://viacep.com.br https://www.google-analytics.com",
    "frame-src 'self' https://www.mercadopago.com.br",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
    "require-trusted-types-for 'script'",
    "trusted-types default"
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // Headers de segurança adicionais
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

  // Headers de auditoria
  response.headers.set('X-Audit-ID', crypto.randomUUID());

  return response;
}

// Função para obter IP do cliente
function getClientIP(request: NextRequest): string {
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIP = getClientIP(request);

  // 1. Verificar se IP está bloqueado
  if (isIPBlocked(clientIP)) {
    logSecurityEvent('BLOCKED_IP_ACCESS', { ip: clientIP, pathname });
    return new NextResponse('Access Denied', { status: 403 });
  }

  // 2. Rate limiting
  const rateLimit = checkRateLimit(clientIP);
  if (!rateLimit.allowed) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', { ip: clientIP, pathname, remaining: rateLimit.remaining });
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: { 'Retry-After': rateLimit.remaining.toString() }
    });
  }

  // 3. Detectar padrões suspeitos
  if (detectSuspiciousPatterns(request)) {
    recordSuspiciousActivity(clientIP, 'SUSPICIOUS_PATTERN', request);
    return new NextResponse('Bad Request', { status: 400 });
  }

  // 4. Headers de segurança para todas as rotas
  const response = NextResponse.next();
  setSecurityHeaders(response);

  // 5. Se for rota pública, permitir acesso
  if (isPublicRoute(pathname)) {
    return response;
  }

  // 6. Verificar token de autenticação
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    // Não redirecionar automaticamente - deixar a página lidar com a autenticação
    // Isso evita loops de redirecionamento
    if (isProtectedRoute(pathname) || isAdminRoute(pathname)) {
      logSecurityEvent('UNAUTHENTICATED_ACCESS', {
        ip: clientIP,
        pathname,
        userAgent: request.headers.get('user-agent')
      });
    }
    return response;
  }

  try {
    // 7. Verificar token
    const payload = await verifyToken(token);

    if (!payload) {
      // Token inválido - não redirecionar automaticamente, deixar a página lidar com isso
      // Isso evita loops de redirecionamento
      logSecurityEvent('INVALID_TOKEN_ACCESS', {
        ip: clientIP,
        pathname,
        userAgent: request.headers.get('user-agent')
      });

      return response;
    }

    // 8. Verificar permissão de admin para rotas administrativas
    if (isAdminRoute(pathname)) {
      if (!isAdmin(payload)) {
        // Usuário não é admin - redirecionar para página inicial
        logSecurityEvent('UNAUTHORIZED_ADMIN_ACCESS', {
          ip: clientIP,
          pathname,
          userId: payload.userId,
          userAgent: request.headers.get('user-agent')
        });

        return NextResponse.redirect(new URL('/', request.url));
      }

      // Log de acesso admin para auditoria
      logSecurityEvent('ADMIN_ACCESS', {
        ip: clientIP,
        pathname,
        userId: payload.userId,
        userAgent: request.headers.get('user-agent')
      });
    }

    // 9. Adicionar informações do usuário aos headers para uso nas APIs
    response.headers.set('X-User-ID', payload.userId?.toString() || '');
    response.headers.set('X-User-Email', payload.email || '');
    response.headers.set('X-User-Is-Admin', isAdmin(payload).toString());
    response.headers.set('X-Session-ID', payload.sessionId || '');

    // 10. Log de acesso autenticado para rotas sensíveis
    if (isSensitiveRoute(pathname)) {
      logSecurityEvent('AUTHENTICATED_ACCESS', {
        ip: clientIP,
        pathname,
        userId: payload.userId,
        userAgent: request.headers.get('user-agent')
      });
    }

    return response;

  } catch (error) {
    console.error('Erro ao verificar token no middleware:', error);

    // Erro na verificação - não redirecionar automaticamente, deixar a página lidar com isso
    logSecurityEvent('TOKEN_VERIFICATION_ERROR', {
      ip: clientIP,
      pathname,
      error: error instanceof Error ? error.message : 'Unknown error',
      userAgent: request.headers.get('user-agent')
    });

    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - MODELOS folder
     * - images folder
     * - uploads folder (uploaded files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|MODELOS/|images/|uploads/).*)',
  ],
};
