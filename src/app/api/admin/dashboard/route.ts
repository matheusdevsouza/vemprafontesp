import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { authenticateUser } from '@/lib/auth';
// Removida importação de descriptografia - dados agora em texto simples

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
    const period = searchParams.get('period') || 'month';

    // Calcular datas baseadas no período
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Buscar todas as estatísticas em paralelo
    const [
      productsStats,
      ordersStats,
      usersStats,
      revenueStats,
      recentOrders,
      recentProducts
    ] = await Promise.all([
      // Estatísticas de produtos
      query(`
        SELECT 
          COUNT(*) as total,
          SUM(stock_quantity) as totalStock,
          AVG(price) as averagePrice,
          COUNT(CASE WHEN stock_quantity <= min_stock_level THEN 1 END) as lowStockCount
        FROM products
      `),
      
      // Estatísticas de pedidos
      query(`
        SELECT 
          COUNT(*) as total,
          SUM(total_amount) as totalRevenue,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing,
          COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped,
          COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered
        FROM orders
      `),
      
      // Estatísticas de usuários
      query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN created_at >= ? THEN 1 END) as newThisPeriod
        FROM users
      `, [startDate]),
      
      // Estatísticas de receita
      query(`
        SELECT 
          SUM(CASE WHEN created_at >= ? THEN total_amount ELSE 0 END) as current,
          SUM(CASE WHEN created_at < ? AND created_at >= ? THEN total_amount ELSE 0 END) as previous
        FROM orders
      `, [startDate, startDate, new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))]),
      
      // Pedidos recentes
      query(`
        SELECT 
          o.id,
          o.order_number,
          o.customer_name,
          o.total_amount,
          o.status,
          o.created_at
        FROM orders o
        ORDER BY o.created_at DESC
        LIMIT 5
      `),
      
      // Produtos recentes
      query(`
        SELECT 
          p.id,
          p.name,
          p.price,
          p.stock_quantity,
          p.created_at,
          b.name as brand,
          CASE WHEN p.stock_quantity <= p.min_stock_level THEN 'low_stock' ELSE 'active' END as status
        FROM products p
        LEFT JOIN brands b ON p.brand_id = b.id
        ORDER BY p.created_at DESC
        LIMIT 5
      `)
    ]);

    // Processar estatísticas de receita
    const currentRevenue = parseFloat(revenueStats[0].current) || 0;
    const previousRevenue = parseFloat(revenueStats[0].previous) || 0;
    const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Processar dados dos pedidos recentes (dados já estão em texto simples)
    const processedRecentOrders = recentOrders.map((order: any) => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name || 'Cliente não identificado',
      total: parseFloat(order.total_amount),
      status: order.status,
      createdAt: order.created_at
    }));

    // Processar produtos recentes
    const processedRecentProducts = recentProducts.map((product: any) => ({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price) || 0,
      brand: product.brand,
      stock: parseInt(product.stock_quantity),
      status: product.status,
      createdAt: product.created_at
    }));

    const dashboardData = {
      products: {
        total: parseInt(productsStats[0].total) || 0,
        totalStock: parseInt(productsStats[0].totalStock) || 0,
        averagePrice: parseFloat(productsStats[0].averagePrice) || 0,
        lowStockCount: parseInt(productsStats[0].lowStockCount) || 0
      },
      orders: {
        total: parseInt(ordersStats[0].total) || 0,
        totalRevenue: parseFloat(ordersStats[0].totalRevenue) || 0,
        pending: parseInt(ordersStats[0].pending) || 0,
        processing: parseInt(ordersStats[0].processing) || 0,
        shipped: parseInt(ordersStats[0].shipped) || 0,
        delivered: parseInt(ordersStats[0].delivered) || 0
      },
      users: {
        total: parseInt(usersStats[0].total) || 0,
        newThisPeriod: parseInt(usersStats[0].newThisPeriod) || 0
      },
      revenue: {
        current: currentRevenue,
        previous: previousRevenue,
        change: revenueChange,
        changeType: revenueChange >= 0 ? 'increase' : 'decrease'
      },
      recentActivity: {
        orders: processedRecentOrders,
        products: processedRecentProducts
      }
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}