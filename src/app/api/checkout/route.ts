import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: { timeout: 5000 }
})

const preference = new Preference(client)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, customer, shipping_address } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items são obrigatórios' },
        { status: 400 }
      )
    }

    const total = items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity)
    }, 0)

    const preferenceData = {
      items: items.map((item: any) => ({
        id: item.id,
        title: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: 'BRL',
        picture_url: item.image,
        description: item.description || item.name
      })),
      payer: {
        name: customer?.name || 'Cliente',
        email: customer?.email || 'cliente@email.com',
        phone: {
          area_code: customer?.phone?.area_code || '11',
          number: customer?.phone?.number || '999999999'
        },
        address: shipping_address ? {
          street_name: shipping_address.street,
          street_number: shipping_address.number,
          zip_code: shipping_address.zip_code,
          city: shipping_address.city,
          state: shipping_address.state
        } : undefined
      },
      shipments: shipping_address ? {
        receiver_address: {
          street_name: shipping_address.street,
          street_number: shipping_address.number,
          zip_code: shipping_address.zip_code,
          city: shipping_address.city,
          state: shipping_address.state
        }
      } : undefined,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/pending`
      },
      auto_return: 'approved',
      external_reference: `order_${Date.now()}`,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
      expires: true,
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString() 
    }

    const response = await preference.create({ body: preferenceData })

    return NextResponse.json({
      success: true,
      preference_id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point
    })

  } catch (error) {
    console.error('Erro ao criar checkout:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 