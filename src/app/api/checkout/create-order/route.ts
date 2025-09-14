import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { authenticateUser } from '@/lib/auth';
import { encryptCheckoutData, encryptOrderData, encrypt } from '@/lib/encryption';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: { timeout: 5000 }
});

const preference = new Preference(client);

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATE ORDER DEBUG ===');
    console.log('Token do Mercado Pago:', process.env.MERCADOPAGO_ACCESS_TOKEN ? 'Configurado' : 'NÃO CONFIGURADO');
    
    // Tentar autenticar o usuário, mas permitir checkout anônimo se não estiver logado
    let user = null;
    try {
      user = await authenticateUser(request);
      console.log('Usuário autenticado:', user);
    } catch (error) {
      // Usuário não autenticado, continuar como anônimo
      console.log('Usuário não autenticado, criando pedido anônimo:', (error as Error).message);
    }

    const body = await request.json();
    const { items, customer, shipping_address, payment_method } = body;

    console.log('Customer email:', customer?.email);
    console.log('User ID que será usado:', user?.userId);
    console.log('Customer completo:', customer);
    console.log('Shipping address:', shipping_address);
    console.log('Items recebidos:', items);

    // Se não conseguiu autenticar, tentar encontrar usuário pelo email
    let userId = user?.userId;
    if (!userId && customer?.email) {
      try {
        const userByEmail = await query('SELECT id FROM users WHERE email = ?', [customer.email]);
        if (userByEmail && userByEmail.length > 0) {
          userId = userByEmail[0].id;
          console.log('Usuário encontrado por email, ID:', userId);
        }
      } catch (error) {
        console.log('Erro ao buscar usuário por email:', (error as Error).message);
      }
    }

    // Calcular totais
    const subtotal = Number(items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0));
    const shipping_cost = Number(shipping_address?.shipping_cost || 0);
    const tax_amount = 0; // Implementar cálculo de impostos se necessário
    const discount_amount = 0; // Implementar cupons se necessário
    const total_amount = subtotal + shipping_cost + tax_amount - discount_amount;

    // Gerar número do pedido
    const orderNumber = `VPF-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    console.log('Criando pedido com user_id:', userId);

    // Criptografar dados sensíveis antes de salvar
    const encryptedCustomerData = customer ? encryptCheckoutData({ customer }) : null;
    const encryptedShippingAddress = shipping_address ? encrypt(JSON.stringify(shipping_address)) : null;

    // Preparar parâmetros com validação explícita
    const params = [
      userId ? Number(userId) : null,
      orderNumber,
      'pending',
      'pending',
      payment_method || 'Mercado Pago',
      subtotal,
      shipping_cost,
      tax_amount,
      discount_amount,
      total_amount,
      'BRL',
      encryptedCustomerData?.customer?.name || customer?.name || null,
      encryptedCustomerData?.customer?.email || customer?.email || null,
      encryptedCustomerData?.customer?.phone || customer?.phone || null,
      encryptedShippingAddress
    ];

    console.log('Parâmetros da query:', params);

    // Criar pedido no banco
    const orderResult = await query(`
      INSERT INTO orders (
        user_id,
        order_number,
        status,
        payment_status,
        payment_method,
        subtotal,
        shipping_cost,
        tax_amount,
        discount_amount,
        total_amount,
        currency,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, params);

    const orderId = (orderResult as any).insertId;
    console.log('Pedido criado com ID:', orderId, 'e user_id:', userId);

    // Criar itens do pedido
    for (const item of items) {
      const itemParams = [
        orderId,
        item.product_id || null,
        null, // variant_id
        item.name || null,
        item.sku || null,
        item.size || null,
        item.color || null,
        item.quantity || 1,
        item.price || 0,
        (item.price || 0) * (item.quantity || 1)
      ];
      
      await query(`
        INSERT INTO order_items (
          order_id,
          product_id,
          variant_id,
          product_name,
          product_sku,
          size,
          color,
          quantity,
          unit_price,
          total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, itemParams);
    }

    console.log('Pedido criado com sucesso!');

    // Criar preferência do Mercado Pago
    console.log('Criando preferência do Mercado Pago...');
    
    const preferenceData = {
      items: items.map((item: any) => ({
        id: String(item.product_id || item.id),
        title: item.name,
        quantity: Number(item.quantity),
        unit_price: Number(item.price),
        currency_id: 'BRL',
        description: item.name
      })),
      payer: {
        name: customer?.name || 'Cliente',
        email: customer?.email || 'cliente@email.com',
        phone: {
          area_code: '11',
          number: customer?.phone || '999999999'
        }
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/meus-pedidos`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/meus-pedidos`
      },
      auto_return: 'approved',
      external_reference: orderNumber,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`
    };

    console.log('Dados da preferência:', JSON.stringify(preferenceData, null, 2));
    
    // Debug adicional das URLs
    console.log('🔍 [DEBUG] URLs sendo enviadas:');
    console.log('Success URL:', preferenceData.back_urls.success);
    console.log('Failure URL:', preferenceData.back_urls.failure);
    console.log('Pending URL:', preferenceData.back_urls.pending);
    console.log('Notification URL:', preferenceData.notification_url);
    console.log('Base URL (NEXT_PUBLIC_APP_URL):', process.env.NEXT_PUBLIC_APP_URL);

    try {
      const preferenceResult = await preference.create({ body: preferenceData });
      console.log('Preferência criada com sucesso:', preferenceResult);

      return NextResponse.json({
        success: true,
        orderId,
        orderNumber,
        total: total_amount,
        init_point: preferenceResult.init_point,
        sandbox_init_point: preferenceResult.sandbox_init_point
      });
    } catch (mpError) {
      console.error('Erro ao criar preferência do Mercado Pago:', mpError);
      
      // Retornar sucesso mesmo se o Mercado Pago falhar, mas sem init_point
      return NextResponse.json({
        success: true,
        orderId,
        orderNumber,
        total: total_amount,
        error: 'Mercado Pago temporariamente indisponível'
      });
    }

  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
