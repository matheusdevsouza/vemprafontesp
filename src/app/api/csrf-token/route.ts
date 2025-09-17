import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFToken, storeCSRFToken } from '@/lib/csrf-protection';

export async function GET(request: NextRequest) {
  try {
    // Gerar novo token CSRF
    const token = generateCSRFToken();
    storeCSRFToken(token, 3600000); // 1 hora

    return NextResponse.json(
      { csrfToken: token },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    console.error('Erro ao gerar token CSRF:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}