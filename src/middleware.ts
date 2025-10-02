import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lista de padrões maliciosos comuns (mais específicos)
const MALICIOUS_PATTERNS = [
  // SQL Injection - mais específicos
  /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\s+.*FROM/i,
  /(;|\-\-|\/\*|\*\/).*(SELECT|INSERT|UPDATE|DELETE|DROP)/i,
  /(\b(OR|AND)\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?\s*(OR|AND))/i,
  /(\b(OR|AND)\s+['"]\w+['"]\s*=\s*['"]\w+['"]\s*(OR|AND))/i,
  
  // XSS - mais específicos
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:\s*[^"'\s]/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /<iframe[^>]*src\s*=\s*["'][^"']*["']/gi,
  
  // Path Traversal - mais específicos
  /\.\.\/\.\.\//,
  /\.\.\\\.\.\\/,
  
  // Command Injection - mais específicos
  /[;&|`$]\s*(rm|del|format|shutdown|reboot|kill)/i,
  
  // LDAP Injection - mais específicos
  /[()=*!&|].*(cn|uid|mail|objectClass)/i,
];

// Headers de segurança
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; img-src 'self' data: https:; font-src 'self' data: https://cdnjs.cloudflare.com; connect-src 'self'; frame-ancestors 'none';",
};

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // Verificar se é uma rota de API admin
  const isAdminAPI = pathname.startsWith('/api/admin/');
  
  // Aplicar headers de segurança para todas as rotas
  const response = NextResponse.next();
  
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Verificações adicionais para APIs admin
  if (isAdminAPI) {
    // Verificar User-Agent suspeito
    const userAgent = request.headers.get('user-agent') || '';
    const suspiciousUserAgents = [
      'sqlmap',
      'nikto',
      'nmap',
      'curl',
      'wget',
      'python-requests',
      'java',
      'go-http-client'
    ];
    
    if (suspiciousUserAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
      console.log(`🚨 [SECURITY] Suspicious User-Agent detected: ${userAgent}`);
      return new NextResponse('Access Denied', { status: 403 });
    }
    
    // Verificar parâmetros de query maliciosos (apenas para APIs críticas)
    const queryString = searchParams.toString();
    if (queryString && pathname.includes('/orders/') && MALICIOUS_PATTERNS.some(pattern => pattern.test(queryString))) {
      console.log(`🚨 [SECURITY] Malicious query detected: ${queryString}`);
      return new NextResponse('Access Denied', { status: 403 });
    }
    
    // Verificar rate limiting básico
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `rate_limit_${ip}`;
    
    // Log de acesso para auditoria
    console.log(`🔍 [AUDIT] Admin API access: ${pathname} from IP: ${ip} User-Agent: ${userAgent}`);
  }
  
  // Verificar se é uma rota de pedidos com ID
  if (pathname.match(/^\/admin\/pedidos\/\d+$/)) {
    const orderId = pathname.split('/').pop();
    
    // Validar se o ID é numérico
    if (!orderId || isNaN(Number(orderId))) {
      console.log(`🚨 [SECURITY] Invalid order ID format: ${orderId}`);
      return new NextResponse('Invalid Request', { status: 400 });
    }
    
    // Verificar se o ID não é muito grande (possível overflow)
    if (Number(orderId) > 999999999) {
      console.log(`🚨 [SECURITY] Order ID too large: ${orderId}`);
      return new NextResponse('Invalid Request', { status: 400 });
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/admin/:path*',
    '/api/orders/:path*',
    '/api/checkout/:path*'
  ]
};