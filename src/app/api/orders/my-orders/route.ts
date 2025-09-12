import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = user.userId;

    // Buscar todos os pedidos do usuário
    const orders = await query(`
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.payment_status,
        o.payment_method,
        o.subtotal,
        o.shipping_cost,
        o.tax_amount,
        o.discount_amount,
        o.total_amount,
        o.currency,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.shipping_address,
        o.notes,
        o.tracking_code,
        o.tracking_url,
        o.shipping_company,
        o.shipping_status,
        o.shipping_notes,
        o.shipped_at,
        o.delivered_at,
        o.created_at,
        o.updated_at
      FROM orders o
      WHERE o.user_id = ? 
      ORDER BY o.created_at DESC
    `, [userId]);

    // Buscar itens de cada pedido
    for (const order of orders) {
      const items = await query(`
        SELECT 
          oi.id,
          oi.product_id,
          oi.product_name,
          p.slug AS slug,
          COALESCE(pi.image_url, '') AS product_image,
          oi.size,
          oi.color,
          oi.quantity,
          oi.unit_price,
          oi.total_price
        FROM order_items oi
        LEFT JOIN products p ON p.id = oi.product_id
        LEFT JOIN product_images pi ON pi.product_id = oi.product_id AND pi.is_primary = 1
        WHERE oi.order_id = ?
        ORDER BY oi.id
      `, [order.id]);
      
      order.items = items;
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
} 