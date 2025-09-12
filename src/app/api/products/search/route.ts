import { NextRequest, NextResponse } from 'next/server'
import { searchProducts } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Query de busca é obrigatória'
      }, { status: 400 })
    }

    const products = await searchProducts(query.trim())
    
    return NextResponse.json({
      success: true,
      data: products,
      query: query.trim(),
      total: products.length
    })
    
  } catch (error) {
    console.error('Erro na busca de produtos:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}



