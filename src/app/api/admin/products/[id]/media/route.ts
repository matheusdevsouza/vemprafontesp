import { NextRequest, NextResponse } from 'next/server'
import database from '@/lib/database'
import { authenticateUser, isAdmin } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// GET - Buscar mídia do produto
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação e permissão de admin
    const user = await authenticateUser(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const productId = parseInt(params.id)
    
    if (isNaN(productId)) {
      return NextResponse.json({
        success: false,
        error: 'ID do produto inválido'
      }, { status: 400 })
    }

    // Buscar imagens do produto
    const images = await database.query(
      `SELECT * FROM product_images 
       WHERE product_id = ? 
       ORDER BY is_primary DESC, sort_order ASC, created_at ASC`,
      [productId]
    )

    // Buscar vídeos do produto
    const videos = await database.query(
      `SELECT * FROM product_videos 
       WHERE product_id = ? 
       ORDER BY is_primary DESC, sort_order ASC, created_at ASC`,
      [productId]
    ).catch(() => []) // Se a tabela não existir, retornar array vazio

    return NextResponse.json({
      success: true,
      data: {
        images: images || [],
        videos: videos || []
      }
    })
  } catch (error) {
    console.error('Erro ao buscar mídia do produto:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// POST - Upload de mídia
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação e permissão de admin
    const user = await authenticateUser(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const productId = parseInt(params.id)
    
    if (isNaN(productId)) {
      return NextResponse.json({
        success: false,
        error: 'ID do produto inválido'
      }, { status: 400 })
    }

    // Verificar se produto existe
    const product = await database.query(
      'SELECT id FROM products WHERE id = ?',
      [productId]
    )

    if (!product || product.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Produto não encontrado'
      }, { status: 404 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const type = formData.get('type') as string
    const altText = formData.get('altText') as string || ''
    const isPrimary = formData.get('isPrimary') === 'true'

    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Nenhum arquivo enviado'
      }, { status: 400 })
    }

    if (type !== 'image' && type !== 'video') {
      return NextResponse.json({
        success: false,
        error: 'Tipo de mídia não suportado. Use image ou video'
      }, { status: 400 })
    }

    const uploadResults = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validar tipo de arquivo
      if (type === 'image' && !file.type.startsWith('image/')) {
        continue
      }
      if (type === 'video' && !file.type.startsWith('video/')) {
        continue
      }

      // Validar tamanho (50MB máximo)
      if (file.size > 50 * 1024 * 1024) {
        continue
      }

      try {
        // Gerar nome único para o arquivo
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const fileExtension = file.name.split('.').pop() || 'jpg'
        const fileName = `${productId}_${timestamp}_${randomString}.${fileExtension}`
        
        // Criar diretório se não existir
        const uploadDir = type === 'image' 
          ? join(process.cwd(), 'public', 'uploads', 'products')
          : join(process.cwd(), 'public', 'uploads', 'products', 'videos')
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true })
        }

        // Salvar arquivo
        const filePath = join(uploadDir, fileName)
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        // URL da mídia
        const mediaUrl = type === 'image' 
          ? `/uploads/products/${fileName}`
          : `/uploads/products/videos/${fileName}`

        // Salvar no banco de dados
        let insertQuery, queryParams
        
        if (type === 'image') {
          insertQuery = `
            INSERT INTO product_images (
              product_id, image_url, file_name, file_size, mime_type, 
              alt_text, is_primary, sort_order, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
          `
          queryParams = [
            productId,
            mediaUrl,
            file.name,
            file.size,
            file.type,
            altText || file.name,
            isPrimary && i === 0 ? 1 : 0,
            i
          ]
        } else {
          insertQuery = `
            INSERT INTO product_videos (
              product_id, video_url, file_name, file_size, mime_type, 
              alt_text, is_primary, sort_order, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
          `
          queryParams = [
            productId,
            mediaUrl,
            file.name,
            file.size,
            file.type,
            altText || file.name,
            isPrimary && i === 0 ? 1 : 0,
            i
          ]
        }
        
        const result = await database.query(insertQuery, queryParams)

        uploadResults.push({
          id: result.insertId,
          url: mediaUrl,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          isPrimary: isPrimary && i === 0,
          type: type
        })

      } catch (fileError) {
        console.error(`Erro ao processar arquivo ${file.name}:`, fileError)
        continue
      }
    }

    if (uploadResults.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Nenhum arquivo foi processado com sucesso'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `${uploadResults.length} arquivo(s) enviado(s) com sucesso`,
      data: uploadResults
    })

  } catch (error) {
    console.error('Erro ao fazer upload de mídia:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// PATCH - Atualizar mídia (ex: definir como primária)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação e permissão de admin
    const user = await authenticateUser(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const productId = parseInt(params.id)
    const body = await request.json()
    const { mediaId, type, isPrimary } = body

    if (!mediaId || !type) {
      return NextResponse.json({
        success: false,
        error: 'ID da mídia e tipo são obrigatórios'
      }, { status: 400 })
    }

    if (isPrimary) {
      if (type === 'image') {
        // Remover primário de todas as imagens do produto
        await database.query(
          'UPDATE product_images SET is_primary = 0 WHERE product_id = ?',
          [productId]
        )

        // Definir nova imagem como primária
        await database.query(
          'UPDATE product_images SET is_primary = 1 WHERE id = ?',
          [mediaId]
        )
      } else if (type === 'video') {
        // Remover primário de todos os vídeos do produto
        await database.query(
          'UPDATE product_videos SET is_primary = 0 WHERE product_id = ?',
          [productId]
        ).catch(() => {}) // Ignorar erro se tabela não existir

        // Definir novo vídeo como primário
        await database.query(
          'UPDATE product_videos SET is_primary = 1 WHERE id = ?',
          [mediaId]
        ).catch(() => {}) // Ignorar erro se tabela não existir
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Mídia atualizada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar mídia:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// DELETE - Remover mídia
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação e permissão de admin
    const user = await authenticateUser(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const productId = parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('mediaId')
    const type = searchParams.get('type')

    if (!mediaId || !type) {
      return NextResponse.json({
        success: false,
        error: 'ID da mídia e tipo são obrigatórios'
      }, { status: 400 })
    }

    if (type === 'image') {
      // Buscar imagem para obter o caminho do arquivo
      const image = await database.query(
        'SELECT * FROM product_images WHERE id = ?',
        [parseInt(mediaId)]
      )

      if (image && image.length > 0) {
        const imageData = image[0]
        
        // Remover do banco de dados
        await database.query(
          'DELETE FROM product_images WHERE id = ?',
          [parseInt(mediaId)]
        )

        // Tentar remover arquivo físico (opcional)
        try {
          if (imageData.image_url) {
            const fileName = imageData.image_url.split('/').pop()
            if (fileName) {
              const filePath = join(process.cwd(), 'public', 'uploads', 'products', fileName)
              if (existsSync(filePath)) {
                const { unlink } = await import('fs/promises')
                await unlink(filePath)
              }
            }
          }
        } catch (fileError) {
          console.warn('Erro ao remover arquivo físico:', fileError)
        }
      }
    } else if (type === 'video') {
      // Buscar vídeo para obter o caminho do arquivo
      const video = await database.query(
        'SELECT * FROM product_videos WHERE id = ?',
        [parseInt(mediaId)]
      ).catch(() => []) // Ignorar erro se tabela não existir

      if (video && video.length > 0) {
        const videoData = video[0]
        
        // Remover do banco de dados
        await database.query(
          'DELETE FROM product_videos WHERE id = ?',
          [parseInt(mediaId)]
        ).catch(() => {}) // Ignorar erro se tabela não existir

        // Tentar remover arquivo físico (opcional)
        try {
          if (videoData.video_url) {
            const fileName = videoData.video_url.split('/').pop()
            if (fileName) {
              const filePath = join(process.cwd(), 'public', 'uploads', 'products', 'videos', fileName)
              if (existsSync(filePath)) {
                const { unlink } = await import('fs/promises')
                await unlink(filePath)
              }
            }
          }
        } catch (fileError) {
          console.warn('Erro ao remover arquivo físico:', fileError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Mídia removida com sucesso'
    })

  } catch (error) {
    console.error('Erro ao remover mídia:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}