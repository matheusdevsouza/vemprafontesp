import { NextRequest } from 'next/server';
import crypto from 'crypto';

// Armazenar tokens CSRF em memória (em produção, usar Redis)
const csrfTokens = new Map<string, { token: string; expires: number }>();

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function storeCSRFToken(token: string, expiresInMs: number = 3600000): void {
  const expires = Date.now() + expiresInMs;
  csrfTokens.set(token, { token, expires });
}

export function validateCSRFToken(token: string): boolean {
  const stored = csrfTokens.get(token);
  if (!stored) return false;
  
  // Verificar se expirou
  if (Date.now() > stored.expires) {
    csrfTokens.delete(token);
    return false;
  }
  
  return true;
}

export function removeCSRFToken(token: string): void {
  csrfTokens.delete(token);
}

export function validateCSRFRequest(request: NextRequest): boolean {
  // Verificar se é um método que requer CSRF
  const method = request.method;
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return true; // GET, HEAD, OPTIONS não precisam de CSRF
  }

  // Verificar Origin header
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');
  
  if (!origin && !referer) {
    return false; // Sem origin ou referer
  }

  // Verificar se o origin/referer é do mesmo domínio
  const expectedOrigin = `${request.nextUrl.protocol}//${host}`;
  if (origin && !origin.startsWith(expectedOrigin)) {
    return false;
  }
  if (referer && !referer.startsWith(expectedOrigin)) {
    return false;
  }

  // Verificar token CSRF
  const csrfToken = request.headers.get('x-csrf-token') || 
                   request.headers.get('csrf-token') ||
                   request.nextUrl.searchParams.get('_csrf');
  
  if (!csrfToken) {
    return false;
  }

  return validateCSRFToken(csrfToken);
}

export function createCSRFResponse(data: any, status: number = 200) {
  const token = generateCSRFToken();
  storeCSRFToken(token);
  
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': token,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}