import { NextResponse } from 'next/server'
import database from '@/lib/database'

export async function GET() {
  try {
    const brands = await database.query(
      'SELECT * FROM brands WHERE is_active = 1 ORDER BY name ASC'
    )

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
  }
}
