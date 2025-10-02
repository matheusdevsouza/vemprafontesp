import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Construir o caminho do arquivo
    const fileName = params.path.join('/');
    const filePath = join(process.cwd(), 'public', 'uploads', 'products', fileName);

    // Verificar se o arquivo existe
    if (!existsSync(filePath)) {
      return new NextResponse('Arquivo não encontrado', { status: 404 });
    }

    // Ler o arquivo
    const fileBuffer = await readFile(filePath);

    // Determinar o tipo MIME baseado na extensão
    const extension = fileName.split('.').pop()?.toLowerCase();
    let mimeType = 'application/octet-stream';

    switch (extension) {
      case 'jpg':
      case 'jpeg':
        mimeType = 'image/jpeg';
        break;
      case 'png':
        mimeType = 'image/png';
        break;
      case 'webp':
        mimeType = 'image/webp';
        break;
      case 'avif':
        mimeType = 'image/avif';
        break;
      case 'gif':
        mimeType = 'image/gif';
        break;
      case 'svg':
        mimeType = 'image/svg+xml';
        break;
      case 'mp4':
        mimeType = 'video/mp4';
        break;
      case 'webm':
        mimeType = 'video/webm';
        break;
      case 'ogg':
        mimeType = 'video/ogg';
        break;
      case 'avi':
        mimeType = 'video/avi';
        break;
      case 'mov':
        mimeType = 'video/quicktime';
        break;
    }

    // Retornar o arquivo com os headers corretos
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache por 1 ano
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Erro ao servir arquivo:', error);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}


