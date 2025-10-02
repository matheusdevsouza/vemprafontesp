import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Buscar pedido no banco de dados
    const orders = await database.query(`
      SELECT 
        id,
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        status,
        payment_status,
        payment_method,
        subtotal,
        shipping_cost,
        tax_amount,
        discount_amount,
        total_amount,
        currency,
        created_at,
        updated_at
      FROM orders 
      WHERE id = ?
    `, [id]);

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    const order = orders[0];

    // Buscar itens do pedido
    const items = await database.query(`
      SELECT 
        oi.id,
        oi.product_name,
        oi.quantity,
        oi.unit_price,
        oi.total_price,
        oi.size,
        oi.color,
        oi.product_image
      FROM order_items oi
      WHERE oi.order_id = ?
    `, [id]);

    // Formatar os dados para resposta
    const formattedOrder = {
      order_id: order.id.toString(),
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      status: order.status,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      subtotal: Number(order.subtotal),
      shipping_cost: Number(order.shipping_cost || 0),
      tax_amount: Number(order.tax_amount || 0),
      discount_amount: Number(order.discount_amount || 0),
      total_amount: Number(order.total_amount),
      currency: order.currency || 'BRL',
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: items.map((item: any) => ({
        id: item.id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        total_price: Number(item.total_price),
        size: item.size,
        color: item.color,
        image: item.product_image
      }))
    };

    return NextResponse.json({
      success: true,
      order: formattedOrder
    });

  } catch (error) {
    console.error('❌ Erro ao buscar pedido:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

