import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, isAdmin, logSecurityEvent } from '@/lib/auth';

// Configurações de segurança
const MAX_REQUESTS_PER_MINUTE = 100;
const MAX_REQUESTS_PER_HOUR = 1000;
const BLOCKED_IPS = new Set<string>();
const blockedUserAgents = new Set<string>();

// User Agents Suspeitos
const SUSPICIOUS_USER_AGENTS = [
  'sqlmap', 'nikto', 'nmap', 'masscan', 'zap', 'burp', 'w3af', 'acunetix',
  'nessus', 'openvas', 'retina', 'core', 'fimap', 'sqlninja', 'havij',
  'pangolin', 'bsqlbf', 'sqldict', 'sqlsus', 'sqlninja', 'sqldumper',
  'bot', 'crawler', 'spider', 'scraper', 'harvester', 'probe', 'scanner',
  'attack', 'exploit', 'inject', 'payload', 'backdoor', 'trojan', 'virus',
  'malware', 'rootkit', 'keylogger', 'stealer', 'rat', 'shell', 'cmd',
  'metasploit', 'cobalt', 'empire', 'powershell', 'cmd.exe', 'bash',
  'curl', 'wget', 'python-requests', 'urllib', 'httpx', 'gobuster',
  'dirb', 'dirbuster', 'wfuzz', 'ffuf', 'feroxbuster', 'gobuster',
  'admin', 'test', 'dev', 'debug', 'config', 'backup', 'temp',
  'null', 'undefined', 'javascript:', 'vbscript:', 'onload', 'onerror',
  'eval(', 'exec(', 'system(', 'shell_exec', 'passthru', 'proc_open'
];

// Padrões suspeitos
const SUSPICIOUS_PATTERNS = [
  // Path traversal
  /\.\.\//, /\.\.\\/, /\.\.%2f/i, /\.\.%5c/i, /\.\.%252f/i, /\.\.%255c/i,
  
  // XSS
  /<script/i, /<\/script/i, /javascript:/i, /vbscript:/i, /data:/i,
  /on\w+\s*=/i, /<iframe/i, /<object/i, /<embed/i, /<link/i, /<meta/i,
  
  // SQL Injection
  /union\s+select/i, /union\s+all\s+select/i, /select\s+.*\s+from/i,
  /drop\s+table/i, /delete\s+from/i, /insert\s+into/i, /update\s+.*\s+set/i,
  /truncate\s+table/i, /alter\s+table/i, /create\s+table/i,
  /exec\s*\(/i, /execute\s*\(/i, /sp_executesql/i,
  /'\s*or\s*'.*'='/i, /"\s*or\s*".*"="/i, /\s*or\s+1\s*=\s*1/i,
  /'\s*and\s*'.*'='/i, /"\s*and\s*".*"="/i, /\s*and\s+1\s*=\s*1/i,
  /'\s*union\s*select/i, /"\s*union\s*select/i,
  /'\s*;.*--/i, /"\s*;.*--/i, /\s*;.*--/i,
  /benchmark\s*\(/i, /sleep\s*\(/i, /waitfor\s+delay/i,
  /information_schema/i, /sys\.databases/i, /sysobjects/i,
  
  // Command injection
  /exec\s*\(/i, /system\s*\(/i, /shell_exec/i, /passthru/i,
  /proc_open/i, /popen/i, /eval\s*\(/i, /assert\s*\(/i,
  
  // NoSQL injection
  /\$where/i, /\$regex/i, /\$ne/i, /\$gt/i, /\$lt/i, /\$in/i,
  
  // LDAP injection
  /\)\s*\(\s*&/i, /\)\s*\(\s*\|/i, /\(\s*\&/i, /\(\s*\|/i,
  
  // XML/XXE injection
  /<!DOCTYPE/i, /<!ENTITY/i, /SYSTEM\s+"/i, /PUBLIC\s+"/i,
  
  // Template injection
  /\{\{.*\}\}/i, /\{%.*%\}/i, /\{\{.*\|.*\}\}/i,
  
  // File inclusion
  /\.\.\/.*\.php/i, /\.\.\/.*\.asp/i, /\.\.\/.*\.jsp/i,
  /include\s*\(/i, /require\s*\(/i, /include_once/i, /require_once/i,
  
  // Encoding attacks
  /%00/i, /%0a/i, /%0d/i, /%20/i, /%2e/i, /%2f/i,
  
  // HTTP parameter pollution
  /&.*=.*&.*=/i, /\?.*=.*&.*=/i,
  
  // CRLF injection
  /%0d%0a/i, /\r\n/i, /%0a/i, /%0d/i
];

// Armazenamento para rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Rotas públicas
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
  '/uploads',
];

// Rotas protegidas
const protectedRoutes = [
  '/entregas',
  '/enderecos',
  '/meus-pedidos',
  '/perfil',
  '/configuracoes',
];

// Rotas admin
const adminRoutes = [
  '/admin',
  '/api/admin',
];

// Rotas sensíveis
const sensitiveRoutes = [
  '/api/admin',
  '/api/auth',
  '/perfil',
];

// Verificar se é rota pública
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route.includes('[') && route.includes(']')) {
      const pattern = route.replace(/\[.*?\]/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(pathname);
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
}

// Verificar se é rota protegida
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );
}

// Verificar se é rota admin
function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );
}

// Verificar se é rota sensível
function isSensitiveRoute(pathname: string): boolean {
  return sensitiveRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );
}

// 1. DETECÇÃO DE USER-AGENTS SUSPEITOS
function isSuspiciousUserAgent(userAgent: string): boolean {
  if (!userAgent) return true;
  
  const ua = userAgent.toLowerCase();
  
  // Verificar se contém user agents suspeitos
  for (const suspicious of SUSPICIOUS_USER_AGENTS) {
    if (ua.includes(suspicious)) {
      return true;
    }
  }
  
  // Verificar padrões suspeitos
  const suspiciousPatterns = [
    /bot|crawler|spider|scraper/i,
    /sqlmap|nikto|nmap|masscan|zap|burp/i,
    /admin|test|dev|debug|config|backup/i,
    /null|undefined|javascript:|vbscript:/i,
    /eval\(|exec\(|system\(|shell_exec/i,
    /cmd\.exe|bash|powershell|python-requests/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(ua));
}

// 2. VALIDAÇÃO DE INPUT
function validateInput(input: string): { isValid: boolean; sanitized: string } {
  if (!input) return { isValid: true, sanitized: '' };
  
  let sanitized = input;
  
  // Remover caracteres perigosos
  sanitized = sanitized
    .replace(/[<>"\'&]/g, '')
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '')
    .replace(/\x00/g, '')
    .trim();
  
  // Verificar se contém padrões maliciosos
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      return { isValid: false, sanitized: '' };
    }
  }
  
  return { isValid: true, sanitized };
}

// 3. RATE LIMITING
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const minute = Math.floor(now / 60000);
  const key = `${ip}:${minute}`;
  
  // Verificar bloqueio
  if (BLOCKED_IPS.has(ip)) {
    return { allowed: false, remaining: 0, resetTime: now + (60 * 60000) };
  }
  
  // Contar requisições
  const current = requestCounts.get(key) || { count: 0, resetTime: now + 60000 };
  
  // Verificar limite
  if (current.count >= MAX_REQUESTS_PER_MINUTE) {
    BLOCKED_IPS.add(ip);
    logSecurityEvent('IP_BLOCKED_RATE_LIMIT', { ip, requests: current.count });
    
    setTimeout(() => {
      BLOCKED_IPS.delete(ip);
    }, 60 * 60000);
    
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
  }
  
  // Incrementar contador
  current.count++;
  requestCounts.set(key, current);
  
  return { allowed: true, remaining: MAX_REQUESTS_PER_MINUTE - current.count, resetTime: current.resetTime };
}

// 4. DETECÇÃO DE PADRÕES SUSPEITOS
function detectSuspiciousPatterns(request: NextRequest): boolean {
  const url = request.nextUrl.href;
  const userAgent = request.headers.get('user-agent') || '';
  
  // Verificar URL
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(url)) {
      return true;
    }
  }
  
  // Verificar User Agent
  if (isSuspiciousUserAgent(userAgent)) {
    return true;
  }
  
  // Verificar query parameters
  const searchParams = request.nextUrl.searchParams;
  for (const [key, value] of Array.from(searchParams.entries())) {
    if (!validateInput(value).isValid) {
      return true;
    }
  }
  
  return false;
}

// 5. HEADERS DE SEGURANÇA COMPLETOS
function setSecurityHeaders(response: NextResponse): NextResponse {
  // Headers básicos
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  // Content Security Policy endurecida (sem unsafe-eval; mantendo compatibilidade)
  const csp = [
    "default-src 'self'",
    "script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.mercadopago.com https://viacep.com.br https://www.google-analytics.com",
    "frame-src 'self' https://www.mercadopago.com.br",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // Headers avançados - TODOS IMPLEMENTADOS
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('Expect-CT', 'max-age=86400, enforce');

  // Headers de auditoria
  response.headers.set('X-Audit-ID', `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  response.headers.set('X-Security-Level', 'HIGH');
  response.headers.set('X-Protection-Status', 'ACTIVE');

  return response;
}

// Obter IP do cliente
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

// MIDDLEWARE PRINCIPAL
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';

  // ========================================
  // 🛡️ PROTEÇÕES DE SEGURANÇA AVANÇADAS
  // ========================================

  // 1. BLOQUEIO DE USER-AGENTS SUSPEITOS
  if (isSuspiciousUserAgent(userAgent)) {
    logSecurityEvent('SUSPICIOUS_USER_AGENT_BLOCKED', { 
      ip: clientIP, 
      pathname, 
      userAgent 
    });
    return new NextResponse('Access Denied - Suspicious User Agent', { 
      status: 403,
      headers: {
        'X-Block-Reason': 'Suspicious User Agent',
        'X-Security-Level': 'HIGH'
      }
    });
  }

  // 2. VERIFICAR SE IP ESTÁ BLOQUEADO
  if (BLOCKED_IPS.has(clientIP)) {
    logSecurityEvent('BLOCKED_IP_ACCESS', { ip: clientIP, pathname });
    return new NextResponse('Access Denied - IP Blocked', { 
      status: 403,
      headers: {
        'X-Block-Reason': 'IP Blocked',
        'X-Security-Level': 'HIGH'
      }
    });
  }

  // 3. RATE LIMITING
  const rateLimit = checkRateLimit(clientIP);
  if (!rateLimit.allowed) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', { 
      ip: clientIP, 
      pathname, 
      remaining: rateLimit.remaining,
      userAgent 
    });
    return new NextResponse('Too Many Requests - Rate Limit Exceeded', {
      status: 429,
      headers: { 
        'Retry-After': rateLimit.remaining.toString(),
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': rateLimit.resetTime.toString(),
        'X-Security-Level': 'HIGH'
      }
    });
  }

  // 4. DETECÇÃO DE PADRÕES SUSPEITOS
  if (detectSuspiciousPatterns(request)) {
    logSecurityEvent('SUSPICIOUS_PATTERN_DETECTED', { 
      ip: clientIP, 
      pathname, 
      userAgent,
      url: request.nextUrl.href,
      method: request.method
    });
    
    BLOCKED_IPS.add(clientIP);
    setTimeout(() => {
      BLOCKED_IPS.delete(clientIP);
    }, 60 * 60000);
    
    return new NextResponse('Bad Request - Suspicious Activity Detected', { 
      status: 400,
      headers: {
        'X-Block-Reason': 'Suspicious Pattern',
        'X-Security-Level': 'HIGH'
      }
    });
  }

  // 5. HEADERS DE SEGURANÇA
  const response = NextResponse.next();
  setSecurityHeaders(response);

  // 6. Se for rota pública, permitir acesso
  if (isPublicRoute(pathname)) {
    return response;
  }

  // 7. Verificar autenticação para rotas protegidas
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    if (isAdminRoute(pathname)) {
      logSecurityEvent('UNAUTHENTICATED_ADMIN_ACCESS', {
        ip: clientIP,
        pathname,
        userAgent
      });
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    if (isProtectedRoute(pathname)) {
      logSecurityEvent('UNAUTHENTICATED_ACCESS', {
        ip: clientIP,
        pathname,
        userAgent
      });
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    return response;
  }

  try {
    // Verificar token
    const payload = await verifyToken(token);

    if (!payload) {
      if (isAdminRoute(pathname)) {
        logSecurityEvent('INVALID_TOKEN_ADMIN_ACCESS', {
          ip: clientIP,
          pathname,
          userAgent
        });
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      if (isProtectedRoute(pathname)) {
        logSecurityEvent('INVALID_TOKEN_ACCESS', {
          ip: clientIP,
          pathname,
          userAgent
        });
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      return response;
    }

    // Verificar permissão de admin
    if (isAdminRoute(pathname)) {
      if (!isAdmin(payload)) {
        logSecurityEvent('UNAUTHORIZED_ADMIN_ACCESS', {
          ip: clientIP,
          pathname,
          userId: payload.userId,
          userAgent
        });
        return NextResponse.redirect(new URL('/', request.url));
      }

      logSecurityEvent('ADMIN_ACCESS', {
        ip: clientIP,
        pathname,
        userId: payload.userId,
        userAgent
      });
    }

    // Adicionar informações do usuário aos headers
    response.headers.set('X-User-ID', payload.userId?.toString() || '');
    response.headers.set('X-User-Email', payload.email || '');
    response.headers.set('X-User-Is-Admin', isAdmin(payload).toString());

    // Log de acesso para rotas sensíveis
    if (isSensitiveRoute(pathname)) {
      logSecurityEvent('AUTHENTICATED_ACCESS', {
        ip: clientIP,
        pathname,
        userId: payload.userId,
        userAgent
      });
    }

    return response;

  } catch (error) {
    console.error('Erro ao verificar token no middleware:', error);

    if (isAdminRoute(pathname)) {
      logSecurityEvent('TOKEN_ERROR_ADMIN_ACCESS', {
        ip: clientIP,
        pathname,
        error: error instanceof Error ? error.message : 'Unknown error',
        userAgent
      });
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    if (isProtectedRoute(pathname)) {
      logSecurityEvent('TOKEN_VERIFICATION_ERROR', {
        ip: clientIP,
        pathname,
        error: error instanceof Error ? error.message : 'Unknown error',
        userAgent
      });
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
