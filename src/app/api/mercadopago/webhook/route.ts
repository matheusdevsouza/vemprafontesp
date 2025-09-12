import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { query } from '@/lib/database'

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: { timeout: 5000 }
})

const payment = new Payment(client)

export async function POST(request: NextRequest) {
  try {
    console.log('=== WEBHOOK MERCADO PAGO RECEBIDO ===')
    const body = await request.json()
    console.log('Body recebido:', JSON.stringify(body, null, 2))

    // Verificar se é uma notificação de pagamento
    if (body.type === 'payment') {
      const paymentId = body.data.id
      console.log('Payment ID:', paymentId)

      // Buscar informações do pagamento
      const paymentResponse = await payment.get({ id: paymentId })
      console.log('Payment response:', paymentResponse)

      if (paymentResponse) {
        const paymentData = paymentResponse

        // Extrair informações importantes
        const {
          id,
          status,
          status_detail,
          external_reference,
          transaction_amount,
          payment_method,
          payer,
          date_created,
          date_approved
        } = paymentData

        console.log('Dados do pagamento:', {
          id,
          status,
          status_detail,
          external_reference,
          transaction_amount,
          payment_method: payment_method?.type,
          payer_email: payer?.email
        })

        // Atualizar status do pedido no banco de dados
        if (external_reference) {
          let orderStatus = 'pending'
          let paymentStatus = 'pending'

          switch (status) {
            case 'approved':
              orderStatus = 'paid'
              paymentStatus = 'paid'
              console.log(`✅ Pagamento ${id} APROVADO para pedido ${external_reference}`)
              break

            case 'pending':
              orderStatus = 'pending'
              paymentStatus = 'pending'
              console.log(`⏳ Pagamento ${id} PENDENTE para pedido ${external_reference}`)
              break

            case 'in_process':
              orderStatus = 'processing'
              paymentStatus = 'pending'
              console.log(`�� Pagamento ${id} EM ANÁLISE para pedido ${external_reference}`)
              break

            case 'rejected':
              orderStatus = 'cancelled'
              paymentStatus = 'failed'
              console.log(`❌ Pagamento ${id} REJEITADO para pedido ${external_reference}`)
              break

            case 'cancelled':
              orderStatus = 'cancelled'
              paymentStatus = 'cancelled'
              console.log(`🚫 Pagamento ${id} CANCELADO para pedido ${external_reference}`)
              break

            case 'refunded':
              orderStatus = 'refunded'
              paymentStatus = 'refunded'
              console.log(`↩️ Pagamento ${id} ESTORNADO para pedido ${external_reference}`)
              break

            default:
              console.log(`❓ Status desconhecido: ${status} para pagamento ${id}`)
              orderStatus = 'unknown'
              paymentStatus = 'unknown'
          }

          // Atualizar pedido no banco de dados
          try {
            const updateResult = await query(`
              UPDATE orders 
              SET 
                status = ?,
                payment_status = ?,
                updated_at = NOW()
              WHERE order_number = ?
            `, [orderStatus, paymentStatus, external_reference])

            console.log('Pedido atualizado no banco:', {
              orderNumber: external_reference,
              orderStatus,
              paymentStatus,
              affectedRows: (updateResult as any).affectedRows
            })

            // Se o pagamento foi aprovado, enviar email de confirmação
            if (status === 'approved') {
              console.log('Enviando email de confirmação para pedido:', external_reference)
              // TODO: Implementar envio de email de confirmação
            }

          } catch (dbError) {
            console.error('Erro ao atualizar pedido no banco:', dbError)
          }
        } else {
          console.log('❌ External reference não encontrado no pagamento')
        }
      } else {
        console.log('❌ Payment response vazio')
      }
    } else {
      console.log('❌ Tipo de notificação não é payment:', body.type)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ Erro no webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET para verificação do webhook
export async function GET() {
  return NextResponse.json({
    message: 'Webhook do Mercado Pago está funcionando',
    timestamp: new Date().toISOString()
  })
}
