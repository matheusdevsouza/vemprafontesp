import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const dateFilter = searchParams.get('dateFilter') || '';

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (search) {
      where.OR = [
        { order_number: { contains: search, mode: 'insensitive' } },
        { customer_name: { contains: search, mode: 'insensitive' } },
        { customer_email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      where.payment_status = paymentStatus;
    }

    // Filtros de data
    if (dateFilter) {
      const now = new Date();
      switch (dateFilter) {
        case 'today':
          where.createdAt = {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
          };
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          where.createdAt = { gte: weekAgo };
          break;
        case 'month':
          where.createdAt = {
            gte: new Date(now.getFullYear(), now.getMonth(), 1)
          };
          break;
      }
    }

    // Buscar pedidos com relacionamentos
    const orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        order_number: true,
        customer_name: true,
        customer_email: true,
        total_amount: true,
        status: true,
        payment_status: true,
        createdAt: true,
        tracking_code: true,
        tracking_url: true,
        shipping_company: true,
        shipping_status: true,
        items: {
          select: {
            id: true,
            product_name: true,
            quantity: true,
            unit_price: true,
            total_price: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    // Contar total de pedidos
    const total = await prisma.order.count({ where });

    // Calcular estatísticas
    const stats = await prisma.order.groupBy({
      by: ['status'],
      where: dateFilter === 'month' ? {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      } : {},
      _count: { status: true }
    });

    const totalRevenue = await prisma.order.aggregate({
      where: {
        payment_status: 'paid',
        ...(dateFilter === 'month' && {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        })
      },
      _sum: { total_amount: true }
    });

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: {
          totalOrders: total,
          totalRevenue: totalRevenue._sum.total_amount || 0,
          statusBreakdown: stats.reduce((acc: any, stat: any) => {
            if (stat.status) {
              acc[stat.status] = stat._count.status;
            }
            return acc;
          }, {} as any)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      userId,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      items,
      subtotal,
      shipping_cost,
      tax_amount,
      discount_amount,
      total_amount,
      payment_method,
      notes
    } = body;

    // Gerar número de pedido único
    const orderNumber = `VPF-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // Criar pedido
    const order = await prisma.order.create({
      data: {
        userId: userId ? parseInt(userId) : null,
        order_number: orderNumber,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        subtotal: parseFloat(subtotal),
        shipping_cost: shipping_cost ? parseFloat(shipping_cost) : 0,
        tax_amount: tax_amount ? parseFloat(tax_amount) : 0,
        discount_amount: discount_amount ? parseFloat(discount_amount) : 0,
        total_amount: parseFloat(total_amount),
        payment_method,
        notes,
        status: 'pending',
        payment_status: 'pending'
      }
    });

    // Criar itens do pedido
    if (items && items.length > 0) {
      const orderItems = items.map((item: any) => ({
        orderId: order.id,
        productId: parseInt(item.productId),
        variant_id: item.variant_id ? parseInt(item.variant_id) : null,
        product_name: item.product_name,
        product_sku: item.product_sku,
        size: item.size,
        color: item.color,
        quantity: parseInt(item.quantity),
        unit_price: parseFloat(item.unit_price),
        total_price: parseFloat(item.total_price)
      }));

      await prisma.orderItem.createMany({
        data: orderItems
      });
    }

    // Buscar pedido completo com itens
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: completeOrder,
      message: 'Pedido criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}



