// OBS: Headers de segurança agora são gerenciados exclusivamente pelo Nginx
// Este arquivo mantém apenas utilitários auxiliares se necessário

import { NextResponse } from 'next/server';

// Função para criar resposta JSON padrão (sem headers de segurança duplicados)
export function createStandardResponse(data: any, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}

// Se precisar de headers específicos para casos especiais (não de segurança)
export function addCustomHeaders(response: NextResponse, headers: Record<string, string>): NextResponse {
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}


