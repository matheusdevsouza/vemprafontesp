import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const brands = await prisma.brands.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: brands || []
    })
  } catch (error) {
    console.error('Erro ao buscar marcas:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      data: []
    }, { status: 500 })
  } finally {
    await prisma.$disconnect();
  }
}
