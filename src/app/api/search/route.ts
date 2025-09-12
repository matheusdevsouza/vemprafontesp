import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Query de busca deve ter pelo menos 2 caracteres'
      }, { status: 400 });
    }

    const searchTerm = query.trim().toLowerCase();
    const results: Array<{
      id: number;
      name: string;
      slug: string;
      price: number;
      image: string;
      type: 'product' | 'brand' | 'category';
      brand?: string;
      category?: string;
    }> = [];

    // Buscar produtos
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm } },
          { description: { contains: searchTerm } },
          { slug: { contains: searchTerm } }
        ],
        is_active: true
      },
      include: {
        brands: true,
        category: true,
        product_images: {
          take: 1,
          where: { is_primary: true }
        }
      },
      take: 5
    });

    // Adicionar produtos aos resultados
    products.forEach((product: any) => {
      results.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        image: product.product_images[0]?.image_url || '',
        type: 'product' as const,
        brand: product.brands?.name,
        category: product.category?.name
      });
    });

    // Buscar marcas
    const brands = await prisma.brands.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm } },
          { slug: { contains: searchTerm } }
        ],
        is_active: true
      },
      take: 3
    });

    // Adicionar marcas aos resultados
    brands.forEach((brand: any) => {
      results.push({
        id: brand.id,
        name: brand.name,
        slug: brand.slug || brand.name.toLowerCase().replace(/\s+/g, '-'),
        price: 0,
        image: brand.logo_url || '',
        type: 'brand' as const,
        brand: brand.name,
        category: undefined
      });
    });

    // Buscar categorias
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm } },
          { slug: { contains: searchTerm } }
        ],
        is_active: true
      },
      take: 3
    });

    // Adicionar categorias aos resultados
    categories.forEach((category: any) => {
      results.push({
        id: category.id,
        name: category.name,
        slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
        price: 0,
        image: '',
        type: 'category' as const,
        brand: undefined,
        category: category.name
      });
    });

    // Ordenar resultados por relevância (produtos primeiro, depois marcas, depois categorias)
    const typeOrder = { product: 1, brand: 2, category: 3 };
    results.sort((a, b) => {
      // Primeiro por tipo
      if (typeOrder[a.type] !== typeOrder[b.type]) {
        return typeOrder[a.type] - typeOrder[b.type];
      }
      // Depois por nome (mais próximo da query)
      const aNameMatch = a.name.toLowerCase().includes(searchTerm);
      const bNameMatch = b.name.toLowerCase().includes(searchTerm);
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      return 0;
    });

    // Limitar a 10 resultados no total
    const limitedResults = results.slice(0, 10);

    return NextResponse.json({
      success: true,
      results: limitedResults,
      total: limitedResults.length,
      query: searchTerm
    });

  } catch (error) {
    console.error('Erro na busca:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
