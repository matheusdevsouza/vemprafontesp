import { NextRequest, NextResponse } from 'next/server'
import { getProductsByBrand, getProductVariants } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const products = await getProductsByBrand(slug)
    
    // Adicionar tamanhos para cada produto
    const productsWithSizes = await Promise.all(
      products.map(async (product: any) => {
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
        
        return {
          ...product,
          sizes
        }
      })
    )
    
    return NextResponse.json({ success: true, data: productsWithSizes })
  } catch (error) {
    console.error('Erro ao buscar produtos por marca:', error)
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
} 