import { NextRequest } from 'next/server';

// Padrões maliciosos para SQL Injection
const SQL_INJECTION_PATTERNS = [
  // Comandos SQL básicos
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
  
  // Caracteres perigosos básicos
  /[;'\"\\]/gi,
  /(\-\-|\/\*|\*\/)/gi,
  
  // Payloads específicos
  /(OR\s+1\s*=\s*1)/gi,
  /(AND\s+1\s*=\s*1)/gi,
  /(UNION\s+SELECT)/gi,
  /(DROP\s+TABLE)/gi,
  /(DELETE\s+FROM)/gi,
  /(INSERT\s+INTO)/gi,
  /(UPDATE\s+SET)/gi,
  /(ALTER\s+TABLE)/gi,
  /(CREATE\s+TABLE)/gi,
  /(EXEC\s*\()/gi,
  
  // Comentários SQL
  /(\/\*.*?\*\/)/gi,
  /(--.*$)/gm,
  /(#.*$)/gm,
  
  // Time-based attacks
  /(SLEEP\s*\()/gi,
  /(WAITFOR\s+DELAY)/gi,
  /(BENCHMARK\s*\()/gi,
  
  // Information schema attacks
  /(INFORMATION_SCHEMA)/gi,
  /(mysql\.user)/gi,
  /(sys\.databases)/gi,
  
  // Encoding attacks
  /(%27|%22|%3D|%3B|%2D|%2D)/gi,
  /(0x[0-9a-f]+)/gi,
  
  // Blind SQL Injection
  /(ASCII\s*\()/gi,
  /(SUBSTRING\s*\()/gi,
  /(LENGTH\s*\()/gi,
  /(CONCAT\s*\()/gi,
  
  // NoSQL Injection patterns
  /(\$where|\$ne|\$gt|\$lt|\$regex|\$exists|\$in|\$nin|\$or|\$and)/gi,
  
  // LDAP Injection
  /(\*|\(|\)|\\|\/|\+|<|>|;|,|"|'|=)/g
];

// Função para detectar SQL Injection
export function detectSQLInjection(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

// Função para sanitizar entrada
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Verificar padrões maliciosos
    if (detectSQLInjection(input)) {
      throw new Error('Entrada maliciosa detectada - possível SQL Injection');
    }
    
    // Sanitizar caracteres perigosos
    return input
      .replace(/[<>]/g, '') // Remover < e >
      .replace(/['"]/g, '') // Remover aspas
      .replace(/[;\\]/g, '') // Remover ; e \
      .replace(/[(){}[\]|&$]/g, '') // Remover caracteres especiais
      .trim();
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = Array.isArray(input) ? [] : {};
    
    for (const key in input) {
      try {
        sanitized[key] = sanitizeInput(input[key]);
      } catch (error) {
        throw new Error(`Campo '${key}' contém entrada maliciosa - possível SQL Injection`);
      }
    }
    
    return sanitized;
  }
  
  return input;
}

// Função para validar entrada
export function validateInput(data: any): { isValid: boolean; error?: string } {
  try {
    sanitizeInput(data);
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Entrada inválida - possível SQL Injection' 
    };
  }
}

// Middleware para proteger rotas
export function sqlInjectionProtection(request: NextRequest): { blocked: boolean; error?: string } {
  try {
    // Validar parâmetros da URL
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Converter para array para evitar problemas de iteração
    const params = Array.from(searchParams.entries());
    
    for (const [key, value] of params) {
      if (detectSQLInjection(value)) {
        return { 
          blocked: true, 
          error: `Parâmetro '${key}' contém possível SQL Injection` 
        };
      }
    }
    
    return { blocked: false };
    
  } catch (error) {
    return { 
      blocked: true, 
      error: 'Erro ao validar entrada - possível SQL Injection' 
    };
  }
}

// Função para validar dados do corpo da requisição
export function validateRequestBody(body: any): { isValid: boolean; error?: string } {
  return validateInput(body);
}

// Log de tentativas de SQL Injection
export function logSQLInjectionAttempt(request: NextRequest, details: string) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const timestamp = new Date().toISOString();
  
  console.log(`🚨 SQL INJECTION ATTEMPT DETECTED:`);
  console.log(`   IP: ${ip}`);
  console.log(`   User-Agent: ${userAgent}`);
  console.log(`   URL: ${request.url}`);
  console.log(`   Details: ${details}`);
  console.log(`   Timestamp: ${timestamp}`);
  
  // Aqui você pode implementar logging para banco de dados ou arquivo
  // para monitoramento de segurança
}
