import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(params.id)
    
    if (isNaN(categoryId)) {
      return NextResponse.json({
        success: false,
        error: 'ID da categoria inválido'
      }, { status: 400 })
    }

    const subcategories = await prisma.subcategories.findMany({
      where: { 
        category_id: categoryId,
        is_active: true 
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: subcategories || []
    })
  } catch (error) {
    console.error('Erro ao buscar subcategorias:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      data: []
    }, { status: 500 })
  } finally {
    await prisma.$disconnect();
  }
}
