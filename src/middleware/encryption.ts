import { NextRequest, NextResponse } from 'next/server';
import { decryptPersonalData, encryptPersonalData, decryptOrderData, encryptOrderData } from '@/lib/encryption';

/**
 * Middleware para criptografar dados sensíveis antes de salvar no banco
 */
export function encryptSensitiveData(data: any, type: 'user' | 'order' = 'user'): any {
  try {
    if (!data || typeof data !== 'object') {
      return data;
    }

    switch (type) {
      case 'user':
        return encryptPersonalData(data);
      case 'order':
        return encryptOrderData(data);
      default:
        return data;
    }
  } catch (error) {
    console.error('Error encrypting sensitive data:', error);
    throw new Error('Failed to encrypt sensitive data');
  }
}

/**
 * Middleware para descriptografar dados sensíveis ao recuperar do banco
 */
export function decryptSensitiveData(data: any, type: 'user' | 'order' = 'user'): any {
  try {
    if (!data || typeof data !== 'object') {
      return data;
    }

    switch (type) {
      case 'user':
        return decryptPersonalData(data);
      case 'order':
        return decryptOrderData(data);
      default:
        return data;
    }
  } catch (error) {
    console.error('Error decrypting sensitive data:', error);
    // Retorna dados não descriptografados para não quebrar a aplicação
    return data;
  }
}

/**
 * Middleware para processar arrays de dados sensíveis
 */
export function processSensitiveDataArray(dataArray: any[], type: 'user' | 'order' = 'user'): any[] {
  try {
    if (!Array.isArray(dataArray)) {
      return dataArray;
    }

    return dataArray.map(item => decryptSensitiveData(item, type));
  } catch (error) {
    console.error('Error processing sensitive data array:', error);
    return dataArray;
  }
}

/**
 * Valida se os dados contêm campos sensíveis
 */
export function hasSensitiveFields(data: any): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const sensitiveFields = [
    'name', 'email', 'phone', 'cpf', 'address', 'display_name',
    'birth_date', 'gender', 'zip_code', 'city', 'state', 'country',
    'customer_name', 'customer_email', 'customer_phone', 'customer_cpf',
    'billing_address', 'shipping_address', 'payment_method'
  ];

  return sensitiveFields.some(field => data.hasOwnProperty(field));
}

/**
 * Remove dados sensíveis de logs (para LGPD compliance)
 */
export function sanitizeForLogs(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = [
    'name', 'email', 'phone', 'cpf', 'address', 'display_name',
    'birth_date', 'gender', 'zip_code', 'city', 'state', 'country',
    'customer_name', 'customer_email', 'customer_phone', 'customer_cpf',
    'billing_address', 'shipping_address', 'payment_method', 'password'
  ];

  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      if (typeof sanitized[field] === 'string') {
        // Mantém apenas os primeiros 2 e últimos 2 caracteres
        const value = sanitized[field];
        if (value.length > 4) {
          sanitized[field] = `${value.substring(0, 2)}***${value.substring(value.length - 2)}`;
        } else {
          sanitized[field] = '***';
        }
      } else {
        sanitized[field] = '[REDACTED]';
      }
    }
  }

  return sanitized;
}

/**
 * Middleware para APIs que lidam com dados de usuários
 */
export function withUserEncryption(handler: Function) {
  return async (req: NextRequest, context: any) => {
    try {
      // Processar dados de entrada (criptografar antes de salvar)
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        const body = await req.json();
        
        if (hasSensitiveFields(body)) {
          // Log sanitizado para compliance LGPD
          console.log('Processing user data:', sanitizeForLogs(body));
          
          // Criptografar dados sensíveis
          const encryptedBody = encryptSensitiveData(body, 'user');
          
          // Criar nova requisição com dados criptografados
          const newReq = new NextRequest(req.url, {
            method: req.method,
            headers: req.headers,
            body: JSON.stringify(encryptedBody)
          });
          
          return await handler(newReq, context);
        }
      }
      
      // Para GET, processar resposta (descriptografar ao retornar)
      const response = await handler(req, context);
      
      if (response && response.status === 200) {
        const data = await response.json();
        
        if (data && typeof data === 'object') {
          if (Array.isArray(data)) {
            const decryptedData = processSensitiveDataArray(data, 'user');
            return NextResponse.json(decryptedData, { status: 200 });
          } else {
            const decryptedData = decryptSensitiveData(data, 'user');
            return NextResponse.json(decryptedData, { status: 200 });
          }
        }
      }
      
      return response;
    } catch (error) {
      console.error('Encryption middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware para APIs que lidam com dados de pedidos
 */
export function withOrderEncryption(handler: Function) {
  return async (req: NextRequest, context: any) => {
    try {
      // Processar dados de entrada (criptografar antes de salvar)
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        const body = await req.json();
        
        if (hasSensitiveFields(body)) {
          // Log sanitizado para compliance LGPD
          console.log('Processing order data:', sanitizeForLogs(body));
          
          // Criptografar dados sensíveis
          const encryptedBody = encryptSensitiveData(body, 'order');
          
          // Criar nova requisição com dados criptografados
          const newReq = new NextRequest(req.url, {
            method: req.method,
            headers: req.headers,
            body: JSON.stringify(encryptedBody)
          });
          
          return await handler(newReq, context);
        }
      }
      
      // Para GET, processar resposta (descriptografar ao retornar)
      const response = await handler(req, context);
      
      if (response && response.status === 200) {
        const data = await response.json();
        
        if (data && typeof data === 'object') {
          if (Array.isArray(data)) {
            const decryptedData = processSensitiveDataArray(data, 'order');
            return NextResponse.json(decryptedData, { status: 200 });
          } else {
            const decryptedData = decryptSensitiveData(data, 'order');
            return NextResponse.json(decryptedData, { status: 200 });
          }
        }
      }
      
      return response;
    } catch (error) {
      console.error('Encryption middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

import { decryptPersonalData, encryptPersonalData, decryptOrderData, encryptOrderData } from '@/lib/encryption';

/**
 * Middleware para criptografar dados sensíveis antes de salvar no banco
 */
export function encryptSensitiveData(data: any, type: 'user' | 'order' = 'user'): any {
  try {
    if (!data || typeof data !== 'object') {
      return data;
    }

    switch (type) {
      case 'user':
        return encryptPersonalData(data);
      case 'order':
        return encryptOrderData(data);
      default:
        return data;
    }
  } catch (error) {
    console.error('Error encrypting sensitive data:', error);
    throw new Error('Failed to encrypt sensitive data');
  }
}

/**
 * Middleware para descriptografar dados sensíveis ao recuperar do banco
 */
export function decryptSensitiveData(data: any, type: 'user' | 'order' = 'user'): any {
  try {
    if (!data || typeof data !== 'object') {
      return data;
    }

    switch (type) {
      case 'user':
        return decryptPersonalData(data);
      case 'order':
        return decryptOrderData(data);
      default:
        return data;
    }
  } catch (error) {
    console.error('Error decrypting sensitive data:', error);
    // Retorna dados não descriptografados para não quebrar a aplicação
    return data;
  }
}

/**
 * Middleware para processar arrays de dados sensíveis
 */
export function processSensitiveDataArray(dataArray: any[], type: 'user' | 'order' = 'user'): any[] {
  try {
    if (!Array.isArray(dataArray)) {
      return dataArray;
    }

    return dataArray.map(item => decryptSensitiveData(item, type));
  } catch (error) {
    console.error('Error processing sensitive data array:', error);
    return dataArray;
  }
}

/**
 * Valida se os dados contêm campos sensíveis
 */
export function hasSensitiveFields(data: any): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const sensitiveFields = [
    'name', 'email', 'phone', 'cpf', 'address', 'display_name',
    'birth_date', 'gender', 'zip_code', 'city', 'state', 'country',
    'customer_name', 'customer_email', 'customer_phone', 'customer_cpf',
    'billing_address', 'shipping_address', 'payment_method'
  ];

  return sensitiveFields.some(field => data.hasOwnProperty(field));
}

/**
 * Remove dados sensíveis de logs (para LGPD compliance)
 */
export function sanitizeForLogs(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = [
    'name', 'email', 'phone', 'cpf', 'address', 'display_name',
    'birth_date', 'gender', 'zip_code', 'city', 'state', 'country',
    'customer_name', 'customer_email', 'customer_phone', 'customer_cpf',
    'billing_address', 'shipping_address', 'payment_method', 'password'
  ];

  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      if (typeof sanitized[field] === 'string') {
        // Mantém apenas os primeiros 2 e últimos 2 caracteres
        const value = sanitized[field];
        if (value.length > 4) {
          sanitized[field] = `${value.substring(0, 2)}***${value.substring(value.length - 2)}`;
        } else {
          sanitized[field] = '***';
        }
      } else {
        sanitized[field] = '[REDACTED]';
      }
    }
  }

  return sanitized;
}

/**
 * Middleware para APIs que lidam com dados de usuários
 */
export function withUserEncryption(handler: Function) {
  return async (req: NextRequest, context: any) => {
    try {
      // Processar dados de entrada (criptografar antes de salvar)
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        const body = await req.json();
        
        if (hasSensitiveFields(body)) {
          // Log sanitizado para compliance LGPD
          console.log('Processing user data:', sanitizeForLogs(body));
          
          // Criptografar dados sensíveis
          const encryptedBody = encryptSensitiveData(body, 'user');
          
          // Criar nova requisição com dados criptografados
          const newReq = new NextRequest(req.url, {
            method: req.method,
            headers: req.headers,
            body: JSON.stringify(encryptedBody)
          });
          
          return await handler(newReq, context);
        }
      }
      
      // Para GET, processar resposta (descriptografar ao retornar)
      const response = await handler(req, context);
      
      if (response && response.status === 200) {
        const data = await response.json();
        
        if (data && typeof data === 'object') {
          if (Array.isArray(data)) {
            const decryptedData = processSensitiveDataArray(data, 'user');
            return NextResponse.json(decryptedData, { status: 200 });
          } else {
            const decryptedData = decryptSensitiveData(data, 'user');
            return NextResponse.json(decryptedData, { status: 200 });
          }
        }
      }
      
      return response;
    } catch (error) {
      console.error('Encryption middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware para APIs que lidam com dados de pedidos
 */
export function withOrderEncryption(handler: Function) {
  return async (req: NextRequest, context: any) => {
    try {
      // Processar dados de entrada (criptografar antes de salvar)
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        const body = await req.json();
        
        if (hasSensitiveFields(body)) {
          // Log sanitizado para compliance LGPD
          console.log('Processing order data:', sanitizeForLogs(body));
          
          // Criptografar dados sensíveis
          const encryptedBody = encryptSensitiveData(body, 'order');
          
          // Criar nova requisição com dados criptografados
          const newReq = new NextRequest(req.url, {
            method: req.method,
            headers: req.headers,
            body: JSON.stringify(encryptedBody)
          });
          
          return await handler(newReq, context);
        }
      }
      
      // Para GET, processar resposta (descriptografar ao retornar)
      const response = await handler(req, context);
      
      if (response && response.status === 200) {
        const data = await response.json();
        
        if (data && typeof data === 'object') {
          if (Array.isArray(data)) {
            const decryptedData = processSensitiveDataArray(data, 'order');
            return NextResponse.json(decryptedData, { status: 200 });
          } else {
            const decryptedData = decryptSensitiveData(data, 'order');
            return NextResponse.json(decryptedData, { status: 200 });
          }
        }
      }
      
      return response;
    } catch (error) {
      console.error('Encryption middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
