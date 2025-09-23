// OBS: Este middleware duplicado foi consolidado no middleware.ts principal
// Headers de segurança são gerenciados exclusivamente pelo Nginx
// Este arquivo pode ser removido se não houver outra lógica específica

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Apenas passa a requisição adiante - headers gerenciados pelo Nginx
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};



