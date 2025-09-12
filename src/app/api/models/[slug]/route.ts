import { NextRequest, NextResponse } from 'next/server'
import { getModelBySlug } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    
    const model = await getModelBySlug(slug)
    
    if (!model) {
      return NextResponse.json({
        success: false,
        error: 'Modelo não encontrado'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: model
    })
    
  } catch (error) {
    console.error('Erro ao buscar modelo:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
} 