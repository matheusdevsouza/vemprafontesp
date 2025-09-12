import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('=== WEBHOOK DE TESTE RECEBIDO ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Body completo:', JSON.stringify(body, null, 2));
    
    // Simular atualização de pedido para teste
    if (body.type === 'test_payment') {
      const orderNumber = body.order_number || 'VPF-2025-TEST';
      
      // Atualizar pedido de teste
      const result = await query(`
        UPDATE orders 
        SET 
          status = 'paid',
          payment_status = 'paid',
          updated_at = NOW()
        WHERE order_number = ? OR order_number LIKE 'VPF-2025-%'
        LIMIT 1
      `, [orderNumber]);
      
      console.log('Pedido de teste atualizado:', {
        orderNumber,
        affectedRows: (result as any).affectedRows
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Webhook de teste executado com sucesso',
        orderNumber,
        affectedRows: (result as any).affectedRows,
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook de teste recebido',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erro no webhook de teste:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', timestamp: new Date().toISOString() }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook de teste está ativo',
    timestamp: new Date().toISOString(),
    endpoint: '/api/test-webhook'
  });
}
