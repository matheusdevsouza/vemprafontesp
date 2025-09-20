import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { sendPaymentConfirmationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('=== WEBHOOK MERCADO PAGO RECEBIDO ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Body completo:', JSON.stringify(body, null, 2));
    
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!mpResponse.ok) {
        throw new Error('Erro ao buscar pagamento no Mercado Pago');
      }
      
      const payment = await mpResponse.json();
      const orderNumber = payment.external_reference;
      
      if (!orderNumber) {
        throw new Error('External reference não encontrada');
      }
      
      let orderStatus = 'pending';
      let paymentStatus = 'pending';
      
      switch (payment.status) {
        case 'approved':
          orderStatus = 'paid';
          paymentStatus = 'paid';
          break;
        case 'pending':
          orderStatus = 'pending';
          paymentStatus = 'pending';
          break;
        case 'in_process':
          orderStatus = 'processing';
          paymentStatus = 'pending';
          break;
        case 'rejected':
          orderStatus = 'cancelled';
          paymentStatus = 'failed';
          break;
        case 'cancelled':
          orderStatus = 'cancelled';
          paymentStatus = 'failed';
          break;
        case 'refunded':
          orderStatus = 'refunded';
          paymentStatus = 'refunded';
          break;
        default:
          orderStatus = 'pending';
          paymentStatus = 'pending';
      }
      
      await query(`
        UPDATE orders 
        SET 
          status = ?,
          payment_status = ?,
          payment_id = ?,
          payment_method = ?,
          updated_at = NOW()
        WHERE order_number = ?
      `, [
        orderStatus, 
        paymentStatus, 
        payment.id ? payment.id.toString() : null, 
        payment.payment_method?.type || 'mercadopago',
        orderNumber
      ]);
      
      console.log('=== PEDIDO ATUALIZADO COM SUCESSO ===');
      console.log(`Pedido ${orderNumber} atualizado:`, {
        order_status: orderStatus,
        payment_status: paymentStatus,
        payment_id: paymentId,
        timestamp: new Date().toISOString()
      });

      // Enviar email de confirmação para usuários não logados
      if (paymentStatus === "paid" && orderStatus === "processing") {
        try {
          // Buscar dados do pedido para enviar email
          const orderData = await query(`
            SELECT o.*, oi.product_name, oi.quantity, oi.unit_price
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.order_number = ?
          `, [orderNumber]);
          
          if (orderData && orderData.length > 0 && orderData[0].customer_email) {
            const order = orderData[0];
            const items = orderData.map((item: any) => ({
              name: item.product_name,
              quantity: item.quantity,
              price: parseFloat(item.unit_price)
            }));
            
            await sendPaymentConfirmationEmail({
              email: order.customer_email,
              name: order.customer_name || "Cliente",
              orderNumber: order.order_number,
              totalAmount: parseFloat(order.total_amount),
              items: items
            });
            
            console.log(`Email de confirmação enviado para ${order.customer_email}`);
          }
        } catch (emailError) {
          console.error("Erro ao enviar email de confirmação:", emailError);
        }
      }
    } else {
      console.log('=== WEBHOOK IGNORADO ===');
      console.log('Tipo de notificação não é payment:', body.type);
    }
    
    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('=== ERRO NO WEBHOOK MERCADO PAGO ===');
    console.error('Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', timestamp: new Date().toISOString() }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook do Mercado Pago está ativo e funcionando',
    timestamp: new Date().toISOString(),
    endpoint: '/api/webhooks/mercadopago',
    status: 'online'
  });
}
