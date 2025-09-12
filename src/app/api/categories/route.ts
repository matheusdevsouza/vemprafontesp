import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: categories || []
    })
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      data: []
    }, { status: 500 })
  } finally {
    await prisma.$disconnect();
  }
}
