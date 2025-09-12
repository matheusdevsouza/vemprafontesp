import { NextRequest, NextResponse } from 'next/server';
import { getOrderByTrackingCode, getOrderItems } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingCode = searchParams.get('code');

    if (!trackingCode) {
      return NextResponse.json({
        success: false,
        error: 'Código de rastreio é obrigatório'
      }, { status: 400 });
    }

    // Buscar pedido pelo código de rastreio
    const order = await getOrderByTrackingCode(trackingCode);
    
    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Pedido não encontrado com este código de rastreio'
      }, { status: 404 });
    }

    // Buscar itens do pedido
    const orderItems = await getOrderItems(order.id);

    // Preparar dados de rastreio
    const trackingData = {
      orderNumber: order.order_number,
      status: order.status,
      trackingCode: order.tracking_code,
      lastUpdate: order.updated_at,
      location: getLocationFromStatus(order.status),
      description: getDescriptionFromStatus(order.status),
      customerName: order.customer_name,
      orderDate: order.created_at,
      products: orderItems.map((item: any) => ({
        name: item.name,
        quantity: item.quantity
      }))
    };

    return NextResponse.json({
      success: true,
      data: trackingData
    });

  } catch (error) {
    console.error('Erro ao buscar rastreio:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// Função para determinar localização baseada no status
function getLocationFromStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    'pending': 'Aguardando processamento',
    'processing': 'Em processamento',
    'shipped': 'Centro de Distribuição - São Paulo/SP',
    'in_transit': 'Em trânsito para entrega',
    'out_for_delivery': 'Saiu para entrega',
    'delivered': 'Entregue',
    'cancelled': 'Pedido cancelado'
  };
  
  return statusMap[status] || 'Status não disponível';
}

// Função para gerar descrição baseada no status
function getDescriptionFromStatus(status: string): string {
  const descriptionMap: { [key: string]: string } = {
    'pending': 'Pedido recebido e aguardando processamento',
    'processing': 'Pedido sendo preparado para envio',
    'shipped': 'Pedido enviado e em trânsito',
    'in_transit': 'Pedido em trânsito para entrega',
    'out_for_delivery': 'Pedido saiu para entrega',
    'delivered': 'Pedido entregue com sucesso',
    'cancelled': 'Pedido foi cancelado'
  };
  
  return descriptionMap[status] || 'Status não disponível';
}

