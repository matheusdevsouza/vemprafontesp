// Configurações de segurança para APIs e dados sensíveis

export const SECURITY_CONFIG = {
  // Configurações de criptografia
  ENCRYPTION: {
    ALGORITHM: 'aes-256-gcm',
    IV_LENGTH: 16,
    SALT_LENGTH: 64,
    HASH_ITERATIONS: 100000,
    HASH_ALGORITHM: 'sha512',
    TOKEN_LENGTH: 32
  },

  // Campos sensíveis que devem ser criptografados
  SENSITIVE_FIELDS: {
    USER: [
      'name', 'email', 'phone', 'cpf', 'address', 'display_name',
      'birth_date', 'gender', 'zip_code', 'city', 'state', 'country'
    ],
    ORDER: [
      'customer_name', 'customer_email', 'customer_phone', 'customer_cpf',
      'billing_address', 'shipping_address', 'payment_method'
    ],
    ALL: [
      'name', 'email', 'phone', 'cpf', 'address', 'display_name',
      'birth_date', 'gender', 'zip_code', 'city', 'state', 'country',
      'customer_name', 'customer_email', 'customer_phone', 'customer_cpf',
      'billing_address', 'shipping_address', 'payment_method', 'password'
    ]
  },

  // Configurações de rate limiting
  RATE_LIMITING: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    SKIP_SUCCESSFUL_REQUESTS: false,
    SKIP_FAILED_REQUESTS: false
  },

  // Configurações de upload
  UPLOAD: {
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    ALLOWED_TYPES: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
    UPLOAD_DIR: process.env.UPLOAD_DIR || 'public/uploads',
    REQUIRE_AUTH: true
  },

  // Configurações de sessão
  SESSION: {
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 horas
    SECURE: process.env.NODE_ENV === 'production',
    HTTP_ONLY: true,
    SAME_SITE: 'strict' as const
  },

  // Configurações de CORS
  CORS: {
    ORIGIN: process.env.CORS_ORIGIN || process.env.NEXT_PUBLIC_APP_URL || '*',
    METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With'],
    CREDENTIALS: true
  },

  // Configurações de logs
  LOGGING: {
    LEVEL: process.env.LOG_LEVEL || 'info',
    ENABLE_DEBUG: process.env.ENABLE_DEBUG_LOGS === 'true',
    SANITIZE_SENSITIVE_DATA: true,
    LOG_FILE: process.env.LOG_FILE || 'logs/app.log'
  },

  // Configurações de banco de dados
  DATABASE: {
    CONNECTION_LIMIT: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
    TIMEOUT: parseInt(process.env.DB_TIMEOUT || '60000'),
    RETRY_ATTEMPTS: parseInt(process.env.DB_RETRY_ATTEMPTS || '3'),
    ENABLE_SSL: process.env.DB_SSL === 'true'
  },

  // Configurações de autenticação
  AUTH: {
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    PASSWORD_MIN_LENGTH: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
    PASSWORD_REQUIRE_SPECIAL_CHARS: process.env.PASSWORD_REQUIRE_SPECIAL_CHARS === 'true',
    PASSWORD_REQUIRE_NUMBERS: process.env.PASSWORD_REQUIRE_NUMBERS === 'true',
    PASSWORD_REQUIRE_UPPERCASE: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true',
    MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
    LOCKOUT_DURATION: parseInt(process.env.LOCKOUT_DURATION || '900000') // 15 minutos
  },

  // Configurações de email
  EMAIL: {
    FROM: process.env.SMTP_FROM || process.env.EMAIL_FROM || 'noreply@example.com',
    REPLY_TO: process.env.SMTP_REPLY_TO || process.env.EMAIL_REPLY_TO || 'contato@example.com',
    TEMPLATE_DIR: process.env.EMAIL_TEMPLATE_DIR || 'src/templates/email',
    RATE_LIMIT: parseInt(process.env.EMAIL_RATE_LIMIT || '10'), // emails por hora
    MAX_RECIPIENTS: parseInt(process.env.EMAIL_MAX_RECIPIENTS || '100')
  },

  // Configurações de pagamento
  PAYMENT: {
    MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN,
    MERCADOPAGO_PUBLIC_KEY: process.env.MERCADOPAGO_PUBLIC_KEY,
    MERCADOPAGO_WEBHOOK_SECRET: process.env.MERCADOPAGO_WEBHOOK_SECRET,
    WEBHOOK_TIMEOUT: parseInt(process.env.WEBHOOK_TIMEOUT || '30000'),
    RETRY_ATTEMPTS: parseInt(process.env.PAYMENT_RETRY_ATTEMPTS || '3')
  },

  // Configurações de monitoramento
  MONITORING: {
    ENABLE_METRICS: process.env.ENABLE_METRICS === 'true',
    METRICS_PORT: parseInt(process.env.METRICS_PORT || '9090'),
    HEALTH_CHECK_INTERVAL: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'),
    ALERT_THRESHOLDS: {
      CPU_USAGE: parseFloat(process.env.CPU_ALERT_THRESHOLD || '80'),
      MEMORY_USAGE: parseFloat(process.env.MEMORY_ALERT_THRESHOLD || '80'),
      ERROR_RATE: parseFloat(process.env.ERROR_RATE_THRESHOLD || '5')
    }
  },

  // Configurações de backup
  BACKUP: {
    ENABLE_AUTO_BACKUP: process.env.ENABLE_AUTO_BACKUP === 'true',
    BACKUP_INTERVAL: process.env.BACKUP_INTERVAL || '24h',
    BACKUP_RETENTION_DAYS: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
    BACKUP_DIR: process.env.BACKUP_DIR || 'backups',
    ENCRYPT_BACKUPS: process.env.ENCRYPT_BACKUPS === 'true'
  },

  // Configurações de compliance (LGPD)
  COMPLIANCE: {
    ENABLE_DATA_ENCRYPTION: process.env.ENABLE_DATA_ENCRYPTION === 'true',
    ENABLE_AUDIT_LOGS: process.env.ENABLE_AUDIT_LOGS === 'true',
    DATA_RETENTION_DAYS: parseInt(process.env.DATA_RETENTION_DAYS || '2555'), // 7 anos
    ENABLE_DATA_EXPORT: process.env.ENABLE_DATA_EXPORT === 'true',
    ENABLE_DATA_DELETION: process.env.ENABLE_DATA_DELETION === 'true',
    PRIVACY_POLICY_URL: process.env.PRIVACY_POLICY_URL || '/politica-de-privacidade',
    TERMS_OF_SERVICE_URL: process.env.TERMS_OF_SERVICE_URL || '/termos-de-uso'
  }
};

// Validações de configuração
export function validateSecurityConfig() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar chaves obrigatórias
  if (!process.env.ENCRYPTION_KEY) {
    errors.push('ENCRYPTION_KEY é obrigatória');
  } else if (process.env.ENCRYPTION_KEY.length < 32) {
    errors.push('ENCRYPTION_KEY deve ter pelo menos 32 caracteres');
  }

  if (!process.env.USER_ID_SALT) {
    errors.push('USER_ID_SALT é obrigatório');
  }

  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET é obrigatório');
  } else if (process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET deve ter pelo menos 32 caracteres');
  }

  // Validar configurações de produção
  if (process.env.NODE_ENV === 'production') {
    if (SECURITY_CONFIG.AUTH.JWT_SECRET === 'your-secret-key-change-in-production') {
      errors.push('JWT_SECRET deve ser alterado em produção');
    }

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      errors.push('MERCADOPAGO_ACCESS_TOKEN é obrigatório em produção');
    }

    if (!process.env.SMTP_HOST) {
      errors.push('Configurações SMTP são obrigatórias em produção');
    }
  }

  // Warnings para configurações não ideais
  if (SECURITY_CONFIG.RATE_LIMITING.MAX_REQUESTS > 1000) {
    warnings.push('Rate limit muito alto pode comprometer a segurança');
  }

  if (SECURITY_CONFIG.UPLOAD.MAX_FILE_SIZE > 10 * 1024 * 1024) { // 10MB
    warnings.push('Tamanho máximo de arquivo muito alto');
  }

  return { errors, warnings };
}

// Configurações de desenvolvimento
export const DEV_CONFIG = {
  ENABLE_DATABASE: process.env.NODE_ENV === 'production',
  ENABLE_CACHING: process.env.NODE_ENV === 'production',
  ENABLE_COMPRESSION: process.env.NODE_ENV === 'production',
  ENABLE_LOGGING: true,
  ENABLE_DEBUG: process.env.NODE_ENV === 'development'
};

// Configurações de produção
export const PROD_CONFIG = {
  ENABLE_DATABASE: true,
  ENABLE_CACHING: true,
  ENABLE_COMPRESSION: true,
  ENABLE_LOGGING: true,
  ENABLE_DEBUG: false,
  ENABLE_SSL: true,
  ENABLE_SECURITY_HEADERS: true,
  ENABLE_RATE_LIMITING: true,
  ENABLE_AUDIT_LOGS: true
};

// Função para obter configuração baseada no ambiente
export function getConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    return {
      ...SECURITY_CONFIG,
      ...PROD_CONFIG
    };
  }
  
  return {
    ...SECURITY_CONFIG,
    ...DEV_CONFIG
  };
}

// Validação de segurança em tempo de execução
export function validateRuntimeSecurity() {
  const config = getConfig();
  const { errors, warnings } = validateSecurityConfig();

  if (errors.length > 0) {
    console.error('❌ Erros de configuração de segurança:', errors);
    if (config.ENABLE_DATABASE) {
      throw new Error('Configuração de segurança inválida');
    }
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Avisos de segurança:', warnings);
  }

  // Validações adicionais
  if (config.AUTH.JWT_SECRET.includes('CHANGE_THIS') || config.AUTH.JWT_SECRET.includes('your-secret')) {
    warnings.push('Altere o JWT_SECRET para um valor seguro e único');
  }

  return { errors, warnings, config };
}

export default SECURITY_CONFIG;
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
