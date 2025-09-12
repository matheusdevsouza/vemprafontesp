import { NextRequest, NextResponse } from 'next/server'
import { getProductsByModel, getProductVariants } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    console.log('Buscando produtos para modelo:', slug)
    
    const products = await getProductsByModel(slug)
    console.log('Produtos encontrados:', products.length)
    
    // Buscar variantes e tamanhos para cada produto
    const productsWithSizes = []
    for (const product of products) {
      const variants = await getProductVariants(product.id)
      let sizes = variants.map((variant: any) => variant.size).filter(Boolean)
      
      // Filtrar apenas tamanhos de 38 a 43 e remover duplicatas
      const allowedSizes = ['38', '39', '40', '41', '42', '43']
      sizes = sizes.filter((size: string) => allowedSizes.includes(size))
      
      // Remover duplicatas dos tamanhos
              sizes = Array.from(new Set(sizes))
      
      // Se não houver tamanhos válidos, usar tamanhos padrão (38-43)
      if (sizes.length === 0) {
        sizes = allowedSizes
      }
      
      productsWithSizes.push({
        ...product,
        sizes: sizes
      })
    }
    
    return NextResponse.json({
      success: true,
      data: productsWithSizes
    })
    
  } catch (error) {
    console.error('Erro ao buscar produtos por modelo:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
} 