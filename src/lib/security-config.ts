// Configurações centralizadas de segurança
export const SECURITY_CONFIG = {
  // Autenticação
  AUTH: {
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    JWT_EXPIRES_IN: '24h',
    REFRESH_TOKEN_EXPIRES_IN: '7d',
    SALT_ROUNDS: 15,
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas
  },
  
  // Rate Limiting
  RATE_LIMITING: {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutos
    MAX_REQUESTS_PER_MINUTE: 100,
    MAX_REQUESTS_PER_HOUR: 1000,
    MAX_REQUESTS_PER_DAY: 10000,
  },
  
  // Senhas
  PASSWORDS: {
    MIN_LENGTH: 12,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    HISTORY_SIZE: 5,
    COMMON_PATTERNS: [
      '123456', 'password', 'qwerty', 'admin', 'user', 'test',
      '123456789', '12345678', '1234567', '1234567890',
      'abc123', 'password123', 'admin123', 'user123'
    ],
  },
  
  // Validação e Sanitização
  VALIDATION: {
    MAX_STRING_LENGTH: 1000,
    MAX_ARRAY_LENGTH: 100,
    MAX_OBJECT_DEPTH: 5,
    MAX_OBJECT_KEYS: 100,
  },
  
  // Headers de Segurança
  SECURITY_HEADERS: {
    X_FRAME_OPTIONS: 'DENY',
    X_CONTENT_TYPE_OPTIONS: 'nosniff',
    REFERRER_POLICY: 'strict-origin-when-cross-origin',
    PERMISSIONS_POLICY: 'camera=(), microphone=(), geolocation=(), payment=()',
    X_DNS_PREFETCH_CONTROL: 'off',
    X_DOWNLOAD_OPTIONS: 'noopen',
    X_PERMITTED_CROSS_DOMAIN_POLICIES: 'none',
    CROSS_ORIGIN_EMBEDDER_POLICY: 'require-corp',
    CROSS_ORIGIN_OPENER_POLICY: 'same-origin',
    CROSS_ORIGIN_RESOURCE_POLICY: 'same-origin',
  },
  
  // Content Security Policy
  CSP: {
    DEFAULT_SRC: ["'self'"],
    SCRIPT_SRC: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
    STYLE_SRC: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    FONT_SRC: ["'self'", "https://fonts.gstatic.com"],
    IMG_SRC: ["'self'", "data:", "https:", "blob:"],
    CONNECT_SRC: ["'self'", "https://api.mercadopago.com", "https://viacep.com.br", "https://www.google-analytics.com"],
    FRAME_SRC: ["'self'", "https://www.mercadopago.com.br"],
    OBJECT_SRC: ["'none'"],
    BASE_URI: ["'self'"],
    FORM_ACTION: ["'self'"],
    UPGRADE_INSECURE_REQUESTS: true,
    REQUIRE_TRUSTED_TYPES_FOR: ["'script'"],
    TRUSTED_TYPES: ["default"],
  },
  
  // Padrões Proibidos
  FORBIDDEN_PATTERNS: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /vbscript:/gi,
    /expression\s*\(/gi,
    /eval\s*\(/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
    /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi,
    /union\s+select/gi,
    /drop\s+table/gi,
    /insert\s+into/gi,
    /update\s+set/gi,
    /delete\s+from/gi,
    /exec\s*\(/gi,
    /system\s*\(/gi,
    /shell_exec\s*\(/gi,
    /passthru\s*\(/gi,
    /`.*`/g,
    /\$\(.*\)/g,
    /\.\.\//g,
    /\.\.\\/g,
  ],
  
  // User Agents Suspeitos
  SUSPICIOUS_USER_AGENTS: [
    'sqlmap', 'nmap', 'nikto', 'dirb', 'gobuster', 'wfuzz',
    'burp', 'zap', 'wireshark', 'metasploit', 'nuclei',
    'hydra', 'john', 'hashcat', 'aircrack-ng', 'kismet',
    'wireshark', 'tcpdump', 'netcat', 'telnet', 'ftp'
  ],
  
  // Rotas Sensíveis
  SENSITIVE_ROUTES: [
    '/api/admin',
    '/api/auth',
    '/checkout',
    '/perfil',
    '/admin',
    '/api/users',
    '/api/orders',
    '/api/products',
  ],
  
  // Rotas Públicas
  PUBLIC_ROUTES: [
    '/',
    '/login',
    '/criar-conta',
    '/verificar-email',
    '/redefinir-senha',
		'/esqueci-senha',
    '/produtos',
    '/produto',
    '/marcas',
    '/modelos',
    '/sobre',
    '/contato',
    '/faq',
    '/como-comprar',
    '/termos-de-uso',
    '/politica-de-privacidade',
    '/trocas-e-devolucoes',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/verify-email',
    '/api/auth/resend-verification',
    '/api/auth/reset-password',
    '/api/auth/forgot-password',
    '/api/products',
    '/api/products/[slug]',
    '/api/brands',
    '/api/models',
    '/api/categories',
    '/api/featured-models',
    '/api/shipping/validate-cep',
    '/api/webhooks/mercadopago',
    '/api/test-webhook',
  ],
  
  // Rotas Protegidas
  PROTECTED_ROUTES: [
    '/checkout',
    '/entregas',
    '/enderecos',
    '/meus-pedidos',
    '/perfil',
    '/configuracoes',
  ],
  
  // Rotas Admin
  ADMIN_ROUTES: [
    '/admin',
    '/api/admin',
  ],
  
  // Cookies
  COOKIES: {
    HTTP_ONLY: true,
    SECURE: process.env.NODE_ENV === 'production',
    SAME_SITE: 'strict' as const,
    DOMAIN: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : undefined,
    AUTH_TOKEN_MAX_AGE: 24 * 60 * 60, // 24 horas
    REFRESH_TOKEN_MAX_AGE: 7 * 24 * 60 * 60, // 7 dias
  },
  
  // Logging
  LOGGING: {
    ENABLE_CONSOLE: true,
    ENABLE_FILE: process.env.NODE_ENV === 'production',
    ENABLE_DATABASE: process.env.NODE_ENV === 'production',
    ENABLE_EXTERNAL: false,
    LOG_LEVEL: 'INFO',
    MAX_LOG_SIZE: 1000,
    RETENTION_DAYS: 90,
    ALERT_THRESHOLDS: {
      LOGIN_FAILED: 5,
      BRUTE_FORCE_ATTEMPT: 3,
      SQL_INJECTION_ATTEMPT: 1,
      XSS_ATTEMPT: 1,
      PATH_TRAVERSAL_ATTEMPT: 1,
      UNAUTHORIZED_ADMIN_ACCESS: 1,
    },
  },
  
  // Monitoramento
  MONITORING: {
    ENABLE_IP_TRACKING: true,
    ENABLE_SESSION_TRACKING: true,
    ENABLE_ACTIVITY_TRACKING: true,
    ENABLE_ANOMALY_DETECTION: true,
    SUSPICIOUS_ACTIVITY_THRESHOLD: 10,
    MAX_SUSPICIOUS_ACTIVITIES: 50,
  },
  
  // Ambiente
  ENVIRONMENT: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    IS_PRODUCTION: process.env.NODE_ENV === 'production',
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
    IS_TESTING: process.env.NODE_ENV === 'test',
  },
};

// Função para obter configuração baseada no ambiente
export function getSecurityConfig(environment?: string) {
  const env = environment || process.env.NODE_ENV || 'development';
  
  if (env === 'production') {
    return {
      ...SECURITY_CONFIG,
      AUTH: {
        ...SECURITY_CONFIG.AUTH,
        JWT_SECRET: process.env.JWT_SECRET || 'CHANGE_THIS_IN_PRODUCTION',
      },
      LOGGING: {
        ...SECURITY_CONFIG.LOGGING,
        ENABLE_CONSOLE: false,
        ENABLE_FILE: true,
        ENABLE_DATABASE: true,
        ENABLE_EXTERNAL: true,
      },
      MONITORING: {
        ...SECURITY_CONFIG.MONITORING,
        ENABLE_IP_TRACKING: true,
        ENABLE_SESSION_TRACKING: true,
        ENABLE_ACTIVITY_TRACKING: true,
        ENABLE_ANOMALY_DETECTION: true,
      },
    };
  }
  
  if (env === 'development') {
    return {
      ...SECURITY_CONFIG,
      LOGGING: {
        ...SECURITY_CONFIG.LOGGING,
        ENABLE_CONSOLE: true,
        ENABLE_FILE: false,
        ENABLE_DATABASE: false,
        ENABLE_EXTERNAL: false,
      },
      MONITORING: {
        ...SECURITY_CONFIG.MONITORING,
        ENABLE_IP_TRACKING: false,
        ENABLE_SESSION_TRACKING: false,
        ENABLE_ACTIVITY_TRACKING: false,
        ENABLE_ANOMALY_DETECTION: false,
      },
    };
  }
  
  return SECURITY_CONFIG;
}

// Função para validar configuração
export function validateSecurityConfig(config: typeof SECURITY_CONFIG): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validar JWT Secret
  if (config.AUTH.JWT_SECRET === 'your-secret-key-change-in-production' || 
      config.AUTH.JWT_SECRET === 'CHANGE_THIS_IN_PRODUCTION') {
    errors.push('JWT_SECRET deve ser alterado em produção');
  }
  
  // Validar salt rounds
  if (config.AUTH.SALT_ROUNDS < 10) {
    errors.push('SALT_ROUNDS deve ser pelo menos 10');
  }
  
  // Validar rate limiting
  if (config.RATE_LIMITING.MAX_LOGIN_ATTEMPTS < 3) {
    errors.push('MAX_LOGIN_ATTEMPTS deve ser pelo menos 3');
  }
  
  if (config.RATE_LIMITING.LOCKOUT_DURATION < 5 * 60 * 1000) {
    errors.push('LOCKOUT_DURATION deve ser pelo menos 5 minutos');
  }
  
  // Validar senhas
  if (config.PASSWORDS.MIN_LENGTH < 8) {
    errors.push('MIN_LENGTH deve ser pelo menos 8');
  }
  
  // Validar logging
  if (config.LOGGING.RETENTION_DAYS < 30) {
    errors.push('RETENTION_DAYS deve ser pelo menos 30');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Função para gerar relatório de configuração
export function generateSecurityReport(): {
  config: typeof SECURITY_CONFIG;
  validation: { valid: boolean; errors: string[] };
  recommendations: string[];
} {
  const config = getSecurityConfig();
  const validation = validateSecurityConfig(config);
  const recommendations: string[] = [];
  
  // Recomendações baseadas na configuração
  if (config.ENVIRONMENT.IS_PRODUCTION) {
    if (config.AUTH.JWT_SECRET.includes('CHANGE_THIS') || config.AUTH.JWT_SECRET.includes('your-secret')) {
      recommendations.push('Altere o JWT_SECRET para um valor seguro e único');
    }
    
    if (!config.LOGGING.ENABLE_EXTERNAL) {
      recommendations.push('Considere habilitar logging externo para monitoramento em produção');
    }
    
    if (!config.MONITORING.ENABLE_ANOMALY_DETECTION) {
      recommendations.push('Habilite detecção de anomalias em produção');
    }
  }
  
  if (config.AUTH.SALT_ROUNDS < 12) {
    recommendations.push('Considere aumentar SALT_ROUNDS para 12 ou mais');
  }
  
  if (config.PASSWORDS.MIN_LENGTH < 12) {
    recommendations.push('Considere aumentar MIN_LENGTH para 12 ou mais');
  }
  
  if (config.RATE_LIMITING.MAX_REQUESTS_PER_MINUTE > 200) {
    recommendations.push('Considere reduzir MAX_REQUESTS_PER_MINUTE para melhor segurança');
  }
  
  return {
    config,
    validation,
    recommendations
  };
}

// Exportar configuração padrão
export default getSecurityConfig();
