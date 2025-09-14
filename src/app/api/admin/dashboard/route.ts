import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateUser, isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Forçar nova instância do Prisma a cada requisição
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    // VERIFICAÇÃO CRÍTICA DE SEGURANÇA - APENAS ADMINS AUTENTICADOS
    const user = await authenticateUser(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas administradores autorizados.' },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';

    // Buscar dados reais do banco
    const productCount = await prisma.product.count({
      where: { is_active: true }
    });
    
    const orderCount = await prisma.order.count();
    
    const userCount = await prisma.user.count();

    // Calcular estatísticas de produtos
    const productStats = await prisma.product.aggregate({
      where: { is_active: true },
      _sum: { stock_quantity: true },
      _avg: { price: true }
    });
    
    const totalStock = productStats._sum.stock_quantity || 0;
    const averagePrice = productStats._avg.price || 0;
    
    const lowStockCount = await prisma.product.count({
      where: {
        is_active: true,
        stock_quantity: { lte: 10 }
      }
    });

    // Calcular estatísticas de pedidos
    const orderStats = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    
    let pendingOrders = 0;
    let processingOrders = 0;
    let shippedOrders = 0;
    let deliveredOrders = 0;
    
    orderStats.forEach((stat: any) => {
      switch(stat.status) {
        case 'pending':
          pendingOrders = stat._count.id;
          break;
        case 'processing':
          processingOrders = stat._count.id;
          break;
        case 'shipped':
          shippedOrders = stat._count.id;
          break;
        case 'delivered':
          deliveredOrders = stat._count.id;
          break;
      }
    });

    // Calcular receita total
    const revenueResult = await prisma.order.aggregate({
      where: { 
        status: { in: ['delivered', 'shipped', 'processing'] }
      },
      _sum: { total_amount: true }
    });
    
    const totalRevenue = revenueResult._sum.total_amount || 0;

    // Buscar atividades recentes
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        order_number: true,
        customer_name: true,
        customer_email: true,
        total_amount: true,
        status: true,
        createdAt: true
      }
    });

    const recentProducts = await prisma.product.findMany({
      take: 5,
      where: { is_active: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        price: true,
        brands: { select: { name: true } }
      }
    });

    const dashboardData = {
      period,
      products: {
        total: productCount,
        totalStock,
        averagePrice: averagePrice && typeof averagePrice === 'number' ? Math.round(averagePrice * 100) / 100 : 0,
        lowStockCount
      },
      orders: {
        total: orderCount,
        totalRevenue: totalRevenue && typeof totalRevenue === 'number' ? Math.round(totalRevenue * 100) / 100 : 0,
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders
      },
      users: {
        total: userCount,
        newThisPeriod: 0
      },
      revenue: {
        current: totalRevenue && typeof totalRevenue === 'number' ? Math.round(totalRevenue * 100) / 100 : 0,
        previous: 0,
        change: 0,
        changeType: 'increase'
      },
      recentActivity: {
        orders: recentOrders.map((order: any) => ({
          id: order.id,
          orderNumber: order.order_number,
          customerName: order.customer_name || 'Cliente',
          customerEmail: order.customer_email || '',
          total: order.total_amount,
          status: order.status,
          createdAt: order.createdAt
        })),
        products: recentProducts.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          brand: product.brands?.name || 'Sem marca'
        }))
      }
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('❌ ERRO na API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  } finally {
    // Sempre desconectar o Prisma
    await prisma.$disconnect();
  }
}
