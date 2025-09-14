import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, isAdmin } from '@/lib/auth';
import { query } from '@/lib/database';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Configurações de upload
const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
  UPLOAD_DIR: join(process.cwd(), 'public', 'uploads', 'products'),
  THUMBNAIL_DIR: join(process.cwd(), 'public', 'uploads', 'thumbnails')
};

// Função para verificar se o usuário é admin
async function verifyAdminAccess(request: NextRequest) {
  try {
    const payload = await authenticateUser(request);
    
    if (!payload || !isAdmin(payload)) {
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('Erro na verificação de admin:', error);
    return null;
  }
}

// Função para validar tipo de arquivo
function validateFileType(file: File, type: 'image' | 'video'): boolean {
  const allowedTypes = type === 'image' ? UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES : UPLOAD_CONFIG.ALLOWED_VIDEO_TYPES;
  return allowedTypes.includes(file.type);
}

// Função para gerar nome único do arquivo
function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop()?.toLowerCase();
  return `${timestamp}_${random}.${extension}`;
}

// Função para criar diretórios se não existirem
async function ensureDirectories() {
  const dirs = [UPLOAD_CONFIG.UPLOAD_DIR, UPLOAD_CONFIG.THUMBNAIL_DIR];
  
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }
}

// GET - Buscar mídia do produto
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação admin
    const payload = await verifyAdminAccess(request);
    if (!payload) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta rota.' },
        { status: 403 }
      );
    }

    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'ID do produto inválido' },
        { status: 400 }
      );
    }

    // Buscar imagens
    const images = await query(`
      SELECT id, image_url, file_name, alt_text, is_primary, sort_order, 
             file_size, mime_type, use_blob, created_at
      FROM product_images 
      WHERE product_id = ? 
      ORDER BY is_primary DESC, sort_order ASC, created_at ASC
    `, [productId]);

    // Buscar vídeos
    const videos = await query(`
      SELECT id, video_url, file_name, alt_text, is_primary, sort_order, 
             file_size, mime_type, use_blob, duration, thumbnail_url, 
             use_thumbnail_blob, created_at
      FROM product_videos 
      WHERE product_id = ? 
      ORDER BY is_primary DESC, sort_order ASC, created_at ASC
    `, [productId]);

    return NextResponse.json({
      success: true,
      data: {
        images: images || [],
        videos: videos || []
      }
    });

  } catch (error) {
    console.error('Erro ao buscar mídia do produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Upload de mídia
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🚀 Iniciando upload de mídia...');
    
    // Verificar autenticação admin
    const payload = await verifyAdminAccess(request);
    if (!payload) {
      console.log('❌ Acesso negado - não é admin');
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem fazer upload.' },
        { status: 403 }
      );
    }

    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      console.log('❌ ID do produto inválido:', params.id);
      return NextResponse.json(
        { error: 'ID do produto inválido' },
        { status: 400 }
      );
    }

    console.log('📦 Produto ID:', productId);

    // Verificar se o produto existe
    const productResult = await query('SELECT id FROM products WHERE id = ? AND is_active = TRUE', [productId]);
    if (!productResult || productResult.length === 0) {
      console.log('❌ Produto não encontrado ou inativo');
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ Produto encontrado:', productResult[0]);

    // Processar FormData
    const formData = await request.formData();
    console.log('📋 FormData processado');
    
    const files = formData.getAll('files') as File[];
    console.log('📁 Arquivos recebidos:', files.length);
    
    const mediaType = formData.get('type') as string;
    const altText = formData.get('altText') as string || '';
    const isPrimary = formData.get('isPrimary') === 'true';

    console.log('🎯 Tipo de mídia:', mediaType);
    console.log('📝 Texto alternativo:', altText);
    console.log('⭐ É principal:', isPrimary);

    // Validações básicas
    if (!files || files.length === 0) {
      console.log('❌ Nenhum arquivo enviado');
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    if (!mediaType || !['image', 'video'].includes(mediaType)) {
      console.log('❌ Tipo de mídia inválido:', mediaType);
      return NextResponse.json(
        { error: 'Tipo de mídia inválido. Use "image" ou "video"' },
        { status: 400 }
      );
    }

    // Garantir que os diretórios existam
    await ensureDirectories();
    console.log('📁 Diretórios verificados');

    const uploadedFiles = [];

    // Processar cada arquivo
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`🔄 Processando arquivo ${i + 1}/${files.length}: ${file.name}`);
      
      try {
        // Validar tamanho do arquivo
        if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
          console.log(`❌ Arquivo muito grande: ${file.name} (${file.size} bytes)`);
          return NextResponse.json(
            { error: `Arquivo ${file.name} é muito grande. Tamanho máximo: 50MB` },
            { status: 400 }
          );
        }

        // Validar tipo do arquivo
        console.log(`🔍 Validando arquivo: ${file.name} (${file.type}) para tipo: ${mediaType}`);
        console.log(`📋 Tipos permitidos para ${mediaType}:`, mediaType === 'image' ? UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES : UPLOAD_CONFIG.ALLOWED_VIDEO_TYPES);
        
        if (!validateFileType(file, mediaType as 'image' | 'video')) {
          console.log(`❌ Tipo de arquivo inválido: ${file.name} (${file.type})`);
          const allowedTypes = mediaType === 'image' 
            ? UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES.join(', ')
            : UPLOAD_CONFIG.ALLOWED_VIDEO_TYPES.join(', ');
          
          return NextResponse.json(
            { error: `Tipo de arquivo não permitido para ${file.name}. Tipos permitidos: ${allowedTypes}` },
            { status: 400 }
          );
        }
        
        console.log(`✅ Tipo de arquivo válido: ${file.name} (${file.type})`);

        // Gerar nome único do arquivo
        const uniqueFileName = generateUniqueFileName(file.name);
        const filePath = join(UPLOAD_CONFIG.UPLOAD_DIR, uniqueFileName);
        const publicUrl = `/uploads/products/${uniqueFileName}`;

        console.log('💾 Salvando arquivo:', uniqueFileName);
        console.log('📁 Caminho completo:', filePath);

        // Salvar arquivo
        console.log('📥 Obtendo arrayBuffer do arquivo...');
        const bytes = await file.arrayBuffer();
        console.log('📊 ArrayBuffer obtido, tamanho:', bytes.byteLength, 'bytes');
        
        const buffer = Buffer.from(bytes);
        console.log('📊 Buffer criado, tamanho:', buffer.length, 'bytes');
        
        console.log('💾 Escrevendo arquivo...');
        try {
          await writeFile(filePath, buffer);
          console.log('✅ Arquivo salvo com sucesso');
        } catch (writeError) {
          console.error('❌ Erro ao escrever arquivo:', writeError);
          throw writeError;
        }

        // Verificar se o arquivo foi realmente criado
        const { existsSync } = await import('fs');
        if (existsSync(filePath)) {
          console.log('✅ Arquivo confirmado no sistema de arquivos');
          const { statSync } = await import('fs');
          const stats = statSync(filePath);
          console.log('📊 Tamanho real:', stats.size, 'bytes');
        } else {
          console.log('❌ ERRO: Arquivo não encontrado após escrita!');
        }

        // Se for vídeo, gerar thumbnail (placeholder por enquanto)
        let thumbnailUrl = null;
        if (mediaType === 'video') {
          thumbnailUrl = '/images/placeholder-video.jpg';
        }

        // Construir query dinamicamente baseada no tipo de mídia
        let insertQuery, insertValues;
        
        if (mediaType === 'image') {
          insertQuery = `
            INSERT INTO product_images (
              product_id, variant_id, image_url, file_name, alt_text, is_primary, 
              sort_order, file_size, mime_type, use_blob
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          insertValues = [
            productId,
            null, // variant_id
            publicUrl,
            file.name,
            altText,
            isPrimary,
            0, // sort_order
            file.size,
            file.type,
            false // use_blob
          ];
        } else {
          insertQuery = `
            INSERT INTO product_videos (
              product_id, variant_id, video_url, file_name, alt_text, is_primary, 
              sort_order, file_size, mime_type, use_blob, duration, thumbnail_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          insertValues = [
            productId,
            null, // variant_id
            publicUrl,
            file.name,
            altText,
            isPrimary,
            0, // sort_order
            file.size,
            file.type,
            false, // use_blob
            null, // duration
            thumbnailUrl
          ];
        }

        console.log('💾 Salvando no banco de dados...');
        console.log('📝 Query:', insertQuery);
        console.log('📝 Valores:', insertValues);

        // Se for primário, remover primário dos outros
        if (isPrimary) {
          const tableName = mediaType === 'image' ? 'product_images' : 'product_videos';
          await query(`UPDATE ${tableName} SET is_primary = FALSE WHERE product_id = ?`, [productId]);
        }

        // Executar INSERT
        const insertResult = await query(insertQuery, insertValues);
        console.log('✅ INSERT executado com sucesso:', insertResult);

        uploadedFiles.push({
          id: insertResult.insertId,
          url: publicUrl,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          isPrimary
        });

        console.log(`✅ Arquivo ${file.name} processado com sucesso!`);

      } catch (fileError) {
        console.error(`❌ Erro ao processar arquivo ${file.name}:`, fileError);
        return NextResponse.json(
          { error: `Erro ao processar arquivo ${file.name}: ${fileError instanceof Error ? fileError.message : 'Erro desconhecido'}` },
          { status: 500 }
        );
      }
    }

    console.log('🎉 Upload concluído com sucesso!');
    return NextResponse.json({
      success: true,
      message: `${files.length} arquivo(s) enviado(s) com sucesso`,
      data: uploadedFiles
    });

  } catch (error) {
    console.error('❌ Erro no upload de mídia:', error);
    return NextResponse.json(
      { error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}

// DELETE - Remover mídia
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação admin
    const payload = await verifyAdminAccess(request);
    if (!payload) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem remover mídia.' },
        { status: 403 }
      );
    }

    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'ID do produto inválido' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('mediaId');
    const mediaType = searchParams.get('type');

    if (!mediaId || !mediaType) {
      return NextResponse.json(
        { error: 'ID da mídia e tipo são obrigatórios' },
        { status: 400 }
      );
    }

    const tableName = mediaType === 'image' ? 'product_images' : 'product_videos';
    const urlField = mediaType === 'image' ? 'image_url' : 'video_url';

    // Buscar arquivo para obter o caminho
    const mediaResult = await query(`
      SELECT ${urlField}, file_name 
      FROM ${tableName} 
      WHERE id = ? AND product_id = ?
    `, [mediaId, productId]);

    if (!mediaResult || mediaResult.length === 0) {
      return NextResponse.json(
        { error: 'Mídia não encontrada' },
        { status: 404 }
      );
    }

    const media = mediaResult[0];

    // Remover arquivo físico se existir
    if (media[urlField] && media[urlField].startsWith('/uploads/')) {
      const filePath = join(process.cwd(), 'public', media[urlField]);
      try {
        await unlink(filePath);
      } catch (error) {
        console.warn('Erro ao remover arquivo físico:', error);
      }
    }

    // Remover do banco de dados
    await query(`DELETE FROM ${tableName} WHERE id = ? AND product_id = ?`, [mediaId, productId]);

    return NextResponse.json({
      success: true,
      message: 'Mídia removida com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover mídia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar mídia (definir como principal, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação admin
    const payload = await verifyAdminAccess(request);
    if (!payload) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem atualizar mídia.' },
        { status: 403 }
      );
    }

    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'ID do produto inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { mediaId, type, isPrimary } = body;

    if (!mediaId || !type) {
      return NextResponse.json(
        { error: 'ID da mídia e tipo são obrigatórios' },
        { status: 400 }
      );
    }

    const tableName = type === 'image' ? 'product_images' : 'product_videos';

    // Se for para definir como principal, remover primário dos outros
    if (isPrimary) {
      await query(`UPDATE ${tableName} SET is_primary = FALSE WHERE product_id = ?`, [productId]);
      await query(`UPDATE ${tableName} SET is_primary = TRUE WHERE id = ? AND product_id = ?`, [mediaId, productId]);
    }

    return NextResponse.json({
      success: true,
      message: 'Mídia atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar mídia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}