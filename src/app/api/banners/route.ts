import { NextRequest, NextResponse } from 'next/server'
import { getBanners } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position') || 'hero'
    
    const banners = await getBanners(position)
    
    const formattedBanners = banners.map((banner: any) => ({
      id: banner.id.toString(),
      imageUrl: banner.image_url,
      mobileImageUrl: banner.mobile_image_url,
      title: banner.title,
      subtitle: banner.subtitle,
      description: banner.description,
      buttonText: banner.button_text,
      buttonUrl: banner.link_url,
      isActive: banner.is_active,
      order: banner.sort_order,
      createdAt: new Date(banner.created_at),
      updatedAt: new Date(banner.updated_at)
    }))
    
    return NextResponse.json({
      success: true,
      data: formattedBanners
    })
    
  } catch (error) {
    console.error('Erro ao buscar banners:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
