import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { decryptForAdmin } from '@/lib/encryption';
import { authenticateUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // VERIFICAÇÃO CRÍTICA DE SEGURANÇA - APENAS ADMINS AUTENTICADOS
    const user = await authenticateUser(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas administradores autorizados.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';

    // Buscar pedidos com paginação e filtros
    let whereClause = '';
    const params: any[] = [];
    
    if (search) {
      whereClause += ' WHERE (order_number LIKE ? OR customer_name LIKE ? OR customer_email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (status && status !== 'all') {
      if (whereClause) {
        whereClause += ' AND status = ?';
      } else {
        whereClause = ' WHERE status = ?';
      }
      params.push(status);
    }
    
    if (paymentStatus && paymentStatus !== 'all') {
      if (whereClause) {
        whereClause += ' AND payment_status = ?';
      } else {
        whereClause = ' WHERE payment_status = ?';
      }
      params.push(paymentStatus);
    }

    const offset = (page - 1) * limit;
    
    const orders = await query(`
      SELECT * FROM orders 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `, [...params, limit.toString(), offset.toString()]);

    // Contar total de pedidos para paginação
    const totalResult = await query(`
      SELECT COUNT(*) as total FROM orders 
      ${whereClause}
    `, params);
    
    const totalOrders = totalResult[0].total;

    // Buscar estatísticas de pedidos
    const [statsResult] = await query(`
      SELECT 
        COUNT(*) as totalOrders,
        SUM(total_amount) as totalRevenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingCount,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processingCount,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shippedCount,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as deliveredCount,
        COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as paymentPendingCount,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paymentPaidCount
      FROM orders
    `);

    // Função para descriptografar dados para o painel admin
    const decryptForAdminDisplay = (value: string | null, fieldName: string = 'campo') => {
      if (!value) return null;
      
      // Se não parece ser um valor criptografado, retorna como está
      if (!value.includes(':') || value.split(':').length !== 4) {
        return value;
      }
      
      try {
        const decrypted = decryptForAdmin({ [fieldName]: value });
        return decrypted[fieldName];
      } catch (error) {
        console.warn(`Erro ao descriptografar ${fieldName} para admin:`, error instanceof Error ? error.message : String(error));
        // Retorna um placeholder mais amigável para o admin
        return `[${fieldName.toUpperCase()} CRIPTOGRAFADO]`;
      }
    };

    // Buscar itens dos pedidos
    const orderIds = orders.map((order: any) => order.id);
    let orderItems: any[] = [];
    
    if (orderIds.length > 0) {
      const placeholders = orderIds.map(() => '?').join(',');
      const [items] = await query(`
        SELECT 
          order_id,
          product_name,
          quantity,
          unit_price,
          total_price,
          size,
          color
        FROM order_items 
        WHERE order_id IN (${placeholders})
        ORDER BY order_id, id
      `, orderIds);
      
      // Garantir que orderItems seja sempre um array
      orderItems = Array.isArray(items) ? items : [];
    }

    // Agrupar itens por pedido
    const itemsByOrder = orderItems.reduce((acc: any, item: any) => {
      if (!acc[item.order_id]) {
        acc[item.order_id] = [];
      }
      acc[item.order_id].push({
        id: item.order_id,
        product_name: item.product_name,
        quantity: parseInt(item.quantity),
        unit_price: parseFloat(item.unit_price),
        total_price: parseFloat(item.total_price),
        size: item.size,
        color: item.color
      });
      return acc;
    }, {});

    // Descriptografar dados para o painel admin (nome, email, telefone e endereço já estão em texto plano)
    const decryptedOrders = orders.map((order: any) => ({
      id: order.id,
      order_number: order.order_number,
      customer_name: order.customer_name || 'Cliente não identificado', // Nome já está em texto plano
      customer_email: order.customer_email, // Email já está em texto plano
      customer_phone: order.customer_phone, // Telefone já está em texto plano
      customer_address: order.shipping_address, // Endereço já está em texto plano
      total_amount: parseFloat(order.total_amount),
      status: order.status,
      payment_status: order.payment_status,
      created_at: order.created_at,
      updated_at: order.updated_at,
      tracking_code: order.tracking_code,
      tracking_url: order.tracking_url,
      shipping_company: order.shipping_company,
      shipping_status: order.shipping_status,
      subtotal: parseFloat(order.subtotal),
      shipping_cost: parseFloat(order.shipping_cost),
      items: itemsByOrder[order.id] || []
    }));

    const stats = {
      totalOrders: parseInt(statsResult.totalOrders) || 0,
      totalRevenue: parseFloat(statsResult.totalRevenue) || 0,
      statusBreakdown: {
        pending: parseInt(statsResult.pendingCount) || 0,
        processing: parseInt(statsResult.processingCount) || 0,
        shipped: parseInt(statsResult.shippedCount) || 0,
        delivered: parseInt(statsResult.deliveredCount) || 0
      },
      paymentBreakdown: {
        pending: parseInt(statsResult.paymentPendingCount) || 0,
        paid: parseInt(statsResult.paymentPaidCount) || 0
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        orders: decryptedOrders,
        stats: stats,
        pagination: {
          page,
          limit,
          total: totalOrders,
          pages: Math.ceil(totalOrders / limit)
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // VERIFICAÇÃO CRÍTICA DE SEGURANÇA - APENAS ADMINS AUTENTICADOS
    const user = await authenticateUser(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas administradores autorizados.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Método não implementado' },
      { status: 501 }
    );

  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}