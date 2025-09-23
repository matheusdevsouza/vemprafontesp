import { NextResponse } from 'next/server';

export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Headers de segurança
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy básico (alinhado ao middleware principal)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://api.mercadopago.com https://viacep.com.br https://www.google-analytics.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'"
  );
  
  return response;
}

export function createSecureResponse(data: any, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  return addSecurityHeaders(response);
}


