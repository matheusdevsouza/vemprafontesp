import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { sendOrderShippedEmail } from '@/lib/email';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;

    const order = await query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );

    if (!order || order.length === 0) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    // Buscar items do pedido
    const items = await query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId]
    );

    // Adicionar items ao pedido
    const orderWithItems = {
      ...order[0],
      items: items || []
    };

    return NextResponse.json({ order: orderWithItems });

  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const body = await request.json();
    const { status, payment_status, tracking_code, tracking_url, shipping_company, shipping_status, shipping_notes } = body;

    // Atualizar pedido
    const updateFields = [];
    const updateValues = [];

    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (payment_status !== undefined) {
      updateFields.push('payment_status = ?');
      updateValues.push(payment_status);
    }

    if (tracking_code !== undefined) {
      updateFields.push('tracking_code = ?');
      updateValues.push(tracking_code);
    }

    if (tracking_url !== undefined) {
      updateFields.push('tracking_url = ?');
      updateValues.push(tracking_url);
    }

    if (shipping_company !== undefined) {
      updateFields.push('shipping_company = ?');
      updateValues.push(shipping_company);
    }

    if (shipping_status !== undefined) {
      updateFields.push('shipping_status = ?');
      updateValues.push(shipping_status);
    }

    if (shipping_notes !== undefined) {
      updateFields.push('shipping_notes = ?');
      updateValues.push(shipping_notes);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo para atualizar' },
        { status: 400 }
      );
    }

    updateValues.push(orderId);

    await query(
      `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Buscar pedido atualizado
    const updatedOrder = await query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );

    // Buscar items do pedido
    const items = await query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId]
    );

    // Adicionar items ao pedido
    const orderWithItems = {
      ...updatedOrder[0],
      items: items || []
    };

    // Enviar email de envio se status for alterado para shipped
    if (status === "shipped" && updatedOrder && updatedOrder[0] && updatedOrder[0].customer_email) {
      try {
        const order = updatedOrder[0];
        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 7); // 7 dias úteis
        
        await sendOrderShippedEmail({
          email: order.customer_email,
          name: order.customer_name || "Cliente",
          orderNumber: order.order_number,
          trackingCode: order.tracking_code || "N/A",
          trackingUrl: order.tracking_url || "#",
          shippingCompany: order.shipping_company || "Transportadora",
          estimatedDelivery: estimatedDelivery.toLocaleDateString("pt-BR")
        });
        
        console.log(`Email de envio enviado para ${order.customer_email}`);
      } catch (emailError) {
        console.error("Erro ao enviar email de envio:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Pedido atualizado com sucesso',
      order: orderWithItems
    });

  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
