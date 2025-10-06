import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';
import { authenticateUser } from '@/lib/auth';
import { encryptForDatabase } from '@/lib/transparent-encryption';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: { timeout: 5000 }
});

const preference = new Preference(client);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer, shipping_address, payment_method } = body;

    // PROTECÇÃO AVANÇADA: Verificar SQL Injection (padrões mais específicos)
    const sqlPatterns = [
      // Comandos SQL perigosos (mais específicos)
      /(\b(SELECT\s+\*|INSERT\s+INTO|UPDATE\s+SET|DELETE\s+FROM|DROP\s+TABLE|CREATE\s+TABLE|ALTER\s+TABLE|EXEC\s+\(|UNION\s+SELECT|SCRIPT\s+TYPE|FROM\s+information_schema|WHERE\s+1\s*=\s*1)\b)/gi,
      // Comentários SQL perigosos
      /(\-\-|\/\*|\*\/|#)/gi,
      // Padrões de bypass específicos
      /(OR\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?)/gi,
      /(AND\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?)/gi,
      /(OR\s+['"]?[a-zA-Z]+['"]?\s*=\s*['"]?[a-zA-Z]+['"]?)/gi,
      /(UNION\s+SELECT)/gi,
      // Padrões de bypass com parênteses
      /(\(['"]?\d+['"]?\s*OR\s*['"]?\d+['"]?\))/gi,
      // Comandos perigosos específicos
      /(INSERT\s+INTO|DROP\s+TABLE|DELETE\s+FROM|TRUNCATE\s+TABLE)/gi,
      // Tentativas de escape de aspas
      /(\\'|\\"|\\\\')/gi
    ];

    const checkSQLInjection = (value: string) => {
      return sqlPatterns.some(pattern => pattern.test(value));
    };

    // Verificar todos os campos do customer
    if (customer) {
      const customerFields = [customer.name, customer.email, customer.phone, customer.cpf];
      for (const field of customerFields) {
        if (field && checkSQLInjection(field)) {
          return NextResponse.json(
            { error: 'Acesso negado - tentativa de ataque detectada' },
            { status: 403 }
          );
        }
      }
    }

    // Verificar campos do endereço
    if (shipping_address) {
      const addressFields = [shipping_address.street, shipping_address.city, shipping_address.state, shipping_address.zipCode];
      for (const field of addressFields) {
        if (field && checkSQLInjection(field)) {
          return NextResponse.json(
            { error: 'Acesso negado - tentativa de ataque detectada' },
            { status: 403 }
          );
        }
      }
    }

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

    console.log('Customer email:', customer?.email);
    console.log('User ID que será usado:', user?.userId);

    // Validações básicas
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items do pedido são obrigatórios' },
        { status: 400 }
      );
    }

    if (!customer || !customer.email || !customer.name) {
      return NextResponse.json(
        { error: 'Dados do cliente são obrigatórios' },
        { status: 400 }
      );
    }

    if (!shipping_address) {
      return NextResponse.json(
        { error: 'Endereço de entrega é obrigatório' },
        { status: 400 }
      );
    }

    // Calcular total do pedido
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Dados dos items inválidos' },
          { status: 400 }
        );
      }

      // Buscar dados do produto
      const product = await database.query(
        'SELECT id, name, price FROM products WHERE id = ?',
        [item.product_id]
      );

      if (!product || product.length === 0) {
        return NextResponse.json(
          { error: `Produto com ID ${item.product_id} não encontrado` },
          { status: 400 }
        );
      }

      const productData = product[0];
      const price = parseFloat(productData.price);
      const quantity = parseInt(item.quantity);
      const itemTotal = price * quantity;
      total += itemTotal;

      orderItems.push({
        product_id: item.product_id,
        product_name: productData.name,
        quantity: quantity,
        price: price,
        total: itemTotal
      });
    }

    // Calcular subtotal e shipping cost
    const subtotal = total; // Subtotal é o valor dos produtos (sem frete)
    const shippingCost = 0.00; // Frete grátis por enquanto

    // Gerar número do pedido
    const orderNumber = `VPF-${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Dados do pedido (criptografia transparente será aplicada automaticamente)
    const orderData = {
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      customer_cpf: customer.cpf || null,
      shipping_address: JSON.stringify(shipping_address)
    };

    // Criar pedido no banco
    const orderResult = await database.query(
      `INSERT INTO orders (
        user_id, order_number, status, payment_status, payment_method,
        subtotal, shipping_cost, tax_amount, discount_amount, total_amount, currency,
        customer_name, customer_email, customer_phone, customer_cpf, shipping_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user?.userId || null,
        orderNumber,
        'pending',
        'pending',
        'Mercado Pago',
        subtotal,
        shippingCost || 0.00,
        0.00, // tax_amount
        0.00, // discount_amount
        total,
        'BRL', // currency
        orderData.customer_name,
        orderData.customer_email,
        orderData.customer_phone,
        orderData.customer_cpf,
        orderData.shipping_address
      ]
    );

    const orderId = orderResult.insertId;

    // Inserir items do pedido
    for (const item of orderItems) {
      await database.query(
        'INSERT INTO order_items (order_id, product_id, variant_id, product_name, product_sku, size, color, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          orderId, 
          item.product_id, 
          null, // variant_id
          item.product_name || 'Produto', 
          null, // product_sku
          null, // size
          null, // color
          item.quantity, 
          item.price, 
          item.total
        ]
      );
    }

    // Criar preferência do Mercado Pago
    try {
      const preferenceData = {
        items: orderItems.map(item => ({
          id: item.product_id.toString(),
          title: item.product_name,
          quantity: item.quantity,
          unit_price: item.price
        })),
        payer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone ? { number: customer.phone } : undefined
        },
        external_reference: orderNumber,
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failure`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/pending`
        },
        auto_return: 'approved'
      };

      const preferenceResult = await preference.create({ body: preferenceData });

      // Atualizar pedido com ID do Mercado Pago
      await database.query(
        'UPDATE orders SET external_reference = ? WHERE id = ?',
        [preferenceResult.id, orderId]
      );

      return NextResponse.json({
        success: true,
        orderId: orderId,
        orderNumber: orderNumber,
        preferenceId: preferenceResult.id,
        init_point: preferenceResult.init_point,
        sandbox_init_point: preferenceResult.sandbox_init_point,
        total: total
      });

    } catch (mpError) {
      console.error('Erro ao criar preferência do Mercado Pago:', mpError);
      
      // Se falhar o Mercado Pago, marcar pedido como cancelado
      await database.query(
        'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
        ['cancelled', 'failed', orderId]
      );

      return NextResponse.json(
        { error: 'Erro ao processar pagamento. Tente novamente.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}