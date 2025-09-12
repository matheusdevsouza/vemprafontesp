import { NextRequest, NextResponse } from 'next/server'
import { getProducts, getProductImages, getProductVariants, getBrands } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      brand_id: searchParams.get('brand_id') ? parseInt(searchParams.get('brand_id')!) : undefined,
      category_id: searchParams.get('category_id') ? parseInt(searchParams.get('category_id')!) : undefined,
      subcategory_id: searchParams.get('subcategory_id') ? parseInt(searchParams.get('subcategory_id')!) : undefined,
      subcategory_slug: searchParams.get('subcategory_slug') || undefined,
      color: searchParams.get('color') || undefined,
      is_featured: searchParams.get('featured') === 'true' ? true : undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      unique: searchParams.get('unique') === 'true' ? true : undefined,
      color_ids: searchParams.get('color_ids') ? searchParams.get('color_ids')!.split(',').map(Number) : undefined
    }
    
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters]
      }
    })
    
    const products = await getProducts(filters)
    
    const productsWithDetails = []
    for (const product of products) {
      const images = await getProductImages(product.id)
      const primaryImage = images.find((img: any) => img.is_primary) || images[0]
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
      let badge = null
      let badgeColor = null
      if (product.is_new) {
        badge = 'NOVO'
        badgeColor = 'bg-green-500'
      } else if (product.original_price && product.original_price > product.price) {
        badge = 'OFERTA'
        badgeColor = 'bg-red-500'
      } else if (product.is_bestseller) {
        badge = 'MAIS VENDIDO'
        badgeColor = 'bg-blue-500'
      }
      productsWithDetails.push({
        id: product.id.toString(),
        name: product.name,
        brand: product.brand_name,
        category: product.category_name,
        color: product.color,
        colorHex: product.color_hex,
        originalPrice: product.original_price,
        price: product.price,
        images: images.map((img: any) => ({
          url: img.image_url,
          alt: img.alt_text,
          isPrimary: img.is_primary
        })),
        image: (primaryImage && primaryImage.image_url) || '/images/Logo.png',
        rating: parseFloat(product.rating) || 0,
        reviews: product.review_count || 0,
        badge,
        badgeColor,
        isNew: product.is_new,
        isBestSeller: product.is_bestseller,
        isFeatured: product.is_featured,
        stockQuantity: product.stock_quantity,
        sizes: sizes,
        slug: product.slug,
        description: product.description,
        shortDescription: product.short_description,
        createdAt: new Date(product.created_at),
        updatedAt: new Date(product.updated_at)
      })
    }
    
    return NextResponse.json({
      success: true,
      data: productsWithDetails,
      total: productsWithDetails.length
    })
    
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
