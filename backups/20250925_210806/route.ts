import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { authenticateUser, isAdmin } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const prisma = new PrismaClient()

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
    const images = await prisma.product_images.findMany({
      where: { product_id: productId },
      orderBy: [
        { is_primary: 'desc' },
        { sort_order: 'asc' },
        { created_at: 'asc' }
      ]
    })

    // Buscar vídeos do produto (se existir tabela de vídeos)
    const videos: any[] = [] // Por enquanto vazio, pode ser implementado depois

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
  } finally {
    await prisma.$disconnect();
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
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
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

    if (type !== 'image') {
      return NextResponse.json({
        success: false,
        error: 'Apenas imagens são suportadas no momento'
      }, { status: 400 })
    }

    const uploadResults = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
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
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'products')
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true })
        }

        // Salvar arquivo
        const filePath = join(uploadDir, fileName)
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        // URL da imagem
        const imageUrl = `/uploads/products/${fileName}`

        // Salvar no banco de dados
        const imageRecord = await prisma.product_images.create({
          data: {
            product_id: productId,
            image_url: imageUrl,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            alt_text: altText || file.name,
            is_primary: isPrimary && i === 0, // Primeira imagem é primária se isPrimary for true
            sort_order: i
          }
        })

        uploadResults.push({
          id: imageRecord.id,
          url: imageUrl,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          isPrimary: imageRecord.is_primary
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
  } finally {
    await prisma.$disconnect();
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

    if (type === 'image') {
      if (isPrimary) {
        // Remover primário de todas as imagens do produto
        await prisma.product_images.updateMany({
          where: { product_id: productId },
          data: { is_primary: false }
        })

        // Definir nova imagem como primária
        await prisma.product_images.update({
          where: { id: mediaId },
          data: { is_primary: true }
        })
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
  } finally {
    await prisma.$disconnect();
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
      const image = await prisma.product_images.findUnique({
        where: { id: parseInt(mediaId) }
      })

      if (image) {
        // Remover do banco de dados
        await prisma.product_images.delete({
          where: { id: parseInt(mediaId) }
        })

        // Tentar remover arquivo físico (opcional)
        try {
          if (image.image_url) {
            const fileName = image.image_url.split('/').pop()
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
  } finally {
    await prisma.$disconnect();
  }
}