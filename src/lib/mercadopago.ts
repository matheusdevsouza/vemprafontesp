// Utilitário para integração com Mercado Pago

export interface CheckoutData {
  items: Array<{
    product_id: number;
    name: string;
    slug: string;
    image: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
  }>;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  shipping_address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipcode: string;
    shipping_cost?: number;
  };
  payment_method?: string;
}

export async function createOrderAndRedirect(checkoutData: CheckoutData) {
  try {
    // 1. Criar pedido no nosso sistema
    const response = await fetch('/api/checkout/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    });

    if (!response.ok) {
      throw new Error('Erro ao criar pedido');
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Erro ao criar pedido');
    }

    // 2. Redirecionar para Mercado Pago
    const initPoint = process.env.NODE_ENV === 'production' 
      ? result.init_point 
      : result.sandbox_init_point;

    if (initPoint) {
      window.location.href = initPoint;
    } else {
      throw new Error('URL de pagamento não disponível');
    }

    return result;
  } catch (error) {
    console.error('Erro no checkout:', error);
    throw error;
  }
}

// Função para verificar status do pedido
export async function checkOrderStatus(orderId: number) {
  try {
    const response = await fetch(`/api/orders/${orderId}/status`);
    
    if (!response.ok) {
      throw new Error('Erro ao verificar status do pedido');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    throw error;
  }
}

// Função para buscar pedido específico
export async function getOrderById(orderId: number) {
  try {
    const response = await fetch(`/api/orders/${orderId}`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar pedido');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    throw error;
  }
} 