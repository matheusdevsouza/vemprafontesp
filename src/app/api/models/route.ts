import { NextRequest, NextResponse } from 'next/server'
import { getModels } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const models = await getModels()
    
    return NextResponse.json({
      success: true,
      data: models
    })
    
  } catch (error) {
    console.error('Erro ao buscar modelos:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
} 