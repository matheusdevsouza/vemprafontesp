import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug, getProductImages, getProductVariants, getProductReviews } from '@/lib/database';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    if (!slug) {
      return NextResponse.json({ error: 'Slug não informado' }, { status: 400 });
    }

    // Buscar produto principal
    const product = await getProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    // Buscar imagens
    const images = await getProductImages(product.id);
    // Buscar variantes (tamanhos)
    const variants = await getProductVariants(product.id);
    // Buscar avaliações
    const reviews = await getProductReviews(product.id, 10);

    // Montar lista de tamanhos únicos
    let sizes = variants.map((v: any) => v.size).filter(Boolean);
    
    // Filtrar apenas tamanhos de 38 a 43 e remover duplicatas
    const allowedSizes = ['38', '39', '40', '41', '42', '43'];
    sizes = sizes.filter((size: string) => allowedSizes.includes(size));
    
    // Remover duplicatas dos tamanhos
    sizes = Array.from(new Set(sizes));
    
    // Se não houver tamanhos válidos, usar tamanhos padrão (38-43)
    if (sizes.length === 0) {
      sizes = allowedSizes;
    }

    return NextResponse.json({
      id: product.id,
      name: product.name,
      description: product.description,
      shortDescription: product.short_description,
      price: product.price,
      priceFormatted: `R$ ${Number(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      originalPrice: product.original_price,
      stockQuantity: product.stock_quantity,
      slug: product.slug,
      images: images.map((img: any) => ({ url: img.image_url, alt: img.alt_text })),
      sizes,
      reviews,
    });
  } catch (error) {
    console.error('Erro ao buscar produto por slug:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 