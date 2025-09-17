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
    const body = await request.json();
    const { items, customer, shipping_address, payment_method } = body;

    // PROTECÇÃO AVANÇADA: Verificar SQL Injection
    const sqlPatterns = [
      // Comandos SQL
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT|FROM|WHERE|HAVING|GROUP\s+BY|ORDER\s+BY)\b)/gi,
      // Caracteres perigosos
      /[;'\"\\]/gi,
      // Comentários SQL
      /(\-\-|\/\*|\*\/|#)/gi,
      // Padrões de bypass
      /(OR\s+['"]?\d*['"]?\s*=\s*['"]?\d*['"]?)/gi,
      /(AND\s+['"]?\d*['"]?\s*=\s*['"]?\d*['"]?)/gi,
      /(OR\s+['"]?[a-zA-Z]*['"]?\s*=\s*['"]?[a-zA-Z]*['"]?)/gi,
      /(UNION\s+SELECT)/gi,
      // Padrões específicos detectados
      /(OR\s+['"]?1['"]?\s*=\s*['"]?1['"]?)/gi,
      /(OR\s+['"]?a['"]?\s*=\s*['"]?a['"]?)/gi,
      /(OR\s+['"]?x['"]?\s*=\s*['"]?x['"]?)/gi,
      // Parênteses e operadores
      /(\(['"]?\d*['"]?\s*OR\s*['"]?\d*['"]?\))/gi,
      // Comandos INSERT/DROP
      /(INSERT\s+INTO|DROP\s+TABLE|DELETE\s+FROM)/gi
    ];

    const checkSQLInjection = (value: string) => {
      return sqlPatterns.some(pattern => pattern.test(value));
    };

    // Verificar todos os campos do customer
    if (customer) {
      const customerFields = [customer.name, customer.email, customer.phone];
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
      const product = await query(
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

    // Gerar número do pedido
    const orderNumber = `VEM${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Criptografar dados sensíveis do cliente
    const encryptedCustomerName = encrypt(customer.name);
    const encryptedCustomerEmail = encrypt(customer.email);
    const encryptedCustomerPhone = customer.phone ? encrypt(customer.phone) : null;
    const encryptedShippingAddress = encrypt(JSON.stringify(shipping_address));

    // Criar pedido no banco
    const orderResult = await query(
      `INSERT INTO orders (
        order_number, user_id, status, payment_status, 
        customer_name, customer_email, customer_phone, shipping_address, 
        total_amount, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        orderNumber,
        user?.userId || null,
        'pending',
        'pending',
        encryptedCustomerName,
        encryptedCustomerEmail,
        encryptedCustomerPhone,
        encryptedShippingAddress,
        total
      ]
    );

    const orderId = orderResult.insertId;

    // Inserir items do pedido
    for (const item of orderItems) {
      await query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, product_name) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price, item.total, item.product_name || 'Produto']
      );
    }

    // Criar preferência do Mercado Pago
    try {
      const preferenceData = {
        items: orderItems.map(item => ({
          id: item.product_id.toString(),
          title: item.product_name,
          quantity: parseInt(item.quantity),
          unit_price: parseFloat(item.price)
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
      await query(
        'UPDATE orders SET mercado_pago_preference_id = ? WHERE id = ?',
        [preferenceResult.id, orderId]
      );

      return NextResponse.json({
        success: true,
        orderId: orderId,
        orderNumber: orderNumber,
        preferenceId: preferenceResult.id,
        initPoint: preferenceResult.init_point,
        total: total
      });

    } catch (mpError) {
      console.error('Erro ao criar preferência do Mercado Pago:', mpError);
      
      // Se falhar o Mercado Pago, marcar pedido como erro
      await query(
        'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
        ['error', 'error', orderId]
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