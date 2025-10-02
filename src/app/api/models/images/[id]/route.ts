import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const modelId = parseInt(params.id)
    
    if (isNaN(modelId)) {
      return NextResponse.json({
        error: 'ID do modelo inválido'
      }, { status: 400 })
    }
    
    const result = await database.query(`
      SELECT image_blob, image_mime_type, image_size 
      FROM models 
      WHERE id = ? AND use_blob = TRUE
    `, [modelId])
    
    if (!result.length || !result[0].image_blob) {
      return NextResponse.json({
        error: 'Imagem não encontrada'
      }, { status: 404 })
    }
    
    const model = result[0]
    
    return new NextResponse(model.image_blob, {
      status: 200,
      headers: {
        'Content-Type': model.image_mime_type || 'image/jpeg',
        'Content-Length': model.image_size?.toString() || '0',
        'Cache-Control': 'public, max-age=86400' 
      }
    })
    
  } catch (error) {
    console.error('Erro ao buscar imagem do modelo:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
} 