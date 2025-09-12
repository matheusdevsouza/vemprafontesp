import { NextRequest, NextResponse } from 'next/server'
import { getTestimonials } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const featured = searchParams.get('featured') === 'true'
    
    const testimonials = await getTestimonials({ 
      limit, 
      is_featured: featured || undefined 
    })
    
    const formattedTestimonials = testimonials.map((testimonial: any) => ({
      id: testimonial.id,
      name: testimonial.customer_name,
      location: testimonial.customer_location || '',
      comment: testimonial.content,
      rating: testimonial.rating,
      image: testimonial.customer_avatar || null,
      created_at: testimonial.created_at,
      updated_at: testimonial.updated_at
    }))
    
    return NextResponse.json({
      success: true,
      data: formattedTestimonials
    })
    
  } catch (error) {
    console.error('Erro ao buscar depoimentos:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
